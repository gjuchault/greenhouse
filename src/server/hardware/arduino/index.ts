import { USBDevice } from '../usb'
import { buildListenArduino } from './listen'
import { parse } from '../../sensors'
import { log, logError } from '../../log'
import { events } from '../../events'

export async function createArduino({
  usbDevices,
}: {
  usbDevices: USBDevice[]
}) {
  if (process.env.DISABLE_ARDUINO) {
    log('arduino', 'Skipping Arduino...')
    return
  }

  const listenArduino = buildListenArduino({ usbDevices })

  try {
    log('arduino', 'Connecting to Arduino...')
    await listenArduino()
  } catch (err) {
    logError(err)
    return
  }

  events.on('arduino:line', async (data: string) => {
    const { sensorId, value } = parse(parseInt(data, 2))
    log('arduino-receiver', `(sensor: ${sensorId} value: ${value})`)
    events.emit('arduino:entry', sensorId, value)
  })
}
