import path from 'path'
import { config as dotenv } from 'dotenv'
import { log, logError } from './log'
import { createHardware } from './hardware'
import { createStorage, getStorage } from './storage'
import { createHttp } from './http'
import { executeRules } from './rules'
import { events } from './events'
const { version } = require('../../package.json')

dotenv({ path: path.resolve(__dirname, '../../.env.local') })
dotenv({ path: path.resolve(__dirname, '../../.env') })

async function main() {
  log('main', `Greenhouse v${version}`)

  await createHardware()
  await createHttp()
  await createStorage()

  const storage = getStorage()

  const handleSensorValue = async (
    source: string,
    sensorId: string,
    value: string
  ) => {
    await executeRules()

    storage.postEntry(sensorId, value, source)
  }

  await executeRules()
  setInterval(executeRules, 10000)

  events.on('arduino:entry', (sensorId, value) =>
    handleSensorValue('arduino', sensorId, value)
  )
  events.on('radio:entry', (sensorId, value) =>
    handleSensorValue('radio', sensorId, value)
  )

  log('main', 'Greenhouse ready')
}

process.on('uncaughtException', (err) => logError(err))
process.on('unhandledRejection', (err) => {
  if (err instanceof Error) logError(err)
  else logError(new Error(JSON.stringify(err)))
})

main()
