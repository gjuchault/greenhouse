import chalk from 'chalk'

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

export function getTimestamp(date: Date) {
  return [
    date.getUTCHours().toString().padStart(2, '0'),
    date.getUTCMinutes().toString().padStart(2, '0'),
    date.getUTCSeconds().toString().padStart(2, '0'),
  ].join(':')
}
