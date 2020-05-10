import { useState } from 'react'

export function useTextInput(
  initialValue: string
): [string, (e: React.ChangeEvent<HTMLInputElement>) => void] {
  const [value, setValue] = useState(initialValue)

  function setFieldValue(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
  }

  return [value, setFieldValue]
}
