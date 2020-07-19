import React from 'react'
import { Table, makeDateCell } from '../Table/Table'
import { formatDate } from '../../helpers/date'

type Log = {
  date: Date
  service: string
  message: string
}

type Props = {
  logs: Log[]
}

export function LogsTable({ logs }: Props) {
  return (
    <Table<Log>
      items={logs}
      renderFilterPlaceholder={(count) => `Rechercher parmis ${count} lignes`}
      columnsSizes={[180, 140, 'auto']}
      columns={[
        {
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
    />
  )
}
