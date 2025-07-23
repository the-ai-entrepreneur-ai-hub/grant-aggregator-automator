import { Actor, log } from 'apify';

export async function grantsGovScraper(page, searchKeywords) {
    const startUrl = 'https://www.grants.gov/search-grants';

    for (const keyword of searchKeywords) {
        log.info(`Searching for keyword: "${keyword}"`);
        await page.goto(startUrl); // Go to the search page for each keyword

        const keywordInputSelector = '#inp-keywords';
        const searchButtonSelector = '#btn-search';

        // 1. Wait for the keyword input box and type slowly.
        await page.waitForSelector(keywordInputSelector, { timeout: 60000, visible: true });
            await page.type(keywordInputSelector, keyword, { delay: 100 }); // 100ms delay between keystrokes
        log.info(`Typed "${keyword}" into the search box.`);

        // 2. Click the search button and simultaneously wait for the network response.
        log.info('Clicking search and waiting for the API response...');
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/results/i14y') && response.status() === 200, { timeout: 60000 }),
            page.click(searchButtonSelector),
        ]);
        log.info('API response received. The results table should now be populated.');

        // 3. Now that we know the data is loaded, we can safely scrape the HTML and handle pagination.
        let currentPage = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const dataRowSelector = 'td[headers="header-opportunity-number"]';
            await page.waitForSelector(dataRowSelector); // A quick wait to ensure rendering is complete.

            const grantsOnPage = await page.evaluate(() => {
                const results = [];
                const rows = document.querySelectorAll('tbody tr');
                console.log(`Found ${rows.length} rows in the table.`);
                rows.forEach(row => {
                    const opportunityNumber = row.querySelector('td[headers="header-opportunity-number"]')?.innerText.trim();
                    if (opportunityNumber) {
                        const titleElement = row.querySelector('td[headers="header-opportunity-title"] a');
                        const closeDateText = row.querySelector('td[headers="header-close-date"]')?.innerText.trim();
                        let deadline = null;
                        if (closeDateText) {
                            try {
                                const dateParts = closeDateText.split('/');
                                if (dateParts.length === 3) {
                                    deadline = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
                                }
                            } catch (e) {
                                console.error("Error parsing date:", e);
                            }
                        }

                        results.push({
                            'Grant Name': titleElement?.innerText.trim() || 'N/A',
                            'Organization': [row.querySelector('td[headers="header-agency"]')?.innerText.trim() || 'N/A'], // Assuming Organization is a linked record
                            'Description': `Opportunity Number: ${opportunityNumber}`,
                            'Amount': null, // Placeholder
                            'Deadline': deadline, // Formatted date
                            'Category': [], // Placeholder
                            'Keywords': [], // Placeholder
                            'Eligibility': 'N/A', // Placeholder
                            'Application Link': titleElement?.href || 'N/A',
                            'Contact Email': 'N/A', // Placeholder
                            'Status': 'Active', // Placeholder
                            'Priority': 'Medium', // Placeholder
                            'Notes': `Scraped from grants.gov. Original Opportunity Number: ${opportunityNumber}. Open Date: ${row.querySelector('td[headers="header-posted-date"]')?.innerText.trim()}`,
                            'Source': 'grants.gov'
                        });
                    }
                });
                return results;
            });

            log.info(`SUCCESS: Scraped ${grantsOnPage.length} opportunities from page ${currentPage} for keyword "${keyword}".`);

            if (grantsOnPage.length > 0) {
                await Actor.pushData(grantsOnPage);
            }

            // Check for next page button and click it
            const nextPageButton = await page.$('a[aria-label^="Go to next page"]');
            if (nextPageButton) {
                await Promise.all([
                    page.waitForResponse(response => response.url().includes('/results/i14y') && response.status() === 200, { timeout: 60000 }),
                    nextPageButton.click(),
                ]);
                currentPage++;
            } else {
                hasNextPage = false;
            }
        }
    }
}