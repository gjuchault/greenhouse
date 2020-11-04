import {
  useQuery,
  useMutation,
  queryCache,
  MutationResultPair,
} from 'react-query'
import { api } from '../api'
import { AxiosResponse } from 'axios'

export interface EmitterSensor {
  id: string
  sensor: string
  name: string
  range: {
    min: number
    max: number
  }
  lastStatement?: {
    value: string
    sentAt: string
    source: string
  }
}

export interface Actionable {
  id: string
  target: string
  name: string
  valueType: {
    range: '0-1' | '1-1024'
    default: string
  }
  lastAction?: {
    value: string
    sentAt: string
  }
}

type Rule = {
  id: string
  rule: string
  priority: number
}

type Command = { id: string; target: string; value: string; expiresIn: string }

export const useActionables = () => {
  const q = useQuery<AxiosResponse<[string, Actionable][]>, string>(
    'GET /api/actionables',
    () => api.get('/api/actionables')
  )

  return {
    ...q,
    data: q.data ? new Map(q.data.data) : undefined,
  }
}

export const useRemoveActionable = () =>
  useMutation<void, unknown, { id: string }>(
    ({ id }) => api.delete(`/api/actionables/${id}`),
    {
      onSuccess: () => queryCache.invalidateQueries('GET /api/actionables'),
    }
  )

export const useSensors = () => {
  const q = useQuery<AxiosResponse<[string, EmitterSensor][]>, string>(
    'GET /api/sensors',
    () => api.get('/api/sensors')
  )

  return {
    ...q,
    data: q.data ? new Map(q.data.data) : undefined,
  }
}

export const useRulesAndCommands = () => {
  const q = useQuery<
    AxiosResponse<{
      rules: Rule[]
      commands: Command[]
    }>,
    string
  >('GET /api/rules-and-commands', () => api.get('/api/rules-and-commands'))

  return {
    ...q,
    data: q.data?.data,
  }
}

export const useLogs = () => {
  const q = useQuery<AxiosResponse<[string, string, string][]>, string>(
    'GET /api/logs',
    () => api.get('/api/logs')
  )

  return {
    ...q,
    data: q.data?.data.map(([date, service, message]) => ({
      date: new Date(date),
      service,
      message,
    })),
  }
}

type LoginBody = {
  user: string
  password: string
}

type LoginResponse =
  | { outcome: 'notLoggedIn'; reason: 'invalidBody' }
  | { outcome: 'notLoggedIn'; reason: 'userNotFound' }
  | { outcome: 'notLoggedIn'; reason: 'invalidPassword' }
  | { outcome: 'loggedIn'; name: string; token: string }

export const useLogin = () =>
  useMutation<LoginResponse, unknown, LoginBody>(
    async (body) => (await api.post('/api/login', body)).data
  )

type CreateCommandBody = {
  target: string
  value: string
  expiresIn: string
}

export const useCreateCommand = () =>
  useMutation<void, unknown, CreateCommandBody>(
    (body) => api.post('/api/command', body),
    {
      onSuccess: () =>
        queryCache.invalidateQueries('GET /api/rules-and-commands'),
    }
  )

type CreateRuleBody = {
  rule: string
  priority: number
}

export const useCreateRule = () =>
  useMutation<void, unknown, CreateRuleBody>(
    (body) => api.post('/api/rule', body),
    {
      onSuccess: () =>
        queryCache.invalidateQueries('GET /api/rules-and-commands'),
    }
  )
