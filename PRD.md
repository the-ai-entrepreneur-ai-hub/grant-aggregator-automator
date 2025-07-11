# Product Requirements Document: Grant Aggregator Automator

## 1. Introduction

Misión Huascarán is a non-profit organization dedicated to transforming rural communities in Peru by improving their quality of life and creating opportunities for a brighter future. To support its mission, the organization actively seeks funding through grants, donations, and contests from various international sources. Currently, the process of finding and tracking these opportunities is manual, time-consuming, and inefficient. This document outlines the requirements for a Grant Aggregator Automator, a smart database designed to streamline the process of identifying and managing funding opportunities.

## 2. Goals

The primary goal of this project is to develop an automated system that efficiently gathers and organizes relevant funding opportunities, enabling Misión Huascarán to focus its resources on applying for the most promising grants.

**Key objectives include:**

*   **Automate Opportunity Discovery:** Eliminate the need for manual searches by automatically scanning selected sources for new funding opportunities.
*   **Centralize Information:** Create a single, well-structured database for all grant-related information, accessible to the entire team.
*   **Improve Efficiency:** Significantly reduce the time and effort required to find and evaluate funding opportunities.
*   **Increase Application Rate:** By streamlining the discovery process, the team can dedicate more time to preparing and submitting high-quality grant proposals.
*   **Enhance Decision-Making:** Implement a ranking system to help prioritize opportunities that best align with the organization's mission and programs.

## 3. User Personas

### Persona 1: Fundraising Coordinator

*   **Name:** Maria Rodriguez
*   **Role:** Fundraising Coordinator at Misión Huascarán
*   **Background:** Maria is responsible for identifying and applying for grants to fund the organization's programs. She is highly organized and detail-oriented but struggles with the time-consuming nature of searching for new opportunities across various websites.
*   **Goals:**
    *   Find relevant funding opportunities quickly and efficiently.
    *   Spend less time on manual searches and more time on writing compelling grant proposals.
    *   Easily track the status of each application.
*   **Frustrations:**
    *   "I spend hours every week just looking for new grants. It's exhausting."
    *   "I'm always worried I'm missing out on a great opportunity because I can't possibly check every source."
    *   "It's hard to keep all the information organized and up-to-date."

### Persona 2: Program Manager

*   **Name:** Carlos Gomez
*   **Role:** Program Manager at Misión Huascarán
*   **Background:** Carlos oversees the implementation of the organization's projects. He needs to be aware of potential funding opportunities to ensure the long-term sustainability of his programs.
*   **Goals:**
    *   Stay informed about funding trends relevant to his program areas.
    *   Collaborate with the fundraising team to identify grants that align with program needs.
    *   Understand the funding landscape to better plan for future projects.
*   **Frustrations:**
    *   "I don't have time to search for grants myself, but I need to know what's out there."
    *   "It's difficult to get a clear overview of all the potential funding sources."
    *   "I want to be more involved in the fundraising process, but I don't know where to start."

## 4. Features and Requirements

### 4.1. Data Sources (Step 1)

The system will scrape data from a curated list of reliable sources known for publishing funding opportunities relevant to Misión Huascarán's mission. The initial list of sources will be researched and selected based on their trustworthiness and relevance.

**Initial Source List (to be validated):**

*   **Grants.gov:** A primary source for federal grants in the United States.
*   **Foundation Directory Online:** A comprehensive database of foundation and corporate grantmakers.
*   **Devex:** A media platform for the global development community, often featuring funding opportunities.
*   **Terra Viva Grants Directory:** A resource for grants in the fields of agriculture, energy, environment, and natural resources.
*   **FundsforNGOs:** A platform that lists grants and resources for non-governmental organizations.
*   **Philanthropy News Digest:** A service of Candid that publishes requests for proposals (RFPs) from foundations.
*   **Embassy websites in Peru:** Direct source for bilateral funding opportunities.

**Requirements:**

*   The list of sources must be easily configurable and expandable.
*   The system should be able to handle different website structures and formats.
*   Each source will be evaluated for its reliability and the quality of its data.

### 4.2. Information Architecture (Step 2)

The scraped data will be organized into a structured database. Each entry will represent a single funding opportunity and will include the following fields:

*   **Funder Name:** The name of the organization providing the funding.
*   **Funder Website:** A link to the funder's website.
*   **Funder Description:** A brief overview of the funder's mission and focus areas.
*   **Opportunity Title:** The title of the grant, donation, or contest.
*   **Opportunity Description:** A summary of the funding opportunity.
*   **Support Type:** The type of support offered (e.g., grant, donation, in-kind, contest).
*   **Support Amount:** The total amount of funding available.
*   **Application Link:** A direct link to the application page or guidelines.
*   **Open Date:** The date when applications open.
*   **Close Date:** The deadline for applications.
*   **Typical Grant Size:** The typical range of individual grants or donations.
*   **Ranking:** A score from 1 to 5 (1 = low priority, 5 = high priority) based on alignment with Misión Huascarán's criteria. The ranking will be based on a combination of factors, including:
    *   Alignment with program areas.
    *   Geographic focus (Peru).
    *   Funding amount.
    *   Application complexity.
*   **Status:** The current status of the opportunity (e.g., Open, Closed, In Progress).
*   **Source:** The website from which the opportunity was scraped.
*   **Date Scraped:** The date the information was added to the database.

### 4.3. Automation System (Step 3)

An automated system will be developed to perform the following tasks:

*   **Weekly Scans:** The system will scan the selected sources once a week to identify new funding opportunities.
*   **Data Extraction:** It will extract the required information for each new opportunity and format it according to the defined information architecture.
*   **Deduplication:** The system will check for duplicate entries to avoid adding the same opportunity multiple times.
*   **Database Population:** New, unique opportunities will be automatically added to the database.
*   **Notifications:** The system will send a weekly email summary of new opportunities to the fundraising team.
*   **Error Handling:** The system will include robust error handling to manage issues with website changes, network problems, or data extraction failures.
*   **Logging:** The system will maintain a log of its activities, including the sources scanned, the number of new opportunities found, and any errors encountered.

## 5. Technical Stack

The following technologies are proposed for the development of the Grant Aggregator Automator:

*   **Programming Language:** Python 3.x
    *   **Reasoning:** Python is a versatile language with a rich ecosystem of libraries for web scraping, data processing, and automation. Its readability and ease of use make it an ideal choice for this project.
*   **Web Scraping:**
    *   **Beautiful Soup:** For parsing HTML and XML documents. It is lightweight and easy to use for simple to moderately complex scraping tasks.
    *   **Scrapy:** For more complex scraping scenarios that require handling multiple pages, sessions, and proxies. Scrapy provides a more robust framework for building scalable web crawlers.
*   **Database:** Airtable
    *   **Reasoning:** Airtable is a flexible, cloud-based database that combines the simplicity of a spreadsheet with the power of a relational database. Its user-friendly interface makes it easy for non-technical users to manage and view the data. The Airtable API will be used to programmatically add new records.
*   **Automation & Scheduling:**
    *   **GitHub Actions:** To schedule and run the scraping scripts on a weekly basis. It provides a reliable and cost-effective way to automate workflows.
    *   **APScheduler (Alternative):** A Python library for in-process scheduling. Can be used if a more self-contained scheduling solution is preferred.
*   **Proxy Rotation:**
    *   **Free Proxy Lists:** To avoid being blocked by websites, the scraper will rotate through a list of free public proxies.
    *   **ScrapingBee (Alternative):** A paid service that handles proxy rotation and browser rendering, simplifying the scraping process.
*   **Notifications:**
    *   **SendGrid API:** For sending email notifications to the fundraising team. It provides a reliable and scalable solution for email delivery.

## 6. Assumptions and Constraints

**Assumptions:**

*   The selected data sources have publicly accessible websites with structured or semi-structured data.
*   The websites' terms of service allow for automated scraping for non-commercial purposes.
*   The Misión Huascarán team will be available to provide feedback and review the data structure.
*   The frontend for displaying the data has already been built and is not part of this project's scope.

**Constraints:**

*   The system must be designed to be respectful of the target websites, including a 5-second delay between requests to avoid overloading their servers.
*   The use of free proxies may result in occasional connection failures or slow performance.
*   The project will rely on free or low-cost services to minimize operational expenses.
*   The initial version will focus on the core functionality of scraping and data storage. More advanced features like natural language processing (NLP) for data enrichment will be considered for future iterations.

## 7. Success Metrics

The success of the Grant Aggregator Automator will be measured by the following key performance indicators (KPIs):

*   **Time Savings:** A 75% reduction in the time spent by the fundraising team on manually searching for grant opportunities.
*   **Increase in Applications:** A 25% increase in the number of grant applications submitted within the first six months of implementation.
*   **Data Accuracy:** 95% accuracy of the scraped data (e.g., correct deadlines, funding amounts, and application links).
*   **System Uptime:** 99% uptime for the automated scraping and notification system.
*   **User Satisfaction:** Positive feedback from the fundraising team on the usability and effectiveness of the system.

## 8. Future Considerations

The following features and enhancements will be considered for future versions of the Grant Aggregator Automator:

*   **Advanced Data Enrichment:**
    *   **NLP for Keyword Extraction:** Use Natural Language Processing (NLP) to automatically extract keywords and themes from grant descriptions to improve the accuracy of the ranking system.
    *   **Funder Research:** Automatically gather additional information about funders, such as their past grantees and funding history.
*   **Integration with Project Management Tools:**
    *   **Trello/Asana Integration:** Automatically create a new card or task in a project management tool when a high-priority opportunity is identified.
*   **Enhanced User Interface:**
    *   **Customizable Dashboard:** Develop a dashboard that allows users to visualize the data, track the status of applications, and generate reports.
*   **Machine Learning-Powered Ranking:**
    *   **Predictive Modeling:** Use machine learning to predict the likelihood of winning a grant based on historical data and application characteristics.
*   **Expanded Data Sources:**
    *   **Social Media Monitoring:** Monitor social media platforms for announcements of new funding opportunities.
    *   **Newsletters and RSS Feeds:** Subscribe to relevant newsletters and RSS feeds to capture additional opportunities.
