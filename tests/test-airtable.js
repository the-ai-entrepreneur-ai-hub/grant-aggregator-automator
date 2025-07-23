// Simple test for Airtable API connection
const AIRTABLE_API_KEY = 'patrTARcp2imegWXX.6c00ccdd82f0b1fa64b9a837e3e3218fb87a7f0b29896644c51ea2c24f66b0a3';
const AIRTABLE_BASE_ID = 'appR8MwS1pQs7Bnga';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

async function testAirtableConnection() {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/Funding Opportunities?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Airtable connection successful!');
    console.log('Sample data:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Airtable connection failed:', error.message);
    return false;
  }
}

// Run the test
testAirtableConnection();