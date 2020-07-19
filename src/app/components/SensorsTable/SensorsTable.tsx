import React from 'react'
import { EmitterSensor } from '../../hooks/useQuery'
import { Table, makeDateCell } from '../Table/Table'

type Props = {
  emitterSensors: EmitterSensor[]
}

export function SensorsTable({ emitterSensors }: Props) {
  return (
    <Table<EmitterSensor>
      items={emitterSensors}
      renderFilterPlaceholder={(count) => `Rechercher parmis ${count} capteurs`}
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
    />
  )
}
