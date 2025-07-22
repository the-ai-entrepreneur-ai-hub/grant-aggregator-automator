import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from keyword_matcher import PeruGrantKeywordMatcher
from airtable_client import AirtableClient
from scrapers.idb_scraper import IDBGrantsScraper
from scrapers.undp_firecrawl_scraper import UNDPFirecrawlScraper  
from scrapers.worldbank_firecrawl_scraper import WorldBankFirecrawlScraper
from scrapers.peru_gov_scraper import PeruGovernmentScraper


@dataclass
class ScrapingReport:
    """Report of scraping session results"""
    timestamp: str
    total_opportunities: int
    relevant_opportunities: int
    sources_scraped: List[str]
    errors: List[str]
    top_opportunities: List[Dict[str, Any]]
    keyword_stats: Dict[str, int]
    execution_time: float


class GrantScraperOrchestrator:
    """
    Intelligent orchestrator for all Peru-focused grant scrapers.
    Manages multiple scrapers, keyword matching, and data pipeline integration.
    """
    
    def __init__(self, firecrawl_api_key: str = None):
        self.logger = logging.getLogger(__name__)
        self.keyword_matcher = PeruGrantKeywordMatcher()
        self.airtable_client = AirtableClient()
        
        # Configure comprehensive logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f'grant_scraping_{datetime.now().strftime("%Y%m%d")}.log'),
                logging.StreamHandler()
            ]
        )
        
        # Initialize scrapers
        self.scrapers = {
            'IDB': None,  # Will be initialized in async context
            'UNDP': UNDPFirecrawlScraper(firecrawl_api_key),
            'World Bank': WorldBankFirecrawlScraper(firecrawl_api_key),
            'Peru Government': None  # Will be initialized in async context
        }
        
        # Scraping configuration
        self.config = {
            'max_concurrent_scrapers': 2,
            'retry_attempts': 3,
            'retry_delay': 5,  # seconds
            'relevance_threshold': 3.0,
            'max_opportunities_per_source': 50,
            'enable_airtable_save': True,
            'enable_deduplication': True
        }
        
        self.session_stats = {
            'start_time': None,
            'end_time': None,
            'total_scraped': 0,
            'total_relevant': 0,
            'errors': [],
            'sources_completed': []
        }
    
    async def run_comprehensive_scraping(self, sources: List[str] = None) -> ScrapingReport:
        """
        Run comprehensive grant scraping across all sources with intelligent filtering.
        
        Args:
            sources: List of source names to scrape. If None, scrapes all sources.
        
        Returns:
            ScrapingReport with session results
        """
        start_time = datetime.now()
        self.session_stats['start_time'] = start_time
        
        self.logger.info("🚀 STARTING COMPREHENSIVE PERU GRANTS SCRAPING")
        self.logger.info("=" * 60)
        
        # Initialize sources to scrape
        if sources is None:
            sources = list(self.scrapers.keys())
        
        all_opportunities = []
        errors = []
        
        # Initialize async context scrapers
        self.scrapers['IDB'] = IDBGrantsScraper()
        self.scrapers['Peru Government'] = PeruGovernmentScraper()
        
        # Process each source with error handling and retries
        semaphore = asyncio.Semaphore(self.config['max_concurrent_scrapers'])
        
        async def scrape_source_with_retry(source_name: str):
            async with semaphore:
                for attempt in range(self.config['retry_attempts']):
                    try:
                        self.logger.info(f"🎯 Scraping {source_name} (Attempt {attempt + 1})")
                        
                        scraper = self.scrapers[source_name]
                        if source_name in ['IDB', 'Peru Government']:
                            async with scraper:  # Use context manager for async scrapers
                                opportunities = await scraper.scrape_all_opportunities()
                        else:
                            opportunities = await scraper.scrape_all_opportunities()
                        
                        self.logger.info(f"✅ {source_name}: Found {len(opportunities)} relevant opportunities")
                        self.session_stats['sources_completed'].append(source_name)
                        
                        return opportunities
                        
                    except Exception as e:
                        error_msg = f"{source_name} attempt {attempt + 1} failed: {str(e)}"
                        self.logger.error(f"❌ {error_msg}")
                        errors.append(error_msg)
                        
                        if attempt < self.config['retry_attempts'] - 1:
                            await asyncio.sleep(self.config['retry_delay'])
                        else:
                            self.logger.error(f"💥 {source_name} failed all retry attempts")
                            return []
        
        # Execute scrapers concurrently
        tasks = []
        for source in sources:
            if source in self.scrapers:
                task = scrape_source_with_retry(source)
                tasks.append((source, task))
        
        # Gather results
        for source, task in tasks:
            try:
                opportunities = await task
                if opportunities:
                    all_opportunities.extend(opportunities)
                    self.session_stats['total_scraped'] += len(opportunities)
            except Exception as e:
                errors.append(f"Task execution failed for {source}: {str(e)}")
        
        # Process and analyze all opportunities
        final_opportunities = await self._process_all_opportunities(all_opportunities)
        
        # Generate comprehensive report
        end_time = datetime.now()
        self.session_stats['end_time'] = end_time
        execution_time = (end_time - start_time).total_seconds()
        
        report = ScrapingReport(
            timestamp=start_time.isoformat(),
            total_opportunities=len(all_opportunities),
            relevant_opportunities=len(final_opportunities),
            sources_scraped=self.session_stats['sources_completed'],
            errors=errors,
            top_opportunities=[self._opportunity_to_dict(opp) for opp in final_opportunities[:10]],
            keyword_stats=self.keyword_matcher.get_keyword_statistics(),
            execution_time=execution_time
        )
        
        await self._save_scraping_report(report)
        await self._display_comprehensive_results(report, final_opportunities)
        
        return report
    
    async def _process_all_opportunities(self, opportunities: List[Any]) -> List[Any]:
        """Process and deduplicate opportunities from all sources"""
        self.logger.info(f"📊 Processing {len(opportunities)} opportunities...")
        
        # Deduplicate based on title similarity
        if self.config['enable_deduplication']:
            opportunities = await self._deduplicate_opportunities(opportunities)
            self.logger.info(f"🔄 After deduplication: {len(opportunities)} opportunities")
        
        # Apply final filtering and ranking
        filtered_opportunities = []
        for opp in opportunities:
            # Get relevance score (should already be set by individual scrapers)
            relevance_score = getattr(opp, 'relevance_score', 0)
            
            if relevance_score >= self.config['relevance_threshold']:
                filtered_opportunities.append(opp)
        
        # Sort by relevance score
        filtered_opportunities.sort(key=lambda x: getattr(x, 'relevance_score', 0), reverse=True)
        
        # Limit per source if configured
        if self.config['max_opportunities_per_source'] > 0:
            final_opportunities = filtered_opportunities[:self.config['max_opportunities_per_source']]
        else:
            final_opportunities = filtered_opportunities
        
        self.session_stats['total_relevant'] = len(final_opportunities)
        
        return final_opportunities
    
    async def _deduplicate_opportunities(self, opportunities: List[Any]) -> List[Any]:
        """Remove duplicate opportunities based on title similarity"""
        unique_opportunities = []
        seen_titles = set()
        
        for opp in opportunities:
            title = getattr(opp, 'title', '').lower().strip()
            
            # Simple deduplication based on title similarity
            is_duplicate = False
            for seen_title in seen_titles:
                if self._calculate_similarity(title, seen_title) > 0.8:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_opportunities.append(opp)
                seen_titles.add(title)
        
        return unique_opportunities
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple similarity between two texts"""
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 and not words2:
            return 1.0
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    async def save_all_to_airtable(self, opportunities: List[Any]) -> int:
        """Save all relevant opportunities to Airtable"""
        if not self.config['enable_airtable_save']:
            self.logger.info("💾 Airtable saving disabled in configuration")
            return 0
        
        self.logger.info(f"💾 Saving {len(opportunities)} opportunities to Airtable...")
        
        saved_count = 0
        failed_count = 0
        
        for opp in opportunities:
            try:
                # Convert opportunity to Airtable record format
                record_data = self._convert_to_airtable_record(opp)
                
                result = self.airtable_client.upsert_record(record_data)
                self.logger.debug(f"💾 {result}")
                saved_count += 1
                
            except Exception as e:
                failed_count += 1
                self.logger.error(f"❌ Failed to save {getattr(opp, 'title', 'Unknown')}: {str(e)}")
        
        self.logger.info(f"✅ Airtable save completed: {saved_count} saved, {failed_count} failed")
        return saved_count
    
    def _convert_to_airtable_record(self, opportunity: Any) -> Dict[str, Any]:
        """Convert opportunity object to Airtable record format"""
        return {
            'Grant Name': getattr(opportunity, 'title', ''),
            'Organization': [getattr(opportunity, 'organization', 'Unknown')],
            'Description': getattr(opportunity, 'description', '')[:2000],
            'Amount': getattr(opportunity, 'funding_amount', ''),
            'Deadline': getattr(opportunity, 'deadline', None),
            'Category': [getattr(opportunity, 'sector', '')] if getattr(opportunity, 'sector', '') else [],
            'Keywords': getattr(opportunity, 'keyword_matches', [])[:10],
            'Eligibility': getattr(opportunity, 'eligibility_criteria', ''),
            'Application Link': getattr(opportunity, 'application_link', ''),
            'Contact Email': getattr(opportunity, 'contact_info', ''),
            'Status': getattr(opportunity, 'status', 'Active'),
            'Priority': getattr(opportunity, 'priority_level', 'MEDIUM'),
            'Notes': f"Source: {getattr(opportunity, 'source', 'Unknown')}. Relevance Score: {getattr(opportunity, 'relevance_score', 0)}. Auto-scraped via Orchestrator.",
            'Source': getattr(opportunity, 'source', 'Unknown')
        }
    
    def _opportunity_to_dict(self, opportunity: Any) -> Dict[str, Any]:
        """Convert opportunity to dictionary for reporting"""
        return {
            'title': getattr(opportunity, 'title', ''),
            'source': getattr(opportunity, 'source', ''),
            'funding_amount': getattr(opportunity, 'funding_amount', ''),
            'relevance_score': getattr(opportunity, 'relevance_score', 0),
            'priority_level': getattr(opportunity, 'priority_level', ''),
            'geographic_focus': getattr(opportunity, 'geographic_focus', ''),
            'application_link': getattr(opportunity, 'application_link', '')
        }
    
    async def _save_scraping_report(self, report: ScrapingReport):
        """Save detailed scraping report to file"""
        try:
            filename = f"scraping_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = os.path.join("grant_aggregator", "logs", filename)
            
            # Create logs directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'w') as f:
                json.dump(asdict(report), f, indent=2, default=str)
            
            self.logger.info(f"📋 Scraping report saved to {filepath}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to save scraping report: {str(e)}")
    
    async def _display_comprehensive_results(self, report: ScrapingReport, opportunities: List[Any]):
        """Display comprehensive results summary"""
        print("\n" + "="*80)
        print("🎯 PERU GRANTS SCRAPING COMPLETE - COMPREHENSIVE RESULTS")
        print("="*80)
        
        print(f"\n📊 OVERALL STATISTICS:")
        print(f"   • Total Opportunities Found: {report.total_opportunities}")
        print(f"   • Relevant for Peru: {report.relevant_opportunities}")
        print(f"   • Sources Completed: {len(report.sources_scraped)}")
        print(f"   • Execution Time: {report.execution_time:.1f} seconds")
        print(f"   • Success Rate: {(len(report.sources_scraped)/len(self.scrapers)*100):.1f}%")
        
        if report.errors:
            print(f"\n⚠️ ERRORS ENCOUNTERED: {len(report.errors)}")
            for error in report.errors[:3]:  # Show first 3 errors
                print(f"   • {error}")
        
        print(f"\n🔍 KEYWORD MATCHING STATISTICS:")
        for category, count in report.keyword_stats.items():
            print(f"   • {category}: {count} keywords")
        
        if opportunities:
            print(f"\n🏆 TOP {min(5, len(opportunities))} OPPORTUNITIES:")
            for i, opp in enumerate(opportunities[:5], 1):
                print(f"\n{i}. {getattr(opp, 'title', 'Unknown Title')}")
                print(f"   🏢 Source: {getattr(opp, 'source', 'Unknown')}")
                print(f"   💰 Amount: {getattr(opp, 'funding_amount', 'Not specified')}")
                print(f"   📍 Geographic: {getattr(opp, 'geographic_focus', 'Not specified')}")
                print(f"   🎯 Relevance Score: {getattr(opp, 'relevance_score', 0):.1f}")
                print(f"   📅 Deadline: {getattr(opp, 'deadline', 'Not specified')}")
                print(f"   🔗 Link: {getattr(opp, 'application_link', 'Not provided')}")
        
        print(f"\n💾 AIRTABLE INTEGRATION:")
        if self.config['enable_airtable_save']:
            saved_count = await self.save_all_to_airtable(opportunities)
            print(f"   • {saved_count} opportunities saved to Airtable")
        else:
            print("   • Airtable saving disabled")
        
        print("\n✅ Scraping session completed successfully!")
        print("="*80)


async def main():
    """Main execution function"""
    print("🚀 Peru Grant Scraper Orchestrator")
    print("Intelligent grant aggregation for Misión Huascarán")
    print("-" * 50)
    
    # Initialize orchestrator
    orchestrator = GrantScraperOrchestrator()
    
    # Run comprehensive scraping
    try:
        report = await orchestrator.run_comprehensive_scraping()
        
        print(f"\n✅ Session completed! Check logs for detailed information.")
        
    except Exception as e:
        print(f"❌ Orchestrator failed: {str(e)}")
        logging.error(f"Orchestrator execution failed: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())