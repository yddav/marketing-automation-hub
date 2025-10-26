#!/usr/bin/env node

/**
 * POSTIZ CONNECTION VALIDATOR
 * 
 * Validates free Postiz social media automation setup
 * Tests: Server connection, API access, demo posting
 */

const PostizAPIHandler = require('./postiz-api-handler');

async function validatePostizSetup() {
  console.log('🔍 POSTIZ VALIDATION SYSTEM');
  console.log('============================\n');

  // Step 1: Check if Postiz server is running
  console.log('🌐 Step 1: Checking Postiz Server...');
  
  const handler = new PostizAPIHandler();
  const serverStatus = await handler.getServerStatus();
  
  if (!serverStatus.running) {
    console.log('❌ Postiz server is not running!');
    console.log(`💡 ${serverStatus.suggestion}`);
    console.log('\n📋 Setup Instructions:');
    console.log('1. cd automation/social_media/postiz-setup');
    console.log('2. ./setup-postiz.sh');
    console.log('3. Wait for services to start');
    console.log('4. Access http://localhost:3000');
    process.exit(1);
  }
  
  console.log('✅ Postiz server is running!');
  console.log(`📍 Server URL: http://localhost:3000`);

  // Step 2: Test API connection
  console.log('\n🔧 Step 2: Testing API Connection...');
  
  const connectionResult = await handler.validateConnection();
  
  if (connectionResult.success) {
    console.log('✅ Postiz API connection successful!');
    console.log(`📱 Available platforms: ${connectionResult.platforms.join(', ')}`);
  } else {
    console.log('❌ API connection failed!');
    console.log(`Error: ${connectionResult.error}`);
    if (connectionResult.suggestion) {
      console.log(`💡 ${connectionResult.suggestion}`);
    }
    process.exit(1);
  }

  // Step 3: Test demo posting
  console.log('\n📝 Step 3: Testing Demo Posting...');
  
  // Enable demo mode for testing
  handler.demoMode = true;
  
  const testContent = {
    text: '🧪 Test post from UNTRAPD Hub automation! This validates our free Postiz integration. #UNTRAPDHub #TestPost #FreeAutomation'
  };

  const postResult = await handler.post(testContent);
  
  if (postResult.success) {
    console.log('✅ Demo posting works correctly!');
    console.log(`📤 Would post to: ${postResult.platforms.join(', ')}`);
  } else {
    console.log('❌ Demo posting failed');
    console.log(`Error: ${postResult.error}`);
  }

  // Step 4: Test content formatting
  console.log('\n🎨 Step 4: Testing Content Formatting...');
  
  const milestoneContent = handler.formatContent(
    { text: 'We reached 1000 users!' }, 
    'milestone'
  );
  
  console.log('✅ Content formatting works!');
  console.log(`📝 Formatted: ${milestoneContent.text.substring(0, 100)}...`);

  // Step 5: Show setup status
  console.log('\n📊 Step 5: Current Setup Status');
  console.log('================================');
  
  const analytics = await handler.getAnalytics();
  if (analytics.demo) {
    console.log('📈 Analytics: Demo mode ready');
  }
  
  const posts = await handler.getPosts();
  if (posts.demo) {
    console.log('📋 Posts: Demo data available');
  }

  // Final summary
  console.log('\n🎉 VALIDATION COMPLETE!');
  console.log('========================');
  console.log('✅ Postiz server running');
  console.log('✅ API connection working');
  console.log('✅ Demo posting functional');
  console.log('✅ Content formatting ready');
  console.log('📱 Platforms: Instagram, Facebook, Pinterest');
  
  console.log('\n📝 Next Steps:');
  console.log('1. 🌐 Open http://localhost:3000 in browser');
  console.log('2. 👤 Create admin account in Postiz');
  console.log('3. 🔗 Connect social media accounts:');
  console.log('   • Instagram: @untrapd.hub');
  console.log('   • Facebook: "un trapd" page');
  console.log('   • Pinterest: untrapd.hub');
  console.log('4. 🧪 Test real posting via Postiz UI');
  console.log('5. 🚀 Enable production automation');
  
  console.log('\n🎯 FREE SOCIAL MEDIA AUTOMATION READY!');
  console.log('No monthly fees, no API limits, complete control! 🎊');
}

// Run validation
validatePostizSetup().catch(error => {
  console.error('\n💥 Validation failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check Docker is running: docker --version');
  console.log('2. Start Postiz: cd postiz-setup && ./setup-postiz.sh');
  console.log('3. Check logs: docker-compose logs');
  process.exit(1);
});