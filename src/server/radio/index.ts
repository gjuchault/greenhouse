import { createNanoEvents } from 'nanoevents'
import chalk from 'chalk'
import { USBDevice } from '../usb'
import { buildListenRadio, Radio } from './listen'
import { log } from '../log'
import { parse } from '../sensors'

interface RadioEvents {
  entry: (sensorId: string, value: string) => void
}

export async function createRadio({ usbDevices }: { usbDevices: USBDevice[] }) {
  if (process.env.DISABLE_RADIO) {
    log('radio', 'Skipping Radio...')
    return
  }

  const listenRadio = buildListenRadio({ usbDevices })
  let radio: Radio

  try {
    log('radio', 'Connecting to Radio...')
    radio = await listenRadio()
  } catch (err) {
    console.log(err)
    return
  }

  const emitter = createNanoEvents<RadioEvents>()

  radio.on('data', async (data: string) => {
    const numericValue = parseInt(data, 2)

    const { sensorId, value } = parse(numericValue)
    log('radio', `sensor: ${sensorId} value: ${value}`)

    emitter.emit('entry', sensorId, value)
  })

  return emitter
}
