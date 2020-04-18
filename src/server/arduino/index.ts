import { createNanoEvents } from 'nanoevents'
import { USBDevice } from '../usb'
import { SensorsConfig } from '../storage'
import { buildListenArduino, Arduino } from './listen'
import { buildParseSensors, StatementEntry } from '../sensors'
import { start, done, failed } from '../log'

interface ArduinoEvents {
  statement: (data: StatementEntry[]) => void
}

export async function createArduino({
  usbDevices,
  sensorsConfig,
}: {
  usbDevices: USBDevice[]
  sensorsConfig: SensorsConfig
}) {
  if (process.env.DISABLE_ARDUINO) {
    start('Skipping Arduino...')
    done()
    return
  }

  const listenArduino = buildListenArduino({ usbDevices })
  const parseSensors = buildParseSensors({ sensorsConfig })
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
    const sensors = parseSensors(data)

    if (!sensors) {
      return
    }

    console.log('Arduino data', JSON.stringify(sensors))
    emitter.emit('statement', sensors)
  })

  return emitter
}
