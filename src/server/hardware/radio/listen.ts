/// <reference path="../../typings/rfxcom.d.ts" />

import rfxcom from 'rfxcom'
import { USBDevice } from '../usb'
import { logError } from '../../log'
import { events } from '../../events'

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

      rfxtrx.on('connectfailed', (err: string) => {
        logError(new Error(err))
      })

      rfxtrx.on('disconnect', (err: string) => {
        logError(new Error(err))
      })
    })
  }

  async function listen() {
    const path = find()
    if (!path) {
      throw new Error('No Radio found')
    }

    const rfxtrx = await open(path)

    rfxtrx.on('receive', (buf: number[]) => {
      if (buf[0] + 1 !== buf.length) {
        console.log(`Invalid packet received (invalid length)`, buf.join(';'))
        return
      }

      if (buf[1] !== lightning4Type) {
        console.log(`Invalid packet received (not lightning4)`, buf.join(';'))
        return
      }

      const line = buf
        .slice(4, -3)
        .map((n) => n.toString(2).padStart(8, '0'))
        .join('')

      events.emit('radio:line', line)
    })
  }

  return listen
}
