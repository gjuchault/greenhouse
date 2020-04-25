import path from 'path'
import { config as dotenv } from 'dotenv'
import { start, done, failed } from './log'
import { buildListUsbDevices, USBDevice } from './usb'
import { createArduino } from './arduino'
import { createRadio } from './radio'
import { buildStorage } from './storage'
import { createHttp } from './http'
import { buildQueue } from './queue'
const { version } = require('../../package.json')

dotenv({ path: path.resolve(__dirname, '../../.env.local') })
dotenv({ path: path.resolve(__dirname, '../../.env') })

async function main() {
  console.log(`Greenhouse v${version}`)
  const storage = buildStorage()
  const listUsbDevices = buildListUsbDevices()
  const queue = buildQueue((sensor: string, value: string) =>
    storage.postEntry(sensor, value)
  )

  try {
    start('Connecting to storage...')
    await storage.connect()
    done()
  } catch (err) {
    failed()
    console.log(err)
    process.exit(1)
  }

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

  await createHttp({ storage })
  const arduino = await createArduino({ usbDevices })

  if (arduino) {
    arduino.on('entry', (sensorId, value) => queue.add(sensorId, value))
  }

  const radio = await createRadio({ usbDevices })

  if (radio) {
    radio.on('entry', (sensorId, value) => queue.add(sensorId, value))
  }
}

main()
