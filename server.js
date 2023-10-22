const express = require('express');
const initialize = require('./init.js');
const scrapeData = require('./scraper.js');

let browser, page;
let scrapingStatus = { shouldContinue: true };

const app = express();
const PORT = 3000;

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Received request for ${req.path} at ${new Date().toISOString()}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to the Scraper Express Server!');
});

app.get('/start', async (req, res) => {
    console.log("Entered /start endpoint");
    console.log(`Request from IP: ${req.ip} with User-Agent: ${req.headers['user-agent']}`);
    try {
        const initResults = await initialize();
        browser = initResults.browser;
        page = initResults.page;
        scrapingStatus.shouldContinue = true;
        res.send('Browser initialized and logged in!');
    } catch (error) {
        console.error('Error initializing browser:', error);
        res.status(500).send('Failed to initialize browser.');
    }
});

app.get('/scrape', async (req, res) => {
    try {
        scrapingStatus.shouldContinue = true;
        console.log("Page before scrapeData call:", page);
        await scrapeData(browser, page, scrapingStatus);
        res.send('Scraping process complete!');
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('Failed to scrape data.');
    }
});

app.get('/stop', (req, res) => {
    scrapingStatus.shouldContinue = false;
    res.send('Scraping process has been stopped. Browser remains open.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});