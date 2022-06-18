import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import {
  actionablesAtom,
  useRemoveActionable,
  useCreateActionable,
  useUpdateActionable,
  useSendCommand,
} from "../queries";
import { ActionableInput } from "../actionable";
import { ActionablesTable } from "./ActionablesTable";
import { SuspenseSpinner } from "../../../components/SuspenseSpinner";

export function Actionables() {
  return (
    <Suspense fallback={<SuspenseSpinner />}>
      <SuspensedActionables />
    </Suspense>
  );
}

function SuspensedActionables() {
  const [actionables] = useAtom(actionablesAtom);
  const { mutateAsync: removeActionable } = useRemoveActionable();
  const { mutateAsync: createActionable } = useCreateActionable();
  const { mutateAsync: updateActionable } = useUpdateActionable();
  const { mutateAsync: sendCommand } = useSendCommand();

  async function onRemoveActionable(actionableId: string) {
    await removeActionable({ id: actionableId });
  }

  async function onCreateActionable(actionableInput: ActionableInput) {
    await createActionable(actionableInput);
  }

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={900} marginBottom={majorScale(3)}>
        Actionables
      </Heading>
      <Pane>
        <ActionablesTable
          actionables={Array.from(actionables.values())}
          onRemoveActionable={onRemoveActionable}
          onCreateActionable={onCreateActionable}
          onUpdateActionable={updateActionable}
          onSendCommand={sendCommand}
        />
      </Pane>
    </Card>
  );
}
