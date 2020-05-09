import path from 'path'
import chalk from 'chalk'
import { config as dotenv } from 'dotenv'
import { log } from './log'
import { listUsbDevices, USBDevice } from './usb'
import { createArduino } from './arduino'
import { createRadio } from './radio'
import { createStorage } from './storage'
import { createHttp } from './http'
import { buildQueue } from './queue'
import { cache } from './cache'
import { createRules } from './rules'
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
  const radio = await createRadio({ usbDevices })
  const arduino = await createArduino({ usbDevices })
  const rules = await createRules({ storage })

  const handleSensorValue = (source: string) => (
    sensorId: string,
    value: string
  ) => {
    const matchRule = rules.tryAgainstRules(sensorId, value)

    if (matchRule && arduino) {
      log('arduino', `< ${JSON.stringify(matchRule)}`)
      arduino.sendCommand(matchRule.target, matchRule.targetValue)
    }

    cache.set(sensorId, {
      value,
      lastSentAt: new Date().toISOString(),
      source,
    })
    queue.add(sensorId, value)
  }

  if (arduino) arduino.emitter.on('entry', handleSensorValue('arduino'))
  if (radio) radio.on('entry', handleSensorValue('radio'))
}

main()
