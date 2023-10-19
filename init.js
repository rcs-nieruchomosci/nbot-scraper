// init.js
const puppeteer = require('puppeteer');

let browser;
let page;

async function initialize() {
    browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    page = await browser.newPage();
// Login
console.log("Navigating to app.nbot.pl");
await page.goto('https://app.nbot.pl/');
console.log("Typing credentials...");
await page.type('input[name="login"]', process.env.USERNAME);
await page.type('input[name="password"]', process.env.PASSWORD);
    return { browser, page };
}

module.exports = initialize;
