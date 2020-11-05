import React, { useState, useEffect } from 'react'
import { TextInput, Select, PaneProps } from 'evergreen-ui'
import { Actionable } from '../../models'

type Props = Pick<PaneProps, 'marginRight'> & {
  commandTarget: string
  actionables: Actionable[]
  commandValue: string
  onChange: (value: string) => void
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
    const nextSelectedActionable = actionables?.find(
      (receiverSensor) => receiverSensor.target === commandTarget
    )

    setSelectedActionable(nextSelectedActionable)

    if (nextSelectedActionable?.valueType.range === '0-1') {
      onChange('0')
    }
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
      <Select
        value={commandValue}
        onChange={(e) => onChange(e.target.value)}
        width={100}
        {...props}
      >
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
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
      {...props}
    />
  )
}
