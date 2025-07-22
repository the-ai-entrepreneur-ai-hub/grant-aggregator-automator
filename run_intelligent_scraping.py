#!/usr/bin/env python3
"""
🚀 Intelligent Peru Grant Scraping System - Main Launcher

This is the primary entry point for running the comprehensive grant aggregation system
for Misión Huascarán. It orchestrates multiple intelligent scrapers to find Peru-relevant
funding opportunities from major international and national sources.

Usage:
    python3 run_intelligent_scraping.py [options]

Features:
- 4 major funding sources (IDB, UNDP, World Bank, Peru Government)
- 160+ specialized Peru-focused keywords
- Intelligent relevance scoring and filtering
- Automatic Airtable integration
- Comprehensive error handling and reporting
"""

import asyncio
import sys
import os
import argparse
from datetime import datetime

# Add the grant_aggregator/core to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'grant_aggregator', 'core'))

try:
    from scraper_orchestrator import GrantScraperOrchestrator
    from keyword_matcher import PeruGrantKeywordMatcher
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure you're running from the project root directory")
    print("and all dependencies are installed.")
    sys.exit(1)


def print_banner():
    """Print system banner and information"""
    banner = """
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 INTELLIGENT PERU GRANT SCRAPER                          ║
║                     For Misión Huascarán Development                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  📊 Sources: IDB • UNDP • World Bank • Peru Government                       ║
║  🎯 Keywords: 160+ Peru-focused terms across 6 categories                    ║
║  🔍 Intelligence: Advanced relevance scoring & filtering                     ║
║  💾 Integration: Automatic Airtable pipeline                                 ║
║  🛡️ Reliability: Error handling • Retries • Rate limiting                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""
    print(banner)
    print(f"Session started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 79)


def print_help():
    """Print detailed usage help"""
    help_text = """
🔧 USAGE OPTIONS:

Basic Usage:
    python3 run_intelligent_scraping.py                    # Run all scrapers
    python3 run_intelligent_scraping.py --sources IDB      # Run specific source
    python3 run_intelligent_scraping.py --test-keywords    # Test keyword engine

Advanced Options:
    --sources SOURCE [SOURCE ...]    Specific sources to scrape
                                    Options: IDB, UNDP, "World Bank", "Peru Government"
    
    --no-airtable                   Disable Airtable integration
    
    --threshold FLOAT               Set relevance threshold (default: 3.0)
    
    --max-opportunities INT         Max opportunities per source (default: 50)
    
    --test-keywords                 Test keyword matching engine only
    
    --verbose                       Enable detailed logging
    
    --help                          Show this help message

Examples:
    # Run all scrapers with default settings
    python3 run_intelligent_scraping.py
    
    # Run only international sources
    python3 run_intelligent_scraping.py --sources IDB UNDP "World Bank"
    
    # Run with lower relevance threshold for more results
    python3 run_intelligent_scraping.py --threshold 2.0
    
    # Test mode - no Airtable saving
    python3 run_intelligent_scraping.py --no-airtable --verbose

📋 SYSTEM REQUIREMENTS:
    • Python 3.7+
    • Dependencies: aiohttp, beautifulsoup4, requests
    • Environment: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME
    
📊 EXPECTED RESULTS:
    • Total opportunities: 50-100 per source
    • Peru-relevant: 15-25% typically pass filtering
    • High priority (6.0+): 5-10 opportunities per session
    • Execution time: 3-5 minutes for complete scraping
    
💾 OUTPUT FILES:
    • Logs: grant_scraping_YYYYMMDD.log
    • Reports: grant_aggregator/logs/scraping_report_*.json
    • Airtable: Records automatically created in configured base
"""
    print(help_text)


async def test_keyword_engine():
    """Test the keyword matching engine with sample data"""
    print("🧪 TESTING KEYWORD MATCHING ENGINE")
    print("=" * 50)
    
    matcher = PeruGrantKeywordMatcher()
    
    # Test grants with various relevance levels
    test_grants = [
        {
            'title': 'Rural Education Program for Indigenous Communities in Peru',
            'description': 'Supporting digital inclusion and literacy programs in Andean regions, focusing on Quechua populations and rural women in highland communities.',
        },
        {
            'title': 'Urban Development Initiative for European Cities',
            'description': 'Commercial real estate development program exclusively for European urban centers and developed countries only.',
        },
        {
            'title': 'Microfinance Support for Latin American Small Farmers',
            'description': 'Providing financial services and capacity building for agricultural cooperatives and rural entrepreneurship in South America.',
        },
        {
            'title': 'Climate Resilience Program for Vulnerable Communities',
            'description': 'Environmental conservation and sustainable development initiatives for indigenous peoples and mountain communities.',
        }
    ]
    
    results = matcher.batch_analyze_grants(test_grants)
    
    print(f"📊 Keyword Statistics: {matcher.get_keyword_statistics()}")
    print(f"\n🎯 Test Results ({len(results)} grants analyzed):")
    print("-" * 60)
    
    for i, result in enumerate(results, 1):
        grant = result['original_grant']
        print(f"\n{i}. {grant['title']}")
        print(f"   🎯 Relevance Score: {result['relevance_score']}")
        print(f"   📊 Priority: {result['priority_level']}")
        print(f"   💡 Recommendation: {result['recommendation']}")
        print(f"   🔍 Top Matches: {', '.join([m['keyword'] for m in result['matches'][:3]])}")
        
        if result['exclusion_flags']:
            print(f"   ⚠️ Exclusions: {', '.join(result['exclusion_flags'])}")
    
    print("\n✅ Keyword engine test completed!")
    return True


async def main():
    """Main execution function with argument parsing"""
    parser = argparse.ArgumentParser(
        description='Intelligent Peru Grant Scraper for Misión Huascarán',
        add_help=False  # We'll handle help manually
    )
    
    parser.add_argument('--sources', nargs='*', 
                       choices=['IDB', 'UNDP', 'World Bank', 'Peru Government'],
                       help='Specific sources to scrape')
    
    parser.add_argument('--no-airtable', action='store_true',
                       help='Disable Airtable integration')
    
    parser.add_argument('--threshold', type=float, default=3.0,
                       help='Relevance threshold for filtering (default: 3.0)')
    
    parser.add_argument('--max-opportunities', type=int, default=50,
                       help='Max opportunities per source (default: 50)')
    
    parser.add_argument('--test-keywords', action='store_true',
                       help='Test keyword matching engine only')
    
    parser.add_argument('--verbose', action='store_true',
                       help='Enable verbose logging')
    
    parser.add_argument('--help', action='store_true',
                       help='Show help message')
    
    args = parser.parse_args()
    
    # Handle help
    if args.help:
        print_banner()
        print_help()
        return
    
    print_banner()
    
    # Test keyword engine if requested
    if args.test_keywords:
        await test_keyword_engine()
        return
    
    # Initialize orchestrator with configuration
    print("🔧 Initializing Grant Scraper Orchestrator...")
    orchestrator = GrantScraperOrchestrator()
    
    # Apply command line configuration
    if args.no_airtable:
        orchestrator.config['enable_airtable_save'] = False
        print("💾 Airtable integration disabled")
    
    orchestrator.config['relevance_threshold'] = args.threshold
    orchestrator.config['max_opportunities_per_source'] = args.max_opportunities
    
    if args.verbose:
        import logging
        logging.getLogger().setLevel(logging.DEBUG)
        print("📝 Verbose logging enabled")
    
    print(f"⚙️ Configuration:")
    print(f"   • Relevance threshold: {args.threshold}")
    print(f"   • Max opportunities per source: {args.max_opportunities}")
    print(f"   • Airtable integration: {'Enabled' if not args.no_airtable else 'Disabled'}")
    print(f"   • Sources: {args.sources if args.sources else 'All sources'}")
    
    # Run comprehensive scraping
    try:
        print("\n🚀 Starting comprehensive grant scraping...")
        print("=" * 60)
        
        report = await orchestrator.run_comprehensive_scraping(sources=args.sources)
        
        # Final summary
        print(f"\n📋 SESSION SUMMARY:")
        print(f"   • Execution time: {report.execution_time:.1f} seconds")
        print(f"   • Sources completed: {len(report.sources_scraped)}")
        print(f"   • Total opportunities: {report.total_opportunities}")
        print(f"   • Peru-relevant: {report.relevant_opportunities}")
        print(f"   • Success rate: {(len(report.sources_scraped)/len(orchestrator.scrapers)*100):.1f}%")
        
        if report.errors:
            print(f"   • Errors encountered: {len(report.errors)}")
        
        print(f"\n✅ Scraping session completed successfully!")
        print(f"📊 Check logs for detailed information")
        
    except KeyboardInterrupt:
        print(f"\n⏹️ Scraping interrupted by user")
        
    except Exception as e:
        print(f"\n❌ Scraping failed: {str(e)}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n⏹️ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
        sys.exit(1)