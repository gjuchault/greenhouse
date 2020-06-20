import { cache } from '../../cache'
import { createStorage } from '../../storage'

export async function listSensorValues() {
  return Array.from(cache.entries())
}

export async function listReceiverSensors() {
  const storage = await createStorage()

  return storage.listReceiverSensors()
}

export async function listEmitterSensors() {
  const storage = await createStorage()
  return storage.listEmitterSensors()
}
