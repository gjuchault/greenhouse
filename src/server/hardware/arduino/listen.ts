/// <reference path="../../typings/serialport-parser-delimiter.d.ts" />

import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import { USBDevice } from '../usb'
import { logError } from '../../log'
import { events } from '../../events'

export type Arduino = {
  send: (data: string) => Promise<void>
}

export function buildListenArduino({
  usbDevices,
}: {
  usbDevices: USBDevice[]
}) {
  async function find() {
    return usbDevices.filter(({ kind }) => kind === 'arduino')
  }

  async function open(path: string) {
    return new Promise<SerialPort>((resolve, reject) => {
      const port = new SerialPort(
        path,
        {
          baudRate: 115200,
        },
        (err) => {
          if (err) {
            reject(err)
            return
          }

          resolve(port)
        }
      )
    })
  }

  async function listen() {
    const androidUsbDevice = await find()
    if (!androidUsbDevice.length) {
      throw new Error('No Arduino found')
    }

    for (const { path } of androidUsbDevice) {
      const port = await open(path)
      const parser = port.pipe(new Delimiter({ delimiter: '\r\n' }))

      port.on('error', (err) => {
        logError(err)
      })

      parser.on('data', (data: Buffer) => {
        const line = data.toString().trim().padStart(24, '0')

        events.emit('arduino:line', line)
      })

      events.on('command:send', (target, value) => {
        const data = `${target};${Math.trunc(Number(value)).toString()}`

        port.write(`${data}\n`, (err) => {
          if (err) logError(err)
        })
      })
    }
  }

  return listen
}
