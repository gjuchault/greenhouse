import { v4 as uuid } from 'uuid'
import pg from 'pg'
import sql from 'sql-template-strings'
import { log, logError } from './log'
import { reshapeRule, Rule } from './rules/rule'
import { reshapeCommand, Command } from './rules/command'
import { EmitterSensor } from './sensors'
import { keyByWith } from './helpers/iterables'
import { Actionable } from './actionables'

export type Storage = {
  getUserByName: (
    name: string
  ) => Promise<{ id: string; name: string; password: string } | undefined>
  postEntry: (sensor: string, value: string, source: string) => Promise<void>
  listRules: () => Promise<Rule[]>
  postRule: (rule: string, priority: number) => Promise<void>
  listCommands: () => Promise<Command[]>
  postCommand: (
    target: string,
    value: string,
    expiresIn: string
  ) => Promise<void>
  setLastActionablesValues: (newValues: Map<string, string>) => Promise<void>
  listActionables: () => Promise<Map<string, Actionable>>
  listEmitterSensors: () => Promise<Map<string, EmitterSensor>>
}

let db: pg.Client
let storage: Storage

export function getStorage() {
  if (!storage) {
    throw new Error('Please call createStorage before getStorage')
  }

  return storage
}

export async function createStorage(): Promise<Storage> {
  if (!db) {
    db = new pg.Client({
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
    })

    try {
      log('db', 'Connecting to storage...')
      await db.connect()
      log('db', 'Connected')
    } catch (err) {
      logError(err)
      process.exit(1)
    }
  }

  async function postEntry(sensor: string, value: string, source: string) {
    try {
      await db.query(sql`begin`)

      const { rows } = await db.query<{ id: string }>(sql`
        insert into statement(id, sensor, value, source, date)
        values (${uuid()}, ${sensor}, ${value}, ${source}, now())
        returning id
      `)

      await db.query(sql`
        update emitter_sensors set
          last_statement = ${rows[0].id}
        where sensor = ${sensor}
      `)

      await db.query(sql`commit`)
    } catch (err) {
      await db.query(sql`rollback`)
      logError(err)
    }
  }

  async function getUserByName(name: string) {
    try {
      const data = await db.query<{
        id: string
        name: string
        password: string
      }>(sql`
        select id, name, password
        from "user"
        where name = ${name}
      `)

      if (data.rows.length !== 1) {
        return
      }

      return data.rows[0]
    } catch (err) {
      logError(err)
      return
    }
  }

  async function listRules() {
    try {
      const data = await db.query<{
        id: string
        rule: string
        priority: number
      }>(sql`
        select id, rule, priority
        from "rules"
      `)

      return data.rows.map(reshapeRule)
    } catch (err) {
      logError(err)
      return []
    }
  }

  async function listCommands() {
    try {
      const data = await db.query<{
        id: string
        target: string
        value: string
        expires_in: Date
      }>(sql`
        select id, target, value, expires_in from "commands"
        where expires_in > NOW()
      `)

      return data.rows.map(reshapeCommand)
    } catch (err) {
      logError(err)
      return []
    }
  }

  async function postCommand(target: string, value: string, expiresIn: string) {
    try {
      await db.query(sql`begin`)

      await db.query(sql`
        delete from commands where target=${target}
      `)

      await db.query(sql`
        insert into commands(id, target, value, expires_in)
        values (${uuid()}, ${target}, ${value}, ${expiresIn})
      `)

      await db.query(sql`
        update actionables set
          last_value = ${value},
          last_value_sent_at = ${new Date()}
        where target = ${target}
      `)

      await db.query(sql`commit`)
    } catch (err) {
      await db.query(sql`rollback`)
      logError(err)
    }
  }

  async function postRule(rule: string, priority: number) {
    try {
      await db.query(sql`begin`)

      const existingRule = await db.query<{ count: number }>(sql`
        select count(1) as count from rules
      `)

      if (Number(existingRule.rows[0].count) > 0) {
        await db.query(sql`
          update rules
          set rule = ${rule}
        `)

        return
      }

      await db.query(sql`
        insert into rules(id, rule, priority)
        values (${uuid()}, ${rule}, ${priority})
      `)

      await db.query(sql`commit`)
    } catch (err) {
      await db.query(sql`rollback`)
      logError(err)
    }
  }

  async function setLastActionablesValues(newValues: Map<string, string>) {
    const now = new Date()

    try {
      await db.query(sql`begin`)

      for (const [target, value] of newValues) {
        await db.query(sql`
          update actionables set
            last_value = ${value},
            last_value_sent_at = ${now}
          where target = ${target}
        `)
      }

      await db.query(sql`commit`)
    } catch (err) {
      await db.query(sql`rollback`)
      logError(err)
    }
  }

  async function listActionables() {
    let actionables: Map<string, Actionable>

    try {
      const data = await db.query<{
        id: string
        target: string
        name: string
        value: '0-1' | '1-1024'
        default_value: string
        last_value: string
        last_value_sent_at: string
      }>(sql`
        select * from actionables
      `)

      actionables = keyByWith(
        data.rows,
        (rawActionable) => rawActionable.target,
        (rawActionable) => ({
          id: rawActionable.id,
          name: rawActionable.name,
          target: rawActionable.target,
          valueType: {
            range: rawActionable.value,
            default: rawActionable.default_value,
          },
          lastAction: rawActionable.last_value
            ? {
                value: rawActionable.last_value,
                sentAt: rawActionable.last_value_sent_at,
              }
            : undefined,
        })
      )
    } catch (err) {
      logError(err)
      return new Map()
    }

    return actionables
  }

  async function listEmitterSensors() {
    let emitterSensors: Map<string, EmitterSensor>

    try {
      const data = await db.query<{
        id: string
        sensor: string
        name: string
        min: number
        max: number
        value?: string
        date?: Date
        source?: string
      }>(sql`
        select
          emitter_sensors.id,
          emitter_sensors.sensor,
          emitter_sensors.name,
          emitter_sensors.min,
          emitter_sensors.max,
          statement.value,
          statement.date,
          statement.source
        from emitter_sensors
        left join statement on statement.id = emitter_sensors.last_statement
      `)

      emitterSensors = keyByWith(
        data.rows,
        (rawSensor) => rawSensor.sensor,
        (rawSensor) => ({
          id: rawSensor.id,
          name: rawSensor.name,
          sensor: rawSensor.sensor,
          range: {
            min: rawSensor.min,
            max: rawSensor.max,
          },
          lastStatement:
            rawSensor.value && rawSensor.date && rawSensor.source
              ? {
                  value: rawSensor.value,
                  sentAt: rawSensor.date.toISOString(),
                  source: rawSensor.source,
                }
              : undefined,
        })
      )
    } catch (err) {
      logError(err)
      return new Map()
    }

    return emitterSensors
  }

  storage = {
    getUserByName,
    postEntry,
    listRules,
    postRule,
    listCommands,
    postCommand,
    setLastActionablesValues,
    listActionables,
    listEmitterSensors,
  }

  return storage
}
