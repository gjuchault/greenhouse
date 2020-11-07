import React, { useState } from 'react'
import { Menu } from 'evergreen-ui'
import { EmitterSensor, EmitterSensorInput } from '../../models'
import { Table, makeDateCell } from '../Table/Table'
import { Confirm } from '../Confirm/Confirm'
import { CreateEmitterSensor } from '../CreateEmitterSensor/CreateEmitterSensor'

type Props = {
  emitterSensors: EmitterSensor[]
  onRemoveEmitterSensor: (emitterSensorId: string) => Promise<void>
  onCreateEmitterSensor: (
    emitterSensorInput: EmitterSensorInput
  ) => Promise<void>
}

export function SensorsTable({
  emitterSensors,
  onCreateEmitterSensor,
  onRemoveEmitterSensor,
}: Props) {
  const [emitterSensorToDelete, setEmitterSensorToDelete] = useState<
    EmitterSensor | undefined
  >(undefined)
  const [showCreateEmitterSensor, setShowCreateEmitterSensor] = useState(false)
  const [isCreatingEmitterSensor, setIsCreatingEmitterSensor] = useState(false)
  const [isRemoving, setIsRemoving] = useState<boolean>(false)

  return (
    <>
      {emitterSensorToDelete && (
        <Confirm
          description={`Supprimer le senseur ${emitterSensorToDelete.name}?`}
          isLoading={isRemoving}
          onClose={() => {
            setEmitterSensorToDelete(undefined)
          }}
          onConfirm={async () => {
            setIsRemoving(true)
            await onRemoveEmitterSensor(emitterSensorToDelete.id)
            setIsRemoving(false)
            setEmitterSensorToDelete(undefined)
          }}
        />
      )}
      {showCreateEmitterSensor && (
        <CreateEmitterSensor
          isLoading={isCreatingEmitterSensor}
          onClose={() => setShowCreateEmitterSensor(false)}
          onConfirm={async (emitterSensor) => {
            setIsCreatingEmitterSensor(true)
            await onCreateEmitterSensor(emitterSensor)
            setIsCreatingEmitterSensor(false)
            setShowCreateEmitterSensor(false)
          }}
        />
      )}
      <Table<EmitterSensor>
        items={emitterSensors}
        renderFilterPlaceholder={(count) =>
          `Rechercher parmis ${count} capteurs`
        }
        columnsSizes={['auto', 150, 150, 150, 180, 180, 150]}
        columns={[
          {
            Header: 'Nom',
            accessor: 'name',
          },
          {
            Header: 'Adresse',
            accessor: 'sensor',
          },
          {
            Header: 'Minimum',
            accessor: (item) => item.range.min,
          },
          {
            Header: 'Maximum',
            accessor: (item) => item.range.max,
          },
          {
            Header: 'Dernière valeur',
            accessor: (item) => item.lastStatement?.value,
          },
          {
            Header: 'Envoyée le',
            accessor: (item) => new Date(item.lastStatement?.sentAt ?? 0),
            ...makeDateCell(),
          },
          {
            Header: 'Source',
            accessor: (item) => item.lastStatement?.source,
          },
        ]}
        onNewItem={() => {
          setShowCreateEmitterSensor(true)
        }}
        renderMenu={(emitterSensor, close) => (
          <Menu>
            <Menu.Group>
              <Menu.Item
                intent="danger"
                onClick={() => {
                  setEmitterSensorToDelete(emitterSensor)
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
