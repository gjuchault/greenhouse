import { createNanoEvents } from 'nanoevents'
import { USBDevice } from '../usb'
import { buildListenRadio, Radio } from './listen'
import { start, done, failed } from '../log'
import { parse } from '../sensors'

interface RadioEvents {
  entry: (sensorId: string, value: string) => void
}

export async function createRadio({ usbDevices }: { usbDevices: USBDevice[] }) {
  if (process.env.DISABLE_RADIO) {
    start('Skipping Radio...')
    done()
    return
  }

  const listenRadio = buildListenRadio({ usbDevices })
  let radio: Radio

  try {
    start('Connecting to Radio...')
    radio = await listenRadio()
    done()
  } catch (err) {
    failed()
    console.log(err)
    return
  }

  const emitter = createNanoEvents<RadioEvents>()

  radio.on('data', async (data: string) => {
    const numericValue = parseInt(data, 2)

    const { sensorId, value } = parse(numericValue)

    emitter.emit('entry', sensorId, value)
  })

  return emitter
}
