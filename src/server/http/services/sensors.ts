import { EmitterSensorInput } from '../../sensors'
import { createStorage } from '../../storage'

const storage = createStorage()

export async function listEmitterSensors() {
  const sensors = await storage.listEmitterSensors()

  return sensors
}

export async function createEmitterSensor(
  emitterSensorInput: EmitterSensorInput
) {
  await storage.createEmitterSensor(emitterSensorInput)
}

export async function removeEmitterSensor(emitterSensorId: string) {
  await storage.removeEmitterSensor(emitterSensorId)
}
