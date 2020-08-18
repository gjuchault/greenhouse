import React, { useState, useEffect } from 'react'
import {
  Pane,
  Card,
  Heading,
  Select,
  TextInput,
  Button,
  Text,
  majorScale,
} from 'evergreen-ui'
import {
  useRulesAndCommands,
  useActionables,
  useSensors,
  useCreateCommand,
  useCreateRule,
} from '../../hooks/useQuery'
import { useTextInput } from '../../hooks/useInput'
import { ActionableValue } from '../../components/ActionableValue/ActionableValue'
import { RuleEditor } from '../../components/RuleEditor/RuleEditor'
import { defaultRule } from './defaultRule'

export function Rules() {
  const { data: rulesAndCommands, refetch } = useRulesAndCommands()

  const { data: actionables } = useActionables()
  const { data: emitterSensors } = useSensors()
  const [createCommand] = useCreateCommand()
  const [createRule, { status: createRuleStatus }] = useCreateRule()

  const [commandTarget, setCommandTarget] = useTextInput('')
  const [commandValue, setCommandValue] = useState('')
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

  if (!emitterSensors || !actionables || !rulesAndCommands) {
    return null
  }

  const sortedActionables = Array.from(actionables.values()).sort(
    (left, right) => {
      return left.name.localeCompare(right.name)
    }
  )

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={800} marginBottom={majorScale(3)}>
        Contrôle manuel
      </Heading>
      <Pane>
        <form onSubmit={handleCreateCommand}>
          <Pane
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            marginTop={majorScale(2)}
            marginBottom={majorScale(2)}
          >
            <Pane>
              <Select
                marginRight={majorScale(1)}
                value={commandTarget}
                onChange={setCommandTarget}
              >
                <option>Choisir une cible</option>
                {sortedActionables.map((actionable) => {
                  return (
                    <option key={actionable.id} value={actionable.target}>
                      {actionable.name}
                    </option>
                  )
                })}
              </Select>
            </Pane>
            <Pane>
              <ActionableValue
                commandTarget={commandTarget}
                commandValue={commandValue}
                onChange={setCommandValue}
                actionables={Array.from(actionables.values())}
                marginRight={majorScale(2)}
              />
            </Pane>
            <TextInput
              type="text"
              name="mins"
              placeholder="Minutes"
              value={commandExpires}
              onChange={setCommandExpires}
              width="100px"
              marginRight={majorScale(2)}
            />
            <Button type="submit">Appliquer</Button>
          </Pane>
        </form>

        <Pane display="flex" marginBottom={majorScale(3)}>
          {rulesAndCommands?.commands.map((rule, i, { length }) => (
            <Card
              key={rule.id}
              elevation={1}
              display="flex"
              flexDirection="column"
              padding={majorScale(2)}
              marginRight={i === length - 1 ? 0 : majorScale(2)}
            >
              <Text marginBottom={majorScale(1)}>Cible: {rule.target}</Text>
              <Text marginBottom={majorScale(1)}>Valeur: {rule.value}</Text>
              <Text>Expire: {makeMinsFromExpires(rule.expiresIn)}</Text>
            </Card>
          ))}
        </Pane>
      </Pane>

      <Heading size={800} marginBottom={majorScale(3)}>
        Règles
      </Heading>
      <Pane>
        <Button
          type="button"
          appearance="primary"
          disabled={createRuleStatus === 'loading'}
          onClick={handleCreateRule}
          marginBottom={majorScale(2)}
        >
          Sauvegarder
        </Button>
        <RuleEditor
          value={rule}
          onChange={setRule}
          actionables={Array.from(actionables.values())}
          emitterSensors={Array.from(emitterSensors.values())}
        />
      </Pane>
    </Card>
  )
}

function makeMinsFromExpires(expiresIn: string) {
  const diff = Math.abs(new Date().getTime() - new Date(expiresIn).getTime())
  return Math.floor(diff / 1000 / 60)
}

function makeDateFromExpires(expiresIn: string) {
  return new Date(Date.now() + Number(expiresIn) * 1000 * 60).toISOString()
}
