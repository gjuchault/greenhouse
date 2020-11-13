import React from "react";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import { useSensors, useRemoveSensor, useCreateSensor } from "../queries";
import { SensorInput } from "../sensor";
import { SensorsTable } from "./SensorsTable";

export function Sensors() {
  const { data: sensors } = useSensors();
  const [removeSensor] = useRemoveSensor();
  const [createSensor] = useCreateSensor();

  if (!sensors) {
    return null;
  }

  async function onRemoveSensor(sensorId: string) {
    await removeSensor({ id: sensorId });
  }

  async function onCreateSensor(sensorInput: SensorInput) {
    await createSensor(sensorInput);
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
          sensors={Array.from(sensors.values())}
          onCreateSensor={onCreateSensor}
          onRemoveSensor={onRemoveSensor}
        />
      </Pane>
    </Card>
  );
}
