const AIRTABLE_API_KEY = 'patrTARcp2imegWXX.6c00ccdd82f0b1fa64b9a837e3e3218fb87a7f0b29896644c51ea2c24f66b0a3';
const AIRTABLE_BASE_ID = 'appR8MwS1pQs7Bnga';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Simulate the authenticateUser function with fixes
async function authenticateUser(email, password) {
  try {
    // Get user by email
    const formula = encodeURIComponent(`{Email} = '${email}'`);
    const response = await fetch(`${AIRTABLE_API_URL}/Users?filterByFormula=${formula}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.records.length === 0) {
      throw new Error('User not found');
    }

    const user = data.records[0];
    
    // Check password
    if (user.fields['Password Hash'] !== password) {
      throw new Error('Invalid password');
    }
    
    // Update last login with correct date format
    const updateResponse = await fetch(`${AIRTABLE_API_URL}/Users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Last Login': new Date().toISOString().split('T')[0]
        }
      })
    });

    if (!updateResponse.ok) {
      console.warn('Failed to update last login, but authentication succeeded');
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw error;
  }
}

// Simulate the full login flow
async function simulateLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    
    const user = await authenticateUser(email, password);
    
    if (user) {
      const userData = {
        name: user.fields['Full Name'],
        email: user.fields['Email'],
        role: user.fields['Role'].toLowerCase() === 'admin' ? 'admin' : 'viewer'
      };
      
      console.log('✅ Login successful!');
      console.log('📋 User data:', JSON.stringify(userData, null, 2));
      return userData;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return null;
  }
}

// Test the login flow
async function testLoginFlow() {
  console.log('🧪 Testing Fixed Authentication Flow...\n');
  
  const testCredentials = [
    { email: 'admin@misionhuascaran.org', password: 'admin123' },
    { email: 'team@misionhuascaran.org', password: 'team123' },
    { email: 'test@example.com', password: 'password123' }
  ];
  
  for (const cred of testCredentials) {
    await simulateLogin(cred.email, cred.password);
  }
  
  console.log('\n🎉 Authentication flow test completed!');
  console.log('\n📱 Ready to test in browser with these credentials:');
  console.log('   Admin: admin@misionhuascaran.org / admin123');
  console.log('   Team:  team@misionhuascaran.org / team123');
  console.log('   Test:  test@example.com / password123');
}

testLoginFlow();