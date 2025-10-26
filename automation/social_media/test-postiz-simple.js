#!/usr/bin/env node

/**
 * SIMPLE POSTIZ TEST
 * 
 * Quick test of Postiz API without external dependencies
 */

const PostizAPIHandler = require('./postiz-api-handler.js');

async function testPostiz() {
  console.log('🧪 Testing Postiz API Handler...\n');

  try {
    // Initialize with demo mode
    const postiz = new PostizAPIHandler({ 
      demoMode: true,
      postizUrl: 'http://localhost:3000'
    });

    // Test 1: Validate connection
    console.log('1️⃣ Testing connection...');
    const connectionStatus = await postiz.validateConnection();
    console.log(`   Status: ${connectionStatus.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Message: ${connectionStatus.message}`);

    // Test 2: Test basic posting
    console.log('\n2️⃣ Testing basic post...');
    const testContent = {
      text: '🧪 Test post from UNTRAPD Hub! FINDERR keeps your phone secure. #Test #FINDERR #UNTRAPDHub'
    };
    
    const postResult = await postiz.post(testContent);
    console.log(`   Post: ${postResult.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Platforms: ${postResult.platforms?.join(', ') || 'N/A'}`);

    // Test 3: Test milestone posting
    console.log('\n3️⃣ Testing milestone post...');
    const milestoneResult = await postiz.postMilestone(500);
    console.log(`   Milestone: ${milestoneResult.success ? '✅ Success' : '❌ Failed'}`);

    // Test 4: Test daily theme posting
    console.log('\n4️⃣ Testing daily theme post...');
    const themeContent = {
      text: '🎯 Motivation Monday: Start your week secure with FINDERR!',
      mediaUrls: ['/home/wolfy/Downloads/untrapd_images/motivation_monday.jpg']
    };
    const themeResult = await postiz.postDailyTheme('motivation_monday', themeContent);
    console.log(`   Theme: ${themeResult.success ? '✅ Success' : '❌ Failed'}`);

    // Test 5: Server status check
    console.log('\n5️⃣ Testing server status...');
    const serverStatus = await postiz.getServerStatus();
    console.log(`   Server: ${serverStatus.running ? '✅ Running' : '❌ Not Running'}`);
    if (serverStatus.running) {
      console.log(`   Status: ${serverStatus.status}`);
    } else if (serverStatus.suggestion) {
      console.log(`   Suggestion: ${serverStatus.suggestion}`);
    }

    console.log('\n🎉 All tests completed!');
    
    return {
      connection: connectionStatus.success,
      posting: postResult.success,
      milestone: milestoneResult.success,
      theme: themeResult.success,
      server: serverStatus.running
    };

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return { error: error.message };
  }
}

// CLI execution
if (require.main === module) {
  testPostiz()
    .then((results) => {
      console.log('\n📊 TEST RESULTS:');
      console.log('================');
      
      if (results.error) {
        console.log(`❌ Error: ${results.error}`);
        process.exit(1);
      }

      const tests = ['connection', 'posting', 'milestone', 'theme', 'server'];
      const passed = tests.filter(test => results[test]).length;
      
      console.log(`✅ Passed: ${passed}/${tests.length}`);
      
      if (results.server && results.connection) {
        console.log('\n🚀 READY FOR NEXT STEPS:');
        console.log('1. Visit http://localhost:4200');
        console.log('2. Create admin account');
        console.log('3. Connect social media accounts');
        console.log('4. Replace Axiom with Postiz automation');
      } else {
        console.log('\n⚠️  Postiz server may need setup or restart');
      }
    })
    .catch((error) => {
      console.error(`❌ Test execution failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = testPostiz;