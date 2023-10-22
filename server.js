const express = require('express');
const initialize = require('./init.js');
const scrapeData = require('./scraper.js');

let browser, page;
let shouldContinueScraping = true; // global flag to stop scraping

const app = express();
const PORT = 3000;

// Route for root path
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
        shouldContinueScraping = true;
        res.send('Browser initialized and logged in!');
    } catch (error) {
        console.error('Error initializing browser:', error);
        res.status(500).send('Failed to initialize browser.');
    }
});

// Route to start the scraping process
app.get('/scrape', async (req, res) => {
    try {
        shouldContinueScraping = true; // Set it to true again, in case it was stopped earlier
        await scrapeData(browser, page, shouldContinueScraping);
        res.send('Scraping process complete!');
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('Failed to scrape data.');
    }
});

// New route to stop the scraping process
app.get('/stop', (req, res) => {
    shouldContinueScraping = false;
    res.send('Scraping process has been stopped. Browser remains open.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});