import React from 'react'

type Props = {
  operation: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export function OperationInput({ operation, onChange }: Props) {
  return (
    <select value={operation} onChange={onChange}>
      <option value="lt">{'<'} (inférieur à)</option>
      <option value="le">≤ (inférieur ou égal à)</option>
      <option value="eq">= (égal à)</option>
      <option value="ne">≠ (non égal à)</option>
      <option value="ge">≥ (supérieur ou égal à)</option>
      <option value="gt">> (supérieur à)</option>
    </select>
  )
}
