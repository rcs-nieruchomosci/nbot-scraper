const puppeteer = require('puppeteer');
const fs = require('fs');
const initialize = require('./init.js');

async function extractAndSavePhoneNumber(page) {
    const phoneNumber = await page.$eval('button.btn.btn-list.btn-block.ng-star-inserted span', span => span.textContent.trim());
    console.log(phoneNumber);

    // Save to the in-memory array
    fs.appendFileSync('phone_numbers.txt', phoneNumber + '\n', 'utf-8');
}

async function scrapeData() {
    const { browser, page } = await initialize();
    const phoneNumbers = [];

    page.setViewport({
        width: 768,
        height: 1024
    });
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // Navigate to the offers section once
    console.log("Clicking offers...");
    await page.waitForXPath('//a[@href="#/base/offers"]');
    const offersLink = await page.$x('//a[@href="#/base/offers"]');
    await offersLink[0].click();

    // Wait for offers page to load
    await page.waitForTimeout(5000);

    for (let pageIndex = 0; pageIndex < 25; pageIndex++) { // Iterate for 25 pages
        let hasHiddenNumbers = true;

        while (hasHiddenNumbers) {
            const hiddenPhoneButtonXpath = '//button[contains(@class, "btn-list") and contains(@class, "btn-block") and contains(@class, "ng-star-inserted")]//span[contains(text(), " *** ")]';
            const hiddenPhoneButtons = await page.$x(hiddenPhoneButtonXpath);
            const hiddenPhoneButton = hiddenPhoneButtons[0];

            if (hiddenPhoneButton) {
                console.log("Clicking phone button...");
                await hiddenPhoneButton.click();

                try {
                    await page.waitForFunction(() => {
                        const phoneNumberSpan = document.querySelector('button.btn.btn-list.btn-block.ng-star-inserted span');
                        return phoneNumberSpan && !phoneNumberSpan.textContent.includes('***');
                    }, { timeout: 10000 }); // Wait for 10 seconds max

                    // Extract and immediately save the phone number
                    await extractAndSavePhoneNumber(page);

                    // Delay between getting phone numbers to avoid getting blocked
                    await page.waitForTimeout(5000);
                } catch (err) {
                    console.warn(`Error while getting number: ${err.message}`);
                    continue; // Continue with the next button
                }
            } else {
                hasHiddenNumbers = false;
            }
        }

        // Navigate to the next page
        console.log("Navigating to the next page...");
        const nextPageButton = await page.$('.pagination-next.page-item:not(.disabled) a.page-link');
        if (nextPageButton) {
            await Promise.all([
                nextPageButton.click(),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);
        } else {
            console.log("No more pages to navigate to.");
            break;
        }
    }

    await browser.close();
    console.log("Done!");
}

// Execute the scraping function
scrapeData().catch(error => {
    console.error(error);
    process.exit(1);
});