import SerialPort from 'serialport'
import { log } from '../log'

export interface USBDevice {
  path: string
  kind: 'arduino' | 'radio'
}

const rport = /usb|acm|^com/i
const arduinoManufacturer = ['1a86', 'arduino']
const rfxcomManufacturer = ['rfxcom']

export async function listUsbDevices() {
  const usbPorts = await SerialPort.list()

  const results: USBDevice[] = []

  for (const { path, manufacturer } of usbPorts) {
    if (!rport.test(path)) {
      continue
    }

    if (arduinoManufacturer.includes(manufacturer?.toLowerCase() || '')) {
      results.push({
        path,
        kind: 'arduino',
      })

      log('usb', `found arduino on path=${path}`)
    }

    if (rfxcomManufacturer.includes(manufacturer?.toLowerCase() || '')) {
      results.push({
        path,
        kind: 'radio',
      })

      log('usb', `found radio on path=${path}`)
    }
  }

  return results
}
