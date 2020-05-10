import path from 'path'
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
      events.emit('command:send', matchRule.target, matchRule.targetValue)
    }

    cache.set(sensorId, {
      value,
      lastSentAt: new Date().toISOString(),
      source,
    })
    queue.add(sensorId, value)
  }

  events.on('arduino:entry', handleSensorValue('arduino'))
  events.on('radio:entry', handleSensorValue('radio'))
}

main()
