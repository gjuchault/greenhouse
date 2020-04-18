import { start, done } from '../log'

export const createHttp = () => {
  if (process.env.DISABLE_HTTP || process.env.NODE_ENV === 'development') {
    start('Skipping HTTP...')
    done()
    return
  }
}
