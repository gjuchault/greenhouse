import React from 'react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useQuery, State } from '../../hooks/useQuery'

type Sensors = [string, { value: string; lastSentAt: string; source: string }][]

export function LiveMap() {
  const [sensors, state] = useQuery<Sensors>('/api/sensors')

  if (state !== State.Success) {
    return null
  }

  const formatDate = (d: string) => {
    return formatDistanceToNow(new Date(d))
  }

  return (
    <div>
      <h2>Sensors:</h2>
      <div>
        {sensors?.map((sensor) => {
          return (
            <div style={{ marginBottom: '10px' }}>
              <div>Sensor {sensor[0]}:</div>
              <div>Valeur {sensor[1].value}</div>
              <div>Date: {formatDate(sensor[1].lastSentAt)}</div>
              <div>Source: {sensor[1].source}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
