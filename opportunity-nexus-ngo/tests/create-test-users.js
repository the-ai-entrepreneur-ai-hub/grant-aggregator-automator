const AIRTABLE_API_KEY = 'patrTARcp2imegWXX.6c00ccdd82f0b1fa64b9a837e3e3218fb87a7f0b29896644c51ea2c24f66b0a3';
const AIRTABLE_BASE_ID = 'appR8MwS1pQs7Bnga';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

async function createTestUsers() {
  const testUsers = [
    {
      'Email': 'admin@misionhuascaran.org',
      'Password Hash': 'admin123', // In production, this would be hashed
      'Full Name': 'Admin User',
      'Role': 'Admin',
      'Created Date': new Date().toISOString().split('T')[0],
      'Status': 'Active',
      'Email Verified': true,
      'Organization': 'Misión Huascarán',
      'Country': 'Peru',
      'Language': 'English'
    },
    {
      'Email': 'team@misionhuascaran.org',
      'Password Hash': 'team123', // In production, this would be hashed
      'Full Name': 'Team Member',
      'Role': 'Team',
      'Created Date': new Date().toISOString().split('T')[0],
      'Status': 'Active',
      'Email Verified': true,
      'Organization': 'Misión Huascarán',
      'Country': 'Peru',
      'Language': 'Spanish'
    },
    {
      'Email': 'test@example.com',
      'Password Hash': 'password123', // In production, this would be hashed
      'Full Name': 'Test User',
      'Role': 'Team',
      'Created Date': new Date().toISOString().split('T')[0],
      'Status': 'Active',
      'Email Verified': false,
      'Organization': 'Test Organization',
      'Country': 'Other',
      'Language': 'English'
    }
  ];

  try {
    for (const user of testUsers) {
      console.log(`Creating user: ${user['Full Name']} (${user['Email']})...`);
      
      const response = await fetch(`${AIRTABLE_API_URL}/Users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: user
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Failed to create user ${user['Email']}:`, errorData);
      } else {
        const result = await response.json();
        console.log(`✅ Successfully created user: ${user['Full Name']} (${user['Email']})`);
      }
    }
    
    console.log('\n🎉 Test users creation completed!');
    console.log('\nYou can now login with:');
    console.log('📧 Admin: admin@misionhuascaran.org / admin123');
    console.log('📧 Team: team@misionhuascaran.org / team123');
    console.log('📧 Test: test@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  }
}

createTestUsers();