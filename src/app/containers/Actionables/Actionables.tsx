import React from 'react'
import { useQuery } from '../../hooks/useQuery'
import { ActionablesTable } from '../../components/ActionablesTable/ActionablesTable'
import styles from './Actionables.module.css'

type Actionable = {
  id: string
  target: string
  name: string
  value: '0-1' | '1-1024'
  default_value: string
  lastValue?: string
  lastSentAt?: string
}

export function Actionables() {
  const { data: actionables } = useQuery<Actionable[]>('/api/actionables')

  if (!actionables) {
    return null
  }

  return (
    <div className={styles.actionables}>
      <h2>Actionables</h2>
      <div>
        <ActionablesTable actionables={actionables} />
      </div>
    </div>
  )
}
