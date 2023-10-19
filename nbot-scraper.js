require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
      headless: false,  // "new" is not valid here, use true or false for headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
    const page = await browser.newPage();
    // Set the viewport to a desktop resolution, for example, 1920x1080
    await page.setViewport({
      width: 1920,
      height: 1080
  });
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    
    // Login
    console.log("Navigating to app.nbot.pl");
    await page.goto('https://app.nbot.pl/');
    console.log("Typing credentials...");
    await page.type('input[name="login"]', process.env.USERNAME);
    await page.type('input[name="password"]', process.env.PASSWORD);
    
    // Click on the login button and wait for navigation
    console.log("Clicking login button...");
    await Promise.all([
        page.click('#submit'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    // Click on the offers link and wait for navigation
    console.log("Clicking offers...");
    await page.waitForXPath('//a[@href="#/base/offers"]');
    const offersLink = await page.$x('//a[@href="#/base/offers"]');
    await offersLink[0].click();

    // Add a delay to ensure the page and its content is loaded properly
    new Promise(r => setTimeout(r, 10000));

    console.log("Clicking phone button...");
    await page.waitForSelector('button.btn.btn-list.btn-block.ng-star-inserted');
    await page.click('button.btn.btn-list.btn-block.ng-star-inserted');
    // Wait for the phone number to be fully loaded.
    await page.waitForFunction(() => {
      const phoneNumberSpan = document.querySelector('button.btn.btn-list.btn-block.ng-star-inserted span');
      return phoneNumberSpan && !phoneNumberSpan.textContent.includes('***');
    });

    // Extract the phone number.
    const phoneNumber = await page.$eval('button.btn.btn-list.btn-block.ng-star-inserted span', span => span.textContent.trim());
    console.log(phoneNumber);

    await browser.close();
})();