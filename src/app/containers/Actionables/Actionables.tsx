import React from 'react'
import { useActionables } from '../../hooks/useQuery'
import { ActionablesTable } from '../../components/ActionablesTable/ActionablesTable'
import styles from './Actionables.module.css'

export function Actionables() {
  const { data: actionables } = useActionables()

  if (!actionables) {
    return null
  }

  return (
    <div className={styles.actionables}>
      <h2>Actionables</h2>
      <div>
        <ActionablesTable actionables={Array.from(actionables.values())} />
      </div>
    </div>
  )
}
