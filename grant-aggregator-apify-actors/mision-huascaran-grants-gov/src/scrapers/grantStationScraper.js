import { Actor, log } from 'apify';

export async function grantStationScraper(page, searchKeywords) {
    const startUrl = 'https://www.grantstation.com/search'; // Placeholder URL, might need adjustment

    for (const keyword of searchKeywords) {
        log.info(`Searching GrantStation for keyword: "${keyword}"`);
        await page.goto(startUrl, { waitUntil: 'networkidle0' });

        // These selectors are placeholders and will likely need to be updated
        const keywordInputSelector = 'input[name="q"], input#search-input, input[type="text"][placeholder*="search"]'; 
        const searchButtonSelector = 'button[type="submit"], button.search-button, input[type="submit"]'; 

        try {
            await page.waitForSelector(keywordInputSelector, { timeout: 60000, visible: true });
            await page.type(keywordInputSelector, keyword, { delay: 100 });
            log.info(`Typed "${keyword}" into the search box on GrantStation.`);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
                page.click(searchButtonSelector),
            ]);
            log.info('Search initiated on GrantStation.');

            // Placeholder for scraping logic - will need to be refined based on actual site structure
            const grantsOnPage = await page.evaluate(() => {
                const results = [];
                // Common selectors for search results, will need to be refined
                const grantListings = document.querySelectorAll('.grant-listing-item, .search-result, .opportunity-item');
                console.log(`Found ${grantListings.length} potential grant listings.`);

                grantListings.forEach(item => {
                    const title = item.querySelector('.grant-title, h2 a')?.innerText.trim();
                    const link = item.querySelector('.grant-link, h2 a')?.href;
                    
                    if (title && link) {
                        results.push({
                            'Grant Name': title,
                            'Application Link': link,
                            'Source': 'grantstation.com',
                            'Organization': ['GrantStation'], 
                            'Description': 'Scraped from GrantStation',
                            'Amount': null,
                            'Deadline': null,
                            'Category': [],
                            'Keywords': [],
                            'Eligibility': 'N/A',
                            'Contact Email': 'N/A',
                            'Status': 'Active',
                            'Priority': 'Medium',
                            'Notes': 'Scraped from grantstation.com'
                        });
                    }
                });
                return results;
            });

            log.info(`SUCCESS: Scraped ${grantsOnPage.length} opportunities from GrantStation for keyword "${keyword}".`);

            if (grantsOnPage.length > 0) {
                await Actor.pushData(grantsOnPage);
            }

            // Placeholder for pagination logic - will need to be refined
            // For now, assuming no pagination or single page for simplicity

        } catch (error) {
            log.error(`Error scraping GrantStation for keyword "${keyword}": ${error.message}`);
        }
    }
}
