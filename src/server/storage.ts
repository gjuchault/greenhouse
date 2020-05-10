import { v4 as uuid } from 'uuid'
import pg from 'pg'
import { log } from './log'
import { reshapeRule, Rule } from './rules/rule'
import { reshapeCommand, Command } from './rules/command'

export type Storage = {
  getUserByName: (
    name: string
  ) => Promise<{ id: string; name: string; password: string } | undefined>
  postEntry: (sensor: string, value: string) => Promise<void>
  listRules: () => Promise<Rule[]>
  listCommands: () => Promise<Command[]>
  postCommand: (
    target: string,
    value: string,
    expiresIn: string
  ) => Promise<void>
}

let db: pg.Pool

export async function createStorage(): Promise<Storage> {
  if (!db) {
    db = new pg.Pool({
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
    })

    try {
      log('db', 'Connecting to storage...')
      await db.connect()
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  }

  async function postEntry(sensor: string, value: string) {
    try {
      await db.query(`
        insert into statement(id, sensor, value, date)
        values ('${uuid()}', '${sensor}', '${value}', now())
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
      }>(`
        select id, name, password
        from "user"
        where name = '${name}'
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
        source: string
        operation: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt'
        thresold: number
        target: string
        target_value: number
      }>(`
        select id, source, operation, thresold, target, target_value
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
      }>(`
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
      await db.query(`
        delete from commands where target='${target}'
      `)

      await db.query(`
        insert into commands(id, target, value, expires_in)
        values ('${uuid()}', '${target}', '${value}', '${expiresIn}')
      `)
    } catch (err) {
      console.log(err)
    }
  }

  return {
    getUserByName,
    postEntry,
    listRules,
    listCommands,
    postCommand,
  }
}
