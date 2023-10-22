// init.js
require('dotenv').config();
const puppeteer = require('puppeteer');

async function initialize() {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Login
  console.log("Navigating to app.nbot.pl");
  await page.goto('https://app.nbot.pl/');
    console.log("Typing credentials...");
  await page.type('input[name="login"]', process.env.USERNAME);
  await page.type('input[name="password"]', process.env.PASSWORD);
    console.log("Credentials typed!");
    const buttons = await page.$x('//button[text()="Zaloguj się"]');
    if (buttons.length > 0) {
        await buttons[0].click();
    } else {
        console.log('Button not found');
    }
    console.log("Logged in!");
  return { browser, page };
}
module.exports = initialize;
