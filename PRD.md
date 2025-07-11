# Product Requirements Document (PRD) for Grant Aggregator Automator

## 1. Introduction

### 1.1 Purpose
This PRD outlines the requirements for the backend application component of the Grant Aggregator Automator, designed to populate a database with relevant grant, donation, and contest opportunities from international funders. The application focuses on data acquisition, structuring, and automation to support the NGO "Misión Huascarán" in tracking funding opportunities aligned with their mission of transforming rural communities in Peru by improving quality of life and creating opportunities.

The frontend is already built, so this PRD emphasizes the data population logic, including source identification, data structuring, and automated scraping/ingestion processes. The system will ensure the database is kept up-to-date with minimal manual intervention.

### 1.2 Document Overview
This document covers:
- Objectives and scope
- Target users and stakeholders
- Functional and non-functional requirements
- Data model and structure
- Automation mechanisms
- Integration points (e.g., with the existing frontend)
- Assumptions, dependencies, and risks

### 1.3 References
- Organization Details: Misión Huascarán (mission: transforming rural communities in Peru; location: Jr. Santorin 258, Urb. El Vivero Santiago de Surco; contact: (01) 284 - 5775 | comunicaciones@misionesrurales.org.pe)
- Programs: Focus on rural development, COVID-19 aid, textile workshops, etc.
- Relevant funding types: Grants, donations, contests from foundations, embassies, development agencies.

## 2. Objectives

### 2.1 Business Objectives
- Enable Misión Huascarán to efficiently discover and track funding opportunities that match their programs (e.g., rural development, health initiatives like COVID-19 response, cultural projects like textile workshops).
- Automate the collection of opportunities to reduce manual research time.
- Provide a ranked list of opportunities based on fit to the organization's mission, location (Peru-focused), and program areas.
- Ensure data is structured for easy querying and display in the existing frontend.

### 2.2 Technical Objectives
- Identify and integrate reliable data sources.
- Define a robust data schema for opportunities.
- Implement weekly automation for scanning sources and updating the database.
- Ensure data integrity, deduplication, and error handling.

## 3. Scope

### 3.1 In Scope
- Research and selection of 10-15 reliable sources for funding opportunities.
- Definition of database schema with required fields.
- Development of an automated scraper or API integration system to fetch and ingest data weekly.
- Ranking algorithm based on custom criteria (e.g., relevance to Peru, rural development, grant size).
- Basic data validation and deduplication.
- Integration with a database (e.g., PostgreSQL or MongoDB) that the frontend can query.

### 3.2 Out of Scope
- Frontend development or modifications (assumed already built).
- User authentication or access controls (unless specified).
- Advanced analytics or reporting beyond basic ranking.
- Mobile app integration.
- Real-time notifications (focus on weekly updates).

## 4. Target Users and Stakeholders

### 4.1 Users
- NGO Staff: Program managers and fundraisers who will use the frontend to view and apply for opportunities.
- Administrators: Those maintaining the system, adding custom sources, or adjusting rankings.

### 4.2 Stakeholders
- Misión Huascarán leadership: For approving sources and structure.
- Developers: For implementing and maintaining the backend.

## 5. Functional Requirements

### 5.1 Step 1: Identify Reliable Sources
The application must include a configurable list of sources. Proposed sources (to be reviewed and approved):
1. Grants.gov (US government grants, including international development).
2. Foundation Center (now Candid) - foundationcenter.org (global foundations).
3. Devex - devex.com/funding (development funding opportunities).
4. FundsforNGOs - fundsforngos.org (NGO-specific grants).
5. European Union Funding - ec.europa.eu/info/funding-tenders (international aid).
6. USAID - usaid.gov/work-usaid (development agency grants, Peru-relevant).
7. Inter-American Development Bank (IDB) - iadb.org (Latin America focus).
8. World Bank - worldbank.org (global development projects).
9. United Nations Development Programme (UNDP) - undp.org/funding.
10. Embassy websites (e.g., US Embassy in Peru, EU delegations).
11. Philanthropy News Digest - philanthropynewsdigest.org/rfps.
12. GlobalGiving - globalgiving.org (crowdfunding and grants).
13. Ashoka - ashoka.org (social entrepreneurship contests).
14. Echoing Green - echoinggreen.org (fellowships and grants).
15. Rockefeller Foundation - rockefellerfoundation.org (global initiatives).

Sources should be stored in a configuration file or database table, allowing easy addition/removal.

### 5.2 Step 2: Structure the Information
Each opportunity entry must include:
- **Name of the Funder**: String (e.g., "USAID").
- **Website and Brief Description**: URL and text summary (e.g., "USAID official site - Provides development aid to Peru").
- **Type and Amount of Support**: String (e.g., "Grant"), and numeric range (e.g., min/max amount in USD).
- **Link to the Application**: URL.
- **Open and Close Dates**: Date fields (start and end).
- **Typical Donation or Grant Size**: Numeric (average or range in USD).
- **Ranking System**: Score (1-10) based on criteria like:
  - Relevance to mission (e.g., rural development, Peru focus): Weighted 40%.
  - Grant size: Weighted 20%.
  - Application ease/deadline proximity: Weighted 20%.
  - Funder reputation: Weighted 20%.
  - Additional fields: Tags (e.g., "health", "education"), Eligibility criteria (text).

Data will be stored in a relational or NoSQL database. Example schema (in JSON-like format for illustration):
```json
{
  "opportunity_id": "unique_uuid",
  "funder_name": "string",
  "funder_website": "url",
  "description": "text",
  "support_type": "string (grant/donation/contest)",
  "amount_min": "number",
  "amount_max": "number",
  "application_link": "url",
  "open_date": "date",
  "close_date": "date",
  "typical_size": "number",
  "ranking_score": "number (1-10)",
  "tags": ["array of strings"],
  "eligibility": "text",
  "last_updated": "timestamp"
}
```

### 5.3 Step 3: Automate
- **Scanning Mechanism**: Use web scraping (e.g., Puppeteer or BeautifulSoup) or APIs where available (e.g., RSS feeds, public APIs) to fetch new opportunities weekly.
- **Schedule**: Run via cron job or serverless function (e.g., AWS Lambda) every Sunday at 00:00 UTC.
- **Ingestion Process**:
  1. Fetch data from each source.
  2. Parse and map to the defined schema.
  3. Apply ranking algorithm.
  4. Check for duplicates (based on funder + title + dates).
  5. Insert/update database entries.
  6. Log errors and notify admins via email if failures occur.
- **Tools/Technologies**: Node.js/Python for scripting, PostgreSQL for DB, Cron for scheduling.

## 6. Non-Functional Requirements

### 6.1 Performance
- Weekly scan should complete in under 1 hour.
- Handle up to 100 new opportunities per run.

### 6.2 Security
- Secure API keys for any integrated services.
- Data encryption in transit and at rest.

### 6.3 Reliability
- Error handling for source downtime.
- Retry mechanism (up to 3 attempts).

### 6.4 Scalability
- Easily add new sources without code changes.
- Support increasing number of sources/opportunities.

### 6.5 Maintainability
- Modular code structure.
- Comprehensive logging.

## 7. Integration

- **Database Integration**: The backend will populate a database accessible by the frontend via API endpoints (e.g., REST or GraphQL).
- **API Endpoints** (proposed):
  - GET /opportunities: Retrieve all with filters (e.g., by ranking, tags).
  - GET /opportunities/{id}: Details for one.
  - POST /sources: Admin endpoint to add sources.

## 8. Assumptions and Dependencies

- Assumptions: Sources provide structured data or scrapable pages; Database is set up separately.
- Dependencies: External libraries (e.g., for scraping), Server/environment for running the automation.

## 9. Risks and Mitigations

- Risk: Sources change structure – Mitigation: Modular parsers with monitoring.
- Risk: Legal issues with scraping – Mitigation: Use APIs where possible, respect robots.txt.
- Risk: Data inaccuracies – Mitigation: Manual review queue for new entries.

## 10. Timeline and Milestones

- Milestone 1: Source selection and schema approval (Week 1).
- Milestone 2: Prototype automation for 3 sources (Week 2-3).
- Milestone 3: Full implementation and testing (Week 4-5).
- Milestone 4: Deployment and monitoring setup (Week 6).

## 11. Approval

This PRD requires review and approval from Misión Huascarán stakeholders before proceeding to implementation.
