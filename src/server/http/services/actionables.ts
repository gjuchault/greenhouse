import { createStorage } from '../../storage'
import { ActionableInput } from '../../actionables'

const storage = createStorage()

export async function listActionables() {
  const actionables = await storage.listActionables()

  return actionables
}

export async function createActionable(actionableInput: ActionableInput) {
  await storage.createActionable(actionableInput)
}

export async function removeActionable(actionableId: string) {
  await storage.removeActionable(actionableId)
}
