#!/usr/bin/env python3
"""
Simple test script to add sample grant data to Airtable
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add the core directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'grant_aggregator', 'core'))

try:
    from airtable import Airtable
    print("✅ Airtable package loaded successfully")
except ImportError as e:
    print(f"❌ Failed to import airtable: {e}")
    sys.exit(1)

def create_sample_grants():
    """Create sample grant opportunities for testing"""
    
    # Sample Peru-focused grant opportunities
    sample_grants = [
        {
            "Funder Name": "Inter-American Development Bank",
            "Opportunity Title": "Digital Innovation for Rural Peru Communities",
            "Opportunity Description": "Supporting digital inclusion initiatives in rural and indigenous communities across Peru, focusing on educational technology and digital literacy programs.",
            "Support Type": "Grant",
            "Program Area": ["Education", "Economic Development"],
            "Total Funding Available": 2500000,
            "Minimum Award": 50000,
            "Maximum Award": 300000,
            "Typical Grant Size": 150000,
            "Currency": "USD",
            "Open Date": "2025-07-20",
            "Close Date": "2025-10-15",
            "Announcement Date": "2025-11-15",
            "Project Duration (Months)": 24,
            "Eligible Countries": ["Peru", "Latin America"],
            "Target Communities": ["Rural", "Indigenous"],
            "Beneficiary Groups": ["Women", "Youth"],
            "Application Link": "https://www.iadb.org/grants/digital-rural-peru",
            "Guidelines Link": "https://www.iadb.org/guidelines/digital-rural-peru",
            "Required Documents": ["Proposal", "Budget", "Letters"],
            "Application Complexity": "Medium",
            "Ranking Score": 85,
            "Priority Level": "High",
            "Geographic Match": "Perfect",
            "Sector Match": "Perfect",
            "Status": "Open",
            "Is Urgent": False,
            "Application Status": "Not Started",
            "Source": "Other",
            "Date Scraped": datetime.now().strftime("%Y-%m-%d"),
            "Keywords": ["Education", "Rural", "Peru", "Indigenous"]
        },
        {
            "Funder Name": "UNDP Peru",
            "Opportunity Title": "Climate Resilience for Andean Communities",
            "Opportunity Description": "Building climate adaptation and resilience capacity in highland communities of Peru, with focus on sustainable agriculture and water management.",
            "Support Type": "Grant",
            "Program Area": ["Environment", "Agriculture"],
            "Total Funding Available": 1800000,
            "Minimum Award": 75000,
            "Maximum Award": 250000,
            "Typical Grant Size": 125000,
            "Currency": "USD",
            "Open Date": "2025-07-15",
            "Close Date": "2025-09-30",
            "Announcement Date": "2025-11-01",
            "Project Duration (Months)": 18,
            "Eligible Countries": ["Peru"],
            "Target Communities": ["Rural", "Indigenous"],
            "Beneficiary Groups": ["Farmers", "Women"],
            "Application Link": "https://www.undp.org/peru/climate-resilience-grants",
            "Guidelines Link": "https://www.undp.org/peru/guidelines/climate-resilience",
            "Required Documents": ["Proposal", "Budget"],
            "Application Complexity": "High",
            "Ranking Score": 92,
            "Priority Level": "Critical",
            "Geographic Match": "Perfect",
            "Sector Match": "Perfect",
            "Status": "Open",
            "Is Urgent": True,
            "Application Status": "Not Started",
            "Source": "Other",
            "Date Scraped": datetime.now().strftime("%Y-%m-%d"),
            "Keywords": ["Environment", "Peru", "Agriculture", "Indigenous"]
        },
        {
            "Funder Name": "World Bank Group",
            "Opportunity Title": "Peru Healthcare Access Initiative",
            "Opportunity Description": "Improving healthcare access and quality in underserved regions of Peru, with emphasis on maternal health and child nutrition programs.",
            "Support Type": "Grant",
            "Program Area": ["Health"],
            "Total Funding Available": 3200000,
            "Minimum Award": 100000,
            "Maximum Award": 500000,
            "Typical Grant Size": 200000,
            "Currency": "USD",
            "Open Date": "2025-08-01",
            "Close Date": "2025-11-30",
            "Announcement Date": "2025-12-31",
            "Project Duration (Months)": 36,
            "Eligible Countries": ["Peru", "Latin America"],
            "Target Communities": ["Rural", "Urban Poor"],
            "Beneficiary Groups": ["Women", "Youth"],
            "Application Link": "https://www.worldbank.org/peru/healthcare-access",
            "Guidelines Link": "https://www.worldbank.org/peru/guidelines/healthcare",
            "Required Documents": ["Proposal", "Budget", "Letters"],
            "Application Complexity": "High",
            "Ranking Score": 88,
            "Priority Level": "High",
            "Geographic Match": "Perfect",
            "Sector Match": "Perfect",
            "Status": "Open",
            "Is Urgent": False,
            "Application Status": "Not Started",
            "Source": "Other",
            "Date Scraped": datetime.now().strftime("%Y-%m-%d"),
            "Keywords": ["Health", "Peru", "Rural", "Women"]
        },
        {
            "Funder Name": "Peruvian Ministry of Development",
            "Opportunity Title": "Indigenous Women Entrepreneurship Program",
            "Opportunity Description": "Supporting microenterprise development and economic empowerment programs for indigenous women in Peru's highland and jungle regions.",
            "Support Type": "Grant",
            "Program Area": ["Economic Development"],
            "Total Funding Available": 950000,
            "Minimum Award": 25000,
            "Maximum Award": 100000,
            "Typical Grant Size": 45000,
            "Currency": "USD",
            "Open Date": "2025-07-25",
            "Close Date": "2025-09-15",
            "Announcement Date": "2025-10-15",
            "Project Duration (Months)": 12,
            "Eligible Countries": ["Peru"],
            "Target Communities": ["Rural", "Indigenous"],
            "Beneficiary Groups": ["Women"],
            "Application Link": "https://www.gob.pe/midis/indigenous-women-grants",
            "Guidelines Link": "https://www.gob.pe/midis/guidelines/women-entrepreneurship",
            "Required Documents": ["Proposal"],
            "Application Complexity": "Low",
            "Ranking Score": 94,
            "Priority Level": "Critical",
            "Geographic Match": "Perfect",
            "Sector Match": "Perfect",
            "Status": "Open",
            "Is Urgent": True,
            "Application Status": "Not Started",
            "Source": "Other",
            "Date Scraped": datetime.now().strftime("%Y-%m-%d"),
            "Keywords": ["Peru", "Women", "Indigenous", "Economic Development"]
        },
        {
            "Funder Name": "Ford Foundation",
            "Opportunity Title": "Youth Leadership in Rural Education Peru",
            "Opportunity Description": "Empowering young leaders to develop innovative educational programs in rural Peru communities, focusing on STEM education and digital literacy.",
            "Support Type": "Fellowship",
            "Program Area": ["Education"],
            "Total Funding Available": 750000,
            "Minimum Award": 15000,
            "Maximum Award": 75000,
            "Typical Grant Size": 35000,
            "Currency": "USD",
            "Open Date": "2025-08-15",
            "Close Date": "2025-10-30",
            "Announcement Date": "2025-12-01",
            "Project Duration (Months)": 8,
            "Eligible Countries": ["Peru", "Latin America"],
            "Target Communities": ["Rural", "Youth"],
            "Beneficiary Groups": ["Youth"],
            "Application Link": "https://www.fordfoundation.org/peru/youth-education",
            "Guidelines Link": "https://www.fordfoundation.org/guidelines/youth-education",
            "Required Documents": ["Proposal", "Letters"],
            "Application Complexity": "Medium",
            "Ranking Score": 78,
            "Priority Level": "Medium",
            "Geographic Match": "Perfect",
            "Sector Match": "Good",
            "Status": "Open",
            "Is Urgent": False,
            "Application Status": "Not Started",
            "Source": "Foundation Directory",
            "Date Scraped": datetime.now().strftime("%Y-%m-%d"),
            "Keywords": ["Education", "Youth", "Peru", "Rural"]
        }
    ]
    
    return sample_grants

def main():
    """Main function to test Airtable integration"""
    
    print("🚀 TESTING AIRTABLE GRANT SCRAPING INTEGRATION")
    print("=" * 60)
    
    # Get environment variables
    api_key = os.getenv("AIRTABLE_API_KEY")
    base_id = os.getenv("AIRTABLE_BASE_ID") 
    table_name = os.getenv("AIRTABLE_TABLE_NAME", "Funding Opportunities")
    
    print(f"🔧 Configuration:")
    print(f"   • API Key: {'✅ Set' if api_key else '❌ Missing'}")
    print(f"   • Base ID: {'✅ Set' if base_id else '❌ Missing'}")
    print(f"   • Table: {table_name}")
    
    if not api_key or not base_id:
        print("❌ Missing required environment variables!")
        print("Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID")
        return 1
    
    try:
        # Initialize Airtable client
        print(f"\n📊 Connecting to Airtable...")
        client = Airtable(base_id, table_name, api_key=api_key)
        
        # Test connection by getting existing records count
        existing_records = client.get_all()
        print(f"✅ Connected successfully! Found {len(existing_records)} existing records")
        
        # Create sample grants
        sample_grants = create_sample_grants()
        print(f"\n🎯 Generated {len(sample_grants)} sample grant opportunities")
        print("-" * 40)
        
        success_count = 0
        error_count = 0
        
        for i, grant in enumerate(sample_grants, 1):
            try:
                print(f"{i}. Adding: {grant['Opportunity Title']}")
                
                # Check if record already exists
                formula = f"{{Opportunity Title}} = '{grant['Opportunity Title']}'"
                existing = client.get_all(formula=formula)
                
                if existing:
                    print(f"   ⚠️ Record already exists, skipping...")
                    continue
                    
                # Insert new record
                result = client.insert(grant)
                print(f"   ✅ Added successfully! ID: {result['id']}")
                success_count += 1
                
            except Exception as e:
                print(f"   ❌ Error: {str(e)}")
                error_count += 1
        
        print(f"\n📋 SCRAPING SUMMARY:")
        print(f"   • Total processed: {len(sample_grants)}")
        print(f"   • Successfully added: {success_count}")
        print(f"   • Errors: {error_count}")
        print(f"   • Total records in table: {len(client.get_all())}")
        
        print(f"\n✅ Grant scraping test completed successfully!")
        print(f"🔗 Check your Airtable base to see the new funding opportunities")
        
        return 0
        
    except Exception as e:
        print(f"❌ Failed to connect to Airtable: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)