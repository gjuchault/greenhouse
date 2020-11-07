export interface EmitterSensor {
  id: string
  sensor: string
  name: string
  range: {
    min: number
    max: number
  }
  lastStatement?: {
    value: string
    sentAt: string
    source: string
  }
}

export interface EmitterSensorInput {
  sensor: string
  name: string
  min: number
  max: number
}

export function reshapeSensor(rawSensor: any): EmitterSensor {
  return {
    id: rawSensor.id,
    name: rawSensor.name,
    sensor: rawSensor.sensor,
    range: {
      min: rawSensor.min,
      max: rawSensor.max,
    },
    lastStatement:
      rawSensor.value && rawSensor.date && rawSensor.source
        ? {
            value: rawSensor.value,
            sentAt: new Date(rawSensor.date).toISOString(),
            source: rawSensor.source,
          }
        : undefined,
  }
}

export function parse(data: number) {
  const rawSensorId = (data & 0b111111100000000000000000) >> 17
  const rawSign = (data & 0b000000010000000000000000) >> 16
  const decimals = (data & 0b000000001100000000000000) >> 14
  const rawNumber = data & 0b000000000011111111111111

  const sensorId = rawSensorId.toString()
  const sign = rawSign === 0 ? '' : '-'
  const number = (rawNumber * Math.pow(10, -1 * decimals)).toFixed(decimals)

  const value = [sign, number].join('')

  return { sensorId, value }
}
