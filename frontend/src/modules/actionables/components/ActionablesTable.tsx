import React, { useState } from "react";
import { Menu } from "evergreen-ui";
import { Actionable, ActionableInput } from "../actionable";
import { Table, makeDateCell } from "../../../components/Table";
import { Confirm } from "../../../components/Confirm";
import { UpdateActionable } from "./UpdateActionable";

interface Props {
  actionables: Actionable[];
  onCreateActionable(actionableInput: ActionableInput): Promise<void>;
  onRemoveActionable(actionableId: string): Promise<void>;
  onUpdateActionable(actionable: Actionable): Promise<void>;
}

export function ActionablesTable({
  actionables,
  onCreateActionable,
  onRemoveActionable,
  onUpdateActionable,
}: Props) {
  const [actionableToDelete, setActionableToDelete] = useState<
    Actionable | undefined
  >(undefined);
  const [showCreateActionable, setShowCreateActionable] = useState(false);
  const [actionableToUpdate, setActionableToUpdate] = useState<
    Actionable | undefined
  >(undefined);
  const [isCreatingActionable, setIsCreatingActionable] = useState(false);
  const [isUpdateingActionable, setIsUpdateingActionable] = useState(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

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
          isLoading={isUpdateingActionable}
          initialValues={actionableToUpdate}
          onClose={() => setActionableToUpdate(undefined)}
          onConfirm={async (actionable) => {
            setIsUpdateingActionable(true);
            await onUpdateActionable({
              id: actionableToUpdate.id,
              ...actionable,
            });
            setIsUpdateingActionable(false);
            setActionableToUpdate(undefined);
          }}
        />
      )}
      <Table<Actionable>
        items={actionables}
        renderFilterPlaceholder={(count) =>
          `Rechercher parmis ${count} actionnables`
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
