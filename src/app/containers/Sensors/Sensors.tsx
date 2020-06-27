import React from 'react'
import { useQuery } from '../../hooks/useQuery'
import { SensorsTable } from '../../components/SensorsTable/SensorsTable'
import styles from './Sensors.module.css'

type EmitterSensor = {
  id: string
  sensor: string
  name: string
  min: number
  max: number
  lastValue?: string
  lastSentAt?: string
  lastSentFrom?: string
}

export function Sensors() {
  const { data: emitterSensors } = useQuery<EmitterSensor[]>('/api/sensors')

  if (!emitterSensors) {
    return null
  }

  return (
    <div className={styles.sensors}>
      <h2>Sensors</h2>
      <div>
        <SensorsTable emitterSensors={emitterSensors} />
      </div>
    </div>
  )
}
