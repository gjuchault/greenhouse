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
    const parser = port.pipe(new Delimiter({ delimiter: '\r\n' }))

    const emitter = createNanoEvents<ArduinoEvents>()
    port.on('error', () => {
      console.log('arduino error >', console.log)
    })
    parser.on('data', (data: Buffer) => {
      console.log('binaryraw >', data)
      console.log('raw >', data.toString().trim())
      const line = data.toString().trim().padStart(24, '0')
      console.log('arduino >', line)
      emitter.emit('line', line)
    })

    return emitter
  }

  return listen
}
