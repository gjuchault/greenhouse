import chalk from 'chalk'

export const start = (action: string) => process.stdout.write(action)
export const done = () => console.log(chalk.green(' Done'))
export const failed = () => console.log(chalk.red(' Failed'))

export const log = (service: string, message: string) => {
  console.log(`${getTimestamp()} [${chalk.blue(service)}] ${message}`)
}

export function getTimestamp() {
  const date = new Date()
  return [
    [
      date.getUTCFullYear(),
      date.getUTCMonth().toString().padStart(2, '0'),
      date.getUTCDate().toString().padStart(2, '0'),
    ].join('-'),
    [
      date.getUTCHours().toString().padStart(2, '0'),
      date.getUTCMinutes().toString().padStart(2, '0'),
      date.getUTCSeconds().toString().padStart(2, '0'),
    ].join(':'),
  ].join(' ')
}
