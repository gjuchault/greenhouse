import { createNanoEvents, Emitter } from 'nanoevents'
import rfxcom from 'rfxcom'
import { USBDevice } from '../usb'

interface RadioEvents {
  command: (data: string) => void
}

export type Radio = Emitter<RadioEvents>

export function buildListenRadio({ usbDevices }: { usbDevices: USBDevice[] }) {
  async function find() {
    return usbDevices.find(({ kind }) => kind === 'radio')?.path
  }

  async function open(path: string) {
    return new Promise<any>((resolve, reject) => {
      const rfxtrx = new rfxcom.RfxCom(path, { debug: true })
      rfxtrx.initialise(() => {
        const transmitter = new rfxcom.Transmitter(rfxtrx, null)
        resolve({ rfxtrx, transmitter })
      })
    })
  }

  async function listen() {
    const path = await find()
    if (!path) {
      throw new Error('No Radio found')
    }

    const { rfxtrx, transmitter } = await open(path)

    const emitter = createNanoEvents<RadioEvents>()

    rfxtrx.on('receive', (buf: Buffer) => {
      console.log('radio receive:', buf)
    })

    return emitter
  }

  return listen
}
