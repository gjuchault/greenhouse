import { createNanoEvents } from 'nanoevents'
import { USBDevice } from '../usb'
import { buildListenArduino, Arduino } from './listen'
import { parse } from '../sensors'
import { start, done, failed } from '../log'

interface ArduinoEvents {
  entry: (sensor: string, value: string) => void
}

export async function createArduino({
  usbDevices,
}: {
  usbDevices: USBDevice[]
}) {
  if (process.env.DISABLE_ARDUINO) {
    start('Skipping Arduino...')
    done()
    return
  }

  const listenArduino = buildListenArduino({ usbDevices })
  let arduino: Arduino

  try {
    start('Connecting to Arduino...')
    arduino = await listenArduino()
    done()
  } catch (err) {
    failed()
    console.log(err)
    return
  }

  const emitter = createNanoEvents<ArduinoEvents>()

  arduino.on('line', async (data: string) => {
    const { sensorId, value } = parse(parseInt(data, 2))
    console.log('Arduino data', JSON.stringify({ sensorId, value }))
    emitter.emit('entry', sensorId, value)
  })

  return emitter
}
