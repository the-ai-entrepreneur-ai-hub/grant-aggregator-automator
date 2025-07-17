import { Actor, log } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.main(async () => {
    log.info('--- EXECUTING THE TRUE HUMAN EMULATION STRATEGY ---');
    const input = await Actor.getInput() || {};
    const keywords = input.keywords || "Peru";

    const startUrl = 'https://www.grants.gov/search-grants';
    
    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 1,
        
        async requestHandler({ page }) {
            log.info(`Navigated to ${startUrl}. Beginning human-like interaction...`);
            
            const keywordInputSelector = 'input[name="keywords"]';
            const searchButtonSelector = 'button[type="submit"]:has-text("Search")';

            // 1. Wait for the keyword input box and type slowly.
            await page.waitForSelector(keywordInputSelector);
            await page.type(keywordInputSelector, keywords, { delay: 100 }); // 100ms delay between keystrokes
            log.info(`Typed "${keywords}" into the search box.`);

            // 2. Click the search button and simultaneously wait for the network response.
            log.info('Clicking search and waiting for the API response...');
            await Promise.all([
                page.waitForResponse(response => response.url().includes('/results/i14y') && response.status() === 200, { timeout: 60000 }),
                page.click(searchButtonSelector),
            ]);
            log.info('API response received. The results table should now be populated.');

            // 3. Now that we know the data is loaded, we can safely scrape the HTML.
            const dataRowSelector = 'td[headers="header-opportunity-number"]';
            await page.waitForSelector(dataRowSelector); // A quick wait to ensure rendering is complete.

            const grantsOnPage = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('tbody tr').forEach(row => {
                    const opportunityNumber = row.querySelector('td[headers="header-opportunity-number"]')?.innerText.trim();
                    if (opportunityNumber) {
                        const titleElement = row.querySelector('td[headers="header-opportunity-title"] a');
                        results.push({
                            'Opportunity Number': opportunityNumber,
                            'Opportunity Title': titleElement?.innerText.trim(),
                            'Funder Name': row.querySelector('td[headers="header-agency"]')?.innerText.trim(),
                            'Open Date': row.querySelector('td[headers="header-posted-date"]')?.innerText.trim(),
                            'Close Date': row.querySelector('td[headers="header-close-date"]')?.innerText.trim(),
                            'Application Link': titleElement?.href,
                        });
                    }
                });
                return results;
            });

            log.info(`SUCCESS: Scraped ${grantsOnPage.length} opportunities from the page.`);

            if (grantsOnPage.length > 0) {
                await Actor.pushData(grantsOnPage);
            }
        }
    });

    await crawler.run([startUrl]);
    log.info('Scraper has finished.');