import { createStorage } from '../../storage'
import { ActionableInput } from '../../actionables'

const storage = createStorage()

export async function listActionables() {
  const actionables = await storage.listActionables()

  return actionables
}

export async function createActionable(actionableInput: ActionableInput) {
  const actionables = await storage.createActionable(actionableInput)

  return actionables
}

export async function removeActionable(actionableId: string) {
  const actionables = await storage.removeActionable(actionableId)

  return actionables
}
