import { buildLogin } from './login'

export function buildControllers({ services }: { services: any }) {
  return {
    login: buildLogin({ services }),
  }
}
