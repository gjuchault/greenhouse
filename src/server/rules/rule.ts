export type Rule = {
  id: string
  rule: string
  priority: number
}

export const reshapeRule = ({
  id,
  rule,
  priority,
}: {
  id: string
  rule: string
  priority: number
}) => ({
  id,
  rule,
  priority,
})
