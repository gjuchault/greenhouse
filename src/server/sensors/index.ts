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
