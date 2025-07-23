const AIRTABLE_API_KEY = 'patrTARcp2imegWXX.6c00ccdd82f0b1fa64b9a837e3e3218fb87a7f0b29896644c51ea2c24f66b0a3';
const AIRTABLE_BASE_ID = 'appR8MwS1pQs7Bnga';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

async function testSignup(email, password, name, role) {
  try {
    console.log(`\n🔍 Testing signup for: ${email}`);
    
    // First check if user already exists
    const formula = encodeURIComponent(`{Email} = '${email}'`);
    const checkResponse = await fetch(`${AIRTABLE_API_URL}/Users?filterByFormula=${formula}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checkResponse.ok) {
      throw new Error(`HTTP error! status: ${checkResponse.status}`);
    }

    const checkData = await checkResponse.json();
    
    if (checkData.records.length > 0) {
      console.log('❌ User already exists');
      return false;
    }

    // Create new user
    const userData = {
      'Email': email,
      'Password Hash': password, // In production, this would be hashed
      'Full Name': name,
      'Role': role === 'admin' ? 'Admin' : 'Team',
      'Created Date': new Date().toISOString().split('T')[0],
      'Status': 'Active',
      'Email Verified': false
    };

    const createResponse = await fetch(`${AIRTABLE_API_URL}/Users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: userData })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Failed to create user:', errorData);
      return false;
    }

    const newUser = await createResponse.json();
    console.log('✅ User created successfully!');
    
    return {
      name: newUser.fields['Full Name'],
      email: newUser.fields['Email'],
      role: newUser.fields['Role'].toLowerCase()
    };
  } catch (error) {
    console.error('❌ Signup test failed:', error.message);
    return false;
  }
}

async function runSignupTests() {
  console.log('🧪 Testing Signup System...\n');
  
  // Test signup cases
  const testCases = [
    { email: 'newuser@example.com', password: 'newpass123', name: 'New User', role: 'viewer' },
    { email: 'admin2@misionhuascaran.org', password: 'admin456', name: 'Admin Two', role: 'admin' },
    { email: 'admin@misionhuascaran.org', password: 'admin123', name: 'Duplicate Admin', role: 'admin' } // Should fail - already exists
  ];
  
  for (const testCase of testCases) {
    const result = await testSignup(testCase.email, testCase.password, testCase.name, testCase.role);
    if (result) {
      console.log(`   → User data: ${JSON.stringify(result)}`);
    }
  }
  
  console.log('\n🎉 Signup tests completed!');
}

runSignupTests();