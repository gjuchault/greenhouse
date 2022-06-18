import React from "react";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import {
  useSensors,
  useRemoveSensor,
  useCreateSensor,
  useUpdateSensor,
} from "../queries";
import { SensorsTable } from "./SensorsTable";

export function Sensors() {
  const { data: sensors } = useSensors();
  const { mutateAsync: removeSensor } = useRemoveSensor();
  const { mutateAsync: createSensor } = useCreateSensor();
  const { mutateAsync: updateSensor } = useUpdateSensor();

  if (!sensors) {
    return null;
  }

  async function handleRemoveSensor(sensorId: string) {
    await removeSensor({ id: sensorId });
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
          onCreateSensor={createSensor}
          onRemoveSensor={handleRemoveSensor}
          onUpdateSensor={updateSensor}
        />
      </Pane>
    </Card>
  );
}
