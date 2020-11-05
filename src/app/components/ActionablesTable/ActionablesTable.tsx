import React, { useState } from 'react'
import { Menu } from 'evergreen-ui'
import { Actionable, ActionableInput } from '../../models'
import { Table, makeDateCell } from '../Table/Table'
import { Confirm } from '../Confirm/Confirm'
import { CreateActionable } from '../CreateActionable/CreateActionable'

type Props = {
  actionables: Actionable[]
  onRemoveActionable: (actionableId: string) => Promise<void>
  onCreateActionable: (actionableInput: ActionableInput) => Promise<void>
}

export function ActionablesTable({
  actionables,
  onRemoveActionable,
  onCreateActionable,
}: Props) {
  const [actionableToDelete, setActionableToDelete] = useState<
    Actionable | undefined
  >(undefined)
  const [showCreateActionable, setShowCreateActionable] = useState(false)
  const [isCreatingActionable, setIsCreatingActionable] = useState(false)
  const [isRemoving, setIsRemoving] = useState<boolean>(false)

  return (
    <>
      {actionableToDelete && (
        <Confirm
          description={`Supprimer l'actionnable ${actionableToDelete.name}?`}
          isLoading={isRemoving}
          onClose={() => {
            setActionableToDelete(undefined)
          }}
          onConfirm={async () => {
            setIsRemoving(true)
            await onRemoveActionable(actionableToDelete.id)
            setIsRemoving(false)
            setActionableToDelete(undefined)
          }}
        />
      )}
      {showCreateActionable && (
        <CreateActionable
          isLoading={isCreatingActionable}
          onClose={() => setShowCreateActionable(false)}
          onConfirm={async (actionable) => {
            setIsCreatingActionable(true)
            await onCreateActionable(actionable)
            setIsCreatingActionable(false)
            setShowCreateActionable(false)
          }}
        />
      )}
      <Table<Actionable>
        items={actionables}
        renderFilterPlaceholder={(count) =>
          `Rechercher parmis ${count} actionnables`
        }
        columnsSizes={['auto', 150, 150, 150, 180]}
        columns={[
          {
            Header: 'Nom',
            accessor: 'name',
          },
          {
            Header: 'Adresse',
            accessor: 'target',
          },
          {
            Header: 'Type de valeur',
            accessor: (item) => item.valueType.range,
          },
          {
            Header: 'Valeur actuelle',
            accessor: (item) => item.lastAction?.value,
          },
          {
            Header: 'Envoyée le',
            accessor: (item) => new Date(item.lastAction?.sentAt ?? 0),
            ...makeDateCell(),
          },
        ]}
        onNewItem={() => {
          setShowCreateActionable(true)
        }}
        renderMenu={(actionable, close) => (
          <Menu>
            <Menu.Group>
              <Menu.Item
                intent="danger"
                onClick={() => {
                  setActionableToDelete(actionable)
                  close()
                }}
              >
                Supprimer
              </Menu.Item>
            </Menu.Group>
          </Menu>
        )}
      />
    </>
  )
}
