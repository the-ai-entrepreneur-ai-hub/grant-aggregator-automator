#!/usr/bin/env node

/**
 * Airtable Integration Test Script
 * Tests the connection to Airtable and validates the database structure
 */

const https = require('https');

// Load environment variables
require('dotenv').config();

// Configuration
const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: colors.blue + '[INFO]' + colors.reset,
    success: colors.green + '[SUCCESS]' + colors.reset,
    error: colors.red + '[ERROR]' + colors.reset,
    warning: colors.yellow + '[WARNING]' + colors.reset,
    test: colors.magenta + '[TEST]' + colors.reset
  }[type] || colors.blue + '[INFO]' + colors.reset;
  
  console.log(`${prefix} ${timestamp} - ${message}`);
}

function test(name, fn) {
  log(`Running: ${name}`, 'test');
  try {
    fn();
    results.passed++;
    log(`✅ ${name}`, 'success');
  } catch (error) {
    results.failed++;
    log(`❌ ${name}: ${error.message}`, 'error');
  }
}

function warn(message) {
  results.warnings++;
  log(`⚠️  ${message}`, 'warning');
}

// Test functions
async function testAirtableConnection() {
  return new Promise((resolve, reject) => {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      reject(new Error('Airtable API key or Base ID not configured'));
      return;
    }

    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE_ID}/tables`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.error?.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.end();
  });
}

async function testTableStructure() {
  const expectedTables = [
    'Grant Opportunities',
    'Organizations',
    'Keywords',
    'Categories',
    'Deadlines',
    'Contacts',
    'Notes'
  ];

  try {
    const response = await testAirtableConnection();
    const tables = response.tables || [];
    const tableNames = tables.map(table => table.name);

    log(`Found ${tables.length} tables in base`, 'info');
    
    expectedTables.forEach(tableName => {
      if (tableNames.includes(tableName)) {
        log(`✅ Table found: ${tableName}`, 'success');
      } else {
        warn(`Missing table: ${tableName}`);
      }
    });

    return tables;
  } catch (error) {
    throw new Error(`Failed to validate table structure: ${error.message}`);
  }
}

async function testSampleData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE_ID}/Grant%20Opportunities?maxRecords=5`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            const records = response.records || [];
            log(`Found ${records.length} grant opportunities`, 'info');
            
            if (records.length > 0) {
              log('✅ Sample data available', 'success');
              records.slice(0, 2).forEach(record => {
                const fields = record.fields;
                log(`  - ${fields['Grant Name'] || 'Unnamed Grant'}: $${fields['Amount'] || 'N/A'}`, 'info');
              });
            } else {
              warn('No grant opportunities found - consider adding sample data');
            }
            
            resolve(records);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.error?.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.end();
  });
}

// Main test runner
async function runTests() {
  console.log(colors.bright + '\n🧪 Misión Huascarán Airtable Integration Test\n' + colors.reset);
  
  // Environment check
  log('Checking environment configuration...', 'info');
  test('Environment Variables', () => {
    if (!AIRTABLE_API_KEY) {
      throw new Error('VITE_AIRTABLE_API_KEY or AIRTABLE_API_KEY not set');
    }
    if (!AIRTABLE_BASE_ID) {
      throw new Error('VITE_AIRTABLE_BASE_ID or AIRTABLE_BASE_ID not set');
    }
    log(`API Key: ${AIRTABLE_API_KEY.substring(0, 8)}...`, 'info');
    log(`Base ID: ${AIRTABLE_BASE_ID}`, 'info');
  });

  // Connection test
  log('\nTesting Airtable connection...', 'info');
  try {
    await testAirtableConnection();
    log('✅ Airtable connection successful', 'success');
  } catch (error) {
    log(`❌ Connection failed: ${error.message}`, 'error');
    process.exit(1);
  }

  // Table structure test
  log('\nValidating database structure...', 'info');
  try {
    await testTableStructure();
  } catch (error) {
    log(`❌ Structure validation failed: ${error.message}`, 'error');
  }

  // Sample data test
  log('\nChecking sample data...', 'info');
  try {
    await testSampleData();
  } catch (error) {
    log(`❌ Data check failed: ${error.message}`, 'error');
  }

  // Summary
  console.log(colors.bright + '\n📊 Test Summary' + colors.reset);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  
  if (results.failed === 0) {
    console.log(colors.green + '\n🎉 All tests passed! Your Airtable integration is ready.' + colors.reset);
  } else {
    console.log(colors.red + '\n❌ Some tests failed. Please check the configuration.' + colors.reset);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  testAirtableConnection,
  testTableStructure,
  testSampleData,
  runTests
};