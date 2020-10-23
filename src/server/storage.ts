import { v4 as uuid } from 'uuid'
import pg from 'pg'
import sql from 'sql-template-strings'
import { log, logError } from './log'
import { reshapeRule, Rule } from './rules/rule'
import { reshapeCommand, Command } from './rules/command'
import { reshapeSensor, EmitterSensor } from './sensors'
import { reshapeActionable, Actionable } from './actionables'
import { keyByWith } from './helpers/iterables'

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

let pool: pg.Pool

export async function setupStorage() {
  if (!pool) {
    log('storage', 'Creating storage...')
    const user = process.env.DATABASE_USER
    const password = process.env.DATABASE_PASSWORD
    const host = process.env.DATABASE_HOST
    const port = Number(process.env.DATABASE_PORT || '5432')
    const database = process.env.DATABASE_NAME

    pool = new pg.Pool({
      host,
      port,
      user,
      password,
      database,
      max: 25,
      min: 2,
    })

    try {
      const client = await createDb()
      await client.query<{ healthcheck: number }>('select 1 as healthcheck')
      client.release()
    } catch (err) {
      logError(err)
      process.exit(1)
    }
  }
}

export async function createDb() {
  if (!pool) {
    throw new Error('DB was not initialized')
  }

  const client = await pool.connect()

  return client
}

async function runTransactionInPoolClient<T>(
  cb: (client: pg.PoolClient) => Promise<T>
) {
  const client = await createDb()

  try {
    await client.query('begin')
    const result = await cb(client)
    await client.query('commit')

    return result
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    client.release()
  }
}

export function createStorage(): Storage {
  async function postEntry(sensor: string, value: string, source: string) {
    return await runTransactionInPoolClient(async (client) => {
      const id = uuid()

      await client.query<{ id: string }>(sql`
        insert into statement(id, sensor, value, source, date)
        values (${id}, ${sensor}, ${value}, ${source}, now())
      `)

      await client.query(sql`
        update emitter_sensors set
          last_statement = ${id}
        where sensor = ${sensor}
      `)
    })
  }

  async function getUserByName(name: string) {
    return await runTransactionInPoolClient(async (client) => {
      const data = await client.query<{
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
  }

  async function listRules() {
    return await runTransactionInPoolClient(async (client) => {
      const data = await client.query<{
        id: string
        rule: string
        priority: number
      }>(sql`
        select id, rule, priority
        from "rules"
      `)
      return data.rows.map(reshapeRule)
    })
  }

  async function listCommands() {
    return await runTransactionInPoolClient(async (client) => {
      const data = await client.query<{
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
  }

  async function postCommand(target: string, value: string, expiresIn: string) {
    return await runTransactionInPoolClient(async (client) => {
      await client.query(sql`
        delete from commands where target=${target}
      `)

      await client.query(sql`
        insert into commands(id, target, value, expires_in)
        values (${uuid()}, ${target}, ${value}, ${expiresIn})
      `)

      await client.query(sql`
        update actionables set
          last_value = ${value},
          last_value_sent_at = ${new Date().toISOString()}
        where target = ${target}
      `)
    })
  }

  async function postRule(rule: string, priority: number) {
    return await runTransactionInPoolClient(async (client) => {
      const existingRule = await client.query<{ count: number }>(sql`
        select count(1) as count from rules
      `)

      if (Number(existingRule.rows[0].count) > 0) {
        await client.query(sql`
          update rules
          set rule = ${rule}
        `)

        return
      }

      await client.query(sql`
        insert into rules(id, rule, priority)
        values (${uuid()}, ${rule}, ${priority})
      `)
    })
  }

  async function setLastActionablesValues(newValues: Map<string, string>) {
    const now = new Date().toISOString()

    return await runTransactionInPoolClient(async (client) => {
      for (const [target, value] of newValues) {
        await client.query(sql`
          update actionables set
            last_value = ${value},
            last_value_sent_at = ${now}
          where target = ${target}
        `)
      }
    })
  }

  async function listActionables(): Promise<Map<string, Actionable>> {
    return await runTransactionInPoolClient(async (client) => {
      const data = await client.query<{
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
        reshapeActionable
      )
    })
  }

  async function listEmitterSensors(): Promise<Map<string, EmitterSensor>> {
    return await runTransactionInPoolClient(async (client) => {
      const data = await client.query<{
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
        reshapeSensor
      )
    })
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
