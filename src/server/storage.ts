import { v4 as uuid } from 'uuid'
import pg from 'pg'
import sql from 'sql-template-strings'
import { log } from './log'
import { reshapeRule, Rule } from './rules/rule'
import { reshapeCommand, Command } from './rules/command'

export type Storage = {
  getUserByName: (
    name: string
  ) => Promise<{ id: string; name: string; password: string } | undefined>
  postEntry: (sensor: string, value: string) => Promise<void>
  listRules: () => Promise<Rule[]>
  postRule: (rule: string, priority: number) => Promise<void>
  listCommands: () => Promise<Command[]>
  postCommand: (
    target: string,
    value: string,
    expiresIn: string
  ) => Promise<void>
  listActionables: () => Promise<
    { id: string; target: string; name: string; value: '0-1' | '1-1024' }[]
  >
  listEmitterSensors: () => Promise<
    { id: string; sensor: string; name: string; min: number; max: number }[]
  >
}

let db: pg.Client

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
      console.log(err)
      process.exit(1)
    }
  }

  async function postEntry(sensor: string, value: string) {
    try {
      await db.query(sql`
        insert into statement(id, sensor, value, date)
        values (${uuid()}, ${sensor}, ${value}, now())
      `)
    } catch (err) {
      console.log(err)
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
      console.log(err)
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
      console.log(err)
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
      console.log(err)
      return []
    }
  }

  async function postCommand(target: string, value: string, expiresIn: string) {
    try {
      await db.query(sql`
        delete from commands where target=${target}
      `)

      await db.query(sql`
        insert into commands(id, target, value, expires_in)
        values (${uuid()}, ${target}, ${value}, ${expiresIn})
      `)
    } catch (err) {
      console.log(err)
    }
  }

  async function postRule(rule: string, priority: number) {
    try {
      const l = await db.query(sql`select count(1) as count from rules`)

      if (Number(l.rows[0].count) > 0) {
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
    } catch (err) {
      console.log(err)
    }
  }

  async function listActionables() {
    try {
      const data = await db.query(sql`
        select * from actionables
      `)

      return data.rows
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async function listEmitterSensors() {
    try {
      const data = await db.query(sql`
        select * from emitter_sensors
      `)

      return data.rows
    } catch (err) {
      console.log(err)
      return []
    }
  }

  return {
    getUserByName,
    postEntry,
    listRules,
    postRule,
    listCommands,
    postCommand,
    listActionables,
    listEmitterSensors,
  }
}
