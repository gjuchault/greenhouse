import React from "react";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import {
  useActionables,
  useRemoveActionable,
  useCreateActionable,
} from "../queries";
import { ActionableInput } from "../actionable";
import { ActionablesTable } from "./ActionablesTable";

export function Actionables() {
  const { data: actionables } = useActionables();
  const [removeActionable] = useRemoveActionable();
  const [createActionable] = useCreateActionable();

  if (!actionables) {
    return null;
  }

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
        />
      </Pane>
    </Card>
  );
}
