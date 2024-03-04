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

export function makeDateRange(days: number = 30) {
  var dateOffset = 24 * 60 * 60 * 1000 * days
  const end = new Date()
  const start = new Date().setTime(end.getTime() - dateOffset)
  return { start: getFormattedDate(new Date(start)), end: getFormattedDate(new Date(end)) }
}

export function getFormattedDate(date) {
  let year = date.getFullYear()
  let month = (1 + date.getMonth()).toString().padStart(2, '0')
  let day = date.getDate().toString().padStart(2, '0')

  return month + '-' + day + '-' + year
}
