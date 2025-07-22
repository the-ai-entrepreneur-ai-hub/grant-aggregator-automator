import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import aiohttp
from bs4 import BeautifulSoup
import re

from ..keyword_matcher import PeruGrantKeywordMatcher
from ..airtable_client import AirtableClient


@dataclass
class PeruGovOpportunity:
    """Data structure for Peru government funding opportunities"""
    title: str
    organization: str = "Government of Peru"
    description: str = ""
    funding_amount: str = ""
    deadline: Optional[str] = None
    announcement_date: Optional[str] = None
    geographic_focus: str = "Peru"
    sector: str = ""
    eligibility_criteria: str = ""
    status: str = ""
    application_link: str = ""
    source_url: str = ""
    source: str = "Peru Government"
    program_type: str = ""  # National Program, Regional Initiative, etc.
    ministry: str = ""
    contact_info: str = ""
    relevance_score: float = 0.0
    keyword_matches: List[str] = None
    priority_level: str = "LOW"
    
    def __post_init__(self):
        if self.keyword_matches is None:
            self.keyword_matches = []


class PeruGovernmentScraper:
    """
    Scraper for Peru government funding opportunities and programs.
    Focuses on social development, rural programs, and indigenous initiatives.
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
        
        # Target Peru government URLs
        self.target_urls = [
            # Main government portal
            "https://www.gob.pe",
            
            # Social development ministry
            "https://www.gob.pe/midis",
            
            # Environment ministry
            "https://www.gob.pe/minam",
            
            # Agriculture and irrigation
            "https://www.gob.pe/midagri",
            
            # Production ministry
            "https://www.gob.pe/produce",
            
            # Education ministry
            "https://www.gob.pe/minedu",
            
            # Women and vulnerable populations
            "https://www.gob.pe/mimp",
            
            # Culture ministry (indigenous affairs)
            "https://www.gob.pe/cultura",
            
            # Regional development
            "https://www.gob.pe/pcm/ceplan",
            
            # National programs
            "https://www.gob.pe/pronabec",  # Education grants
            "https://www.gob.pe/foncodes",  # Social development
            "https://www.gob.pe/agrorural", # Rural development
        ]
        
        # Headers for respectful scraping
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers=self.headers
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def scrape_all_opportunities(self) -> List[PeruGovOpportunity]:
        """Main method to scrape Peru government opportunities"""
        self.logger.info("🚀 Starting Peru government scraping...")
        
        all_opportunities = []
        
        for url in self.target_urls:
            try:
                self.logger.info(f"📡 Scraping: {url}")
                opportunities = await self._scrape_government_site(url)
                all_opportunities.extend(opportunities)
                
                # Respectful delay
                await asyncio.sleep(3)
                
            except Exception as e:
                self.logger.error(f"❌ Error scraping {url}: {str(e)}")
                continue
        
        # Add known Peru government programs based on research
        all_opportunities.extend(await self._add_known_programs())
        
        # Filter and analyze opportunities
        relevant_opportunities = await self._analyze_and_filter_opportunities(all_opportunities)
        
        self.logger.info(f"✅ Peru gov scraping completed. Found {len(all_opportunities)} total, {len(relevant_opportunities)} relevant.")
        
        return relevant_opportunities
    
    async def _scrape_government_site(self, url: str) -> List[PeruGovOpportunity]:
        """Scrape a specific government site"""
        opportunities = []
        
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    self.logger.warning(f"⚠️ HTTP {response.status} for {url}")
                    return opportunities
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract opportunities based on URL type
                if "midis" in url:
                    opportunities.extend(await self._parse_social_development(soup, url))
                elif "midagri" in url or "agrorural" in url:
                    opportunities.extend(await self._parse_agriculture_programs(soup, url))
                elif "minam" in url:
                    opportunities.extend(await self._parse_environment_programs(soup, url))
                elif "cultura" in url:
                    opportunities.extend(await self._parse_culture_indigenous(soup, url))
                elif "minedu" in url or "pronabec" in url:
                    opportunities.extend(await self._parse_education_programs(soup, url))
                elif "foncodes" in url:
                    opportunities.extend(await self._parse_foncodes_programs(soup, url))
                else:
                    opportunities.extend(await self._parse_general_programs(soup, url))
                
        except Exception as e:
            self.logger.error(f"❌ Failed to scrape {url}: {str(e)}")
        
        return opportunities
    
    async def _parse_social_development(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse social development ministry programs"""
        opportunities = []
        
        # Look for program announcements and initiatives
        program_sections = soup.find_all(['div', 'section'], class_=re.compile(r'programa|servicio|convocatoria'))
        
        for section in program_sections:
            try:
                opportunity = await self._extract_program_info(section, url, "Social Development")
                if opportunity:
                    opportunity.ministry = "MIDIS"
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing social development section: {str(e)}")
        
        return opportunities
    
    async def _parse_agriculture_programs(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse agriculture and rural development programs"""
        opportunities = []
        
        # Look for agricultural programs and funding
        ag_sections = soup.find_all(['div', 'article'], class_=re.compile(r'programa|proyecto|convocatoria|financiamiento'))
        
        for section in ag_sections:
            try:
                opportunity = await self._extract_program_info(section, url, "Agriculture/Rural Development")
                if opportunity:
                    opportunity.ministry = "MIDAGRI" if "midagri" in url else "AGRORURAL"
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing agriculture section: {str(e)}")
        
        return opportunities
    
    async def _parse_environment_programs(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse environment ministry programs"""
        opportunities = []
        
        # Look for environmental and conservation programs
        env_sections = soup.find_all(['div'], class_=re.compile(r'programa|proyecto|conservacion|ambiental'))
        
        for section in env_sections:
            try:
                opportunity = await self._extract_program_info(section, url, "Environment/Conservation")
                if opportunity:
                    opportunity.ministry = "MINAM"
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing environment section: {str(e)}")
        
        return opportunities
    
    async def _parse_culture_indigenous(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse culture ministry and indigenous programs"""
        opportunities = []
        
        # Look for cultural and indigenous community programs
        culture_sections = soup.find_all(['div'], class_=re.compile(r'programa|indigena|cultural|patrimonio'))
        
        for section in culture_sections:
            try:
                opportunity = await self._extract_program_info(section, url, "Culture/Indigenous Affairs")
                if opportunity:
                    opportunity.ministry = "CULTURA"
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing culture section: {str(e)}")
        
        return opportunities
    
    async def _parse_education_programs(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse education programs and scholarships"""
        opportunities = []
        
        # Look for education funding and scholarship programs
        edu_sections = soup.find_all(['div'], class_=re.compile(r'beca|programa|educativo|convocatoria'))
        
        for section in edu_sections:
            try:
                opportunity = await self._extract_program_info(section, url, "Education")
                if opportunity:
                    opportunity.ministry = "MINEDU" if "minedu" in url else "PRONABEC"
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing education section: {str(e)}")
        
        return opportunities
    
    async def _parse_foncodes_programs(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse FONCODES social development programs"""
        opportunities = []
        
        # FONCODES specific program parsing
        foncodes_sections = soup.find_all(['div'], class_=re.compile(r'proyecto|programa|rural|nucleo'))
        
        for section in foncodes_sections:
            try:
                opportunity = await self._extract_program_info(section, url, "Social Development/Infrastructure")
                if opportunity:
                    opportunity.ministry = "FONCODES"
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing FONCODES section: {str(e)}")
        
        return opportunities
    
    async def _parse_general_programs(self, soup: BeautifulSoup, url: str) -> List[PeruGovOpportunity]:
        """Parse general government programs"""
        opportunities = []
        
        # Generic program parsing
        general_sections = soup.find_all(['div', 'section'], class_=re.compile(r'programa|servicio|iniciativa'))
        
        for section in general_sections[:5]:  # Limit to first 5
            try:
                opportunity = await self._extract_program_info(section, url, "General Programs")
                if opportunity:
                    opportunities.append(opportunity)
            except Exception as e:
                self.logger.debug(f"Error parsing general section: {str(e)}")
        
        return opportunities
    
    async def _extract_program_info(self, element, source_url: str, sector: str) -> Optional[PeruGovOpportunity]:
        """Extract program information from HTML element"""
        try:
            # Extract title
            title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'a', 'strong'])
            if not title_elem:
                return None
                
            title = self._clean_text(title_elem.get_text(strip=True))
            if len(title) < 10 or len(title) > 200:
                return None
            
            # Extract description
            desc_elem = element.find(['p', 'div'], class_=re.compile(r'descripcion|resumen|contenido'))
            if not desc_elem:
                desc_elem = element
            
            description = self._clean_text(desc_elem.get_text(strip=True))
            
            # Extract link
            link_elem = element.find('a', href=True)
            application_link = source_url
            if link_elem:
                href = link_elem['href']
                if href.startswith('http'):
                    application_link = href
                elif href.startswith('/'):
                    application_link = 'https://www.gob.pe' + href
            
            # Check if this looks like a real program
            if not self._is_valid_program(title, description):
                return None
            
            opportunity = PeruGovOpportunity(
                title=title,
                description=description[:1500],  # Limit length
                sector=sector,
                application_link=application_link,
                source_url=source_url,
                program_type="National Program",
                announcement_date=datetime.now().isoformat()
            )
            
            return opportunity
            
        except Exception as e:
            self.logger.debug(f"Error extracting program info: {str(e)}")
            return None
    
    async def _add_known_programs(self) -> List[PeruGovOpportunity]:
        """Add known Peru government programs based on research"""
        known_programs = [
            {
                "title": "PRONABEC - Beca 18 - Rural and Indigenous Communities",
                "description": "Comprehensive scholarship program for students from rural and indigenous communities to access higher education",
                "sector": "Education",
                "ministry": "PRONABEC",
                "funding_amount": "Full scholarship coverage",
                "application_link": "https://www.gob.pe/pronabec",
                "program_type": "Scholarship Program"
            },
            {
                "title": "FONCODES - Haku Wiñay - Rural Productive Development",
                "description": "Productive development program for rural families focusing on food security and income generation",
                "sector": "Rural Development",
                "ministry": "FONCODES",
                "application_link": "https://www.gob.pe/foncodes",
                "program_type": "Rural Development Program"
            },
            {
                "title": "AGRORURAL - Mi Riego - Rural Irrigation Program",
                "description": "Support for rural irrigation infrastructure and water management systems",
                "sector": "Agriculture/Infrastructure",
                "ministry": "AGRORURAL",
                "application_link": "https://www.gob.pe/agrorural",
                "program_type": "Infrastructure Program"
            },
            {
                "title": "MIDIS - Qali Warma - School Nutrition Program",
                "description": "Nutrition program providing meals to students in rural and indigenous schools",
                "sector": "Social Development/Nutrition",
                "ministry": "MIDIS",
                "application_link": "https://www.gob.pe/midis",
                "program_type": "Social Program"
            },
            {
                "title": "MINAM - Indigenous Protected Areas Program",
                "description": "Support for indigenous communities managing protected areas and conservation initiatives",
                "sector": "Environment/Indigenous Rights",
                "ministry": "MINAM",
                "application_link": "https://www.gob.pe/minam",
                "program_type": "Conservation Program"
            }
        ]
        
        opportunities = []
        for program in known_programs:
            opportunity = PeruGovOpportunity(
                title=program["title"],
                description=program["description"],
                sector=program["sector"],
                ministry=program["ministry"],
                funding_amount=program.get("funding_amount", ""),
                application_link=program["application_link"],
                source_url=program["application_link"],
                program_type=program["program_type"],
                status="Active"
            )
            opportunities.append(opportunity)
        
        return opportunities
    
    def _is_valid_program(self, title: str, description: str) -> bool:
        """Check if extracted content represents a valid program"""
        # Check for program indicators
        program_indicators = [
            'programa', 'proyecto', 'beca', 'apoyo', 'fondo', 'financiamiento',
            'convocatoria', 'subsidio', 'asistencia', 'desarrollo', 'capacitacion',
            'program', 'project', 'scholarship', 'funding', 'support', 'grant'
        ]
        
        text = (title + " " + description).lower()
        has_indicator = any(indicator in text for indicator in program_indicators)
        
        # Check for exclusions
        exclusions = ['error', 'página no encontrada', '404', 'menu', 'navegación', 'cookie']
        has_exclusion = any(exclusion in text for exclusion in exclusions)
        
        return has_indicator and not has_exclusion and len(title) >= 10
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Remove common web artifacts
        text = re.sub(r'Ir al contenido principal', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Gobierno del Perú', '', text, flags=re.IGNORECASE)
        
        return text[:1000]  # Limit length
    
    async def _analyze_and_filter_opportunities(self, opportunities: List[PeruGovOpportunity]) -> List[PeruGovOpportunity]:
        """Analyze opportunities using keyword matcher"""
        relevant_opportunities = []
        
        for opportunity in opportunities:
            try:
                # Prepare text for analysis
                full_text = f"{opportunity.title} {opportunity.description} {opportunity.sector} {opportunity.ministry}"
                
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
                
                # Include relevant opportunities (lower threshold for Peru gov programs)
                if analysis['relevance_score'] >= 1.5 and not analysis['exclusion_flags']:
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
    
    async def save_to_airtable(self, opportunities: List[PeruGovOpportunity]) -> int:
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
                    'Status': opportunity.status or 'Active',
                    'Priority': opportunity.priority_level,
                    'Notes': f"Ministry: {opportunity.ministry}. Program Type: {opportunity.program_type}. Relevance Score: {opportunity.relevance_score}. Auto-scraped from Peru Government.",
                    'Source': opportunity.source
                }
                
                result = self.airtable_client.upsert_record(record_data)
                self.logger.info(f"💾 {result}")
                saved_count += 1
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save {opportunity.title}: {str(e)}")
        
        return saved_count


async def run_peru_gov_scraper():
    """Main function to run the Peru government scraper"""
    async with PeruGovernmentScraper() as scraper:
        try:
            # Scrape opportunities
            opportunities = await scraper.scrape_all_opportunities()
            
            if opportunities:
                print(f"\n🎯 Found {len(opportunities)} relevant Peru government opportunities:")
                print("=" * 65)
                
                for i, opp in enumerate(opportunities[:5], 1):  # Show top 5
                    print(f"\n{i}. {opp.title}")
                    print(f"   🏛️ Ministry: {opp.ministry}")
                    print(f"   💰 {opp.funding_amount}")
                    print(f"   📍 Sector: {opp.sector}")
                    print(f"   🏷️ Program Type: {opp.program_type}")
                    print(f"   🎯 Relevance Score: {opp.relevance_score}")
                    print(f"   🔗 {opp.application_link}")
                
                # Save to Airtable
                if input("\nSave to Airtable? (y/n): ").lower() == 'y':
                    saved_count = await scraper.save_to_airtable(opportunities)
                    print(f"✅ Saved {saved_count} opportunities to Airtable")
            else:
                print("❌ No relevant Peru government opportunities found")
                
        except Exception as e:
            print(f"❌ Scraping failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(run_peru_gov_scraper())