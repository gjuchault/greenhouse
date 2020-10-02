import { USBDevice } from '../usb'
import { buildListenRadio } from './listen'
import { log, logError } from '../../log'
import { parse } from '../../sensors'
import { events } from '../../events'

export async function createRadio({ usbDevices }: { usbDevices: USBDevice[] }) {
  if (process.env.DISABLE_RADIO) {
    log('radio', 'Skipping Radio...')
    return
  }

  const listenRadio = buildListenRadio({ usbDevices })

  try {
    log('radio', 'Connecting to Radio...')
    await listenRadio()
    log('radio', 'Connected to Radio')
  } catch (err) {
    logError(err)
    return
  }

  events.on('radio:line', async (data: string) => {
    const numericValue = parseInt(data, 2)

    const { sensorId, value } = parse(numericValue)
    log('radio-receiver', `(sensor: ${sensorId} value: ${value})`)

    events.emit('radio:entry', sensorId, value)
  })
}
