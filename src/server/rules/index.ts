import { createStorage } from '../storage'
import { processRules } from './rules'
import { debounce } from '../helpers/debounce'

async function _executeRules(): Promise<void> {
  const storage = createStorage()

  const [rules, commands, emitterSensors, actionables] = await Promise.all([
    storage.listRules(),
    storage.listCommands(),
    storage.listEmitterSensors(),
    storage.listActionables(),
  ])

  const newActionablesValues = processRules({
    rules,
    commands,
    emitterSensors,
    actionables,
  })

  storage.setLastActionablesValues(newActionablesValues)
}

export const executeRules = debounce(_executeRules, 3500)
