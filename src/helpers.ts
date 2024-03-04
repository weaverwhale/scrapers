import chalk from 'chalk'

export const logger = {
  info: (msg) => {
    console.log(chalk.blue(msg))
  },
  error: (msg) => {
    console.log(chalk.red(msg))
  },
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
