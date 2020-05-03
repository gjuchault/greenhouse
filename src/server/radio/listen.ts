import { createNanoEvents, Emitter } from 'nanoevents'
import chalk from 'chalk'
import rfxcom from 'rfxcom'
import { USBDevice } from '../usb'
import { log } from '../log'

interface RadioEvents {
  data: (data: string) => void
}

export type Radio = Emitter<RadioEvents>

const lightning4Type = 0x13

export function buildListenRadio({ usbDevices }: { usbDevices: USBDevice[] }) {
  function find() {
    return usbDevices.find(({ kind }) => kind === 'radio')?.path
  }

  async function open(path: string) {
    return new Promise<any>((resolve, reject) => {
      const rfxtrx = new rfxcom.RfxCom(path, { debug: false })
      rfxtrx.initialise(() => {
        resolve(rfxtrx)
      })
    })
  }

  async function listen() {
    const path = find()
    if (!path) {
      throw new Error('No Radio found')
    }

    const rfxtrx = await open(path)

    const emitter = createNanoEvents<RadioEvents>()

    rfxtrx.on('receive', (buf: number[]) => {
      if (buf[0] + 1 !== buf.length) {
        console.log(`Invalid packet received (invalid length)`, buf.join(';'))
        return
      }

      if (buf[1] !== lightning4Type) {
        console.log(`Invalid packet received (not lightning4)`, buf.join(';'))
        return
      }

      log(
        'radio',
        `> ${buf
          .slice(4, -3)
          .map((n) => n.toString(2).padStart(8, '0'))
          .join('')}`
      )

      const rawValue = buf
        .slice(4, -3)
        .map((n) => n.toString(2).padStart(8, '0'))
        .join('')

      emitter.emit('data', rawValue)
    })

    return emitter
  }

  return listen
}
