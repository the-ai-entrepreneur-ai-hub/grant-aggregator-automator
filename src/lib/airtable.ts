// Airtable API Configuration and Data Services
// Misión Huascarán Grant Aggregator System

// Environment variable configuration with fallback for production debugging
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Funding Opportunities';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Detailed environment variable validation and debugging
console.log('🔧 Environment Variables Debug:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  allEnvVars: Object.keys(import.meta.env),
  airtableVars: {
    VITE_AIRTABLE_API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY ? 'Set' : 'Missing',
    VITE_AIRTABLE_BASE_ID: import.meta.env.VITE_AIRTABLE_BASE_ID ? 'Set' : 'Missing',
    VITE_AIRTABLE_TABLE_NAME: import.meta.env.VITE_AIRTABLE_TABLE_NAME ? 'Set' : 'Missing (using fallback)'
  }
});

// Validate environment variables
if (!AIRTABLE_API_KEY) {
  console.error('❌ CRITICAL: VITE_AIRTABLE_API_KEY is missing from environment variables');
  console.error('📝 Please set environment variables in Netlify dashboard');
  console.error('🔗 Instructions: See NETLIFY_ENV_SETUP.md in project root');
}
if (!AIRTABLE_BASE_ID) {
  console.error('❌ CRITICAL: VITE_AIRTABLE_BASE_ID is missing from environment variables');
}

console.log('🔧 Airtable configuration:', {
  hasApiKey: !!AIRTABLE_API_KEY,
  hasBaseId: !!AIRTABLE_BASE_ID,
  apiUrl: AIRTABLE_API_URL,
  tableName: AIRTABLE_TABLE_NAME,
  envMode: import.meta.env.MODE
});

// Table names
export const TABLES = {
  FUNDING_OPPORTUNITIES: 'Funding Opportunities',
  FUNDERS: 'Funders',
  APPLICATIONS: 'Applications',
  TEAM_MEMBERS: 'Team Members',
  DATA_SOURCES: 'Data Sources',
  USERS: 'Users'
} as const;

// Types for our data structures
export interface FundingOpportunity {
  id: string;
  fields: {
    'Opportunity ID'?: number;
    'Funder Name': string;
    'Funder Website'?: string;
    'Funder Description'?: string;
    'Opportunity Title': string;
    'Opportunity Description'?: string;
    'Support Type': 'Grant' | 'Donation' | 'Contest' | 'Fellowship' | 'Prize';
    'Program Area'?: string[];
    'Total Funding Available'?: number;
    'Minimum Award'?: number;
    'Maximum Award'?: number;
    'Typical Grant Size'?: number;
    'Currency'?: string;
    'Open Date'?: string;
    'Close Date'?: string;
    'Announcement Date'?: string;
    'Project Duration (Months)'?: number;
    'Eligible Countries'?: string[];
    'Target Communities'?: string[];
    'Beneficiary Groups'?: string[];
    'Application Link'?: string;
    'Guidelines Link'?: string;
    'Required Documents'?: string[];
    'Application Complexity'?: 'Low' | 'Medium' | 'High';
    'Ranking Score'?: number;
    'Priority Level'?: 'Critical' | 'High' | 'Medium' | 'Low';
    'Geographic Match'?: 'Perfect' | 'Good' | 'Fair' | 'Poor';
    'Sector Match'?: 'Perfect' | 'Good' | 'Fair' | 'Poor';
    'Budget Match'?: 'Perfect' | 'Good' | 'Fair' | 'Poor';
    'Status': 'Open' | 'Closed' | 'Under Review' | 'Cancelled';
    'Is Urgent'?: boolean;
    'Days Until Deadline'?: number;
    'Application Status'?: 'Not Started' | 'Researching' | 'Preparing' | 'Submitted' | 'Outcome';
    'Source'?: string;
    'Source URL'?: string;
    'Date Scraped'?: string;
    'Last Updated'?: string;
    'Keywords'?: string[];
    'Notes'?: string;
  };
}

export interface Application {
  id: string;
  fields: {
    'Application ID'?: number;
    'Opportunity'?: string[];
    'Internal Reference'?: string;
    'Status': 'Identified' | 'Researching' | 'Preparing' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
    'Priority'?: 'Critical' | 'High' | 'Medium' | 'Low';
    'Lead Person'?: string;
    'Team Members'?: string[];
    'Estimated Effort (Hours)'?: number;
    'Actual Effort (Hours)'?: number;
    'Internal Deadline'?: string;
    'Submission Deadline'?: string;
    'Requested Amount'?: number;
    'Project Title'?: string;
    'Project Summary'?: string;
    'Proposal Status'?: 'Not Started' | 'Draft' | 'Review' | 'Final';
    'Outcome'?: 'Pending' | 'Awarded' | 'Rejected' | 'Partially Funded';
    'Awarded Amount'?: number;
    'Feedback'?: string;
    'Lessons Learned'?: string;
  };
}

export interface TeamMember {
  id: string;
  fields: {
    'Name': string;
    'Email'?: string;
    'Role'?: 'Coordinator' | 'Manager' | 'Writer' | 'Reviewer';
    'Department'?: string;
    'Specialization'?: string[];
    'Active Applications'?: number;
    'Success Rate'?: number;
  };
}

export interface User {
  id: string;
  fields: {
    'User ID'?: number;
    'Email': string;
    'Password Hash': string;
    'Full Name': string;
    'Role': 'Admin' | 'Team';
    'Created Date': string;
    'Last Login'?: string;
    'Status': 'Active' | 'Inactive' | 'Suspended';
    'Email Verified'?: boolean;
    'Password Reset Token'?: string;
    'Password Reset Expires'?: string;
    'Profile Picture'?: string;
    'Organization'?: string;
    'Phone'?: string;
    'Country'?: string;
    'Language'?: 'English' | 'Spanish';
    'Notifications'?: string[];
    'Bio'?: string;
    'Session Token'?: string;
    'Session Expires'?: string;
  };
}

// API Helper Functions
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  console.log('🔄 Making Airtable request:', {
    url: `${AIRTABLE_API_URL}${endpoint}`,
    method: options.method || 'GET',
    hasApiKey: !!AIRTABLE_API_KEY,
    baseId: AIRTABLE_BASE_ID
  });

  const response = await fetch(`${AIRTABLE_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  console.log('📡 Airtable response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Airtable API error:', errorText);
    throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Airtable data received:', data);
  return data;
};

// Funding Opportunities API
export const airtableAPI = {
  // Get all funding opportunities with filtering
  async getFundingOpportunities(params: {
    view?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    maxRecords?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.view) searchParams.append('view', params.view);
    if (params.filterByFormula) searchParams.append('filterByFormula', params.filterByFormula);
    if (params.maxRecords) searchParams.append('maxRecords', params.maxRecords.toString());
    if (params.sort) {
      params.sort.forEach((sort, index) => {
        searchParams.append(`sort[${index}][field]`, sort.field);
        searchParams.append(`sort[${index}][direction]`, sort.direction);
      });
    }

    const data = await makeRequest(`/${TABLES.FUNDING_OPPORTUNITIES}?${searchParams.toString()}`);
    return data.records as FundingOpportunity[];
  },

  // Get active opportunities (status = Open, deadline in future)
  async getActiveOpportunities() {
    const formula = `AND({Status} = 'Open', IS_AFTER({Close Date}, TODAY()))`;
    return this.getFundingOpportunities({
      filterByFormula: formula,
      sort: [{ field: 'Ranking Score', direction: 'desc' }]
    });
  },

  // Get urgent opportunities (deadline within 14 days)
  async getUrgentOpportunities() {
    const formula = `AND({Status} = 'Open', {Is Urgent} = TRUE())`;
    return this.getFundingOpportunities({
      filterByFormula: formula,
      sort: [{ field: 'Close Date', direction: 'asc' }]
    });
  },

  // Get high-priority opportunities (ranking score > 80)
  async getHighPriorityOpportunities() {
    const formula = `AND({Status} = 'Open', {Ranking Score} >= 80)`;
    return this.getFundingOpportunities({
      filterByFormula: formula,
      sort: [{ field: 'Ranking Score', direction: 'desc' }]
    });
  },

  // Get opportunities by sector
  async getOpportunitiesBySector(sectors: string[]) {
    const sectorConditions = sectors.map(sector => `FIND('${sector}', ARRAYJOIN({Program Area}, ',')) > 0`);
    const formula = `AND({Status} = 'Open', OR(${sectorConditions.join(', ')}))`;
    return this.getFundingOpportunities({
      filterByFormula: formula,
      sort: [{ field: 'Ranking Score', direction: 'desc' }]
    });
  },

  // Search opportunities by text
  async searchOpportunities(searchTerm: string) {
    const formula = `OR(
      FIND('${searchTerm}', UPPER({Funder Name})) > 0,
      FIND('${searchTerm}', UPPER({Opportunity Title})) > 0,
      FIND('${searchTerm}', UPPER({Opportunity Description})) > 0,
      FIND('${searchTerm}', UPPER(ARRAYJOIN({Program Area}, ','))) > 0,
      FIND('${searchTerm}', UPPER(ARRAYJOIN({Keywords}, ','))) > 0
    )`;
    return this.getFundingOpportunities({
      filterByFormula: formula,
      sort: [{ field: 'Ranking Score', direction: 'desc' }]
    });
  },

  // Get single opportunity by ID
  async getOpportunity(id: string) {
    const data = await makeRequest(`/${TABLES.FUNDING_OPPORTUNITIES}/${id}`);
    return data as FundingOpportunity;
  },

  // Update opportunity
  async updateOpportunity(id: string, fields: Partial<FundingOpportunity['fields']>) {
    const data = await makeRequest(`/${TABLES.FUNDING_OPPORTUNITIES}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    return data as FundingOpportunity;
  },

  // Applications API
  async getApplications(params: {
    view?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.view) searchParams.append('view', params.view);
    if (params.filterByFormula) searchParams.append('filterByFormula', params.filterByFormula);
    if (params.sort) {
      params.sort.forEach((sort, index) => {
        searchParams.append(`sort[${index}][field]`, sort.field);
        searchParams.append(`sort[${index}][direction]`, sort.direction);
      });
    }

    const data = await makeRequest(`/${TABLES.APPLICATIONS}?${searchParams.toString()}`);
    return data.records as Application[];
  },

  // Get active application pipeline
  async getActiveApplications() {
    const formula = `NOT(OR({Status} = 'Rejected', {Status} = 'Withdrawn'))`;
    return this.getApplications({
      filterByFormula: formula,
      sort: [{ field: 'Submission Deadline', direction: 'asc' }]
    });
  },

  // Create new application
  async createApplication(fields: Application['fields']) {
    const data = await makeRequest(`/${TABLES.APPLICATIONS}`, {
      method: 'POST',
      body: JSON.stringify({ fields })
    });
    return data as Application;
  },

  // Update application
  async updateApplication(id: string, fields: Partial<Application['fields']>) {
    const data = await makeRequest(`/${TABLES.APPLICATIONS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields })
    });
    return data as Application;
  },

  // Team Members API
  async getTeamMembers() {
    const data = await makeRequest(`/${TABLES.TEAM_MEMBERS}`);
    return data.records as TeamMember[];
  },

  // Users API
  async getUsers() {
    const data = await makeRequest(`/${TABLES.USERS}`);
    return data.records as User[];
  },

  async getUserByEmail(email: string) {
    const formula = `{Email} = '${email}'`;
    console.log('🔍 Looking up user by email:', email);
    const data = await makeRequest(`/${TABLES.USERS}?filterByFormula=${encodeURIComponent(formula)}`);
    console.log('👥 Found users:', data.records.length);
    
    if (data.records.length > 1) {
      console.warn('⚠️ Multiple users found with same email, using first active user');
      // Find the first active user, preferring Admin role
      const activeUsers = data.records.filter((user: User) => user.fields.Status === 'Active');
      const adminUser = activeUsers.find((user: User) => user.fields.Role === 'Admin');
      return (adminUser || activeUsers[0]) as User || null;
    }
    
    return data.records[0] as User || null;
  },

  async createUser(userData: Partial<User['fields']>) {
    const data = await makeRequest(`/${TABLES.USERS}`, {
      method: 'POST',
      body: JSON.stringify({ fields: userData })
    });
    return data as User;
  },

  async updateUser(id: string, userData: Partial<User['fields']>) {
    const data = await makeRequest(`/${TABLES.USERS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: userData })
    });
    return data as User;
  },

  async authenticateUser(email: string, password: string) {
    console.log('🔐 Attempting authentication for:', email);
    const user = await this.getUserByEmail(email);
    console.log('👤 User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log('🔑 Checking password for user:', user.fields['Full Name']);
    
    // In production, use proper password hashing comparison
    if (user.fields['Password Hash'] !== password) {
      console.error('❌ Password mismatch');
      throw new Error('Invalid password');
    }
    
    console.log('✅ Authentication successful');
    
    // Update last login
    await this.updateUser(user.id, {
      'Last Login': new Date().toISOString().split('T')[0]
    });
    
    return user;
  },

  // Analytics and Dashboard Data
  async getDashboardStats() {
    const [opportunities, applications] = await Promise.all([
      this.getActiveOpportunities(),
      this.getActiveApplications()
    ]);

    const urgentOpportunities = opportunities.filter(opp => opp.fields['Is Urgent']);
    const totalFunding = opportunities.reduce((sum, opp) => {
      return sum + (opp.fields['Typical Grant Size'] || 0);
    }, 0);

    const applicationsByStatus = applications.reduce((acc, app) => {
      const status = app.fields.Status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOpportunities: opportunities.length,
      urgentOpportunities: urgentOpportunities.length,
      totalFunding,
      activeApplications: applications.length,
      applicationsByStatus,
      averageRankingScore: opportunities.reduce((sum, opp) => sum + (opp.fields['Ranking Score'] || 0), 0) / opportunities.length,
    };
  }
};

// Utility functions for data formatting
export const formatters = {
  currency: (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  date: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  daysUntilDeadline: (closeDate: string) => {
    const deadline = new Date(closeDate);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  urgencyLevel: (daysRemaining: number) => {
    if (daysRemaining <= 7) return 'critical';
    if (daysRemaining <= 14) return 'urgent';
    if (daysRemaining <= 30) return 'soon';
    return 'normal';
  }
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Airtable API Error:', error);
    return fallback || null;
  }
};