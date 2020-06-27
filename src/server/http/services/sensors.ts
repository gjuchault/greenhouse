import { actionableCache, emitterCache } from '../../cache'
import { createStorage } from '../../storage'

export async function listActionables() {
  const storage = await createStorage()

  const actionablesFromStorage = await storage.listActionables()

  const actionables: {
    id: string
    target: string
    name: string
    value: '0-1' | '1-1024'
    default_value: string
    lastValue?: string
    lastSentAt?: string
  }[] = []

  for (const actionable of actionablesFromStorage) {
    actionables.push({
      ...actionable,
      lastValue: actionableCache.get(actionable.target)?.value,
      lastSentAt: actionableCache.get(actionable.target)?.lastSentAt,
    })
  }

  return actionables
}

export async function listEmitterSensors() {
  const storage = await createStorage()
  const sensorsFromStorage = await storage.listEmitterSensors()
  const sensors: {
    id: string
    sensor: string
    name: string
    min: number
    max: number
    lastValue?: string
    lastSentAt?: string
    lastSentFrom?: string
  }[] = []

  for (const sensor of sensorsFromStorage) {
    sensors.push({
      ...sensor,
      lastValue: emitterCache.get(sensor.sensor)?.value,
      lastSentAt: emitterCache.get(sensor.sensor)?.lastSentAt,
      lastSentFrom: emitterCache.get(sensor.sensor)?.source,
    })
  }

  return sensors
}
