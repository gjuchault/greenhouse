import chalk from 'chalk'

export type Log = (service: string, message: string) => void

export const log = (service: string, message: string) => {
  let coloredService = chalk.green(service)

  if (service === 'arduino') coloredService = chalk.blue(service)
  if (service === 'radio') coloredService = chalk.red(service)

  console.log(`${getTimestamp()} [${coloredService}] ${message}`)
}

export function getTimestamp() {
  const date = new Date()
  return [
    date.getUTCHours().toString().padStart(2, '0'),
    date.getUTCMinutes().toString().padStart(2, '0'),
    date.getUTCSeconds().toString().padStart(2, '0'),
  ].join(':')
}
