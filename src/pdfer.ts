import fs from 'fs'
import puppeteer from 'puppeteer'
import { logger, sleep, makeDateRange } from './helpers'
import {
  APP_LINK,
  PDF_DIR,
  REPORT_ADMIN_USER,
  REPORT_ADMIN_PWD,
  WILLY_DASH_ID,
  SHOP_DOMAIN,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  DEFAULT_PDF_WIDTH,
} from './constants'

export const createDashboardPDF = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000,
    args: [
      '--start-maximized',
      `--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    defaultViewport: null,
  })

  logger.info('pdf: started for ' + WILLY_DASH_ID)
  const page = await browser.newPage()
  await page.emulateMediaType('screen')

  await page.goto(`${APP_LINK}/signin`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#login-email-input', {
    timeout: 10000,
  })
  await page.type('#login-email-input', REPORT_ADMIN_USER)
  await page.type('#login-password-input', REPORT_ADMIN_PWD)
  await sleep(2000)

  await page.click('.continue-button')
  logger.info('pdf: logged in')
  await sleep(2000)

  const generatedDateRange = makeDateRange(7)
  const dateRangeString = `&start=${generatedDateRange.start}&end=${generatedDateRange.end}`
  const url = `${APP_LINK}/dashboards/${WILLY_DASH_ID}?shop-id=${SHOP_DOMAIN}${dateRangeString}`
  logger.info('pdf: loading page: ' + url)
  await page.goto(url, {
    waitUntil: 'networkidle2',
  })

  logger.info('pdf: page loaded; creating pdf')
  await page.evaluate(() => {
    const header = document.querySelector('.willy-dash-header')
    const mainPane = document.querySelector('.willy-main-pane')
    document.body.innerHTML = `<div class="w-full"><div class="p-6.5">${header?.innerHTML}</div>${mainPane?.innerHTML}</div>`
  })

  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true })
  }

  const pdfFileName = `${WILLY_DASH_ID}_${new Date()}.pdf`
  const pdfFile = await page.pdf({
    width: DEFAULT_PDF_WIDTH,
    path: pdfFileName,
    printBackground: true,
  })
  fs.writeFileSync(PDF_DIR + pdfFileName, pdfFile)
  fs.unlinkSync(pdfFileName)
  logger.info('pdf: created & saved')

  await browser.close()
  logger.info('pdf: finished ' + WILLY_DASH_ID)
}

createDashboardPDF()
