import { v4 as uuid } from 'uuid'
import pg from 'pg'
import { start, done, failed } from './log'

export type Storage = ReturnType<typeof createStorage>

let db: pg.Pool

export async function createStorage() {
  if (!db) {
    db = new pg.Pool({
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
    })

    try {
      start('Connecting to storage...')
      await db.connect()
      done()
    } catch (err) {
      failed()
      console.log(err)
      process.exit(1)
    }
  }

  async function postEntry(sensor: string, value: string) {
    try {
      start('Saving statement...')

      await db.query(`
        insert into statement(id, sensor, value, date)
        values ('${uuid()}', '${sensor}', '${value}', now())
      `)

      done()
    } catch (err) {
      failed()
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

  return {
    getUserByName,
    postEntry,
  }
}
