import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, State } from '../../hooks/useQuery'
import { useTextInput } from '../../hooks/useInput'
import { ActionableValue } from '../../components/ActionableValue/ActionableValue'
import { RuleEditor } from '../../components/RuleEditor/RuleEditor'
import { defaultRule } from './defaultRule'

import styles from './Rules.module.css'

type Rule = {
  id: string
  rule: string
  priority: number
}

type Command = { id: string; target: string; value: string; expiresIn: string }

type Actionable = {
  id: string
  target: string
  name: string
  value: '0-1' | '1-1024'
}

type EmitterSensor = {
  id: string
  sensor: string
  name: string
  min: number
  max: number
}

type CreateCommandBody = {
  target: string
  value: string
  expiresIn: string
}

type CreateRuleBody = {
  rule: string
  priority: number
}

const operatorsNames = {
  lt: 'inférieur à',
  le: 'inférieur ou égal à',
  eq: 'égal à',
  ne: 'différent à',
  ge: 'supérieur ou égal à',
  gt: 'supérieur à',
}

export function Rules() {
  const { data: rulesAndCommands, refetch } = useQuery<{
    rules: Rule[]
    commands: Command[]
  }>('/api/rules-and-commands')

  const { data: actionables } = useQuery<Actionable[]>('/api/actionables')
  const { data: emitterSensors } = useQuery<EmitterSensor[]>(
    '/api/emitter-sensors'
  )

  const [createCommand] = useMutation<CreateCommandBody, unknown>(
    '/api/command'
  )

  const [createRule, state] = useMutation<CreateRuleBody, unknown>('/api/rule')

  const [commandTarget, setCommandTarget] = useTextInput('')
  const [commandValue, setCommandValue] = useTextInput('')
  const [commandExpires, setCommandExpires] = useTextInput('')

  const [rule, setRule] = useState('')

  useEffect(() => {
    setRule(rulesAndCommands?.rules[0]?.rule || defaultRule)
  }, [rulesAndCommands])

  const handleCreateCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCommand({
      target: commandTarget,
      value: commandValue,
      expiresIn: makeDateFromExpires(commandExpires),
    })

    await refetch()
  }

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRule({
      rule: rule,
      priority: 1,
    })

    await refetch()
  }

  if (!emitterSensors || !actionables) {
    return null
  }

  const sortedActionables = actionables.sort((left, right) => {
    return left.name.localeCompare(right.name)
  })

  return (
    <div className={styles.rulesAndCommands}>
      <h2 className={styles.title}>Contrôle manuel</h2>
      <form className={styles.form} onSubmit={handleCreateCommand}>
        <select value={commandTarget} onChange={setCommandTarget}>
          <option>Choisir une cible</option>
          {sortedActionables.map((actionable) => {
            return (
              <option key={actionable.id} value={actionable.target}>
                {actionable.name}
              </option>
            )
          })}
        </select>
        <ActionableValue
          commandTarget={commandTarget}
          commandValue={commandValue}
          onChange={setCommandValue}
          actionables={actionables}
        />
        <input
          type="text"
          name="mins"
          placeholder="Minutes"
          value={commandExpires}
          onChange={setCommandExpires}
        />
        <button type="submit">Appliquer</button>
      </form>

      {rulesAndCommands?.commands.map((rule) => (
        <div key={rule.id}>
          <strong>Commande</strong>
          <div>Cible: {rule.target}</div>
          <div>Valeur: {rule.value}</div>
          <div>Expire: {makeMinsFromExpires(rule.expiresIn)}</div>
        </div>
      ))}

      <h2 className={styles.title}>Règles</h2>
      <button
        type="button"
        className={styles.save}
        disabled={state === State.Fetching}
        onClick={handleCreateRule}
      >
        Sauvegarder
      </button>
      <RuleEditor
        value={rule}
        onChange={setRule}
        actionables={actionables}
        emitterSensors={emitterSensors}
      />
    </div>
  )
}

function makeMinsFromExpires(expiresIn: string) {
  const diff = Math.abs(new Date().getTime() - new Date(expiresIn).getTime())
  return Math.floor(diff / 1000 / 60)
}

function makeDateFromExpires(expiresIn: string) {
  return new Date(Date.now() + Number(expiresIn) * 1000 * 60).toISOString()
}
