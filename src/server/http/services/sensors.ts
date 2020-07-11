import { createStorage } from '../../storage'

export async function listActionables() {
  const storage = await createStorage()

  const actionables = await storage.listActionables()

  return actionables
}

export async function listEmitterSensors() {
  const storage = await createStorage()
  const sensors = await storage.listEmitterSensors()

  return sensors
}
