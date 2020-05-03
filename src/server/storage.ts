import { v4 as uuid } from 'uuid'
import pg from 'pg'
import { log } from './log'
import { reshapeRule, Rule } from './rules/rule'

export type Storage = {
  getUserByName: (
    name: string
  ) => Promise<{ id: string; name: string; password: string } | undefined>
  postEntry: (sensor: string, value: string) => Promise<void>
  listRules: () => Promise<Rule[]>
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
      return []
    }
  }

  return {
    getUserByName,
    postEntry,
    listRules,
  }
}
