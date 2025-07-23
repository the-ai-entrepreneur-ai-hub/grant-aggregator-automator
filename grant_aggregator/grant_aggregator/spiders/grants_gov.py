from grant_aggregator.grant_aggregator.spiders.base_spider import BaseSpider
from bs4 import BeautifulSoup

class GrantsGovSpider(BaseSpider):
    """
    A spider to scrape grant opportunities from grants.gov.
    """
    name = "grants_gov"
    start_urls = ["https://www.grants.gov/search-grants.html"]

    def parse(self, response):
        """
        Parses the search results page and extracts the grant opportunities.
        """
        soup = BeautifulSoup(response.text, 'html.parser')
        table = soup.find('table', class_='usa-table')
        if table:
            for row in table.find('tbody').find_all('tr'):
                cells = row.find_all('td')
                yield {
                    'opportunity_number': cells[0].text.strip(),
                    'opportunity_title': cells[1].text.strip(),
                    'agency': cells[2].text.strip(),
                    'opportunity_status': cells[3].text.strip(),
                    'posted_date': cells[4].text.strip(),
                    'close_date': cells[5].text.strip(),
                    'source': 'grants.gov',
                    'application_link': response.urljoin(cells[0].find('a')['href'])
                }
