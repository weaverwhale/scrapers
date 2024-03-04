import fs from 'fs'
import puppeteer from 'puppeteer'
import chalk from 'chalk'

const logger = {
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

const REPORT_ADMIN_USER = 'michael@triplewhale.com'
const REPORT_ADMIN_PWD = 'TestPassword1'

const willyDashId = 'AmmcFZ69sXEyXk13HYSe'
const shopDomain = 'madisonbraids.myshopify.com'

const viewportSize = { width: 1240, height: 1754 }

export const createDashboardPDF = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 60000,
    args: [],
  })

  const page = await browser.newPage()
  await page.emulateMediaType('screen')
  await page.setViewport(viewportSize) //a4

  logger.info('pdf: started')
  const appLink = 'https://app.triplewhale.com'
  const url = `${appLink}/dashboards/${willyDashId}?shop-id=${shopDomain}`

  await page.goto(`${appLink}/signin`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#login-email-input', {
    timeout: 10000,
  })
  await page.type('#login-email-input', REPORT_ADMIN_USER)
  await page.type('#login-password-input', REPORT_ADMIN_PWD)
  await sleep(2000)

  await page.click('.continue-button')
  logger.info('pdf: logged in')
  await sleep(2000)

  logger.info('pdf: page loading')
  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  logger.info('pdf: page loaded; creating pdf')
  await page.evaluate(() => {
    const header = document.querySelector('.willy-dash-header')
    const mainPane = document.querySelector('.willy-main-pane')
    document.body.innerHTML = `<div>${header?.outerHTML}${mainPane?.outerHTML}</div>`
  })

  const pdfFileName = `${willyDashId}_${new Date()}.pdf`
  const pdfFile = await page.pdf({ format: 'a4', path: pdfFileName })
  fs.writeFileSync('pdfs/' + pdfFileName, pdfFile)
  fs.unlinkSync(pdfFileName)
  logger.info('pdf: created & saved')

  await browser.close()
  logger.info('pdf: finished ' + willyDashId)
}

createDashboardPDF()
