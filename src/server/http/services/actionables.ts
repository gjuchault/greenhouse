import { createStorage } from '../../storage'

export async function listActionables() {
  const storage = await createStorage()

  const actionables = await storage.listActionables()

  return actionables
}

export async function removeActionable(actionableId: string) {
  const storage = await createStorage()

  const actionables = await storage.removeActionable(actionableId)

  return actionables
}
