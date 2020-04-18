import path from 'path'
import { config as dotenv } from 'dotenv'
import { start, done, failed } from './log'
import { buildListUsbDevices, USBDevice } from './usb'
import { createArduino } from './arduino'
import { createRadio } from './radio'
import { buildStorage, SensorsConfig } from './storage'
import { createHttp } from './http'
const { version } = require('../../package.json')

dotenv({ path: path.resolve(__dirname, '../../.env.local') })
dotenv({ path: path.resolve(__dirname, '../../.env') })

async function main() {
  console.log(`Greenhouse v${version}`)
  const storage = buildStorage()
  const listUsbDevices = buildListUsbDevices()

  let sensorsConfig: SensorsConfig
  try {
    start('Connecting to storage...')
    await storage.connect()
    sensorsConfig = await storage.getSensors()
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

  await createHttp()
  const arduino = await createArduino({ sensorsConfig, usbDevices })

  if (arduino) {
    arduino.on('statement', async (statement) => {
      await storage.postStatement(statement)
    })
  }

  const radio = await createRadio({ usbDevices })
}

main()
