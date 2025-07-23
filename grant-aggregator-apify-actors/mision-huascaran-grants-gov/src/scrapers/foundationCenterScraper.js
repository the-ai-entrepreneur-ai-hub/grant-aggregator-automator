import { Actor, log } from 'apify';

export async function foundationCenterScraper(page, searchKeywords) {
    const startUrl = 'https://foundationcenter.org/search';

    for (const keyword of searchKeywords) {
        log.info(`Searching Foundation Center for keyword: "${keyword}"`);
        await page.goto(startUrl, { waitUntil: 'networkidle0' });

        // Updated selectors based on common patterns and grants.gov experience
        const keywordInputSelector = 'input[name="q"], input#search-field-en-small, input[type="search"]'; 
        const searchButtonSelector = 'button[type="submit"], button.usa-button, a[aria-label*="Search"]'; 

        try {
            await page.waitForSelector(keywordInputSelector, { timeout: 60000, visible: true });
            await page.type(keywordInputSelector, keyword, { delay: 100 });
            log.info(`Typed "${keyword}" into the search box on Foundation Center.`);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
                page.click(searchButtonSelector),
            ]);
            log.info('Search initiated on Foundation Center.');

            // Placeholder for scraping logic - will need to be refined based on actual site structure
            const grantsOnPage = await page.evaluate(() => {
                const results = [];
                // Common selectors for search results, will need to be refined
                const grantListings = document.querySelectorAll('.search-result-item, .grant-listing, .opportunity-card');
                console.log(`Found ${grantListings.length} potential grant listings.`);

                grantListings.forEach(item => {
                    const title = item.querySelector('.grant-title, h3 a')?.innerText.trim();
                    const link = item.querySelector('.grant-link, h3 a')?.href;
                    
                    if (title && link) {
                        results.push({
                            'Grant Name': title,
                            'Application Link': link,
                            'Source': 'foundationcenter.org',
                            'Organization': ['Foundation Center'], 
                            'Description': 'Scraped from Foundation Center',
                            'Amount': null,
                            'Deadline': null,
                            'Category': [],
                            'Keywords': [],
                            'Eligibility': 'N/A',
                            'Contact Email': 'N/A',
                            'Status': 'Active',
                            'Priority': 'Medium',
                            'Notes': 'Scraped from foundationcenter.org'
                        });
                    }
                });
                return results;
            });

            log.info(`SUCCESS: Scraped ${grantsOnPage.length} opportunities from Foundation Center for keyword "${keyword}".`);

            if (grantsOnPage.length > 0) {
                await Actor.pushData(grantsOnPage);
            }

            // Placeholder for pagination logic - will need to be refined
            // For now, assuming no pagination or single page for simplicity

        } catch (error) {
            log.error(`Error scraping Foundation Center for keyword "${keyword}": ${error.message}`);
        }
    }
}