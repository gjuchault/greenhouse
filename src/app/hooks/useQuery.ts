import { useState, useEffect } from 'react'
import { api } from '../api'

export enum State {
  Idle,
  Fetching,
  Success,
  Error,
}

type UseQuery<TResponse> = [TResponse | undefined, State]

export function useQuery<TResponse>(
  url: string,
  deps: unknown[] = []
): UseQuery<TResponse> {
  const [state, setState] = useState<State>(State.Idle)
  const [response, setResponse] = useState<TResponse>()

  useEffect(() => {
    async function fetchData() {
      setState(State.Fetching)
      let response: TResponse

      try {
        const { data } = await api.get<TResponse>(url)
        response = data
      } catch (err) {
        setState(State.Error)
        return
      }

      setState(State.Success)
      setResponse(response)
    }

    fetchData()
  }, deps)

  return [response, state]
}

type UseMutation<TBody, TResponse> = [
  (body: TBody) => Promise<TResponse>,
  State
]

export function useMutation<TBody, TResponse>(
  url: string
): UseMutation<TBody, TResponse> {
  const [state, setState] = useState<State>(State.Idle)

  async function postData(body: TBody) {
    let response: TResponse

    setState(State.Fetching)

    try {
      const { data } = await api.post(url, body)
      response = data
    } catch (err) {
      setState(State.Error)
      return
    }

    setState(State.Success)

    return response
  }

  return [postData, state]
}
