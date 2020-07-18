import React from 'react'
import { Pane, Card, Heading, majorScale } from 'evergreen-ui'
import { useActionables } from '../../hooks/useQuery'
import { ActionablesTable } from '../../components/ActionablesTable/ActionablesTable'

export function Actionables() {
  const { data: actionables } = useActionables()

  if (!actionables) {
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
        Actionables
      </Heading>
      <Pane>
        <ActionablesTable actionables={Array.from(actionables.values())} />
      </Pane>
    </Card>
  )
}
