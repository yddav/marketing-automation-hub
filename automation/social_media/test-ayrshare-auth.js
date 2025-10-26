#!/usr/bin/env node

/**
 * SIMPLE AYRSHARE AUTH TEST
 * 
 * Direct API test to debug authentication issues
 */

require('dotenv').config();
const axios = require('axios');

async function testAuth() {
  const apiKey = process.env.AYRSHARE_API_KEY;
  
  console.log('🔍 Testing Ayrshare Authentication');
  console.log('==================================');
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'Missing'}`);
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  // Test different authentication methods
  const tests = [
    {
      name: 'Bearer Token Auth',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'API Key Header',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Authorization Key',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    
    try {
      const response = await axios.get('https://app.ayrshare.com/api/profiles', {
        headers: test.headers,
        timeout: 10000
      });
      
      console.log('✅ Success!');
      console.log(`Status: ${response.status}`);
      console.log(`Profiles: ${JSON.stringify(response.data, null, 2)}`);
      return; // Stop on first success
      
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data) {
        console.log(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. Check if API key is correctly copied from Ayrshare dashboard');
  console.log('2. Verify account is active and has connected platforms');
  console.log('3. Check if there are any API usage restrictions');
  console.log('4. Try regenerating the API key in your Ayrshare account');
}

testAuth().catch(console.error);