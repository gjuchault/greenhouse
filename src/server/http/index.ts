import { createServer } from 'http'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import { log } from '../log'
import { isLoggedIn } from './isLoggedIn'
import { handleLogin } from './controllers/login'
import {
  handleSensors,
  handleListActionables,
  handleListEmitterSensors,
} from './controllers/sensors'
import {
  handleRulesAndCommands,
  handleCreateCommand,
  handleCreateRule,
} from './controllers/rules'

export async function createHttp() {
  if (process.env.DISABLE_HTTP) {
    log('http', 'Skipping HTTP...')
    return
  }

  log('http', 'Creating HTTP server...')

  const app = express()

  app.set('case sensitive routing', false)
  app.set('strict routing', false)
  app.set('trust proxy', true)
  app.set('x-powered-by', false)

  app.use(helmet())
  app.use(cors())
  app.use(bodyParser.json({ limit: '5mb' }))

  app.use(express.static(path.join(__dirname, '../../../dist/app')))

  app.post('/api/login', handleLogin)
  app.get('/api/sensors', isLoggedIn, handleSensors)
  app.get('/api/rules-and-commands', isLoggedIn, handleRulesAndCommands)
  app.get('/api/actionables', isLoggedIn, handleListActionables)
  app.get('/api/emitter-sensors', isLoggedIn, handleListEmitterSensors)
  app.post('/api/command', isLoggedIn, handleCreateCommand)
  app.post('/api/rule', isLoggedIn, handleCreateRule)

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../dist/app/index.html'))
  })

  const server = createServer(app)

  return new Promise((resolve) => {
    server.listen(
      Number(process.env.HTTP_PORT) || 3000,
      process.env.HTTP_BIND || '0.0.0.0',
      () => {
        resolve()
      }
    )
  })
}
