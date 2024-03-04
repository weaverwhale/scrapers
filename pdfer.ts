import fs from 'fs';
import puppeteer from 'puppeteer';
import chalk from 'chalk';

const logger = {
  info: (msg) => {
    console.log(chalk.blue(msg));
  },
  error: (msg) => {
    console.log(chalk.red(msg));
  }
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}


const REPORT_ADMIN_USER = 'michael@triplewhale.com'
const REPORT_ADMIN_PWD = 'TestPassword1'

const willyDashId = 'AmmcFZ69sXEyXk13HYSe'
const shopDomain = 'madisonbraids.myshopify.com'

const viewportSize = { width: 2480, height: 3508 }

export const createDashboardPDF = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 60000,
    args: []
  });

  const page = await browser.newPage();
  await page.emulateMediaType('screen');
  await page.setViewport(viewportSize); //a4

  logger.info('pdf: started');
  const appLink = 'https://app.triplewhale.com';
  const url = `${appLink}/dashboards/${willyDashId}?shop-id=${shopDomain}`;
  await page.goto(`${appLink}/signin`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login-email-input', {
    timeout: 10000,
  });
  await page.type('#login-email-input', REPORT_ADMIN_USER);
  await page.type('#login-password-input', REPORT_ADMIN_PWD);
  await sleep(2000)

  logger.info('pdf: trying to log in');
  await page.click('.continue-button');
  logger.info('pdf: logged in');
  await sleep(2000)

  logger.info('pdf: loading page');
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });
  logger.info('pdf: page loaded: ' + url);

  // const screenshotFileName = `${willyDashId}_${new Date()}.jpg`;
  const elementToScreenshot = `.w-full.h-full[class*="container"]`; //slick!
  await page.$(elementToScreenshot);
  // await mainElement?.screenshot({
  //   path: screenshotFileName,
  //   fullPage: true,
  // });
  logger.info('pdf: element found & sreenshotted: ' + elementToScreenshot);

  const pdfFileName = `${willyDashId}_${new Date()}.pdf`;
  const pdfFile = await page.pdf({ ...viewportSize, path: pdfFileName });
  fs.writeFileSync('pdfs/' + pdfFileName, pdfFile);

  await browser.close();

  logger.info('pdf: finished ' + willyDashId);
};


createDashboardPDF()