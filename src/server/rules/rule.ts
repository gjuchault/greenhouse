export type Rule = {
  id: string
  source: string
  operation: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt'
  thresold: number
  target: string
  targetValue: number
}

export const reshapeRule = ({
  id,
  source,
  operation,
  thresold,
  target,
  target_value,
}: {
  id: string
  source: string
  thresold: number
  operation: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt'
  target: string
  target_value: number
}) => ({
  id,
  source,
  operation,
  thresold,
  target,
  targetValue: target_value,
})
