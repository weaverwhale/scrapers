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

export const createDashboardPDF = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000,
    args: [
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ],
  });

  const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';
  const page = await browser.newPage();
  await page.setUserAgent(ua);
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  logger.info('pdf: started');
  const appLink = 'https://app.triplewhale.com';
  const url = `${appLink}/dashboards/${willyDashId}?shop-id=${shopDomain}`;
  await page.goto(`${appLink}/signin`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login-email-input', {
    timeout: 10000,
  });
  await page.type('#login-email-input', REPORT_ADMIN_USER);
  await page.type('#login-password-input', REPORT_ADMIN_PWD);
  await sleep(4000)

  logger.info('pdf: trying to log in');
  await page.click('.continue-button');
  logger.info('pdf: logged in');
  await sleep(4000)

  logger.info('pdf: going to page');
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });
  logger.info('pdf: page opened: ' + url);

  const elementToScreenshot = `.mantine-AppShell-main`;
  await page.$(elementToScreenshot);
  logger.info('pdf: element found: ' + elementToScreenshot);
  logger.info('pdf: creating PDF');

  const dom = await page.$eval(elementToScreenshot, (element) => {
    return element.innerHTML;
  });
  await page.emulateMediaType('screen');
  await page.setContent(dom, { waitUntil: 'load' });

  const pdfFileName = `${willyDashId}_${new Date()}.pdf`;
  const pdfFile = await page.pdf({ format: 'A4', path: pdfFileName });
  fs.writeFileSync(pdfFileName, pdfFile);

  await browser.close();

  logger.info('pdf: finished ' + willyDashId);
};


createDashboardPDF()