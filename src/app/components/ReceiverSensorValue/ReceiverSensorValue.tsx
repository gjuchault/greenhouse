import React, { useState, useEffect } from 'react'

type Sensor = {
  id: string
  name: string
  sensor: string
  value: '0-1' | '1-1024'
}

type Props = {
  commandTarget: string
  receiverSensors: Sensor[]
  commandValue: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void
}

export function ReceiverSensorValue({
  commandTarget,
  receiverSensors,
  commandValue,
  onChange,
}: Props) {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | undefined>()

  useEffect(() => {
    setSelectedSensor(
      receiverSensors?.find(
        (receiverSensor) => receiverSensor.sensor === commandTarget
      )
    )
  }, [receiverSensors, commandTarget])

  if (!selectedSensor) {
    return <input type="text" name="value" placeholder="Valeur" disabled />
  }

  if (selectedSensor.value === '0-1') {
    return (
      <select value={commandValue} onChange={onChange}>
        <option value="0">0 (activé)</option>
        <option value="1">1 (désactivé)</option>
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
