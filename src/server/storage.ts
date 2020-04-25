import { v4 as uuid } from 'uuid'
import { sql, createPool, DatabaseConnectionType } from 'slonik'
import { start, done, failed } from './log'

export type Storage = ReturnType<typeof buildStorage>

export function buildStorage() {
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD
  const host = process.env.DATABASE_HOST
  const port = process.env.DATABASE_PORT
  const name = process.env.DATABASE_NAME
  const pool = createPool(
    `postgres://${user}:${password}@${host}:${port}/${name}`
  )

  let connection: DatabaseConnectionType

  async function connect() {
    connection = (await pool.connect(async () => {})) as any
  }

  async function postEntry(sensor: string, value: string) {
    try {
      start('Saving statement...')

      await connection.query(sql`
        insert into statement (id, sensor_id, value, date) values
        ("${uuid()}", "${sensor}", ${value}, now())
      `)

      done()
    } catch (err) {
      failed()
      console.log(err)
    }
  }

  return {
    connect,
    postEntry,
  }
}
