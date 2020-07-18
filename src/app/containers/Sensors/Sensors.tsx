import React from 'react'
import { Pane, Card, Heading, majorScale } from 'evergreen-ui'
import { useSensors } from '../../hooks/useQuery'
import { SensorsTable } from '../../components/SensorsTable/SensorsTable'

export function Sensors() {
  const { data: emitterSensors } = useSensors()

  if (!emitterSensors) {
    return null
  }

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={900} marginBottom={majorScale(3)}>
        Capteurs
      </Heading>
      <Pane>
        <SensorsTable emitterSensors={Array.from(emitterSensors.values())} />
      </Pane>
    </Card>
  )
}
