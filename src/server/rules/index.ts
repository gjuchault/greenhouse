import { log } from '../log'
import { getStorage } from '../storage'
import { processRules } from './rules'
import { debounce } from '../helpers/debounce'

async function _executeRules(): Promise<void> {
  const now = new Date()
  const storage = getStorage()

  const [rules, commands, emitterSensors, actionables] = await Promise.all([
    storage.listRules(),
    storage.listCommands(),
    storage.listEmitterSensors(),
    storage.listActionables(),
  ])

  log('rules', `Executing ${rules.length} rules (${now.toISOString()})`)

  return processRules({
    rules,
    commands,
    emitterSensors,
    actionables,
  })
}

export const executeRules = debounce(_executeRules, 3500)
