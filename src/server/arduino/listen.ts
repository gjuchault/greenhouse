import { createNanoEvents, Emitter } from 'nanoevents'
import SerialPort from 'serialport'
import Delimiter from '@serialport/parser-delimiter'
import { USBDevice } from '../usb'

interface ArduinoEvents {
  line: (data: string) => void
}

export type Arduino = Emitter<ArduinoEvents>

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

    const emitter = createNanoEvents<ArduinoEvents>()
    port.on('error', console.log)
    port.on('data', (d) => console.log(d.toString()))
    // const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
    // parser.on('data', (buf: Buffer) => emitter.emit('line', buf.toString()))

    return emitter
  }

  return listen
}
