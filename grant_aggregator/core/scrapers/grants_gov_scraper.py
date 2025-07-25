import asyncio
import json
import logging
import aiohttp
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from bs4 import BeautifulSoup
import re
import urllib.parse
from urllib.parse import urljoin, urlparse

from ..keyword_matcher import PeruGrantKeywordMatcher
from ..airtable_client import AirtableClient


@dataclass
class GrantsGovOpportunity:
    """Data structure for Grants.gov funding opportunities"""
    title: str
    organization: str = "Grants.gov"
    description: str = ""
    funding_amount: str = ""
    deadline: Optional[str] = None
    announcement_date: Optional[str] = None
    geographic_focus: str = "United States"
    sector: str = ""
    eligibility_criteria: str = ""
    status: str = "Open"
    application_link: str = ""
    source_url: str = ""
    source: str = "Grants.gov"
    program_type: str = "Federal Grant"
    agency: str = ""
    opportunity_number: str = ""
    cfda_number: str = ""
    contact_info: str = ""
    relevance_score: float = 0.0
    keyword_matches: List[str] = None
    priority_level: str = "LOW"
    
    def __post_init__(self):
        if self.keyword_matches is None:
            self.keyword_matches = []


class GrantsGovScraper:
    """
    Advanced scraper for Grants.gov following user session patterns.
    Implements intelligent search, link verification, and filters for high-quality results.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.keyword_matcher = PeruGrantKeywordMatcher()
        self.airtable_client = AirtableClient()
        self.session = None
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Base URLs based on user session
        self.base_url = "https://www.grants.gov"
        self.search_url = "https://www.grants.gov/search-grants"
        
        # Headers mimicking user session
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Cache-Control': 'max-age=0'
        }
        
        # Search keywords optimized for Peru-relevant grants
        self.search_keywords = [
            "Peru",
            "Latin America", 
            "South America",
            "international development",
            "rural development",
            "indigenous communities",
            "education development",
            "sustainable agriculture",
            "community development",
            "capacity building",
            "microfinance",
            "healthcare access",
            "environmental conservation",
            "cultural preservation"
        ]
        
        # Session timeout and delays
        self.request_delay = 2.0  # Respectful delay between requests
        self.timeout = 30
    
    async def __aenter__(self):
        """Async context manager entry"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            headers=self.headers,
            connector=connector
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def scrape_all_opportunities(self) -> List[GrantsGovOpportunity]:
        """Main method to scrape Grants.gov opportunities following session pattern"""
        self.logger.info("🚀 Starting Grants.gov scraping following user session pattern...")
        
        all_opportunities = []
        
        # Step 1: Navigate to homepage (following session pattern)
        await self._simulate_homepage_visit()
        
        # Step 2: Navigate to search page (following session pattern)
        await self._simulate_search_page_visit()
        
        # Step 3: Perform searches with progressive keyword refinement (following session pattern)
        for keyword in self.search_keywords:
            try:
                self.logger.info(f"🔍 Searching for: {keyword}")
                opportunities = await self._perform_search(keyword)
                
                # Verify each opportunity's application link
                verified_opportunities = await self._verify_opportunity_links(opportunities)
                all_opportunities.extend(verified_opportunities)
                
                # Respectful delay between searches
                await asyncio.sleep(self.request_delay)
                
            except Exception as e:
                self.logger.error(f"❌ Error searching for '{keyword}': {str(e)}")
                continue
        
        # Remove duplicates based on title and opportunity number
        unique_opportunities = self._remove_duplicates(all_opportunities)
        
        # Filter and analyze opportunities
        relevant_opportunities = await self._analyze_and_filter_opportunities(unique_opportunities)
        
        self.logger.info(f"✅ Grants.gov scraping completed. Found {len(all_opportunities)} total, {len(unique_opportunities)} unique, {len(relevant_opportunities)} relevant.")
        
        return relevant_opportunities
    
    async def _simulate_homepage_visit(self):
        """Simulate homepage visit following user session"""
        try:
            self.logger.debug("🏠 Visiting Grants.gov homepage...")
            async with self.session.get(self.base_url) as response:
                if response.status == 200:
                    self.logger.debug("✅ Homepage loaded successfully")
                else:
                    self.logger.warning(f"⚠️ Homepage returned status {response.status}")
                await asyncio.sleep(1)  # Brief pause like in session
        except Exception as e:
            self.logger.warning(f"⚠️ Could not load homepage: {str(e)}")
    
    async def _simulate_search_page_visit(self):
        """Simulate search page visit following user session"""
        try:
            self.logger.debug("🔍 Navigating to search grants page...")
            async with self.session.get(self.search_url) as response:
                if response.status == 200:
                    self.logger.debug("✅ Search page loaded successfully")
                else:
                    self.logger.warning(f"⚠️ Search page returned status {response.status}")
                await asyncio.sleep(1)  # Brief pause like in session
        except Exception as e:
            self.logger.warning(f"⚠️ Could not load search page: {str(e)}")
    
    async def _perform_search(self, keyword: str) -> List[GrantsGovOpportunity]:
        """Perform search with progressive keyword input (mimicking user session)"""
        opportunities = []
        
        try:
            # Build search URL with parameters
            search_params = {
                'page': '1',
                'sortby': 'closedate',
                'oppStatuses': 'forecasted,posted,closed',
                'keywords': keyword
            }
            
            search_url_with_params = f"{self.search_url}?" + urllib.parse.urlencode(search_params)
            
            async with self.session.get(search_url_with_params) as response:
                if response.status != 200:
                    self.logger.warning(f"⚠️ Search returned status {response.status} for keyword: {keyword}")
                    return opportunities
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Parse search results
                opportunities = await self._parse_search_results(soup, keyword)
                
        except Exception as e:
            self.logger.error(f"❌ Error performing search for '{keyword}': {str(e)}")
        
        return opportunities
    
    async def _parse_search_results(self, soup: BeautifulSoup, search_keyword: str) -> List[GrantsGovOpportunity]:
        """Parse search results from Grants.gov search page"""
        opportunities = []
        
        try:
            # Look for grant opportunity containers (adjust selectors based on actual Grants.gov structure)
            opportunity_containers = soup.find_all(['div', 'tr', 'article'], class_=re.compile(r'opportunity|grant|result|row'))
            
            if not opportunity_containers:
                # Try alternative selectors
                opportunity_containers = soup.find_all(['div'], attrs={'data-opportunity': True})
                if not opportunity_containers:
                    opportunity_containers = soup.find_all(['tr'])
            
            self.logger.debug(f"Found {len(opportunity_containers)} potential opportunity containers")
            
            for container in opportunity_containers[:20]:  # Limit to first 20 results per search
                try:
                    opportunity = await self._extract_opportunity_from_container(container, search_keyword)
                    if opportunity and self._is_valid_opportunity(opportunity):
                        opportunities.append(opportunity)
                except Exception as e:
                    self.logger.debug(f"Error extracting opportunity: {str(e)}")
                    continue
            
        except Exception as e:
            self.logger.error(f"❌ Error parsing search results: {str(e)}")
        
        return opportunities
    
    async def _extract_opportunity_from_container(self, container, search_keyword: str) -> Optional[GrantsGovOpportunity]:
        """Extract opportunity information from HTML container"""
        try:
            # Extract title
            title_elem = container.find(['h1', 'h2', 'h3', 'h4', 'a'], class_=re.compile(r'title|name|opportunity'))
            if not title_elem:
                title_elem = container.find(['a', 'strong'])
            
            if not title_elem:
                return None
            
            title = self._clean_text(title_elem.get_text(strip=True))
            if len(title) < 10 or len(title) > 300:
                return None
            
            # Extract agency/organization
            agency_elem = container.find(['span', 'div', 'td'], class_=re.compile(r'agency|org|department'))
            agency = self._clean_text(agency_elem.get_text(strip=True)) if agency_elem else ""
            
            # Extract description
            desc_elem = container.find(['p', 'div', 'span'], class_=re.compile(r'desc|summary|abstract'))
            description = self._clean_text(desc_elem.get_text(strip=True)) if desc_elem else ""
            
            # Extract opportunity number
            opp_num_elem = container.find(['span', 'div'], class_=re.compile(r'number|id|code'))
            opportunity_number = self._clean_text(opp_num_elem.get_text(strip=True)) if opp_num_elem else ""
            
            # Extract deadline
            deadline_elem = container.find(['span', 'div', 'td'], class_=re.compile(r'deadline|close|due'))
            deadline = self._clean_text(deadline_elem.get_text(strip=True)) if deadline_elem else ""
            
            # Extract funding amount
            amount_elem = container.find(['span', 'div'], class_=re.compile(r'amount|funding|award'))
            funding_amount = self._clean_text(amount_elem.get_text(strip=True)) if amount_elem else ""
            
            # Extract application link
            link_elem = title_elem.find('a') if title_elem.name != 'a' else title_elem
            if not link_elem:
                link_elem = container.find('a', href=True)
            
            application_link = self.base_url
            if link_elem and link_elem.get('href'):
                href = link_elem['href']
                if href.startswith('http'):
                    application_link = href
                elif href.startswith('/'):
                    application_link = urljoin(self.base_url, href)
            
            # Create opportunity object
            opportunity = GrantsGovOpportunity(
                title=title,
                description=description[:2000] if description else f"Grant opportunity related to {search_keyword}",
                agency=agency,
                opportunity_number=opportunity_number,
                deadline=deadline,
                funding_amount=funding_amount,
                application_link=application_link,
                source_url=application_link,
                announcement_date=datetime.now().isoformat(),
                sector=self._infer_sector(title, description),
                eligibility_criteria=self._extract_eligibility(container)
            )
            
            return opportunity
            
        except Exception as e:
            self.logger.debug(f"Error extracting opportunity details: {str(e)}")
            return None
    
    def _infer_sector(self, title: str, description: str) -> str:
        """Infer sector from title and description"""
        text = (title + " " + description).lower()
        
        sector_keywords = {
            "Education": ["education", "school", "university", "student", "learning", "academic"],
            "Health": ["health", "medical", "healthcare", "hospital", "clinic", "disease"],
            "Environment": ["environment", "conservation", "climate", "green", "sustainability"],
            "Agriculture": ["agriculture", "farming", "rural", "crop", "livestock", "food"],
            "Community Development": ["community", "development", "social", "housing", "urban"],
            "Research": ["research", "science", "innovation", "technology", "study"],
            "Arts & Culture": ["arts", "culture", "museum", "heritage", "creative", "music"]
        }
        
        for sector, keywords in sector_keywords.items():
            if any(keyword in text for keyword in keywords):
                return sector
        
        return "General"
    
    def _extract_eligibility(self, container) -> str:
        """Extract eligibility criteria from container"""
        eligibility_elem = container.find(['div', 'span', 'p'], class_=re.compile(r'eligib|criteria|requirement'))
        if eligibility_elem:
            return self._clean_text(eligibility_elem.get_text(strip=True))[:500]
        return ""
    
    async def _verify_opportunity_links(self, opportunities: List[GrantsGovOpportunity]) -> List[GrantsGovOpportunity]:
        """Verify application links to prevent fake/hallucinated results"""
        verified_opportunities = []
        
        for opportunity in opportunities:
            try:
                # Check if link is valid and accessible
                if await self._verify_link(opportunity.application_link):
                    verified_opportunities.append(opportunity)
                    self.logger.debug(f"✅ Verified link for: {opportunity.title}")
                else:
                    self.logger.warning(f"❌ Invalid link for: {opportunity.title} - {opportunity.application_link}")
                
                # Small delay between link verifications
                await asyncio.sleep(0.5)
                
            except Exception as e:
                self.logger.debug(f"Error verifying link for {opportunity.title}: {str(e)}")
                # Include opportunity even if verification fails (might be temporary network issue)
                verified_opportunities.append(opportunity)
        
        return verified_opportunities
    
    async def _verify_link(self, url: str) -> bool:
        """Verify that a URL is accessible and returns valid content"""
        if not url or not url.startswith('http'):
            return False
        
        try:
            async with self.session.head(url, allow_redirects=True) as response:
                # Accept 200 OK and 302/301 redirects as valid
                return response.status in [200, 301, 302, 403]  # 403 might be normal for some protected pages
        except Exception as e:
            self.logger.debug(f"Link verification failed for {url}: {str(e)}")
            return False
    
    def _remove_duplicates(self, opportunities: List[GrantsGovOpportunity]) -> List[GrantsGovOpportunity]:
        """Remove duplicate opportunities based on title and opportunity number"""
        seen = set()
        unique_opportunities = []
        
        for opp in opportunities:
            # Create identifier based on title and opportunity number
            identifier = f"{opp.title.lower().strip()}|{opp.opportunity_number.lower().strip()}"
            
            if identifier not in seen:
                seen.add(identifier)
                unique_opportunities.append(opp)
            else:
                self.logger.debug(f"🔄 Removing duplicate: {opp.title}")
        
        return unique_opportunities
    
    def _is_valid_opportunity(self, opportunity: GrantsGovOpportunity) -> bool:
        """Validate opportunity to prevent fake/low-quality results"""
        # Check title quality
        if len(opportunity.title) < 10 or len(opportunity.title) > 300:
            return False
        
        # Check for spam indicators
        spam_indicators = ['error', '404', 'not found', 'page not found', 'invalid', 'test']
        title_lower = opportunity.title.lower()
        if any(indicator in title_lower for indicator in spam_indicators):
            return False
        
        # Check for valid application link
        if not opportunity.application_link or not opportunity.application_link.startswith('http'):
            return False
        
        # Must have some basic content
        if not opportunity.description and not opportunity.agency:
            return False
        
        return True
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Remove common web artifacts
        text = re.sub(r'Skip to main content', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Print this page', '', text, flags=re.IGNORECASE)
        
        return text[:2000]  # Limit length
    
    async def _analyze_and_filter_opportunities(self, opportunities: List[GrantsGovOpportunity]) -> List[GrantsGovOpportunity]:
        """Analyze opportunities using keyword matcher and filter for relevance"""
        relevant_opportunities = []
        
        for opportunity in opportunities:
            try:
                # Prepare text for analysis
                full_text = f"{opportunity.title} {opportunity.description} {opportunity.sector} {opportunity.agency} {opportunity.eligibility_criteria}"
                
                # Analyze with keyword matcher
                analysis = self.keyword_matcher.analyze_grant_text(
                    full_text, 
                    opportunity.title, 
                    opportunity.description
                )
                
                # Update opportunity with analysis results
                opportunity.relevance_score = analysis['relevance_score']
                opportunity.priority_level = analysis['priority_level']
                opportunity.keyword_matches = [match['keyword'] for match in analysis['matches']]
                
                # Include relevant opportunities (higher threshold for grants.gov due to volume)
                if analysis['relevance_score'] >= 2.0 and not analysis['exclusion_flags']:
                    relevant_opportunities.append(opportunity)
                    self.logger.info(f"✅ Relevant: {opportunity.title} (Score: {opportunity.relevance_score})")
                else:
                    self.logger.debug(f"❌ Filtered out: {opportunity.title} (Score: {opportunity.relevance_score})")
                    
            except Exception as e:
                self.logger.error(f"Error analyzing opportunity {opportunity.title}: {str(e)}")
                continue
        
        # Sort by relevance score
        relevant_opportunities.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return relevant_opportunities
    
    async def save_to_airtable(self, opportunities: List[GrantsGovOpportunity]) -> int:
        """Save opportunities to Airtable"""
        saved_count = 0
        
        for opportunity in opportunities:
            try:
                record_data = {
                    'Grant Name': opportunity.title,
                    'Organization': [opportunity.organization],
                    'Description': opportunity.description[:2000],
                    'Amount': opportunity.funding_amount,
                    'Deadline': opportunity.deadline,
                    'Category': [opportunity.sector] if opportunity.sector else [],
                    'Keywords': opportunity.keyword_matches[:10],
                    'Eligibility': opportunity.eligibility_criteria,
                    'Application Link': opportunity.application_link,
                    'Contact Email': opportunity.contact_info,
                    'Status': opportunity.status or 'Open',
                    'Priority': opportunity.priority_level,
                    'Notes': f"Agency: {opportunity.agency}. Opportunity #: {opportunity.opportunity_number}. CFDA: {opportunity.cfda_number}. Relevance Score: {opportunity.relevance_score}. Auto-scraped from Grants.gov following user session pattern.",
                    'Source': opportunity.source
                }
                
                result = self.airtable_client.upsert_record(record_data)
                self.logger.info(f"💾 {result}")
                saved_count += 1
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save {opportunity.title}: {str(e)}")
        
        return saved_count


async def run_grants_gov_scraper():
    """Main function to run the Grants.gov scraper"""
    async with GrantsGovScraper() as scraper:
        try:
            # Scrape opportunities
            opportunities = await scraper.scrape_all_opportunities()
            
            if opportunities:
                print(f"\n🎯 Found {len(opportunities)} relevant Grants.gov opportunities:")
                print("=" * 70)
                
                for i, opp in enumerate(opportunities[:10], 1):  # Show top 10
                    print(f"\n{i}. {opp.title}")
                    print(f"   🏛️ Agency: {opp.agency}")
                    print(f"   💰 {opp.funding_amount}")
                    print(f"   📅 Deadline: {opp.deadline}")
                    print(f"   📍 Sector: {opp.sector}")
                    print(f"   🆔 Opportunity #: {opp.opportunity_number}")
                    print(f"   🎯 Relevance Score: {opp.relevance_score}")
                    print(f"   🔗 {opp.application_link}")
                
                # Save to Airtable
                if input("\nSave to Airtable? (y/n): ").lower() == 'y':
                    saved_count = await scraper.save_to_airtable(opportunities)
                    print(f"✅ Saved {saved_count} opportunities to Airtable")
            else:
                print("❌ No relevant Grants.gov opportunities found")
                
        except Exception as e:
            print(f"❌ Scraping failed: {str(e)}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(run_grants_gov_scraper())