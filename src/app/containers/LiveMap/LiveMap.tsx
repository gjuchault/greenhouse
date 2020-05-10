import React from 'react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useQuery } from '../../hooks/useQuery'
import styles from './LiveMap.module.css'

type Sensors = [string, { value: string; lastSentAt: string; source: string }][]

export function LiveMap() {
  const { data: sensors } = useQuery<Sensors>('/api/sensors')

  const formatDate = (d: string) => {
    return formatDistanceToNow(new Date(d))
  }

  return (
    <div className={styles.liveMap}>
      <h2>Sensors</h2>
      <div className={styles.sensors}>
        {sensors?.map((sensor) => {
          return (
            <div className={styles.sensor}>
              <div>
                <strong>Sensor</strong>: <code>{sensor[0]}</code>
              </div>
              <div>
                <strong>Valeur</strong>: <code>{sensor[1].value}</code>
              </div>
              <div>
                <strong>Date</strong>: {formatDate(sensor[1].lastSentAt)}
              </div>
              <div>
                <strong>Source</strong>: {sensor[1].source}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
