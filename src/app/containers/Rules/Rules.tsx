import React from 'react'
import { useQuery, useMutation } from '../../hooks/useQuery'

import styles from './Rules.module.css'
import { useTextInput } from '../../hooks/useInput'

type Rule = {}
type Command = { id: string; target: string; value: string; expiresIn: string }
type CreateCommandBody = {
  target: string
  value: string
  expiresIn: string
}

export function Rules() {
  const { data: rulesAndCommands, refetch } = useQuery<{
    rules: Rule[]
    commands: Command[]
  }>('/api/rules-and-commands')

  const [createCommand] = useMutation<CreateCommandBody, Command>(
    '/api/command'
  )

  const [commandTarget, setCommandTarget] = useTextInput('')
  const [commandValue, setCommandValue] = useTextInput('')
  const [commandExpires, setCommandExpires] = useTextInput('')

  const handleCreateCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCommand({
      target: commandTarget,
      value: commandValue,
      expiresIn: makeDateFromExpires(commandExpires),
    })

    await refetch()
  }

  return (
    <div className={styles.rules}>
      <h2 className={styles.title}>Contrôle manuel</h2>
      <form className={styles.form} onSubmit={handleCreateCommand}>
        <input
          type="text"
          name="target"
          placeholder="Cible"
          value={commandTarget}
          onChange={setCommandTarget}
        />
        <input
          type="text"
          name="value"
          placeholder="Valeur"
          value={commandValue}
          onChange={setCommandValue}
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
