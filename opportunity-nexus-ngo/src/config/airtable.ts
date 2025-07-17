// Airtable configuration
export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableNames: {
    grantOpportunities: string;
    organizations: string;
    keywords: string;
    categories: string;
    deadlines: string;
    contacts: string;
    notes: string;
  };
}

// Get configuration from environment variables
export const getAirtableConfig = (): AirtableConfig => {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.warn('Airtable API key or Base ID not found. Using mock data for development.');
    
    // Return mock config for development
    return {
      apiKey: 'mock-key',
      baseId: 'mock-base',
      tableNames: {
        grantOpportunities: 'Grant Opportunities',
        organizations: 'Organizations',
        keywords: 'Keywords',
        categories: 'Categories',
        deadlines: 'Deadlines',
        contacts: 'Contacts',
        notes: 'Notes'
      }
    };
  }

  return {
    apiKey,
    baseId,
    tableNames: {
      grantOpportunities: 'Grant Opportunities',
      organizations: 'Organizations',
      keywords: 'Keywords',
      categories: 'Categories',
      deadlines: 'Deadlines',
      contacts: 'Contacts',
      notes: 'Notes'
    }
  };
};

// Airtable API endpoints
export const AIRTABLE_ENDPOINTS = {
  base: 'https://api.airtable.com/v0',
  meta: 'https://api.airtable.com/v0/meta'
};

// Rate limiting configuration
export const RATE_LIMITS = {
  requestsPerSecond: 5,
  maxRecordsPerRequest: 100,
  cacheDuration: 15 * 60 * 1000 // 15 minutes
};

// Error handling configuration
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid Airtable API key',
  INVALID_BASE_ID: 'Invalid Airtable base ID',
  RATE_LIMIT_EXCEEDED: 'Airtable rate limit exceeded',
  NETWORK_ERROR: 'Network error occurred',
  RECORD_NOT_FOUND: 'Record not found',
  VALIDATION_ERROR: 'Validation error occurred'
};

// Field mappings for data transformation
export const FIELD_MAPPINGS = {
  grantOpportunities: {
    'Grant Name': 'grantName',
    'Organization': 'organizations',
    'Description': 'description',
    'Amount': 'amount',
    'Deadline': 'deadline',
    'Category': 'categories',
    'Keywords': 'keywords',
    'Eligibility': 'eligibility',
    'Application Link': 'applicationLink',
    'Contact Email': 'contactEmail',
    'Status': 'status',
    'Priority': 'priority',
    'Notes': 'notes'
  },
  organizations: {
    'Name': 'name',
    'Type': 'type',
    'Website': 'website',
    'Contact Email': 'contactEmail',
    'Phone': 'phone',
    'Address': 'address',
    'Mission': 'mission',
    'Focus Areas': 'focusAreas',
    'Geographic Focus': 'geographicFocus',
    'Grant Range': 'grantRange',
    'Application Process': 'applicationProcess',
    'Notes': 'notes'
  }
};