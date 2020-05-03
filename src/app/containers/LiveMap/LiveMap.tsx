import React from 'react'
import { useQuery, State } from '../../hooks/useQuery'

type Sensors = [string, string][]

export function LiveMap() {
  const [sensors, state] = useQuery<Sensors>('/api/sensors')

  if (state !== State.Success) {
    return null
  }

  return (
    <div>
      <h2>Sensors:</h2>
      <div>
        {sensors?.map((sensor) => {
          return (
            <div>
              Sensor {sensor[0]}: <code>{sensor[1]}</code>
            </div>
          )
        })}
      </div>
    </div>
  )
}
