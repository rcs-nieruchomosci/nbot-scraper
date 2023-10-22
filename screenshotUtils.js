// screenshotUtils.js

const pathModule = require('path');

const formatDateForFileName = () => {
    const now = new Date();
    // Format the date and time in the YYYY-MM-DD_HH-MM-SS format
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
};

async function takeScreenshot(page, filename) {
    try {
        const timestamp = formatDateForFileName();
        const fullPath = `/workspaces/nbot-scraper/screenshots/${filename.split('.png')[0]}_${timestamp}.png`;
        await page.screenshot({ path: fullPath });
    } catch (error) {
        console.log(`Error taking screenshot at ${fullPath}:`, error.message);
    }
}

module.exports = {
    takeScreenshot
};