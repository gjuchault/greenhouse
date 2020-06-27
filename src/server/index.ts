import path from 'path'
import { config as dotenv } from 'dotenv'
import { log } from './log'
import { listUsbDevices, USBDevice } from './usb'
import { createArduino } from './arduino'
import { createRadio } from './radio'
import { createStorage } from './storage'
import { createHttp } from './http'
import { buildQueue } from './queue'
import {
  emitterCache,
  actionableCache,
  setInitialActionableCache,
} from './cache'
import { createRules } from './rules'
import { events } from './events'
const { version } = require('../../package.json')

dotenv({ path: path.resolve(__dirname, '../../.env.local') })
dotenv({ path: path.resolve(__dirname, '../../.env') })

async function main() {
  log('main', `Greenhouse v${version}`)

  let usbDevices: USBDevice[]
  try {
    log('main', 'Listing USB devices...')
    usbDevices = await listUsbDevices()
    log('main', 'Done')
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  await createHttp()
  const storage = await createStorage()
  const queue = buildQueue(storage.postEntry)
  await createRadio({ usbDevices })
  await createArduino({ usbDevices })
  const rules = await createRules({ storage })

  const actionables = await storage.listActionables()
  setInitialActionableCache(actionables)

  const applyRules = async () => {
    const now = new Date().toISOString()

    const newActionablesValues = rules.executeRules(
      emitterCache,
      actionableCache,
      await storage.listEmitterSensors(),
      await storage.listActionables()
    )

    for (const [actionableSensor, actionableValue] of newActionablesValues) {
      if (actionableValue !== actionableCache.get(actionableSensor)?.value) {
        log('rules', `${actionableSensor} : ${actionableValue}`)

        actionableCache.set(actionableSensor, {
          value: actionableValue,
          lastSentAt: now,
        })

        events.emit('command:send', actionableSensor, actionableValue)
      }
    }
  }

  const handleSensorValue = (source: string) => (
    sensorId: string,
    value: string
  ) => {
    emitterCache.set(sensorId, {
      value,
      lastSentAt: new Date().toISOString(),
      source,
    })

    applyRules()

    queue.add(sensorId, value)
  }

  applyRules()
  setInterval(applyRules, 10000)

  events.on('arduino:entry', handleSensorValue('arduino'))
  events.on('radio:entry', handleSensorValue('radio'))

  log('main', 'Greenhouse ready')
}

main()
