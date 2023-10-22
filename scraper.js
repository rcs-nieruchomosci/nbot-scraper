const { takeScreenshot } = require('./screenshotUtils');

const MAX_PAGES = 25;

async function extractAndSavePhoneNumber(page) {
    // Assuming the phone number is within a specific span. Modify the selector as necessary.
    const phoneNumberSpan = await page.$('button.btn.btn-list.btn-block.ng-star-inserted span');
    
    if (phoneNumberSpan) {
        const phoneNumber = await page.evaluate(span => span.textContent, phoneNumberSpan);
        // Save or process the phone number as needed. For now, just logging it:
        console.log(`Extracted phone number: ${phoneNumber}`);
        return phoneNumber;
    }
    throw new Error('Phone number not found.');
    }

async function navigateToOffersPage(page) {
    console.log("Clicking offers...");
    await page.waitForXPath('//a[@href="#/base/offers"]', { visible: true });
    await takeScreenshot(page, 'before_clicking_offers.png');
    
    const offersLink = await page.$x('//a[@href="#/base/offers"]');
    
    if (offersLink.length === 0) {
        throw new Error('Offers link not found on the page.');
    }
    
    await page.waitForTimeout(1000); // Added delay for safety

    try {
        await offersLink[0].click();
    } catch {
        console.log("Normal click failed. Trying with coordinates.");
        const rect = await offersLink[0].boundingBox();
        await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
    }

    await page.waitForTimeout(5000); // Wait for offers page to load
}

async function handlePhoneNumbers(page, shouldContinueScraping) {
    while (shouldContinueScraping) {
        const hiddenPhoneButtonXpath = '//button[contains(@class, "btn-list") and contains(@class, "btn-block") and contains(@class, "ng-star-inserted")]//span[contains(text(), " *** ")]';
        const hiddenPhoneButtons = await page.$x(hiddenPhoneButtonXpath);
    
        if (!hiddenPhoneButtons.length) {
            console.log("No more hidden phone numbers found.");
            break;
        }
    
        const hiddenPhoneButton = hiddenPhoneButtons[0];
        console.log("Clicking phone button...");
        await hiddenPhoneButton.click();
    
        try {
            await page.waitForFunction(() => {
                const phoneNumberSpan = document.querySelector('button.btn.btn-list.btn-block.ng-star-inserted span');
                return phoneNumberSpan && !phoneNumberSpan.textContent.includes('***');
            }, { timeout: 10000 });
    
            await extractAndSavePhoneNumber(page);
            await page.waitForTimeout(5000);
        } catch (err) {
            console.warn(`Error while getting number: ${err.message}`);
        }
    }
    return shouldContinueScraping; // Return the flag's value so that we can use it in the scrapeData function
}

async function scrapeData(browser, page, shouldContinueScraping) {
    console.log(shouldContinueScraping);
    page.setViewport({
        width: 1920,
        height: 1080,
    });
    page.setDefaultNavigationTimeout(20000);
    page.setDefaultTimeout(20000);

    try {
        await navigateToOffersPage(page);
    } catch (err) {
        console.log('Taking a screenshot due to error...');
        await takeScreenshot(page, 'error_screenshot.png');
        throw err;
    }

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
        // Store the return value from handlePhoneNumbers
        const continueScraping = await handlePhoneNumbers(page, shouldContinueScraping);
    
        if (continueScraping) {
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
        } else {
            console.log("Stopping scraper...");
            break;
        }
    }
    
    // Moved out of the for loop to ensure browser only closes after all processing is done.
    if (pageIndex === MAX_PAGES - 1 || !continueScraping) {
        await browser.close();
        console.log("Done!");
    }
}

module.exports = scrapeData;