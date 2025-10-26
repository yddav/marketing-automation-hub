#!/usr/bin/env node

/**
 * POSTIZ ADMIN ACCOUNT CREATOR
 * 
 * Creates admin account via API when GUI has issues
 */

const axios = require('axios');

async function createAdminAccount() {
  console.log('🔧 Creating Postiz admin account via API...');

  try {
    const adminData = {
      email: 'untrapd77@gmail.com',
      password: 'UNTRAPDHub2025!',
      name: 'UNTRAPD Hub Admin',
      organization: 'UNTRAPD Hub'
    };

    // Try to create account via API
    const response = await axios.post('http://localhost:3000/api/auth/register', adminData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Admin account created successfully!');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log('\n🚀 Next steps:');
    console.log('1. Login at http://localhost:4200');
    console.log('2. Connect social media accounts');
    console.log('3. Test posting functionality');

    return response.data;

  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Account already exists - try logging in');
      console.log(`📧 Email: untrapd77@gmail.com`);
      console.log(`🔑 Password: UNTRAPDHub2025!`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to Postiz API');
      console.log('💡 Try: sudo docker restart untrapd-postiz');
    } else {
      console.log(`❌ Account creation failed: ${error.message}`);
      console.log('💡 Use GUI signup at http://localhost:4200 instead');
    }
    
    return null;
  }
}

// Test API connection first
async function testConnection() {
  try {
    const response = await axios.get('http://localhost:3000/', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

if (require.main === module) {
  testConnection()
    .then(async (connected) => {
      if (connected) {
        console.log('✅ Postiz API is accessible');
        await createAdminAccount();
      } else {
        console.log('❌ Postiz API not accessible');
        console.log('🔧 Try: sudo docker restart untrapd-postiz');
      }
    });
}

module.exports = { createAdminAccount, testConnection };