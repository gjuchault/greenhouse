import React from "react";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import { useHardware, useRestartHardware, useUpdateHardware } from "../queries";
import { HardwareTable } from "./HardwareTable";
import { Hardware } from "../hardware";

export function Hardwares() {
  const { data: hardwares } = useHardware();
  const [updateHardware] = useUpdateHardware();
  const [restartHardware] = useRestartHardware();

  if (!hardwares) {
    return null;
  }

  async function onUpdateHardwareName(
    hardware: Pick<Hardware, "path" | "name">
  ) {
    await updateHardware(hardware);
  }

  async function onRestartHardware(hardware: Pick<Hardware, "path">) {
    await restartHardware(hardware);
  }

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={900} marginBottom={majorScale(3)}>
        Matériels USB
      </Heading>
      <Pane>
        <HardwareTable
          hardwares={hardwares}
          onUpdateHardware={onUpdateHardwareName}
          onRestartHardware={onRestartHardware}
        />
      </Pane>
    </Card>
  );
}
