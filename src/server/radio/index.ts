import { createNanoEvents } from 'nanoevents'
import { USBDevice } from '../usb'
import { SensorsConfig } from '../storage'
import { buildListenRadio, Radio } from './listen'
import { start, done, failed } from '../log'

interface RadioEvents {}

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

  // radio.on('line', async (data: string) => {
  //   const sensors = parseSensors(data)

  //   if (!sensors) {
  //     return
  //   }

  //   console.log('Arduino data', JSON.stringify(sensors))
  //   emitter.emit('statement', sensors)
  // })

  return emitter
}
