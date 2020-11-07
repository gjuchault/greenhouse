import { createServer } from 'http'
import path from 'path'
import express, { NextFunction, Response, Request } from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import cors from 'cors'
import { log, logError } from '../log'
import { isLoggedIn } from './isLoggedIn'
import { handleLogin } from './controllers/login'
import {
  handleListEmitterSensors,
  handleCreateEmitterSensor,
  handleRemoveEmitterSensor,
} from './controllers/sensors'
import {
  handleListActionables,
  handleCreateActionable,
  handleRemoveActionable,
} from './controllers/actionables'
import {
  handleRulesAndCommands,
  handleCreateCommand,
  handleCreateRule,
} from './controllers/rules'
import { handleGetLogs } from './services/logs'

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
  app.get('/api/rules-and-commands', isLoggedIn, handleRulesAndCommands)
  app.get('/api/sensors', isLoggedIn, handleListEmitterSensors)
  app.delete('/api/sensors/:id', isLoggedIn, handleRemoveEmitterSensor)
  app.post('/api/sensors', isLoggedIn, handleCreateEmitterSensor)
  app.get('/api/actionables', isLoggedIn, handleListActionables)
  app.delete('/api/actionables/:id', isLoggedIn, handleRemoveActionable)
  app.post('/api/actionables', isLoggedIn, handleCreateActionable)
  app.get('/api/logs', isLoggedIn, handleGetLogs)
  app.post('/api/command', isLoggedIn, handleCreateCommand)
  app.post('/api/rule', isLoggedIn, handleCreateRule)

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../dist/app/index.html'))
  })

  const server = createServer(app)

  app.use(function (err: Error, _: Request, res: Response, __: NextFunction) {
    logError(err)

    if (res.headersSent) {
      return
    }

    return res.status(500).send('Server Error')
  })

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
