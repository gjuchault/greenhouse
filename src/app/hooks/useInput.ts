import { useState } from 'react'

type UseTextInput = [string, (e: React.ChangeEvent<HTMLInputElement>) => void]

export function useTextInput(initialValue: string): UseTextInput {
  const [value, setValue] = useState(initialValue)

  function setFieldValue(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
  }

  return [value, setFieldValue]
}
