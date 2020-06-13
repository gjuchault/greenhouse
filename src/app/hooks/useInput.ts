import { useState } from 'react'

export function useTextInput(
  initialValue: string
): [string, (e: React.ChangeEvent<{ value: string }>) => void] {
  const [value, setValue] = useState(initialValue)

  function setFieldValue(e: React.ChangeEvent<{ value: string }>) {
    setValue(e.target.value)
  }

  return [value, setFieldValue]
}
