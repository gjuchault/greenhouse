import vm from 'vm'
import { log } from '../log'
import { Storage } from '../storage'
import { Rule } from './rule'
import { Command } from './command'
import { events } from '../events'

export async function createRules({ storage }: { storage: Storage }) {
  let rules: Rule[] = []
  let commands: Command[] = []

  function executeRules(
    emitterSensors: Map<
      string,
      {
        value: string
        lastSentAt: string
        source: string
      }
    >,
    actionables: Map<
      string,
      {
        value: string
        lastSentAt: string
      }
    >
  ): Map<string, string> {
    const now = new Date()

    log('rules', `Executing ${rules.length} rules (${now.toISOString()})`)

    const sortedRules = rules.sort(
      (left, right) => left.priority - right.priority
    )

    let result: Map<string, string> = new Map(
      Array.from(actionables.keys()).map((key) => [key, '0'])
    )

    for (const rule of sortedRules) {
      const vmContext = vm.createContext({
        date: now,
        emitterSensors,
        actionables,
      })

      try {
        const output = vm.runInContext(rule.rule, vmContext)

        if (output instanceof Map) {
          throw new TypeError(`Code is not returning a Map`)
        }

        for (const [key, value] of output as Map<string, number>) {
          result.set(key, value.toString())
        }
      } catch (err) {
        console.log(err)
        continue
      }
    }

    return result
  }

  async function refreshRulesAndCommands() {
    commands = await storage.listCommands()
    rules = await storage.listRules()
  }

  function listCommands() {
    return storage.listCommands()
  }

  await refreshRulesAndCommands()

  events.on('rules:new', refreshRulesAndCommands)
  setInterval(refreshRulesAndCommands, 30000)

  return {
    listCommands,
    executeRules,
  }
}
