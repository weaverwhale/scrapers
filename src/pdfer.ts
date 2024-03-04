import fs from 'fs'
import puppeteer from 'puppeteer'
import { logger, sleep } from './helpers'
import { REPORT_ADMIN_USER, REPORT_ADMIN_PWD, willyDashId, shopDomain } from './constants'

export const createDashboardPDF = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 60000,
    args: ['--start-maximized'],
    defaultViewport: null,
  })

  const page = await browser.newPage()
  await page.emulateMediaType('screen')

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
