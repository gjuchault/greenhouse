import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import {
  hardwareAtom,
  useRestartHardware,
  useUpdateHardware,
} from "../queries";
import { HardwareTable } from "./HardwareTable";
import { Hardware } from "../hardware";
import { SuspenseSpinner } from "../../../components/SuspenseSpinner";

export function Hardwares() {
  return (
    <Suspense fallback={<SuspenseSpinner />}>
      <SuspensedHardwares />
    </Suspense>
  );
}

function SuspensedHardwares() {
  const [hardwares] = useAtom(hardwareAtom);
  const { mutateAsync: updateHardware } = useUpdateHardware();
  const { mutateAsync: restartHardware } = useRestartHardware();

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
