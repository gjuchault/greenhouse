import React, { useEffect } from 'react'
import { Pane, Card, Heading, majorScale } from 'evergreen-ui'
import { useLogs } from '../../hooks/useQuery'
import { LogsTable } from '../../components/LogsTable/LogsTable'

export function Logs() {
  const { data: logs, refetch } = useLogs()

  if (!logs) {
    return null
  }

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={900} marginBottom={majorScale(3)}>
        Logs
      </Heading>
      <Pane>
        <LogsTable
          logs={logs}
          onRefetch={async () => {
            await refetch()
          }}
        />
      </Pane>
    </Card>
  )
}
