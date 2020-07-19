import React from 'react'
import { Actionable } from '../../hooks/useQuery'
import { Table, makeDateCell } from '../Table/Table'

type Props = {
  actionables: Actionable[]
}

export function ActionablesTable({ actionables }: Props) {
  return (
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
    />
  )
}
