import React from 'react'
import { Table, makeDateCell } from '../Table/Table'

type Log = {
  date: Date
  service: string
  message: string
}

type Props = {
  logs: Log[]
  onRefetch: () => Promise<void>
}

export function LogsTable({ logs, onRefetch }: Props) {
  return (
    <Table<Log>
      items={logs}
      renderFilterPlaceholder={(count) => `Rechercher parmis ${count} lignes`}
      columnsSizes={[180, 140, 'auto']}
      onRefetch={onRefetch}
      onNewItem={() => {}}
      columns={[
        {
          id: 'date',
          Header: 'Date',
          accessor: 'date',
          ...makeDateCell(true),
        },
        {
          Header: 'Service',
          accessor: 'service',
        },
        {
          Header: 'Message',
          accessor: 'message',
        },
      ]}
      initialState={{
        sortBy: [
          {
            id: 'date',
            desc: true,
          },
        ],
      }}
    />
  )
}
