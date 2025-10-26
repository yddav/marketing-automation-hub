#!/usr/bin/env node

/**
 * POSTIZ FIXED REGISTRATION
 * 
 * Use correct API parameters based on validation errors
 */

const axios = require('axios');

async function createAccountWithCorrectParams() {
  console.log('🔧 Creating Postiz account with correct parameters...');
  
  const registrationData = {
    email: 'untrapd77@gmail.com',
    password: 'UNTRAPDHub2025!',
    name: 'UNTRAPD Hub Admin',
    company: 'UNTRAPD Hub',  // Required: 3-128 chars
    provider: 'email'        // Required: string value
  };

  try {
    console.log('📤 Sending registration request...');
    
    const response = await axios.post('http://localhost:3000/auth/register', registrationData, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ REGISTRATION SUCCESSFUL!');
    console.log('📧 Email:', registrationData.email);
    console.log('🔑 Password:', registrationData.password);
    console.log('🏢 Company:', registrationData.company);
    console.log('📱 Response:', response.data);
    
    return { success: true, data: response.data };

  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Account already exists! Trying login...');
      return await tryLogin(registrationData);
    } else {
      console.log(`❌ Registration failed: ${error.response?.status || 'Connection Error'}`);
      console.log(`📝 Error details: ${error.response?.data?.message || error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function tryLogin(credentials) {
  console.log('🔐 Testing login with correct parameters...');
  
  const loginData = {
    email: credentials.email,
    password: credentials.password,
    provider: 'email'  // Add provider for login too
  };

  try {
    const response = await axios.post('http://localhost:3000/auth/login', loginData, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('🎉 Account exists and credentials work');
    console.log('🔑 Auth token received');
    
    return { success: true, data: response.data, method: 'login' };

  } catch (error) {
    console.log(`❌ Login failed: ${error.response?.status || 'Connection Error'}`);
    console.log(`📝 Error details: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

// CLI Usage
if (require.main === module) {
  createAccountWithCorrectParams()
    .then((result) => {
      console.log('\n📊 FINAL RESULT:');
      console.log(result);
      
      if (result.success) {
        console.log('\n🚀 SUCCESS! Account ready for use');
        console.log('🌐 Next step: Visit http://localhost:4200 and login');
        console.log('📧 Email: untrapd77@gmail.com');
        console.log('🔑 Password: UNTRAPDHub2025!');
        console.log('\n📱 Ready to connect social media accounts:');
        console.log('  - Instagram @untrapd.hub');
        console.log('  - Facebook "un trapd" page'); 
        console.log('  - Pinterest untrapd.hub');
      } else {
        console.log('\n🔧 Manual database approach required');
      }
    })
    .catch((error) => {
      console.error(`❌ Process failed: ${error.message}`);
    });
}

module.exports = { createAccountWithCorrectParams, tryLogin };