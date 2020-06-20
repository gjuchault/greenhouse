export type Rule = {
  id: string
  source: string
  operation: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt'
  threshold: number
  target: string
  targetValue: number
}

export const reshapeRule = ({
  id,
  source,
  operation,
  threshold,
  target,
  target_value,
}: {
  id: string
  source: string
  threshold: number
  operation: 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt'
  target: string
  target_value: number
}) => ({
  id,
  source,
  operation,
  threshold,
  target,
  targetValue: target_value,
})
