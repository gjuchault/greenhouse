import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import { USBDevice } from '../usb'
import { log } from '../log'
import { events } from '../events'

export type Arduino = {
  send: (data: string) => Promise<void>
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

    port.on('error', (err) => {
      console.log(err)
    })

    parser.on('data', (data: Buffer) => {
      log('arduino', data.toString().trim())
      const line = data.toString().trim().padStart(24, '0')

      events.emit('arduino:line', line)
    })

    events.on('command:send', (target, value) => {
      const data = `${target};${Math.trunc(value).toString()}`

      log('arduino', `< ${data}`)
      port.write(`${data}\n`, (err) => {
        if (err) log('arduino', `Error when sending data to arduino ${err}`)
      })
    })
  }

  return listen
}
