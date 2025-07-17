import { getAirtableConfig } from '../config/airtable';

// Airtable service configuration
interface AirtableConfig {
  apiKey: string;
  baseId: string;
}

// Get configuration from environment variables
const getConfig = (): AirtableConfig => {
  const config = getAirtableConfig();
  return {
    apiKey: config.apiKey,
    baseId: config.baseId
  };
};

// Table names based on the Misión Huascarán database schema
export const TABLES = {
  GRANT_OPPORTUNITIES: 'Grant Opportunities',
  ORGANIZATIONS: 'Organizations',
  KEYWORDS: 'Keywords',
  CATEGORIES: 'Categories',
  DEADLINES: 'Deadlines',
  CONTACTS: 'Contacts',
  NOTES: 'Notes'
};

// Grant Opportunities table schema
export interface GrantOpportunity {
  id?: string;
  'Grant Name': string;
  'Organization': string[];
  'Description': string;
  'Amount': number;
  'Deadline': string;
  'Category': string[];
  'Keywords': string[];
  'Eligibility': string;
  'Application Link': string;
  'Contact Email': string;
  'Status': 'Active' | 'Closed' | 'Pending';
  'Priority': 'High' | 'Medium' | 'Low';
  'Notes': string;
  'Created Date': string;
  'Last Modified': string;
}

// Organizations table schema
export interface Organization {
  id?: string;
  'Name': string;
  'Type': 'Foundation' | 'Government' | 'Corporate' | 'Nonprofit' | 'International';
  'Website': string;
  'Contact Email': string;
  'Phone': string;
  'Address': string;
  'Mission': string;
  'Focus Areas': string[];
  'Geographic Focus': string[];
  'Grant Range': string;
  'Application Process': string;
  'Notes': string;
}

// Keywords table schema
export interface Keyword {
  id?: string;
  'Keyword': string;
  'Category': string;
  'Weight': number;
  'Related Keywords': string[];
  'Usage Count': number;
}

// Mock Airtable service for development/testing
export class AirtableService {
  private config: AirtableConfig;

  constructor() {
    this.config = getConfig();
  }

  // Mock data for development
  private mockGrantOpportunities: GrantOpportunity[] = [
    {
      id: 'rec1',
      'Grant Name': 'Environmental Conservation Grant 2024',
      'Organization': ['Green Foundation'],
      'Description': 'Supporting environmental conservation projects in Latin America',
      'Amount': 50000,
      'Deadline': '2024-12-31',
      'Category': ['Environment', 'Conservation'],
      'Keywords': ['environment', 'conservation', 'latin america', 'sustainability'],
      'Eligibility': 'Nonprofit organizations with 501(c)(3) status',
      'Application Link': 'https://greenfoundation.org/apply',
      'Contact Email': 'grants@greenfoundation.org',
      'Status': 'Active',
      'Priority': 'High',
      'Notes': 'Priority for projects in Peru and Ecuador',
      'Created Date': '2024-01-15',
      'Last Modified': '2024-01-15'
    },
    {
      id: 'rec2',
      'Grant Name': 'Education Innovation Fund',
      'Organization': ['Global Education Initiative'],
      'Description': 'Funding innovative educational programs in underserved communities',
      'Amount': 25000,
      'Deadline': '2024-11-15',
      'Category': ['Education', 'Innovation'],
      'Keywords': ['education', 'innovation', 'underserved', 'community'],
      'Eligibility': 'Educational institutions and nonprofits',
      'Application Link': 'https://gei.org/innovation-fund',
      'Contact Email': 'innovation@gei.org',
      'Status': 'Active',
      'Priority': 'Medium',
      'Notes': 'Focus on digital literacy programs',
      'Created Date': '2024-01-10',
      'Last Modified': '2024-01-10'
    }
  ];

  // Grant Opportunities methods
  async getGrantOpportunities(filter?: string): Promise<GrantOpportunity[]> {
    // In production, this would make actual Airtable API calls
    console.log('Fetching grant opportunities with filter:', filter);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.mockGrantOpportunities;
  }

  async createGrantOpportunity(data: Omit<GrantOpportunity, 'id'>): Promise<GrantOpportunity> {
    console.log('Creating grant opportunity:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newOpportunity: GrantOpportunity = {
      id: `rec${Date.now()}`,
      ...data,
      'Created Date': new Date().toISOString().split('T')[0],
      'Last Modified': new Date().toISOString().split('T')[0]
    };
    
    this.mockGrantOpportunities.push(newOpportunity);
    return newOpportunity;
  }

  async updateGrantOpportunity(id: string, data: Partial<GrantOpportunity>): Promise<GrantOpportunity> {
    console.log('Updating grant opportunity:', id, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.mockGrantOpportunities.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error('Grant opportunity not found');
    }
    
    this.mockGrantOpportunities[index] = {
      ...this.mockGrantOpportunities[index],
      ...data,
      'Last Modified': new Date().toISOString().split('T')[0]
    };
    
    return this.mockGrantOpportunities[index];
  }

  async deleteGrantOpportunity(id: string): Promise<void> {
    console.log('Deleting grant opportunity:', id);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.mockGrantOpportunities.findIndex(g => g.id === id);
    if (index === -1) {
      throw new Error('Grant opportunity not found');
    }
    
    this.mockGrantOpportunities.splice(index, 1);
  }

  // Organizations methods
  async getOrganizations(filter?: string): Promise<Organization[]> {
    console.log('Fetching organizations with filter:', filter);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'org1',
        'Name': 'Green Foundation',
        'Type': 'Foundation',
        'Website': 'https://greenfoundation.org',
        'Contact Email': 'info@greenfoundation.org',
        'Phone': '+1-555-0123',
        'Address': '123 Green St, San Francisco, CA 94105',
        'Mission': 'To protect and restore the environment through conservation, education, and advocacy',
        'Focus Areas': ['Environment', 'Conservation', 'Climate Change'],
        'Geographic Focus': ['Global', 'Latin America', 'Peru'],
        'Grant Range': '$10,000 - $100,000',
        'Application Process': 'Online application with quarterly review cycles',
        'Notes': 'Responsive to inquiries, prefers email communication'
      }
    ];
  }

  // Keywords methods
  async getKeywords(filter?: string): Promise<Keyword[]> {
    console.log('Fetching keywords with filter:', filter);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'kw1',
        'Keyword': 'environment',
        'Category': 'Sector',
        'Weight': 0.9,
        'Related Keywords': ['conservation', 'sustainability', 'climate'],
        'Usage Count': 45
      },
      {
        id: 'kw2',
        'Keyword': 'education',
        'Category': 'Sector',
        'Weight': 0.8,
        'Related Keywords': ['learning', 'training', 'literacy'],
        'Usage Count': 32
      }
    ];
  }

  // Search functionality
  async searchGrants(query: string): Promise<GrantOpportunity[]> {
    console.log('Searching grants for query:', query);
    
    const opportunities = await this.getGrantOpportunities();
    const lowerQuery = query.toLowerCase();
    
    return opportunities.filter(opportunity =>
      opportunity['Grant Name'].toLowerCase().includes(lowerQuery) ||
      opportunity['Description'].toLowerCase().includes(lowerQuery) ||
      opportunity['Keywords'].some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
      opportunity['Organization'].some(org => org.toLowerCase().includes(lowerQuery))
    );
  }

  // Get grants by category
  async getGrantsByCategory(category: string): Promise<GrantOpportunity[]> {
    console.log('Getting grants by category:', category);
    
    const opportunities = await this.getGrantOpportunities();
    return opportunities.filter(opportunity =>
      opportunity['Category'].includes(category)
    );
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(days: number = 30): Promise<GrantOpportunity[]> {
    console.log('Getting upcoming deadlines for next', days, 'days');
    
    const opportunities = await this.getGrantOpportunities();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return opportunities.filter(opportunity => {
      const deadline = new Date(opportunity['Deadline']);
      return deadline > today && deadline <= futureDate && opportunity['Status'] === 'Active';
    });
  }
}

// Export singleton instance
export const airtableService = new AirtableService();

// For production use, uncomment the following and install airtable package:
// npm install airtable
// 
// import Airtable from 'airtable';
// 
// const config = getConfig();
// const base = new Airtable({ apiKey: config.apiKey }).base(config.baseId);
// 
// Then replace the mock implementation with actual Airtable API calls