import axios, { AxiosResponse, AxiosError } from 'axios'
import { getToken, clearToken } from './auth'

export const api = axios.create({
  baseURL: createBaseUrl(),
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      clearToken()
    }

    return Promise.reject(err)
  }
)

function createBaseUrl() {
  if (location.hostname === 'localhost') {
    return 'http://localhost:3000/'
  }

  return `${location.protocol}//api.${location.hostname}:${location.port}/`
}
