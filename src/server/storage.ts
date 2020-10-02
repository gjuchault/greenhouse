import { v4 as uuid } from 'uuid'
import { createPool, sql, DatabasePoolType } from 'slonik'
import { logError } from './log'
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

let pool: DatabasePoolType

export function createStorage(): Storage {
  if (!pool) {
    const user = process.env.DATABASE_USER
    const password = process.env.DATABASE_PASSWORD
    const host = process.env.DATABASE_HOST
    const port = process.env.DATABASE_PORT
    const database = process.env.DATABASE_NAME

    pool = createPool(
      `postgres://${user}:${password}@${host}:${port}/${database}`
    )
  }

  async function postEntry(sensor: string, value: string, source: string) {
    try {
      return pool.connect(async (connection) => {
        return connection.transaction(async (transaction) => {
          const id = uuid()

          await transaction.query<{ id: string }>(sql`
            insert into statement(id, sensor, value, source, date)
            values (${id}, ${sensor}, ${value}, ${source}, now())
          `)

          await transaction.query(sql`
            update emitter_sensors set
              last_statement = ${id}
            where sensor = ${sensor}
          `)
        })
      })
    } catch (err) {
      logError(err)
      return
    }
  }

  async function getUserByName(name: string) {
    try {
      return pool.connect(async (connection) => {
        const data = await connection.query<{
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
      })
    } catch (err) {
      logError(err)
      return
    }
  }

  async function listRules() {
    try {
      return pool.connect(async (connection) => {
        const data = await connection.query<{
          id: string
          rule: string
          priority: number
        }>(sql`
          select id, rule, priority
          from "rules"
        `)

        return data.rows.map(reshapeRule)
      })
    } catch (err) {
      logError(err)
      return []
    }
  }

  async function listCommands() {
    try {
      return pool.connect(async (connection) => {
        const data = await connection.query<{
          id: string
          target: string
          value: string
          expires_in: number
        }>(sql`
          select id, target, value, expires_in from "commands"
          where expires_in > NOW()
        `)

        return data.rows.map(reshapeCommand)
      })
    } catch (err) {
      logError(err)
      return []
    }
  }

  async function postCommand(target: string, value: string, expiresIn: string) {
    try {
      return pool.connect(async (connection) => {
        return connection.transaction(async (transaction) => {
          await transaction.query(sql`
            delete from commands where target=${target}
          `)

          await transaction.query(sql`
            insert into commands(id, target, value, expires_in)
            values (${uuid()}, ${target}, ${value}, ${expiresIn})
          `)

          await transaction.query(sql`
            update actionables set
              last_value = ${value},
              last_value_sent_at = ${new Date().toISOString()}
            where target = ${target}
          `)
        })
      })
    } catch (err) {
      logError(err)
      return
    }
  }

  async function postRule(rule: string, priority: number) {
    try {
      return pool.connect(async (connection) => {
        return connection.transaction(async (transaction) => {
          const existingRule = await transaction.query<{ count: number }>(sql`
            select count(1) as count from rules
          `)

          if (Number(existingRule.rows[0].count) > 0) {
            await transaction.query(sql`
              update rules
              set rule = ${rule}
            `)

            return
          }

          await transaction.query(sql`
            insert into rules(id, rule, priority)
            values (${uuid()}, ${rule}, ${priority})
          `)
        })
      })
    } catch (err) {
      logError(err)
      return
    }
  }

  async function setLastActionablesValues(newValues: Map<string, string>) {
    const now = new Date().toISOString()

    try {
      return pool.connect(async (connection) => {
        return connection.transaction(async (transaction) => {
          for (const [target, value] of newValues) {
            await transaction.query(sql`
              update actionables set
                last_value = ${value},
                last_value_sent_at = ${now}
              where target = ${target}
            `)
          }
        })
      })
    } catch (err) {
      logError(err)
      return
    }
  }

  async function listActionables(): Promise<Map<string, Actionable>> {
    try {
      return pool.connect(async (connection) => {
        const data = await connection.query<{
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

        return keyByWith(
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
      })
    } catch (err) {
      logError(err)
      return new Map()
    }
  }

  async function listEmitterSensors(): Promise<Map<string, EmitterSensor>> {
    try {
      return pool.connect(async (connection) => {
        const data = await connection.query<{
          id: string
          sensor: string
          name: string
          min: number
          max: number
          value?: string
          date?: number
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

        return keyByWith(
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
                    sentAt: new Date(rawSensor.date).toISOString(),
                    source: rawSensor.source,
                  }
                : undefined,
          })
        )
      })
    } catch (err) {
      logError(err)
      return new Map()
    }
  }

  return {
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
}
