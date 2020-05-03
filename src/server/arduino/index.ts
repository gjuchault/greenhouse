import { createNanoEvents } from 'nanoevents'
import chalk from 'chalk'
import { USBDevice } from '../usb'
import { buildListenArduino, Arduino } from './listen'
import { parse } from '../sensors'
import { log } from '../log'

interface ArduinoEvents {
  entry: (sensor: string, value: string) => void
}

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
  let arduino: Arduino

  try {
    log('arduino', 'Connecting to Arduino...')
    arduino = await listenArduino()
  } catch (err) {
    console.log(err)
    return
  }

  const emitter = createNanoEvents<ArduinoEvents>()

  arduino.emitter.on('line', async (data: string) => {
    const { sensorId, value } = parse(parseInt(data, 2))
    log('arduino', `> sensor: ${sensorId} value: ${value}`)
    emitter.emit('entry', sensorId, value)
  })

  return {
    emitter,
    sendCommand: async (target: string, value: number) => {
      arduino.send(`${target};${Math.trunc(value).toString()}`)
    },
  }
}
