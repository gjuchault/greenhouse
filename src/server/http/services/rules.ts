import { createStorage } from '../../storage'
import { events } from '../../events'

export async function listRulesAndCommands() {
  const storage = await createStorage()

  const rules = await storage.listRules()
  const commands = await storage.listCommands()

  return { rules, commands }
}

export async function createCommand(
  target: string,
  value: string,
  expiresIn: string
) {
  const storage = await createStorage()

  await storage.postCommand(target, value, expiresIn)

  events.emit('command:send', target, Number(value))
}

export async function createRule(
  source: string,
  operation: string,
  threshold: number,
  target: string,
  targetValue: number
) {
  const storage = await createStorage()

  await storage.postRule(source, operation, threshold, target, targetValue)
}
