import React, { useState, useEffect } from 'react'
import { Actionable } from '../../hooks/useQuery'

type Props = {
  commandTarget: string
  actionables: Actionable[]
  commandValue: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void
}

export function ActionableValue({
  commandTarget,
  actionables,
  commandValue,
  onChange,
}: Props) {
  const [selectedActionable, setSelectedActionable] = useState<
    Actionable | undefined
  >()

  useEffect(() => {
    setSelectedActionable(
      actionables?.find(
        (receiverSensor) => receiverSensor.target === commandTarget
      )
    )
  }, [actionables, commandTarget])

  if (!selectedActionable) {
    return <input type="text" name="value" placeholder="Valeur" disabled />
  }

  if (selectedActionable.valueType.range === '0-1') {
    return (
      <select value={commandValue} onChange={onChange}>
        <option value="0">0</option>
        <option value="1">1</option>
      </select>
    )
  }

  return (
    <input
      type="number"
      name="value"
      placeholder="Valeur"
      min="1"
      max="1024"
      value={commandValue}
      onChange={onChange}
    />
  )
}
