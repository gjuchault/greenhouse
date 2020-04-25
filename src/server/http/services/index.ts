import { buildLogin } from './login'
import { Storage } from '../../storage'

export type Services = ReturnType<typeof buildServices>

export function buildServices({ storage }: { storage: Storage }) {
  return {
    login: buildLogin({ storage }),
  }
}
