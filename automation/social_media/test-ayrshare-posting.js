#!/usr/bin/env node

/**
 * AYRSHARE POSTING TEST
 * 
 * Test actual posting capability with free tier account
 */

require('dotenv').config();
const axios = require('axios');

async function testAyrsharePosting() {
  const apiKey = process.env.AYRSHARE_API_KEY;
  
  console.log('🧪 AYRSHARE POSTING TEST');
  console.log('========================');
  console.log(`API Key: ${apiKey ? '✅ Present' : '❌ Missing'}`);
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  const client = axios.create({
    baseURL: 'https://app.ayrshare.com/api',
    timeout: 15000,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  // Test 1: Test posting with demo post
  console.log('\n📝 Testing Demo Post Creation...');
  
  const testPost = {
    post: '🧪 Test from UNTRAPD Hub automation system! This is a demo post to verify API connection. #UNTRAPDHub #TestPost #Automation',
    platforms: ['instagram', 'facebook', 'pinterest'],
    // Important: Don't actually publish during testing
    scheduleDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Schedule for tomorrow
    shortenLinks: true
  };

  try {
    console.log('📤 Sending test post request...');
    console.log(`📅 Scheduled for: ${testPost.scheduleDate}`);
    
    const response = await client.post('/post', testPost);
    
    console.log('✅ SUCCESS! Ayrshare posting works!');
    console.log(`📋 Response: ${JSON.stringify(response.data, null, 2)}`);
    
    // Check if we got a post ID
    if (response.data.id) {
      console.log(`🎯 Post ID: ${response.data.id}`);
      console.log('📱 Post scheduled successfully to all platforms');
      
      // Try to get the post status
      console.log('\n📊 Checking post status...');
      try {
        const statusResponse = await client.get(`/post/${response.data.id}`);
        console.log(`📈 Status: ${JSON.stringify(statusResponse.data, null, 2)}`);
      } catch (statusError) {
        console.log('⚠️  Status check may require business plan');
      }
    }
    
  } catch (error) {
    console.log('❌ Posting failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    
    if (error.response?.status === 403) {
      console.log('\n💡 This might be due to:');
      console.log('1. Free tier posting limitations');
      console.log('2. Need to verify connected platforms in Ayrshare dashboard');
      console.log('3. API key permissions');
    }
  }

  // Test 2: Try to get user info (simpler endpoint)
  console.log('\n👤 Testing User Info...');
  try {
    const userResponse = await client.get('/user');
    console.log('✅ User info retrieved successfully');
    console.log(`📋 User: ${JSON.stringify(userResponse.data, null, 2)}`);
  } catch (userError) {
    console.log('⚠️  User endpoint may require business plan');
    console.log(`Status: ${userError.response?.status}`);
  }

  console.log('\n🏁 TEST COMPLETE');
  console.log('================');
  console.log('📝 Next steps if posting works:');
  console.log('1. Remove the scheduleDate to post immediately');
  console.log('2. Integrate with main automation system');
  console.log('3. Set up regular posting schedule');
}

testAyrsharePosting().catch(error => {
  console.error('\n💥 Test failed:', error.message);
});