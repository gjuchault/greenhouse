import path from 'path'
import pg from 'pg'
import { config as dotenv } from 'dotenv'
import { start, done, failed } from './log'
import { listUsbDevices, USBDevice } from './usb'
import { createArduino } from './arduino'
import { createRadio } from './radio'
import { createStorage } from './storage'
import { createHttp } from './http'
import { buildQueue } from './queue'
import { cache } from './cache'
const { version } = require('../../package.json')

dotenv({ path: path.resolve(__dirname, '../../.env.local') })
dotenv({ path: path.resolve(__dirname, '../../.env') })

async function main() {
  console.log(`Greenhouse v${version}`)

  let usbDevices: USBDevice[]
  try {
    start('Listing USB devices...')
    usbDevices = await listUsbDevices()
    done()
  } catch (err) {
    failed()
    console.log(err)
    process.exit(1)
  }

  const storage = await createStorage()
  const queue = buildQueue(storage.postEntry)
  const arduino = await createArduino({ usbDevices })
  const radio = await createRadio({ usbDevices })
  await createHttp()

  const handleSensorValue = (sensorId: string, value: string) => {
    cache.set(sensorId, value)
    queue.add(sensorId, value)
  }

  if (arduino) arduino.on('entry', handleSensorValue)
  if (radio) radio.on('entry', handleSensorValue)
}

main()
