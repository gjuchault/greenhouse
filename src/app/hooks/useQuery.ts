import { useQuery, useMutation, queryCache } from 'react-query'
import { AxiosResponse } from 'axios'
import { api } from '../api'
import {
  Actionable,
  ActionableInput,
  EmitterSensor,
  Command,
  Rule,
} from '../models'

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

export const useCreateActionable = () =>
  useMutation<void, unknown, ActionableInput>(
    (actionableInput) => api.post(`/api/actionables`, actionableInput),
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
