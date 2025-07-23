import { Actor, log } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import { grantsGovScraper } from './scrapers/grantsGovScraper.js';
import { foundationCenterScraper } from './scrapers/foundationCenterScraper.js';
import { grantStationScraper } from './scrapers/grantStationScraper.js';

await Actor.main(async () => {
    log.info('--- EXECUTING THE TRUE HUMAN EMULATION STRATEGY ---');
    const input = await Actor.getInput() || {};
    log.info(`Input received: ${JSON.stringify(input)}`);
    const keywords = input.keywords || [
        "Peru",
        "Andean region",
        "Ancash Province",
        "Huascarán National Park",
        "Rural Peru",
        "Highland communities",
        "Mountain regions",
        "Peruvian highlands",
        "Remote villages Peru",
        "Indigenous territories",
        "Rural education Peru",
        "Community learning centers",
        "Adult literacy programs",
        "Digital inclusion",
        "Educational access",
        "Technical training",
        "Microfinance Peru",
        "Small business grants",
        "Agricultural cooperatives",
        "Rural entrepreneurship",
        "Income generation",
        "Value chain development",
        "Rural health clinics",
        "Mobile medical units",
        "Maternal health programs",
        "Telemedicine Peru",
        "Community health workers",
        "Nutrition initiatives",
        "Sustainable farming",
        "Crop diversification",
        "Climate-smart agriculture",
        "Seed improvement",
        "Agribusiness development",
        "Organic farming",
        "Rural electrification",
        "Water access",
        "Sanitation systems",
        "Road construction",
        "Digital connectivity",
        "Renewable energy",
        "Indigenous communities",
        "Quechua populations",
        "Rural women",
        "Smallholder farmers",
        "Mountain dwellers",
        "Vulnerable groups",
        "Community development grants",
        "Rural infrastructure funding",
        "Capacity building programs",
        "Education initiatives",
        "Health sector grants",
        "Agricultural development",
        "Peru eligibility",
        "Rural focus",
        "Community-based",
        "Grassroots organizations",
        "Local NGOs",
        "Indigenous-led initiatives"
    ];
    const searchKeywords = Array.isArray(keywords) ? keywords : [keywords]; // Ensure it's an array
    const source = input.source || 'grants.gov'; // New input for source selection

    const scrapers = {
        'grants.gov': {
            scraper: grantsGovScraper,
            startUrl: 'https://www.grants.gov/search-grants'
        },
        'foundationcenter.org': {
            scraper: foundationCenterScraper,
            startUrl: 'https://foundationcenter.org/search' 
        },
        'grantstation.com': {
            scraper: grantStationScraper,
            startUrl: 'https://www.grantstation.com/search' 
        }
    };

    const selectedScraperConfig = scrapers[source];

    if (!selectedScraperConfig) {
        log.error(`No scraper found for source: ${source}`);
        return;
    }

    const { scraper, startUrl } = selectedScraperConfig;
    
    const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 1,
        requestHandlerTimeoutSecs: 180, 
        
        async requestHandler({ page, request }) {
            log.info(`Navigated to ${request.url}. Beginning human-like interaction...`);
            await page.goto(request.url, { waitUntil: 'networkidle0' }); 
            await scraper(page, searchKeywords);
        }
    });

    await crawler.run([startUrl]);
    log.info('Scraper has finished.');
});