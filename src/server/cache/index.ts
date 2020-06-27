import { date } from 'zod'

export const emitterCache = new Map<
  string,
  {
    value: string
    lastSentAt: string
    source: string
  }
>()

export const actionableCache = new Map<
  string,
  {
    value: string
    lastSentAt: string
  }
>()

export function setInitialActionableCache(
  actionables: {
    id: string
    target: string
    name: string
    value: '0-1' | '1-1024'
    default_value: string
  }[]
) {
  for (const actionable of actionables) {
    actionableCache.set(actionable.target, {
      value: actionable.default_value,
      lastSentAt: new Date(0).toISOString(),
    })
  }
}
