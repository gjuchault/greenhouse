import { createServer } from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import { start, done } from '../log'
import { isLoggedIn } from './isLoggedIn'
import { handleLogin } from './controllers/login'
import { handleSensors } from './controllers/sensors'

export async function createHttp() {
  if (process.env.DISABLE_HTTP) {
    start('Skipping HTTP...')
    done()
    return
  }

  start('Creating HTTP server...')

  const app = express()

  app.set('case sensitive routing', false)
  app.set('strict routing', false)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(helmet())
  app.use(cors())
  app.use(bodyParser.json({ limit: '5mb' }))

  app.post('/login', handleLogin)
  app.get('/sensors', isLoggedIn, handleSensors)

  const server = createServer(app)

  return new Promise((resolve) => {
    server.listen(
      Number(process.env.HTTP_PORT) || 3000,
      process.env.HTTP_BIND || '0.0.0.0',
      () => {
        done()
        resolve()
      }
    )
  })
}
