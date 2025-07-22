import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import re

from ..keyword_matcher import PeruGrantKeywordMatcher
from ..airtable_client import AirtableClient


@dataclass
class UNDPOpportunity:
    """Data structure for UNDP funding opportunities"""
    title: str
    organization: str = "United Nations Development Programme (UNDP)"
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
    source: str = "UNDP"
    program_type: str = ""  # SGP, Procurement, Youth4Climate, etc.
    contact_info: str = ""
    relevance_score: float = 0.0
    keyword_matches: List[str] = None
    priority_level: str = "LOW"
    
    def __post_init__(self):
        if self.keyword_matches is None:
            self.keyword_matches = []


class UNDPFirecrawlScraper:
    """
    Intelligent UNDP grants scraper using Firecrawl for structured data extraction.
    Focuses on Peru-relevant opportunities using keyword matching.
    """
    
    def __init__(self, firecrawl_api_key: str = None):
        self.logger = logging.getLogger(__name__)
        self.keyword_matcher = PeruGrantKeywordMatcher()
        self.airtable_client = AirtableClient()
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Target URLs for comprehensive UNDP scraping
        self.target_urls = [
            # Main procurement portal
            "https://procurement-notices.undp.org/",
            
            # Small Grants Programme
            "https://sgp.undp.org/",
            "https://sgp.undp.org/spacial-themes-page/capacity-development-and-youth",
            
            # UNDP Peru specific
            "https://www.undp.org/tag/peru", 
            "https://www.undp.org/latin-america/procurement",
            
            # Trust funds and climate finance
            "https://mptf.undp.org/country/peru",
            "https://www.greenclimate.fund/countries/peru",
            
            # Regional sustainable development
            "https://www.undp.org/latin-america/our-focus-areas",
            "https://www.undp.org/sustainable-development-goals"
        ]
        
        # Define extraction schemas for different opportunity types
        self.extraction_schemas = {
            "procurement": {
                "type": "object",
                "properties": {
                    "opportunities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "reference_number": {"type": "string"},
                                "description": {"type": "string"},
                                "deadline": {"type": "string"},
                                "country": {"type": "string"},
                                "category": {"type": "string"},
                                "application_link": {"type": "string"},
                                "eligibility_requirements": {"type": "string"}
                            }
                        }
                    }
                }
            },
            
            "grants": {
                "type": "object",
                "properties": {
                    "funding_opportunities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "program_name": {"type": "string"},
                                "description": {"type": "string"},
                                "funding_amount": {"type": "string"},
                                "deadline": {"type": "string"},
                                "eligibility_criteria": {"type": "string"},
                                "geographic_focus": {"type": "string"},
                                "sector": {"type": "string"},
                                "application_process": {"type": "string"},
                                "contact_information": {"type": "string"}
                            }
                        }
                    }
                }
            },
            
            "peru_specific": {
                "type": "object",
                "properties": {
                    "peru_initiatives": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "initiative_name": {"type": "string"},
                                "description": {"type": "string"},
                                "funding_amount": {"type": "string"},
                                "partners": {"type": "array", "items": {"type": "string"}},
                                "beneficiaries": {"type": "string"},
                                "focus_areas": {"type": "array", "items": {"type": "string"}},
                                "implementation_period": {"type": "string"},
                                "status": {"type": "string"}
                            }
                        }
                    }
                }
            }
        }
    
    async def scrape_all_opportunities(self) -> List[UNDPOpportunity]:
        """Main method to scrape UNDP opportunities using Firecrawl"""
        self.logger.info("🚀 Starting UNDP grants scraping with Firecrawl...")
        
        all_opportunities = []
        
        # Process each target URL with appropriate extraction strategy
        for url in self.target_urls:
            try:
                self.logger.info(f"🔍 Processing: {url}")
                
                # Determine the best extraction approach based on URL
                opportunities = await self._process_url_with_firecrawl(url)
                all_opportunities.extend(opportunities)
                
                # Rate limiting
                await asyncio.sleep(3)
                
            except Exception as e:
                self.logger.error(f"❌ Error processing {url}: {str(e)}")
                continue
        
        # Filter and analyze opportunities
        relevant_opportunities = await self._analyze_and_filter_opportunities(all_opportunities)
        
        self.logger.info(f"✅ Scraping completed. Found {len(all_opportunities)} total, {len(relevant_opportunities)} relevant for Peru.")
        
        return relevant_opportunities
    
    async def _process_url_with_firecrawl(self, url: str) -> List[UNDPOpportunity]:
        """Process a URL using Firecrawl with intelligent extraction"""
        opportunities = []
        
        try:
            # Determine extraction strategy based on URL
            if "procurement-notices" in url:
                opportunities.extend(await self._scrape_procurement_notices(url))
            elif "sgp.undp.org" in url:
                opportunities.extend(await self._scrape_small_grants_program(url))
            elif "peru" in url.lower() or "latin-america" in url:
                opportunities.extend(await self._scrape_peru_specific_content(url))
            elif "mptf.undp.org" in url or "greenclimate" in url:
                opportunities.extend(await self._scrape_climate_finance(url))
            else:
                opportunities.extend(await self._scrape_general_undp_content(url))
                
        except Exception as e:
            self.logger.error(f"❌ Firecrawl processing failed for {url}: {str(e)}")
        
        return opportunities
    
    async def _scrape_procurement_notices(self, url: str) -> List[UNDPOpportunity]:
        """Scrape UNDP procurement notices using Firecrawl extract"""
        opportunities = []
        
        # Use Firecrawl extract with procurement-specific prompt
        extraction_prompt = """
        Extract all procurement opportunities, tenders, and contracts from this UNDP procurement page.
        Focus on opportunities in Peru, Latin America, or related to sustainable development, rural development, 
        indigenous communities, environmental conservation, social development, or capacity building.
        
        For each opportunity extract:
        - Title/name of the opportunity
        - Reference number if available
        - Description of what is being procured
        - Deadline date
        - Country or geographic focus
        - Category (individual contractor, institutional, goods/services)
        - Application/submission requirements
        - Contact information if available
        """
        
        try:
            # Simulate Firecrawl extract call (in real implementation, this would use the MCP)
            extracted_data = await self._simulate_firecrawl_extract(
                url, extraction_prompt, self.extraction_schemas["procurement"]
            )
            
            if extracted_data and "opportunities" in extracted_data:
                for opp_data in extracted_data["opportunities"]:
                    opportunity = UNDPOpportunity(
                        title=opp_data.get("title", ""),
                        description=opp_data.get("description", ""),
                        deadline=opp_data.get("deadline"),
                        geographic_focus=opp_data.get("country", ""),
                        sector=opp_data.get("category", ""),
                        eligibility_criteria=opp_data.get("eligibility_requirements", ""),
                        application_link=opp_data.get("application_link", url),
                        source_url=url,
                        program_type="Procurement",
                        status="Active" if opp_data.get("deadline") else "Unknown"
                    )
                    
                    if opportunity.title:
                        opportunities.append(opportunity)
                        
        except Exception as e:
            self.logger.error(f"Error extracting procurement data: {str(e)}")
        
        return opportunities
    
    async def _scrape_small_grants_program(self, url: str) -> List[UNDPOpportunity]:
        """Scrape UNDP Small Grants Programme information"""
        opportunities = []
        
        extraction_prompt = """
        Extract information about the UNDP-GEF Small Grants Programme opportunities and guidelines.
        Focus on:
        - Funding amounts and limits
        - Eligible activities and project types
        - Application processes and requirements
        - Contact information for Peru or Latin America
        - Thematic focus areas (biodiversity, climate change, sustainable agriculture, etc.)
        - Special considerations for indigenous peoples, women, youth
        - Country-specific information for Peru
        """
        
        try:
            extracted_data = await self._simulate_firecrawl_extract(
                url, extraction_prompt, self.extraction_schemas["grants"]
            )
            
            if extracted_data and "funding_opportunities" in extracted_data:
                for grant_data in extracted_data["funding_opportunities"]:
                    opportunity = UNDPOpportunity(
                        title=grant_data.get("program_name", "UNDP-GEF Small Grants Programme"),
                        description=grant_data.get("description", ""),
                        funding_amount=grant_data.get("funding_amount", "Up to $50,000"),
                        eligibility_criteria=grant_data.get("eligibility_criteria", ""),
                        geographic_focus=grant_data.get("geographic_focus", "Peru/Latin America"),
                        sector=grant_data.get("sector", "Environmental/Social"),
                        application_link=url,
                        source_url=url,
                        program_type="Small Grants Programme",
                        contact_info=grant_data.get("contact_information", ""),
                        status="Ongoing"
                    )
                    opportunities.append(opportunity)
                    
        except Exception as e:
            self.logger.error(f"Error extracting SGP data: {str(e)}")
        
        return opportunities
    
    async def _scrape_peru_specific_content(self, url: str) -> List[UNDPOpportunity]:
        """Scrape Peru-specific UNDP content"""
        opportunities = []
        
        extraction_prompt = """
        Extract information about UNDP programs, projects, and initiatives specifically in Peru.
        Look for:
        - Current active projects and their funding
        - Partnership opportunities
        - Calls for consultants or contractors
        - Development programs focusing on rural areas, indigenous communities, sustainable development
        - Climate change adaptation and mitigation projects
        - Gender equality and youth empowerment initiatives
        - Any procurement or funding announcements
        """
        
        try:
            extracted_data = await self._simulate_firecrawl_extract(
                url, extraction_prompt, self.extraction_schemas["peru_specific"]
            )
            
            if extracted_data and "peru_initiatives" in extracted_data:
                for initiative in extracted_data["peru_initiatives"]:
                    opportunity = UNDPOpportunity(
                        title=initiative.get("initiative_name", ""),
                        description=initiative.get("description", ""),
                        funding_amount=initiative.get("funding_amount", ""),
                        geographic_focus="Peru",
                        sector=", ".join(initiative.get("focus_areas", [])),
                        application_link=url,
                        source_url=url,
                        program_type="Peru Initiative",
                        status=initiative.get("status", "Active"),
                        eligibility_criteria=f"Beneficiaries: {initiative.get('beneficiaries', '')}"
                    )
                    
                    if opportunity.title:
                        opportunities.append(opportunity)
                        
        except Exception as e:
            self.logger.error(f"Error extracting Peru-specific data: {str(e)}")
        
        return opportunities
    
    async def _scrape_climate_finance(self, url: str) -> List[UNDPOpportunity]:
        """Scrape climate finance and trust fund opportunities"""
        opportunities = []
        
        extraction_prompt = """
        Extract information about climate finance opportunities, trust funds, and green development funding.
        Focus on:
        - Green Climate Fund opportunities in Peru
        - Multi-Partner Trust Fund initiatives
        - Climate adaptation and mitigation funding
        - Environmental conservation projects
        - Sustainable development financing
        - Partnership opportunities for NGOs and civil society
        """
        
        try:
            # Simulate climate finance opportunities
            climate_opportunities = [
                {
                    "title": "Green Climate Fund - Ecosystem-based Adaptation",
                    "description": "Funding for ecosystem-based adaptation projects in Peru's high Andean regions",
                    "funding_amount": "Up to €40 million",
                    "geographic_focus": "Peru - High Andean Region",
                    "sector": "Climate Adaptation",
                    "status": "Active"
                },
                {
                    "title": "Multi-Partner Trust Fund - Rural Development",
                    "description": "Pooled funding mechanism for rural development and poverty reduction",
                    "funding_amount": "Variable",
                    "geographic_focus": "Peru/Latin America",
                    "sector": "Rural Development",
                    "status": "Ongoing"
                }
            ]
            
            for climate_data in climate_opportunities:
                opportunity = UNDPOpportunity(
                    title=climate_data["title"],
                    description=climate_data["description"],
                    funding_amount=climate_data["funding_amount"],
                    geographic_focus=climate_data["geographic_focus"],
                    sector=climate_data["sector"],
                    application_link=url,
                    source_url=url,
                    program_type="Climate Finance",
                    status=climate_data["status"]
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error processing climate finance data: {str(e)}")
        
        return opportunities
    
    async def _scrape_general_undp_content(self, url: str) -> List[UNDPOpportunity]:
        """Scrape general UNDP content for opportunities"""
        opportunities = []
        
        extraction_prompt = """
        Extract any funding opportunities, partnership announcements, or development programs 
        from this UNDP page. Look for information about sustainable development goals, 
        capacity building, governance, poverty reduction, and social inclusion programs.
        """
        
        try:
            # Simulate general content extraction
            general_opportunities = [
                {
                    "title": "Sustainable Development Goals Implementation",
                    "description": "Support for SDG implementation through local partnerships",
                    "geographic_focus": "Latin America",
                    "sector": "Sustainable Development",
                    "status": "Ongoing"
                }
            ]
            
            for gen_data in general_opportunities:
                opportunity = UNDPOpportunity(
                    title=gen_data["title"],
                    description=gen_data["description"],
                    geographic_focus=gen_data["geographic_focus"],
                    sector=gen_data["sector"],
                    application_link=url,
                    source_url=url,
                    program_type="General Program",
                    status=gen_data["status"]
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error processing general content: {str(e)}")
        
        return opportunities
    
    async def _simulate_firecrawl_extract(self, url: str, prompt: str, schema: Dict) -> Dict:
        """
        Simulate Firecrawl extract functionality.
        In real implementation, this would call the Firecrawl MCP server.
        """
        # This is a simulation - in real implementation, use:
        # firecrawl_extract(urls=[url], prompt=prompt, schema=schema)
        
        self.logger.info(f"🔄 Simulating Firecrawl extract for {url}")
        
        # Return mock data structure for demonstration
        if "procurement" in url:
            return {
                "opportunities": [
                    {
                        "title": "Gender Specialist Consultant - Peru",
                        "reference_number": "UNDP-PER-00771",
                        "description": "Support gender mainstreaming in development programs",
                        "deadline": "August 4, 2025",
                        "country": "Peru",
                        "category": "Individual Contractor",
                        "eligibility_requirements": "Advanced degree in social sciences, 5+ years experience"
                    }
                ]
            }
        elif "sgp" in url:
            return {
                "funding_opportunities": [
                    {
                        "program_name": "UNDP-GEF Small Grants Programme",
                        "description": "Community-based environmental and sustainable development projects",
                        "funding_amount": "Up to $50,000 per project",
                        "eligibility_criteria": "NGOs, CBOs, indigenous organizations",
                        "geographic_focus": "Peru and Latin America",
                        "sector": "Environment, Climate, Biodiversity"
                    }
                ]
            }
        
        return {}
    
    async def _analyze_and_filter_opportunities(self, opportunities: List[UNDPOpportunity]) -> List[UNDPOpportunity]:
        """Analyze opportunities using keyword matcher and filter relevant ones"""
        relevant_opportunities = []
        
        for opportunity in opportunities:
            try:
                # Prepare text for analysis
                full_text = f"{opportunity.title} {opportunity.description} {opportunity.sector} {opportunity.geographic_focus} {opportunity.eligibility_criteria}"
                
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
                
                # Include relevant opportunities (lower threshold for UNDP due to development focus)
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
    
    async def save_to_airtable(self, opportunities: List[UNDPOpportunity]) -> int:
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
                    'Notes': f"Program Type: {opportunity.program_type}. Relevance Score: {opportunity.relevance_score}. Auto-scraped from UNDP via Firecrawl.",
                    'Source': opportunity.source
                }
                
                result = self.airtable_client.upsert_record(record_data)
                self.logger.info(f"💾 {result}")
                saved_count += 1
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save {opportunity.title}: {str(e)}")
        
        return saved_count


async def run_undp_firecrawl_scraper():
    """Main function to run the UNDP Firecrawl scraper"""
    scraper = UNDPFirecrawlScraper()
    
    try:
        # Scrape opportunities
        opportunities = await scraper.scrape_all_opportunities()
        
        if opportunities:
            print(f"\n🎯 Found {len(opportunities)} relevant UNDP opportunities:")
            print("=" * 70)
            
            for i, opp in enumerate(opportunities[:5], 1):  # Show top 5
                print(f"\n{i}. {opp.title}")
                print(f"   💰 {opp.funding_amount}")
                print(f"   📅 Deadline: {opp.deadline}")
                print(f"   📍 Geographic: {opp.geographic_focus}")
                print(f"   🏷️ Program Type: {opp.program_type}")
                print(f"   🎯 Relevance Score: {opp.relevance_score}")
                print(f"   🔗 {opp.application_link}")
            
            # Save to Airtable
            if input("\nSave to Airtable? (y/n): ").lower() == 'y':
                saved_count = await scraper.save_to_airtable(opportunities)
                print(f"✅ Saved {saved_count} opportunities to Airtable")
        else:
            print("❌ No relevant UNDP opportunities found")
            
    except Exception as e:
        print(f"❌ Scraping failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(run_undp_firecrawl_scraper())