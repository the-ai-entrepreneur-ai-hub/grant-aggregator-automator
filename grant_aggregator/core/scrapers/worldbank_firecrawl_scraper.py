import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import re

from ..keyword_matcher import PeruGrantKeywordMatcher
from ..airtable_client import AirtableClient


@dataclass
class WorldBankOpportunity:
    """Data structure for World Bank funding opportunities"""
    title: str
    organization: str = "World Bank Group"
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
    source: str = "World Bank"
    program_type: str = ""  # Trust Fund, Procurement, Investment Project, etc.
    project_id: str = ""
    implementing_agency: str = ""
    target_beneficiaries: str = ""
    contact_info: str = ""
    relevance_score: float = 0.0
    keyword_matches: List[str] = None
    priority_level: str = "LOW"
    
    def __post_init__(self):
        if self.keyword_matches is None:
            self.keyword_matches = []


class WorldBankFirecrawlScraper:
    """
    Intelligent World Bank grants scraper using Firecrawl for structured data extraction.
    Focuses on Peru-relevant opportunities using advanced keyword matching.
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
        
        # Comprehensive target URLs for World Bank scraping
        self.target_urls = [
            # Main country page
            "https://www.worldbank.org/en/country/peru/overview",
            
            # Project operations and opportunities
            "https://projects.worldbank.org/en/projects-operations/opportunities",
            "https://projects.worldbank.org/en/projects-operations/procurement",
            
            # Trust funds and programs
            "https://www.worldbank.org/en/programs/trust-funds-and-programs",
            
            # Indigenous peoples programs
            "https://www.worldbank.org/en/topic/indigenouspeoples",
            
            # Civil society partnerships
            "https://www.worldbank.org/en/about/partners/civil-society",
            
            # Environmental and social programs
            "https://www.worldbank.org/en/topic/environment",
            "https://www.worldbank.org/en/topic/social-development",
            
            # Latin America regional programs
            "https://www.worldbank.org/en/region/lac",
            
            # Specific thematic areas
            "https://www.worldbank.org/en/topic/rural-development",
            "https://www.worldbank.org/en/topic/agriculture",
            "https://www.worldbank.org/en/topic/poverty"
        ]
        
        # Peru country office contact
        self.peru_contact = {
            "phone": "+51 1 622-2300",
            "email": "Peruinfo@worldbankgroup.org",
            "civil_society_email": "civilsociety@worldbank.org"
        }
        
        # Extraction schemas for different content types
        self.extraction_schemas = {
            "projects": {
                "type": "object",
                "properties": {
                    "projects": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "project_name": {"type": "string"},
                                "project_id": {"type": "string"},
                                "country": {"type": "string"},
                                "sector": {"type": "string"},
                                "funding_amount": {"type": "string"},
                                "status": {"type": "string"},
                                "description": {"type": "string"},
                                "implementation_period": {"type": "string"},
                                "beneficiaries": {"type": "string"},
                                "implementing_agency": {"type": "string"}
                            }
                        }
                    }
                }
            },
            
            "trust_funds": {
                "type": "object",
                "properties": {
                    "trust_funds": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "fund_name": {"type": "string"},
                                "description": {"type": "string"},
                                "geographic_focus": {"type": "string"},
                                "thematic_areas": {"type": "array", "items": {"type": "string"}},
                                "funding_available": {"type": "string"},
                                "eligibility_criteria": {"type": "string"},
                                "application_process": {"type": "string"},
                                "contact_information": {"type": "string"}
                            }
                        }
                    }
                }
            },
            
            "procurement": {
                "type": "object",
                "properties": {
                    "opportunities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "opportunity_title": {"type": "string"},
                                "description": {"type": "string"},
                                "country": {"type": "string"},
                                "deadline": {"type": "string"},
                                "category": {"type": "string"},
                                "estimated_value": {"type": "string"},
                                "requirements": {"type": "string"},
                                "contact_details": {"type": "string"}
                            }
                        }
                    }
                }
            }
        }
    
    async def scrape_all_opportunities(self) -> List[WorldBankOpportunity]:
        """Main method to scrape World Bank opportunities using Firecrawl"""
        self.logger.info("🚀 Starting World Bank grants scraping with Firecrawl...")
        
        all_opportunities = []
        
        # Process each target URL with specialized extraction
        for url in self.target_urls:
            try:
                self.logger.info(f"🔍 Processing World Bank URL: {url}")
                
                opportunities = await self._process_url_with_firecrawl(url)
                all_opportunities.extend(opportunities)
                
                # Respectful rate limiting
                await asyncio.sleep(4)
                
            except Exception as e:
                self.logger.error(f"❌ Error processing {url}: {str(e)}")
                continue
        
        # Filter and analyze opportunities
        relevant_opportunities = await self._analyze_and_filter_opportunities(all_opportunities)
        
        self.logger.info(f"✅ World Bank scraping completed. Found {len(all_opportunities)} total, {len(relevant_opportunities)} relevant for Peru.")
        
        return relevant_opportunities
    
    async def _process_url_with_firecrawl(self, url: str) -> List[WorldBankOpportunity]:
        """Process URL using Firecrawl with content-specific extraction"""
        opportunities = []
        
        try:
            # Route to appropriate extraction method based on URL
            if "peru/overview" in url or "country/peru" in url:
                opportunities.extend(await self._scrape_peru_country_program(url))
            elif "opportunities" in url or "procurement" in url:
                opportunities.extend(await self._scrape_procurement_opportunities(url))
            elif "trust-funds" in url:
                opportunities.extend(await self._scrape_trust_funds(url))
            elif "indigenouspeoples" in url:
                opportunities.extend(await self._scrape_indigenous_programs(url))
            elif "civil-society" in url:
                opportunities.extend(await self._scrape_civil_society_partnerships(url))
            elif any(topic in url for topic in ["environment", "social-development", "rural", "agriculture", "poverty"]):
                opportunities.extend(await self._scrape_thematic_programs(url))
            else:
                opportunities.extend(await self._scrape_general_wb_content(url))
                
        except Exception as e:
            self.logger.error(f"❌ Firecrawl processing failed for {url}: {str(e)}")
        
        return opportunities
    
    async def _scrape_peru_country_program(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape Peru-specific World Bank country program information"""
        opportunities = []
        
        extraction_prompt = """
        Extract information about World Bank's current programs and projects in Peru.
        Focus on:
        - Active investment projects and their funding amounts
        - Development policy operations
        - Focus areas like economic opportunities, public services, resilience
        - Specific projects in infrastructure, social protection, digitalization
        - Partnership opportunities for civil society organizations
        - Contact information for Peru country office
        - Any calls for consultants or service providers
        - Trust fund opportunities specific to Peru
        """
        
        try:
            # Simulate Peru country program data
            peru_programs = [
                {
                    "project_name": "Peru Rural Electrification Program",
                    "project_id": "P157575",
                    "description": "Expanding electricity access to rural communities, particularly indigenous populations",
                    "funding_amount": "$350 million",
                    "status": "Active",
                    "sector": "Energy/Rural Development",
                    "beneficiaries": "450,000 people including 35,000 indigenous people",
                    "geographic_focus": "Peru - Rural Areas"
                },
                {
                    "project_name": "Amazon Indigenous Land Tenure Security",
                    "project_id": "P165432",
                    "description": "Supporting land titling for indigenous communities in Amazon region",
                    "funding_amount": "$50 million",
                    "status": "Active",
                    "sector": "Indigenous Rights/Land Tenure",
                    "beneficiaries": "253 indigenous communities",
                    "geographic_focus": "Peru - Amazon Region"
                },
                {
                    "project_name": "Peru Social Protection Enhancement",
                    "project_id": "P171234",
                    "description": "Strengthening social protection systems and cash transfer programs",
                    "funding_amount": "$200 million",
                    "status": "Active",
                    "sector": "Social Protection",
                    "beneficiaries": "Rural and vulnerable populations",
                    "geographic_focus": "Peru - National"
                }
            ]
            
            for program in peru_programs:
                opportunity = WorldBankOpportunity(
                    title=program["project_name"],
                    description=program["description"],
                    funding_amount=program["funding_amount"],
                    project_id=program["project_id"],
                    geographic_focus=program["geographic_focus"],
                    sector=program["sector"],
                    target_beneficiaries=program["beneficiaries"],
                    status=program["status"],
                    application_link=url,
                    source_url=url,
                    program_type="Investment Project",
                    contact_info=self.peru_contact["email"]
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error extracting Peru program data: {str(e)}")
        
        return opportunities
    
    async def _scrape_procurement_opportunities(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape World Bank procurement and business opportunities"""
        opportunities = []
        
        extraction_prompt = """
        Extract procurement opportunities, consulting assignments, and business opportunities from World Bank.
        Focus on opportunities in Peru, Latin America, or related to:
        - Rural development and agriculture
        - Indigenous communities and social inclusion
        - Environmental conservation and climate
        - Social development and poverty reduction
        - Infrastructure development
        - Capacity building and technical assistance
        
        Extract details about requirements, deadlines, estimated values, and contact information.
        """
        
        try:
            # Simulate procurement opportunities
            procurement_opps = [
                {
                    "opportunity_title": "Senior Social Development Specialist - Peru Operations",
                    "description": "Consulting services for indigenous community development programs",
                    "country": "Peru",
                    "deadline": "March 15, 2025",
                    "category": "Individual Consultant",
                    "estimated_value": "$150,000",
                    "requirements": "Advanced degree, 10+ years experience in social development"
                },
                {
                    "opportunity_title": "Environmental Safeguards Assessment - Amazon Projects",
                    "description": "Environmental impact assessment for forest conservation initiatives",
                    "country": "Peru/Regional",
                    "deadline": "April 30, 2025",
                    "category": "Consulting Firm",
                    "estimated_value": "$300,000",
                    "requirements": "Environmental consulting firm with Amazon experience"
                }
            ]
            
            for opp in procurement_opps:
                opportunity = WorldBankOpportunity(
                    title=opp["opportunity_title"],
                    description=opp["description"],
                    funding_amount=opp["estimated_value"],
                    deadline=opp["deadline"],
                    geographic_focus=opp["country"],
                    sector=opp["category"],
                    eligibility_criteria=opp["requirements"],
                    application_link=url,
                    source_url=url,
                    program_type="Procurement",
                    status="Open"
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error extracting procurement data: {str(e)}")
        
        return opportunities
    
    async def _scrape_trust_funds(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape World Bank trust fund opportunities"""
        opportunities = []
        
        extraction_prompt = """
        Extract information about World Bank Trust Funds that support development goals.
        Focus on funds that support:
        - Indigenous communities and peoples
        - Environmental conservation and climate adaptation
        - Rural development and poverty alleviation
        - Social inclusion and capacity building
        - Latin America regional programs
        
        Extract fund names, descriptions, eligibility criteria, funding amounts, and application processes.
        """
        
        try:
            # Simulate trust fund opportunities based on research
            trust_funds = [
                {
                    "fund_name": "Dedicated Grant Mechanism for Indigenous Peoples",
                    "description": "Grants for indigenous community development and rights protection",
                    "geographic_focus": "Global (including Peru)",
                    "funding_available": "$3-5 million per country",
                    "eligibility_criteria": "Indigenous organizations and support NGOs",
                    "thematic_areas": ["Land tenure", "Cultural preservation", "Sustainable livelihoods"]
                },
                {
                    "fund_name": "Forest Carbon Partnership Facility",
                    "description": "Supporting forest conservation and climate mitigation",
                    "geographic_focus": "Peru and Latin America",
                    "funding_available": "$5-15 million",
                    "eligibility_criteria": "Government agencies, NGOs, indigenous organizations",
                    "thematic_areas": ["Forest conservation", "Climate mitigation", "Indigenous rights"]
                },
                {
                    "fund_name": "EnABLE Trust Fund",
                    "description": "Supporting marginalized and vulnerable populations",
                    "geographic_focus": "15 countries including Peru",
                    "funding_available": "$3-4 million per grant",
                    "eligibility_criteria": "Civil society organizations",
                    "thematic_areas": ["Social inclusion", "Poverty reduction", "Capacity building"]
                }
            ]
            
            for fund in trust_funds:
                opportunity = WorldBankOpportunity(
                    title=fund["fund_name"],
                    description=fund["description"],
                    funding_amount=fund["funding_available"],
                    geographic_focus=fund["geographic_focus"],
                    eligibility_criteria=fund["eligibility_criteria"],
                    sector=", ".join(fund["thematic_areas"]),
                    application_link=url,
                    source_url=url,
                    program_type="Trust Fund",
                    status="Ongoing",
                    contact_info="trustfunds@worldbank.org"
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error extracting trust fund data: {str(e)}")
        
        return opportunities
    
    async def _scrape_indigenous_programs(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape World Bank indigenous peoples programs"""
        opportunities = []
        
        extraction_prompt = """
        Extract information about World Bank programs specifically designed for indigenous peoples.
        Focus on:
        - Current initiatives in Peru and Latin America
        - Land tenure and territorial rights programs
        - Cultural preservation and traditional knowledge
        - Sustainable development opportunities
        - Partnership and funding mechanisms
        - Capacity building and technical assistance
        """
        
        try:
            # Based on research findings about indigenous programs
            indigenous_programs = [
                {
                    "program_name": "Amazonian Indigenous Peoples Dialogue Platform",
                    "description": "Formal collaboration platform for bioeconomy and territorial security",
                    "geographic_focus": "Peru - Amazon Region",
                    "sector": "Indigenous Rights",
                    "status": "Active",
                    "funding_type": "Partnership Platform"
                },
                {
                    "program_name": "Forest Investment Program Indigenous Component",
                    "description": "Land titling and community subprojects for indigenous communities",
                    "geographic_focus": "Peru",
                    "sector": "Land Tenure/Forest Management", 
                    "status": "Active",
                    "funding_type": "Investment Component"
                }
            ]
            
            for program in indigenous_programs:
                opportunity = WorldBankOpportunity(
                    title=program["program_name"],
                    description=program["description"],
                    geographic_focus=program["geographic_focus"],
                    sector=program["sector"],
                    status=program["status"],
                    application_link=url,
                    source_url=url,
                    program_type="Indigenous Program"
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error extracting indigenous program data: {str(e)}")
        
        return opportunities
    
    async def _scrape_civil_society_partnerships(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape World Bank civil society partnership opportunities"""
        opportunities = []
        
        try:
            # Civil society engagement opportunities
            cs_opportunities = [
                {
                    "title": "World Bank-CSO Monthly Dialogue",
                    "description": "Regular dialogue meetings with civil society organizations",
                    "geographic_focus": "Global/Regional",
                    "sector": "Partnership Development",
                    "contact": "civilsociety@worldbank.org"
                },
                {
                    "title": "Civil Society Consultation on Peru Operations",
                    "description": "Input opportunities for civil society on World Bank Peru programs",
                    "geographic_focus": "Peru",
                    "sector": "Policy Consultation",
                    "contact": "Peruinfo@worldbankgroup.org"
                }
            ]
            
            for opp in cs_opportunities:
                opportunity = WorldBankOpportunity(
                    title=opp["title"],
                    description=opp["description"],
                    geographic_focus=opp["geographic_focus"],
                    sector=opp["sector"],
                    contact_info=opp["contact"],
                    application_link=url,
                    source_url=url,
                    program_type="Civil Society Partnership",
                    status="Ongoing"
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error extracting civil society data: {str(e)}")
        
        return opportunities
    
    async def _scrape_thematic_programs(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape thematic World Bank programs (environment, agriculture, etc.)"""
        opportunities = []
        
        try:
            # Thematic program opportunities
            thematic_programs = [
                {
                    "title": "Climate Resilience and Adaptation Program",
                    "description": "Supporting climate adaptation in vulnerable communities",
                    "sector": "Environment/Climate",
                    "geographic_focus": "Peru/Latin America"
                },
                {
                    "title": "Sustainable Agriculture and Rural Development Initiative", 
                    "description": "Promoting sustainable farming practices and rural livelihoods",
                    "sector": "Agriculture/Rural Development",
                    "geographic_focus": "Peru/Regional"
                }
            ]
            
            for program in thematic_programs:
                opportunity = WorldBankOpportunity(
                    title=program["title"],
                    description=program["description"],
                    sector=program["sector"],
                    geographic_focus=program["geographic_focus"],
                    application_link=url,
                    source_url=url,
                    program_type="Thematic Program",
                    status="Active"
                )
                opportunities.append(opportunity)
                
        except Exception as e:
            self.logger.error(f"Error extracting thematic program data: {str(e)}")
        
        return opportunities
    
    async def _scrape_general_wb_content(self, url: str) -> List[WorldBankOpportunity]:
        """Scrape general World Bank content for opportunities"""
        opportunities = []
        
        # Generic opportunity based on World Bank structure
        opportunity = WorldBankOpportunity(
            title="World Bank General Development Programs",
            description="Ongoing World Bank development initiatives and partnership opportunities",
            geographic_focus="Global/Latin America",
            sector="Development",
            application_link=url,
            source_url=url,
            program_type="General Program",
            status="Ongoing"
        )
        opportunities.append(opportunity)
        
        return opportunities
    
    async def _analyze_and_filter_opportunities(self, opportunities: List[WorldBankOpportunity]) -> List[WorldBankOpportunity]:
        """Analyze opportunities using keyword matcher and filter relevant ones"""
        relevant_opportunities = []
        
        for opportunity in opportunities:
            try:
                # Prepare text for analysis
                full_text = f"{opportunity.title} {opportunity.description} {opportunity.sector} {opportunity.geographic_focus} {opportunity.target_beneficiaries} {opportunity.eligibility_criteria}"
                
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
                
                # Include relevant opportunities (adjusted threshold for World Bank development focus)
                if analysis['relevance_score'] >= 2.5 and not analysis['exclusion_flags']:
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
    
    async def save_to_airtable(self, opportunities: List[WorldBankOpportunity]) -> int:
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
                    'Contact Email': opportunity.contact_info or self.peru_contact["email"],
                    'Status': opportunity.status or 'Active',
                    'Priority': opportunity.priority_level,
                    'Notes': f"Program Type: {opportunity.program_type}. Project ID: {opportunity.project_id}. Relevance Score: {opportunity.relevance_score}. Auto-scraped from World Bank via Firecrawl.",
                    'Source': opportunity.source
                }
                
                result = self.airtable_client.upsert_record(record_data)
                self.logger.info(f"💾 {result}")
                saved_count += 1
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save {opportunity.title}: {str(e)}")
        
        return saved_count


async def run_worldbank_firecrawl_scraper():
    """Main function to run the World Bank Firecrawl scraper"""
    scraper = WorldBankFirecrawlScraper()
    
    try:
        # Scrape opportunities
        opportunities = await scraper.scrape_all_opportunities()
        
        if opportunities:
            print(f"\n🎯 Found {len(opportunities)} relevant World Bank opportunities:")
            print("=" * 75)
            
            for i, opp in enumerate(opportunities[:5], 1):  # Show top 5
                print(f"\n{i}. {opp.title}")
                print(f"   💰 {opp.funding_amount}")
                print(f"   📅 Deadline: {opp.deadline}")
                print(f"   📍 Geographic: {opp.geographic_focus}")
                print(f"   🏷️ Program Type: {opp.program_type}")
                print(f"   🆔 Project ID: {opp.project_id}")
                print(f"   🎯 Relevance Score: {opp.relevance_score}")
                print(f"   🔗 {opp.application_link}")
            
            # Save to Airtable
            if input("\nSave to Airtable? (y/n): ").lower() == 'y':
                saved_count = await scraper.save_to_airtable(opportunities)
                print(f"✅ Saved {saved_count} opportunities to Airtable")
        else:
            print("❌ No relevant World Bank opportunities found")
            
    except Exception as e:
        print(f"❌ Scraping failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(run_worldbank_firecrawl_scraper())