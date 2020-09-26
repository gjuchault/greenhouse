import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

export const lruCache: [Date, string, string][] = []

export type Log = (service: string, message: string) => void

export const log = (service: string, message: string) => {
  const date = new Date()
  let coloredService = chalk.green(service)

  if (service === 'arduino') coloredService = chalk.blue(service)
  if (service === 'radio') coloredService = chalk.red(service)

  lruCache.push([date, service, message])

  if (lruCache.length > 500) {
    lruCache.shift()
  }

  console.log(`${getTimestamp(date)} [${coloredService}] ${message}`)
}

export const logError = (error: Error) => {
  const errorFilePath = path.join(__dirname, '../../stderr.out')

  fs.appendFileSync(
    errorFilePath,
    JSON.stringify({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
    }) + '\n',
    { encoding: 'utf-8' }
  )

  log('errors', error.message)
}

export function getTimestamp(date: Date) {
  return [
    date.getUTCHours().toString().padStart(2, '0'),
    date.getUTCMinutes().toString().padStart(2, '0'),
    date.getUTCSeconds().toString().padStart(2, '0'),
  ].join(':')
}
