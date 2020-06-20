import React from 'react'
import { useQuery, useMutation } from '../../hooks/useQuery'
import { useTextInput } from '../../hooks/useInput'
import { ReceiverSensorValue } from '../../components/ReceiverSensorValue/ReceiverSensorValue'
import { OperationInput } from '../../components/OperationInput/OperationInput'

import styles, { rules } from './Rules.module.css'

type Rule = {
  id: string
  operation: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt'
  source: string
  target: string
  targetValue: number
  threshold: number
}

type Command = { id: string; target: string; value: string; expiresIn: string }

type ReceiverSensor = {
  id: string
  name: string
  sensor: string
  value: '0-1' | '1-1024'
}

type CreateCommandBody = {
  target: string
  value: string
  expiresIn: string
}

type CreateRuleBody = {
  source: string
  operation: string
  threshold: number
  target: string
  targetValue: number
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

  const { data: receiverSensors } = useQuery<ReceiverSensor[]>(
    '/api/receiver-sensors'
  )
  const { data: emitterSensors } = useQuery<ReceiverSensor[]>(
    '/api/emitter-sensors'
  )

  const [createCommand] = useMutation<CreateCommandBody, unknown>(
    '/api/command'
  )

  const [createRule] = useMutation<CreateRuleBody, unknown>('/api/rule')

  const [commandTarget, setCommandTarget] = useTextInput('')
  const [commandValue, setCommandValue] = useTextInput('')
  const [commandExpires, setCommandExpires] = useTextInput('')

  const [ruleSource, setRuleSource] = useTextInput('')
  const [ruleOperation, setRuleOperation] = useTextInput('eq')
  const [ruleThreshold, setRuleThreshold] = useTextInput('')
  const [ruleTarget, setRuleTarget] = useTextInput('')
  const [ruleValue, setRuleValue] = useTextInput('')

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
      source: ruleSource,
      operation: ruleOperation,
      threshold: Number(ruleThreshold),
      target: ruleTarget,
      targetValue: Number(ruleValue),
    })

    await refetch()
  }

  if (!receiverSensors || !emitterSensors) {
    return null
  }

  const sortedReceiverSensors = receiverSensors.sort((left, right) => {
    const leftMagnitude = Number(left.sensor.slice(0, 1))
    const rightMagnitude = Number(right.sensor.slice(0, 1))

    if (leftMagnitude !== rightMagnitude) {
      return leftMagnitude - rightMagnitude
    }

    return left.name.localeCompare(right.name)
  })

  const sortedEmitterSensors = emitterSensors.sort((left, right) => {
    return left.name.localeCompare(right.name)
  })

  return (
    <div className={styles.rulesAndCommands}>
      <h2 className={styles.title}>Contrôle manuel</h2>
      <form className={styles.form} onSubmit={handleCreateCommand}>
        <select value={commandTarget} onChange={setCommandTarget}>
          <option>Choisir une cible</option>
          {sortedReceiverSensors.map((receiverSensor) => {
            return (
              <option key={receiverSensor.id} value={receiverSensor.sensor}>
                {receiverSensor.name}
              </option>
            )
          })}
        </select>
        <ReceiverSensorValue
          commandTarget={commandTarget}
          commandValue={commandValue}
          onChange={setCommandValue}
          receiverSensors={receiverSensors}
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
      <form className={styles.form} onSubmit={handleCreateRule}>
        Quand &nbsp;
        <select value={ruleSource} onChange={setRuleSource}>
          <option>Choisir une source</option>
          {sortedEmitterSensors.map((emitterSensors) => {
            return (
              <option key={emitterSensors.id} value={emitterSensors.sensor}>
                {emitterSensors.name}
              </option>
            )
          })}
        </select>
        <OperationInput operation={ruleOperation} onChange={setRuleOperation} />
        <input
          type="text"
          name="threshold"
          placeholder="Valeur"
          value={ruleThreshold}
          onChange={setRuleThreshold}
        />
        &nbsp;Alors &nbsp;
        <select value={ruleTarget} onChange={setRuleTarget}>
          <option>Choisir une cible</option>
          {sortedReceiverSensors.map((receiverSensor) => {
            return (
              <option key={receiverSensor.id} value={receiverSensor.sensor}>
                {receiverSensor.name}
              </option>
            )
          })}
        </select>
        &nbsp;Prend &nbsp;
        <ReceiverSensorValue
          commandTarget={ruleTarget}
          commandValue={ruleValue}
          onChange={setRuleValue}
          receiverSensors={receiverSensors}
        />
        <button type="submit">Appliquer</button>
      </form>
      <div className={styles.rules}>
        {rulesAndCommands?.rules.map((rule) => {
          const sourceName = emitterSensors.find(
            (sensor) => sensor.sensor === rule.source
          )?.name
          const targetName = receiverSensors.find(
            (sensor) => sensor.sensor === rule.target
          )?.name

          const operation = operatorsNames[rule.operation]

          return (
            <div key={rule.id} className={styles.rule}>
              <span>Quand</span>
              <strong>{rule.source}</strong>
              <span>({sourceName || 'inconnu'})</span>
              <strong>{operation}</strong>
              <strong>{rule.threshold}</strong>
              <span>Alors</span>
              <strong>{targetName}</strong>
              <span>Prend</span>
              <strong>{rule.targetValue}</strong>
            </div>
          )
        })}
      </div>
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
