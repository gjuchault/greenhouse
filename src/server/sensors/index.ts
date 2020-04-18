export interface SensorConfig {
  id: string
  name: string
  index: number
}

export interface StatementEntry {
  sensorId: string
  value: string
}

const separator = ';'

export function buildParseSensors({
  sensorsConfig,
}: {
  sensorsConfig: SensorConfig[]
}) {
  function parse(line: string) {
    if (!line.includes(separator)) {
      console.log(line)
      return
    }

    const rawValues = line.split(separator)

    const statementEntries: StatementEntry[] = []

    for (let i = 0; i < sensorsConfig.length; i += 1) {
      const sensorId = sensorsConfig[i].id
      const value = (rawValues[i] || '-1').trim()

      if (value === '-1' || value === 'nan') {
        continue
      }

      statementEntries.push({
        sensorId,
        value,
      })
    }

    return statementEntries
  }

  return parse
}
