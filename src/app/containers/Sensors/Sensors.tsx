import React from 'react'
import { useSensors } from '../../hooks/useQuery'
import { SensorsTable } from '../../components/SensorsTable/SensorsTable'
import styles from './Sensors.module.css'

export function Sensors() {
  const { data: emitterSensors } = useSensors()

  if (!emitterSensors) {
    return null
  }

  return (
    <div className={styles.sensors}>
      <h2>Sensors</h2>
      <div>
        <SensorsTable emitterSensors={Array.from(emitterSensors.values())} />
      </div>
    </div>
  )
}
