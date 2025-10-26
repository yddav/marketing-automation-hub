#!/usr/bin/env node

/**
 * TEST POSTIZ LOGIN
 * 
 * Test if account already exists and login works
 */

const axios = require('axios');

async function testLogin() {
  console.log('🔐 Testing Postiz login...');

  const credentials = {
    email: 'untrapd77@gmail.com',
    password: 'UNTRAPDHub2025!'
  };

  try {
    // Try login
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('🎉 Account already exists and working');
    console.log('\n📱 Ready to connect social media accounts');
    
    return response.data;

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️ Invalid credentials - account may not exist');
      console.log('💡 Try creating account via GUI signup');
    } else if (error.response?.status === 404) {
      console.log('⚠️ Login endpoint not found');
      console.log('💡 Use GUI at http://localhost:4200 for authentication');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to Postiz API');
      console.log('💡 Restart containers with: sudo docker restart untrapd-postiz');
    } else {
      console.log(`❌ Login test failed: ${error.message}`);
    }
    
    return null;
  }
}

async function checkAvailableEndpoints() {
  console.log('🔍 Checking available API endpoints...');
  
  const endpoints = [
    '/api/auth/register',
    '/api/auth/login', 
    '/api/user',
    '/api/health',
    '/health'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`http://localhost:3000${endpoint}`, { timeout: 3000 });
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      const status = error.response?.status || 'Connection Error';
      console.log(`${status === 404 ? '❌' : '⚠️'} ${endpoint} - Status: ${status}`);
    }
  }
}

if (require.main === module) {
  Promise.all([
    testLogin(),
    checkAvailableEndpoints()
  ]).then(() => {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. If login failed: Use GUI signup at http://localhost:4200');
    console.log('2. Try different browser if GUI has errors');
    console.log('3. Once logged in: Connect Instagram @untrapd.hub');
    console.log('4. Test posting functionality');
  });
}

module.exports = { testLogin, checkAvailableEndpoints };