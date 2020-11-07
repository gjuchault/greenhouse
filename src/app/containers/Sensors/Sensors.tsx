import React from 'react'
import { Pane, Card, Heading, majorScale } from 'evergreen-ui'
import {
  useSensors,
  useRemoveEmitterSensor,
  useCreateEmitterSensor,
} from '../../hooks/useQuery'
import { SensorsTable } from '../../components/SensorsTable/SensorsTable'
import { EmitterSensorInput } from '../../models'

export function Sensors() {
  const { data: emitterSensors } = useSensors()
  const [removeEmitterSensor] = useRemoveEmitterSensor()
  const [createEmitterSensor] = useCreateEmitterSensor()

  if (!emitterSensors) {
    return null
  }

  async function onRemoveEmitterSensor(emittersensorId: string) {
    await removeEmitterSensor({ id: emittersensorId })
  }

  async function onCreateEmitterSensor(emittersensorInput: EmitterSensorInput) {
    await createEmitterSensor(emittersensorInput)
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
        <SensorsTable
          emitterSensors={Array.from(emitterSensors.values())}
          onCreateEmitterSensor={onCreateEmitterSensor}
          onRemoveEmitterSensor={onRemoveEmitterSensor}
        />
      </Pane>
    </Card>
  )
}
