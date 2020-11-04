import React, { useState } from 'react'
import { Menu } from 'evergreen-ui'
import { Actionable } from '../../hooks/useQuery'
import { Table, makeDateCell } from '../Table/Table'
import { Confirm } from '../Confirm/Confirm'

type Props = {
  actionables: Actionable[]
  onRemoveActionable: (actionableId: string) => Promise<void>
}

export function ActionablesTable({ actionables, onRemoveActionable }: Props) {
  const [actionableToDelete, setActionableToDelete] = useState<
    Actionable | undefined
  >(undefined)
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
