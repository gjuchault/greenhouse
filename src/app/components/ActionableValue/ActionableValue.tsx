import React, { useState, useEffect } from 'react'
import { TextInput, Select, PaneProps } from 'evergreen-ui'
import { Actionable } from '../../hooks/useQuery'

type Props = PaneProps & {
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
  ...props
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
    return (
      <TextInput
        type="text"
        name="value"
        placeholder="Valeur"
        width="100px"
        disabled
        {...props}
      />
    )
  }

  if (selectedActionable.valueType.range === '0-1') {
    return (
      <Select value={commandValue} onChange={onChange} width={100} {...props}>
        <option value="0">0</option>
        <option value="1">1</option>
      </Select>
    )
  }

  return (
    <TextInput
      type="number"
      name="value"
      placeholder="Valeur"
      width="100px"
      min="1"
      max="1024"
      value={commandValue}
      onChange={onChange}
      {...props}
    />
  )
}
