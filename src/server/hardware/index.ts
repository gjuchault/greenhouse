import { listUsbDevices, USBDevice } from './usb'
import { createArduino } from './arduino'
import { createRadio } from './radio'
import { log, logError } from '../log'

export async function createHardware() {
  let usbDevices: USBDevice[]
  try {
    log('hardware', 'Listing USB devices...')
    usbDevices = await listUsbDevices()
    log('hardware', 'Done')
  } catch (err) {
    logError(err)
    process.exit(1)
  }

  await createRadio({ usbDevices })
  await createArduino({ usbDevices })
}
