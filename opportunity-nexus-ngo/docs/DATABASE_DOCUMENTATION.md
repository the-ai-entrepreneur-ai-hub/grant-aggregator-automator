# Misión Huascarán Grant Aggregator Database Documentation
## Complete Database Schema & Data Collection Automation Reference

---

## 🎯 Database Overview

The **Misión Huascarán Grant Aggregator Database** is a comprehensive data management system built on Airtable that serves as the central repository for all grant-related information. This database is designed to support automated data collection, intelligent matching, and strategic decision-making for grant management operations.

### Core Database Objectives

- **Centralized Grant Repository**: Store all grant opportunities in a structured, searchable format
- **Automated Data Collection**: Integrate with external APIs and web scraping for real-time updates
- **Intelligent Matching**: Match grants with organizational capabilities and priorities
- **Deadline Management**: Track and alert on upcoming deadlines
- **Performance Analytics**: Monitor application success rates and funding trends

---

## 📊 Database Architecture

### Base Structure
- **Base Name**: Misión Huascarán Grant Aggregator
- **Base ID**: `appXXXXXXXXXXXXXX` (Available in Airtable settings)
- **API Key**: Available in GitHub repository secrets

### Primary Tables

#### 1. **Grant Opportunities** (Main Table)
**Purpose**: Central repository for all grant opportunities

| Field Name | Type | Description | Required |
|------------|------|-------------|----------|
| Grant Name | Single line text | Name of the grant opportunity | ✅ |
| Organization | Multiple select | Funding organization(s) | ✅ |
| Description | Long text | Detailed description of the grant | ✅ |
| Amount | Currency | Total funding amount available | ✅ |
| Deadline | Date | Application deadline | ✅ |
| Category | Multiple select | Grant category tags | ✅ |
| Keywords | Multiple select | Search keywords | ✅ |
| Eligibility | Long text | Eligibility requirements | ✅ |
| Application Link | URL | Direct link to application | ✅ |
| Contact Email | Email | Primary contact email | ✅ |
| Status | Single select | Active/Closed/Pending | ✅ |
| Priority | Single select | High/Medium/Low | ✅ |
| Notes | Long text | Internal notes and comments | ❌ |
| Created Date | Created time | Auto-generated creation date | ✅ |
| Last Modified | Last modified time | Auto-updated modification date | ✅ |

#### 2. **Organizations** Table
**Purpose**: Comprehensive directory of funding organizations

| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Organization name |
| Type | Single select | Foundation/Government/Corporate/Nonprofit/International |
| Website | URL | Organization website |
| Contact Email | Email | Primary contact email |
| Phone | Phone | Contact phone number |
| Address | Long text | Physical address |
| Mission | Long text | Organization mission statement |
| Focus Areas | Multiple select | Primary focus areas |
| Geographic Focus | Multiple select | Geographic regions served |
| Grant Range | Single line text | Typical grant funding range |
| Application Process | Long text | Application process description |
| Notes | Long text | Additional notes |

#### 3. **Keywords** Table
**Purpose**: Controlled vocabulary for search and matching

| Field Name | Type | Description |
|------------|------|-------------|
| Keyword | Single line text | Search keyword |
| Category | Single select | Keyword category (Sector/Geography/Population/etc.) |
| Weight | Number | Search relevance weight (0-1) |
| Related Keywords | Multiple select | Associated keywords |
| Usage Count | Number | Frequency of use |

#### 4. **Categories** Table
**Purpose**: Standardized grant categorization

| Field Name | Type | Description |
|------------|------|-------------|
| Category Name | Single line text | Category name |
| Description | Long text | Category description |
| Parent Category | Link to Categories | Hierarchical categorization |
| Active | Checkbox | Whether category is active |

#### 5. **Deadlines** Table
**Purpose**: Detailed deadline tracking and notifications

| Field Name | Type | Description |
|------------|------|-------------|
| Grant | Link to Grant Opportunities | Associated grant |
| Deadline Type | Single select | Application/Report/LOI/etc. |
| Deadline Date | Date | Specific deadline date |
| Reminder Days | Number | Days before deadline to send reminder |
| Status | Single select | Pending/Met/Overdue |
| Notes | Long text | Additional deadline information |

#### 6. **Contacts** Table
**Purpose**: Contact management for funding organizations

| Field Name | Type | Description |
|------------|------|-------------|
| Name | Single line text | Contact person name |
| Organization | Link to Organizations | Associated organization |
| Email | Email | Contact email |
| Phone | Phone | Contact phone |
| Role | Single line text | Job title/role |
| Notes | Long text | Additional contact information |

#### 7. **Notes** Table
**Purpose**: Activity tracking and communication logs

| Field Name | Type | Description |
|------------|------|-------------|
| Grant | Link to Grant Opportunities | Associated grant |
| Note Type | Single select | Update/Question/Decision/Meeting |
| Content | Long text | Note content |
| Author | Single line text | Note author |
| Date | Date | Note date |
| Priority | Single select | High/Medium/Low |

---

## 🔗 Relationships Between Tables

### Primary Relationships
- **Grant Opportunities** → **Organizations** (Many-to-Many)
- **Grant Opportunities** → **Keywords** (Many-to-Many)
- **Grant Opportunities** → **Categories** (Many-to-Many)
- **Organizations** → **Contacts** (One-to-Many)
- **Grant Opportunities** → **Deadlines** (One-to-Many)
- **Grant Opportunities** → **Notes** (One-to-Many)

### Linked Fields
- **Grant Opportunities.Organization** → **Organizations.Name**
- **Grant Opportunities.Category** → **Categories.Category Name**
- **Grant Opportunities.Keywords** → **Keywords.Keyword**
- **Deadlines.Grant** → **Grant Opportunities.Grant Name**
- **Notes.Grant** → **Grant Opportunities.Grant Name**
- **Contacts.Organization** → **Organizations.Name**

---

## 🤖 Data Collection Automation

### Automated Data Sources

#### 1. **Foundation Directory Online (FDO)**
- **API Endpoint**: `https://api.foundationcenter.org/v2.0/`
- **Data Collected**: Foundation profiles, grant guidelines, deadlines
- **Update Frequency**: Weekly
- **Fields Mapped**: Organization, Amount, Deadline, Eligibility

#### 2. **Grants.gov API**
- **API Endpoint**: `https://www.grants.gov/grantsws/rest/`
- **Data Collected**: Federal grant opportunities
- **Update Frequency**: Daily
- **Fields Mapped**: Grant Name, Description, Deadline, Eligibility

#### 3. **European Commission Funding & Tenders Portal**
- **API Endpoint**: `https://api.futurium.ec.europa.eu/`
- **Data Collected**: EU funding opportunities
- **Update Frequency**: Weekly
- **Fields Mapped**: All standard grant fields

#### 4. **Web Scraping Pipeline**
- **Sources**: Individual foundation websites, corporate giving pages
- **Technology**: Puppeteer/Playwright with scheduled scraping
- **Update Frequency**: Varies by source (daily to monthly)

### Data Processing Workflow

1. **Data Ingestion**: Raw data collection from APIs and web scraping
2. **Data Cleaning**: Standardization of formats, removal of duplicates
3. **Data Enrichment**: Adding keywords, categories, and calculated fields
4. **Quality Validation**: Checking completeness and accuracy
5. **Database Insertion**: Adding new records and updating existing ones
6. **Notification System**: Alerts for new opportunities and deadline changes

---

## 🔍 Search & Matching System

### Keyword Matching Algorithm
- **Exact Match**: Direct keyword matches
- **Semantic Match**: Related terms and synonyms
- **Weighted Scoring**: Priority based on keyword weights
- **Geographic Matching**: Location-based filtering
- **Category Matching**: Sector-specific filtering

### Search Fields
- Grant Name
- Description
- Organization Name
- Keywords
- Geographic Focus
- Eligibility Requirements

---

## 📈 Analytics & Reporting

### Key Metrics Tracked
- **Total Opportunities**: Count of active grants
- **Success Rate**: Applications submitted vs. funded
- **Average Grant Size**: Funding amount trends
- **Deadline Proximity**: Upcoming deadlines by category
- **Geographic Distribution**: Opportunities by region
- **Sector Analysis**: Funding trends by category

### Automated Reports
- **Weekly Summary**: New opportunities and deadline alerts
- **Monthly Analysis**: Funding trends and success metrics
- **Quarterly Review**: Comprehensive performance analysis

---

## 🔐 Security & Access Control

### API Key Management
- **Production**: Stored in GitHub Secrets
- **Development**: Environment variables in `.env` file
- **Access Levels**: Read-only for most operations, write for admin

### Rate Limiting
- **Airtable API**: 5 requests per second per base
- **External APIs**: Respective rate limits enforced
- **Caching**: 15-minute cache for search results

---

## 🚀 Getting Started

### Environment Setup
1. **Clone Repository**: `git clone https://github.com/the-ai-entrepreneur-ai-hub/grant-aggregator-automator.git`
2. **Install Dependencies**: `npm install`
3. **Environment Variables**: Copy `.env.example` to `.env` and add your Airtable credentials
4. **Database Setup**: Import base schema from `airtable-base-schema.json`
5. **Start Development**: `npm run dev`

### Airtable Configuration
1. **Create Base**: Duplicate the template base
2. **Update IDs**: Replace base ID and table names in configuration
3. **API Key**: Add your Airtable API key to environment variables
4. **Test Connection**: Run initial data sync to verify setup

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review and categorize new opportunities
- **Monthly**: Update organization information and contacts
- **Quarterly**: Review keyword taxonomy and search weights
- **Annually**: Comprehensive database audit and cleanup

### Contact Information
- **Technical Support**: technical@misionhuascaran.org
- **Database Administration**: admin@misionhuascaran.org
- **API Issues**: api-support@misionhuascaran.org

---

*Last Updated: January 2024*  
*Version: 2.0*  
*Maintained by: Misión Huascarán Technical Team*