import { createStorage } from '../../storage'

export async function listEmitterSensors() {
  const storage = await createStorage()
  const sensors = await storage.listEmitterSensors()

  return sensors
}
