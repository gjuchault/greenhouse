import { emitterCache } from '../../cache'
import { createStorage } from '../../storage'

export async function listSensorValues() {
  return Array.from(emitterCache.entries())
}

export async function listActionables() {
  const storage = await createStorage()
  return storage.listActionables()
}

export async function listEmitterSensors() {
  const storage = await createStorage()
  return storage.listEmitterSensors()
}
