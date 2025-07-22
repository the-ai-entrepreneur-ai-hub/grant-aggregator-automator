import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import aiohttp
from bs4 import BeautifulSoup
import re

from ..keyword_matcher import PeruGrantKeywordMatcher
from ..airtable_client import AirtableClient


@dataclass
class GrantOpportunity:
    """Data structure for grant opportunities"""
    title: str
    organization: str = "Inter-American Development Bank (IDB)"
    description: str = ""
    funding_amount: str = ""
    deadline: Optional[str] = None
    announcement_date: Optional[str] = None
    geographic_focus: str = ""
    sector: str = ""
    eligibility_criteria: str = ""
    status: str = ""
    application_link: str = ""
    source_url: str = ""
    source: str = "IDB"
    implementation_period: str = ""
    contact_info: str = ""
    relevance_score: float = 0.0
    keyword_matches: List[str] = None
    priority_level: str = "LOW"
    
    def __post_init__(self):
        if self.keyword_matches is None:
            self.keyword_matches = []


class IDBGrantsScraper:
    """
    Intelligent scraper for Inter-American Development Bank grant opportunities.
    Focuses on Peru-relevant grants using the keyword matching engine.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.keyword_matcher = PeruGrantKeywordMatcher()
        self.airtable_client = AirtableClient()
        self.base_url = "https://www.iadb.org"
        self.session = None
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Target URLs for scraping
        self.target_urls = [
            "https://www.iadb.org/en/how-we-can-work-together/calls-proposals",
            "https://www.iadb.org/en/how-we-can-work-together/public-sector/financing-solutions/grants",
            "https://www.iadb.org/en/how-we-can-work-together/public-sector/technical-cooperation-grants"
        ]
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def scrape_all_opportunities(self) -> List[GrantOpportunity]:
        """Main method to scrape all IDB grant opportunities"""
        self.logger.info("🚀 Starting IDB grants scraping...")
        
        all_opportunities = []
        
        for url in self.target_urls:
            try:
                self.logger.info(f"📡 Scraping: {url}")
                opportunities = await self._scrape_page(url)
                all_opportunities.extend(opportunities)
                
                # Add delay between requests to be respectful
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error(f"❌ Error scraping {url}: {str(e)}")
                continue
        
        # Filter and analyze opportunities using keyword matching
        relevant_opportunities = await self._analyze_and_filter_opportunities(all_opportunities)
        
        self.logger.info(f"✅ Scraping completed. Found {len(all_opportunities)} total opportunities, {len(relevant_opportunities)} relevant for Peru.")
        
        return relevant_opportunities
    
    async def _scrape_page(self, url: str) -> List[GrantOpportunity]:
        """Scrape a specific page for grant opportunities"""
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    self.logger.warning(f"⚠️ HTTP {response.status} for {url}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                opportunities = []
                
                # Parse based on URL type
                if "calls-proposals" in url:
                    opportunities.extend(await self._parse_calls_for_proposals(soup, url))
                elif "grants" in url:
                    opportunities.extend(await self._parse_grants_page(soup, url))
                elif "technical-cooperation" in url:
                    opportunities.extend(await self._parse_technical_cooperation(soup, url))
                
                return opportunities
                
        except Exception as e:
            self.logger.error(f"❌ Failed to scrape {url}: {str(e)}")
            return []
    
    async def _parse_calls_for_proposals(self, soup: BeautifulSoup, source_url: str) -> List[GrantOpportunity]:
        """Parse the calls for proposals page"""
        opportunities = []
        
        # Look for grant opportunity cards
        grant_cards = soup.find_all(['div', 'article'], class_=re.compile(r'card|opportunity|proposal|call'))
        
        if not grant_cards:
            # Alternative selectors
            grant_cards = soup.find_all(['div', 'article'], attrs={'data-type': re.compile(r'proposal|grant|opportunity')})
        
        if not grant_cards:
            # Generic content blocks that might contain grant info
            grant_cards = soup.find_all(['div'], class_=re.compile(r'content|item|entry'))
        
        for card in grant_cards:
            try:
                opportunity = await self._extract_opportunity_data(card, source_url)
                if opportunity and opportunity.title:
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing card: {str(e)}")
                continue
        
        # Also look for text-based opportunities in the content
        text_opportunities = await self._extract_text_based_opportunities(soup, source_url)
        opportunities.extend(text_opportunities)
        
        return opportunities
    
    async def _parse_grants_page(self, soup: BeautifulSoup, source_url: str) -> List[GrantOpportunity]:
        """Parse general grants overview page"""
        opportunities = []
        
        # Extract program descriptions that might lead to actual grants
        program_sections = soup.find_all(['section', 'div'], class_=re.compile(r'program|grant|funding'))
        
        for section in program_sections:
            try:
                # Look for program titles and descriptions
                title_elem = section.find(['h1', 'h2', 'h3', 'h4'])
                desc_elem = section.find(['p', 'div'], class_=re.compile(r'description|summary'))
                
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    description = desc_elem.get_text(strip=True) if desc_elem else ""
                    
                    # Check if this looks like an actual grant opportunity
                    if self._is_potential_grant_text(title, description):
                        opportunity = GrantOpportunity(
                            title=title,
                            description=description,
                            source_url=source_url,
                            application_link=self._extract_link(section) or source_url
                        )
                        opportunities.append(opportunity)
            
            except Exception as e:
                self.logger.debug(f"Error parsing grants section: {str(e)}")
                continue
        
        return opportunities
    
    async def _parse_technical_cooperation(self, soup: BeautifulSoup, source_url: str) -> List[GrantOpportunity]:
        """Parse technical cooperation grants page"""
        opportunities = []
        
        # Extract information about technical cooperation programs
        coop_sections = soup.find_all(['section', 'div'], class_=re.compile(r'cooperation|technical|program'))
        
        for section in coop_sections:
            try:
                opportunity = await self._extract_opportunity_data(section, source_url)
                if opportunity and opportunity.title:
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing technical cooperation section: {str(e)}")
                continue
        
        return opportunities
    
    async def _extract_opportunity_data(self, element, source_url: str) -> Optional[GrantOpportunity]:
        """Extract grant opportunity data from a DOM element"""
        try:
            # Extract title
            title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'a'])
            title = title_elem.get_text(strip=True) if title_elem else ""
            
            if not title or len(title) < 10:
                return None
            
            # Extract description
            desc_elem = element.find(['p', 'div'], class_=re.compile(r'description|summary|content'))
            if not desc_elem:
                # Get all text content as description
                desc_elem = element
            
            description = self._clean_text(desc_elem.get_text(strip=True))
            
            # Extract deadline
            deadline = self._extract_deadline(element)
            
            # Extract link
            link_elem = element.find('a', href=True)
            application_link = ""
            if link_elem:
                href = link_elem['href']
                if href.startswith('/'):
                    application_link = self.base_url + href
                elif href.startswith('http'):
                    application_link = href
                else:
                    application_link = source_url
            else:
                application_link = source_url
            
            # Extract additional fields
            funding_amount = self._extract_funding_amount(description)
            sector = self._extract_sector(title, description)
            geographic_focus = self._extract_geographic_focus(title, description)
            
            opportunity = GrantOpportunity(
                title=title,
                description=description,
                funding_amount=funding_amount,
                deadline=deadline,
                sector=sector,
                geographic_focus=geographic_focus,
                application_link=application_link,
                source_url=source_url,
                announcement_date=datetime.now().isoformat()
            )
            
            return opportunity
            
        except Exception as e:
            self.logger.debug(f"Error extracting opportunity data: {str(e)}")
            return None
    
    async def _extract_text_based_opportunities(self, soup: BeautifulSoup, source_url: str) -> List[GrantOpportunity]:
        """Extract opportunities from text content that mentions specific programs"""
        opportunities = []
        
        # Common patterns that indicate grant opportunities
        grant_patterns = [
            r'call for proposals?', r'funding opportunity', r'grant program',
            r'application deadline', r'proposal submission', r'funding available'
        ]
        
        text_content = soup.get_text()
        
        for pattern in grant_patterns:
            matches = re.finditer(pattern, text_content, re.IGNORECASE)
            for match in matches:
                # Extract context around the match
                start = max(0, match.start() - 500)
                end = min(len(text_content), match.end() + 500)
                context = text_content[start:end].strip()
                
                # Look for title-like text before the match
                title_match = re.search(r'([A-Z][^.!?]*(?:Program|Initiative|Grant|Fund|Challenge))[^.!?]*', 
                                      context[:match.start()-start])
                
                if title_match:
                    title = title_match.group(1).strip()
                    if len(title) > 10 and len(title) < 200:
                        opportunity = GrantOpportunity(
                            title=title,
                            description=context,
                            source_url=source_url,
                            application_link=source_url
                        )
                        opportunities.append(opportunity)
        
        return opportunities
    
    async def _analyze_and_filter_opportunities(self, opportunities: List[GrantOpportunity]) -> List[GrantOpportunity]:
        """Analyze opportunities using keyword matcher and filter relevant ones"""
        relevant_opportunities = []
        
        for opportunity in opportunities:
            try:
                # Prepare text for analysis
                full_text = f"{opportunity.title} {opportunity.description} {opportunity.sector} {opportunity.geographic_focus}"
                
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
                
                # Only include relevant opportunities
                if analysis['is_relevant'] and not analysis['exclusion_flags']:
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
    
    def _extract_deadline(self, element) -> Optional[str]:
        """Extract deadline from element text"""
        text = element.get_text()
        
        # Common deadline patterns
        date_patterns = [
            r'deadline:?\s*([A-Za-z]+ \d{1,2},? \d{4})',
            r'due:?\s*([A-Za-z]+ \d{1,2},? \d{4})',
            r'closes?:?\s*([A-Za-z]+ \d{1,2},? \d{4})',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{4}-\d{2}-\d{2})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _extract_funding_amount(self, text: str) -> str:
        """Extract funding amount from text"""
        amount_patterns = [
            r'\$[\d,.]+ (?:million|billion|thousand)',
            r'USD [\d,.]+ (?:million|billion|thousand)',
            r'up to \$[\d,.]+',
            r'funding of \$[\d,.]+'
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return ""
    
    def _extract_sector(self, title: str, description: str) -> str:
        """Extract sector from title and description"""
        sector_keywords = {
            'agriculture': ['agriculture', 'farming', 'agricultural', 'crop', 'livestock'],
            'education': ['education', 'learning', 'school', 'training', 'literacy'],
            'health': ['health', 'medical', 'healthcare', 'hospital', 'clinic'],
            'infrastructure': ['infrastructure', 'road', 'bridge', 'construction', 'transport'],
            'environment': ['environment', 'climate', 'conservation', 'renewable', 'sustainability'],
            'social': ['social', 'community', 'development', 'poverty', 'inclusion']
        }
        
        text = (title + " " + description).lower()
        
        for sector, keywords in sector_keywords.items():
            if any(keyword in text for keyword in keywords):
                return sector.title()
        
        return ""
    
    def _extract_geographic_focus(self, title: str, description: str) -> str:
        """Extract geographic focus from text"""
        geo_keywords = [
            'Peru', 'Latin America', 'South America', 'Caribbean', 'Andean',
            'Bolivia', 'Ecuador', 'Colombia', 'Argentina', 'Brazil', 'Chile'
        ]
        
        text = title + " " + description
        
        found_regions = []
        for keyword in geo_keywords:
            if keyword in text:
                found_regions.append(keyword)
        
        return ", ".join(found_regions) if found_regions else "Latin America and Caribbean"
    
    def _extract_link(self, element) -> Optional[str]:
        """Extract application link from element"""
        link_elem = element.find('a', href=True)
        if link_elem:
            href = link_elem['href']
            if href.startswith('/'):
                return self.base_url + href
            elif href.startswith('http'):
                return href
        return None
    
    def _is_potential_grant_text(self, title: str, description: str) -> bool:
        """Check if text represents a potential grant opportunity"""
        grant_indicators = [
            'grant', 'funding', 'proposal', 'application', 'deadline',
            'call', 'opportunity', 'program', 'initiative', 'competition',
            'award', 'financial', 'support', 'assistance'
        ]
        
        text = (title + " " + description).lower()
        return any(indicator in text for indicator in grant_indicators)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Remove common web artifacts
        text = re.sub(r'Skip to .+?content', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Cookie Policy.+', '', text, flags=re.IGNORECASE)
        
        return text[:2000]  # Limit text length
    
    async def save_to_airtable(self, opportunities: List[GrantOpportunity]) -> int:
        """Save opportunities to Airtable"""
        saved_count = 0
        
        for opportunity in opportunities:
            try:
                record_data = {
                    'Grant Name': opportunity.title,
                    'Organization': [opportunity.organization],  # Linked record
                    'Description': opportunity.description[:2000],  # Limit length
                    'Amount': opportunity.funding_amount,
                    'Deadline': opportunity.deadline,
                    'Category': [opportunity.sector] if opportunity.sector else [],
                    'Keywords': opportunity.keyword_matches[:10],  # Limit number
                    'Eligibility': opportunity.eligibility_criteria,
                    'Application Link': opportunity.application_link,
                    'Contact Email': opportunity.contact_info,
                    'Status': 'Active',
                    'Priority': opportunity.priority_level,
                    'Notes': f"Relevance Score: {opportunity.relevance_score}. Auto-scraped from IDB.",
                    'Source': opportunity.source
                }
                
                result = self.airtable_client.upsert_record(record_data)
                self.logger.info(f"💾 {result}")
                saved_count += 1
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save {opportunity.title}: {str(e)}")
        
        return saved_count


async def run_idb_scraper():
    """Main function to run the IDB scraper"""
    async with IDBGrantsScraper() as scraper:
        try:
            # Scrape opportunities
            opportunities = await scraper.scrape_all_opportunities()
            
            if opportunities:
                print(f"\n🎯 Found {len(opportunities)} relevant opportunities:")
                print("=" * 60)
                
                for i, opp in enumerate(opportunities[:5], 1):  # Show top 5
                    print(f"\n{i}. {opp.title}")
                    print(f"   💰 {opp.funding_amount}")
                    print(f"   🗓️ Deadline: {opp.deadline}")
                    print(f"   📍 Geographic: {opp.geographic_focus}")
                    print(f"   🎯 Relevance Score: {opp.relevance_score}")
                    print(f"   🔗 {opp.application_link}")
                
                # Save to Airtable
                if input("\nSave to Airtable? (y/n): ").lower() == 'y':
                    saved_count = await scraper.save_to_airtable(opportunities)
                    print(f"✅ Saved {saved_count} opportunities to Airtable")
            else:
                print("❌ No relevant opportunities found")
                
        except Exception as e:
            print(f"❌ Scraping failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(run_idb_scraper())