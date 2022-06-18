import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import {
  useRemoveSensor,
  useCreateSensor,
  useUpdateSensor,
  sensorsAtom,
} from "../queries";
import { SensorsTable } from "./SensorsTable";
import { SuspenseSpinner } from "../../../components/SuspenseSpinner";

export function Sensors() {
  return (
    <Suspense fallback={<SuspenseSpinner />}>
      <SuspensedSensors />
    </Suspense>
  );
}

function SuspensedSensors() {
  const [sensors] = useAtom(sensorsAtom);
  const { mutateAsync: removeSensor } = useRemoveSensor();
  const { mutateAsync: createSensor } = useCreateSensor();
  const { mutateAsync: updateSensor } = useUpdateSensor();

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
