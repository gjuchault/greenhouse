import { v4 as uuid } from 'uuid'
import { Pool } from 'pg'
import { start, done, failed } from './log'

export type Storage = ReturnType<typeof buildStorage>

export function buildStorage(db: Pool) {
  async function postEntry(sensor: string, value: string) {
    try {
      start('Saving statement...')

      await db.query(`
        insert into statement(id, sensor_id, value, date)
        ("${uuid()}", "${sensor}", ${value}, now())
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
