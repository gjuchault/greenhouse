import chalk from 'chalk'

export const start = (action: string) => process.stdout.write(action)
export const done = () => console.log(chalk.green(' Done'))
export const failed = () => console.log(chalk.red(' Failed'))
