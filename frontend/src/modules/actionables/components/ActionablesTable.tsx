import React, { useState } from "react";
import { Menu } from "evergreen-ui";
import { Actionable, ActionableInput, CommandInput } from "../actionable";
import { Table, makeDateCell } from "../../../components/Table";
import { Confirm } from "../../../components/Confirm";
import { UpdateActionable } from "./UpdateActionable";
import { SendCommand } from "./SendCommand";

interface Props {
  actionables: Actionable[];
  onCreateActionable(actionableInput: ActionableInput): Promise<void>;
  onRemoveActionable(actionableId: string): Promise<void>;
  onUpdateActionable(actionable: Actionable): Promise<void>;
  onSendCommand(commandInput: CommandInput): Promise<void>;
}

export function ActionablesTable({
  actionables,
  onCreateActionable,
  onRemoveActionable,
  onUpdateActionable,
  onSendCommand,
}: Props) {
  const [globalFilter, setGlobalFilter] = useState<string | undefined>();
  const [actionableToDelete, setActionableToDelete] = useState<
    Actionable | undefined
  >(undefined);
  const [showCreateActionable, setShowCreateActionable] = useState(false);
  const [actionableToUpdate, setActionableToUpdate] = useState<
    Actionable | undefined
  >(undefined);
  const [actionableToSendCommand, setActionableToSendCommand] = useState<
    Actionable | undefined
  >(undefined);
  const [isCreatingActionable, setIsCreatingActionable] = useState(false);
  const [isUpdatingActionable, setIsUpdatingActionable] = useState(false);
  const [
    isSendingCommandToActionable,
    setIsSendingCommandToActionable,
  ] = useState(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const filteredActionables = actionables.filter((actionable) => {
    if (globalFilter !== undefined) {
      return (
        actionable.name.includes(globalFilter) ||
        actionable.target.includes(globalFilter)
      );
    }

    return true;
  });

  return (
    <>
      {actionableToDelete && (
        <Confirm
          description={`Supprimer le senseur ${actionableToDelete.name}?`}
          isLoading={isRemoving}
          onClose={() => {
            setActionableToDelete(undefined);
          }}
          onConfirm={async () => {
            setIsRemoving(true);
            await onRemoveActionable(actionableToDelete.id);
            setIsRemoving(false);
            setActionableToDelete(undefined);
          }}
        />
      )}
      {showCreateActionable && (
        <UpdateActionable
          isLoading={isCreatingActionable}
          onClose={() => setShowCreateActionable(false)}
          onConfirm={async (actionable) => {
            setIsCreatingActionable(true);
            await onCreateActionable(actionable);
            setIsCreatingActionable(false);
            setShowCreateActionable(false);
          }}
        />
      )}
      {actionableToUpdate && (
        <UpdateActionable
          isLoading={isUpdatingActionable}
          initialValues={actionableToUpdate}
          onClose={() => setActionableToUpdate(undefined)}
          onConfirm={async (actionable) => {
            setIsUpdatingActionable(true);
            await onUpdateActionable({
              id: actionableToUpdate.id,
              ...actionable,
            });
            setIsUpdatingActionable(false);
            setActionableToUpdate(undefined);
          }}
        />
      )}
      {actionableToSendCommand && (
        <SendCommand
          range={actionableToSendCommand.valueType.range}
          isLoading={isSendingCommandToActionable}
          onClose={() => setActionableToSendCommand(undefined)}
          onConfirm={async (commandInput) => {
            setIsSendingCommandToActionable(false);
            await onSendCommand({
              target: actionableToSendCommand.target,
              ...commandInput,
            });
            setIsSendingCommandToActionable(false);
            setActionableToSendCommand(undefined);
          }}
        />
      )}
      <Table<Actionable>
        items={filteredActionables}
        setGlobalFilter={setGlobalFilter}
        renderFilterPlaceholder={() =>
          `Rechercher parmi ${actionables.length} actionnables`
        }
        columnsSizes={["auto", 150, 150, 150, 180]}
        columns={[
          {
            Header: "Nom",
            accessor: "name",
          },
          {
            Header: "Adresse",
            accessor: "target",
          },
          {
            Header: "Type de valeur",
            accessor: (item) => item.valueType.range,
          },
          {
            Header: "Valeur actuelle",
            accessor: (item) => item.lastAction?.value,
          },
          {
            Header: "Envoyée le",
            accessor: (item) => new Date(item.lastAction?.sentAt ?? 0),
            ...makeDateCell(),
          },
        ]}
        onNewItem={() => {
          setShowCreateActionable(true);
        }}
        renderMenu={(actionable, close) => (
          <Menu>
            <Menu.Group>
              <Menu.Item
                intent="none"
                onClick={() => {
                  setActionableToSendCommand(actionable);
                  close();
                }}
              >
                Envoyer une commande
              </Menu.Item>
              <Menu.Item
                intent="none"
                onClick={() => {
                  setActionableToUpdate(actionable);
                  close();
                }}
              >
                Éditer
              </Menu.Item>
              <Menu.Item
                intent="danger"
                onClick={() => {
                  setActionableToDelete(actionable);
                  close();
                }}
              >
                Supprimer
              </Menu.Item>
            </Menu.Group>
          </Menu>
        )}
      />
    </>
  );
}
