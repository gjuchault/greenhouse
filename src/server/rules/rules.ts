import vm from 'vm'
import { log } from '../log'
import { Rule } from './rule'
import { Command } from './command'
import { events } from '../events'
import { EmitterSensor } from '../sensors'
import { Actionable } from '../actionables'

interface ProcessRulesParameters {
  rules: Rule[]
  commands: Command[]
  emitterSensors: Map<string, EmitterSensor>
  actionables: Map<string, Actionable>
}

export function processRules({
  rules,
  commands,
  emitterSensors,
  actionables,
}: ProcessRulesParameters): void {
  const now = new Date()

  log('rules', `Executing ${rules.length} rules (${now.toISOString()})`)

  const sortedRules = rules.sort(
    (left, right) => left.priority - right.priority
  )

  let result: Map<string, string> = new Map(
    Object.keys(actionables).map((target) => [target, '1'])
  )

  const Actionables: Record<string, string> = {}
  for (const actionable of actionables.values()) {
    Actionables[actionable.name] = actionable.target
  }

  const Sensors: Record<string, string> = {}
  for (const sensor of emitterSensors.values()) {
    Sensors[sensor.name] = sensor.sensor
  }

  const vmContext = vm.createContext({
    date: now,
    emitterSensors,
    actionables,
    Actionables,
    Sensors,
  })

  for (const rule of sortedRules) {
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

  for (const command of commands) {
    if (command.expiresIn <= now) {
      result.set(command.target, command.value)
    }
  }

  for (const [target, value] of result) {
    if (value !== actionables.get(target)?.lastAction?.value) {
      log('rules', `${target} : ${value}`)

      events.emit('command:send', target, value)
    }
  }
}
