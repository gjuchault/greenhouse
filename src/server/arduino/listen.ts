import { createNanoEvents, Emitter } from 'nanoevents'
import chalk from 'chalk'
import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import { USBDevice } from '../usb'
import { log } from '../log'

interface ArduinoEvents {
  line: (data: string) => void
}

export type Arduino = {
  send: (data: string) => Promise<void>
  emitter: Emitter<ArduinoEvents>
}

export function buildListenArduino({
  usbDevices,
}: {
  usbDevices: USBDevice[]
}) {
  async function find() {
    return usbDevices.find(({ kind }) => kind === 'arduino')?.path
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
    const path = await find()
    if (!path) {
      throw new Error('No Arduino found')
    }

    const port = await open(path)
    const parser = port.pipe(new Delimiter({ delimiter: '\r\n' }))

    const emitter = createNanoEvents<ArduinoEvents>()
    port.on('error', (err) => {
      console.log(err)
    })
    parser.on('data', (data: Buffer) => {
      log('arduino', data.toString().trim())
      const line = data.toString().trim().padStart(24, '0')
      emitter.emit('line', line)
    })

    return {
      emitter,
      send: (data: string) =>
        new Promise<void>((resolve, reject) => {
          log('arduino', `< ${data}`)
          port.write(`${data}\n`, (err) => {
            if (err) return reject(err)
            resolve()
          })
        }),
    }
  }

  return listen
}
