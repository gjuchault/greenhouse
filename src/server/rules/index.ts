import { Storage } from '../storage'
import { Rule } from './rule'
import { SwitchGuardError } from '../switchGuard'

let rules: Rule[] = []

export async function createRules({ storage }: { storage: Storage }) {
  refreshRules()
  setInterval(refreshRules, 15000)

  async function refreshRules() {
    rules = await storage.listRules()
  }

  function tryAgainstRules(sensorId: string, value: string) {
    for (const rule of rules) {
      if (rule.source !== sensorId) {
        continue
      }

      const m = (match: boolean) =>
        buildMatch(match, rule.target, rule.targetValue)

      switch (rule.operation) {
        case 'lt':
          return m(Number(value) < rule.thresold)
        case 'le':
          return m(Number(value) <= rule.thresold)
        case 'eq':
          return m(Number(value) === rule.thresold)
        case 'ne':
          return m(Number(value) !== rule.thresold)
        case 'ge':
          return m(Number(value) >= rule.thresold)
        case 'gt':
          return m(Number(value) > rule.thresold)
        default:
          throw new SwitchGuardError('tryAgainstRules', rule.operation)
      }
    }
  }

  function buildMatch(match: boolean, target: string, targetValue: number) {
    if (!match) return

    return { target, targetValue }
  }

  return {
    tryAgainstRules,
  }
}
