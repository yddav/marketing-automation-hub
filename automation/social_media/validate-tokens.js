#!/usr/bin/env node
/**
 * UNTRAPD Hub Token Validation Script
 * Tests API connections with real tokens
 */

require('dotenv').config({ path: '../../.env' });
const SocialMediaAPIHandler = require('./api-handler.js');

class TokenValidator {
  constructor() {
    this.apiHandler = new SocialMediaAPIHandler({ 
      demoMode: false,
      logger: console 
    });
    this.results = {
      instagram: { status: 'pending', error: null },
      facebook: { status: 'pending', error: null },
      tiktok: { status: 'pending', error: null },
      twitter: { status: 'pending', error: null }
    };
  }

  async validateInstagram() {
    console.log('🔍 Testing Instagram Business API...');
    
    try {
      // Test Instagram API connection
      const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}?fields=id,username,followers_count&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Instagram: Connected to @${data.username} (${data.followers_count} followers)`);
        this.results.instagram.status = 'success';
        this.results.instagram.data = data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Instagram: ${error.message}`);
      this.results.instagram.status = 'error';
      this.results.instagram.error = error.message;
    }
  }

  async validateFacebook() {
    console.log('🔍 Testing Facebook Page API...');
    
    try {
      // Test Facebook Page API connection
      const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.FACEBOOK_PAGE_ID}?fields=id,name,followers_count,verification_status&access_token=${process.env.FACEBOOK_PAGE_TOKEN}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Facebook: Connected to "${data.name}" (${data.followers_count || 0} followers)`);
        this.results.facebook.status = 'success';
        this.results.facebook.data = data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Facebook: ${error.message}`);
      this.results.facebook.status = 'error';
      this.results.facebook.error = error.message;
    }
  }

  async validateTikTok() {
    console.log('🔍 Testing TikTok Business API...');
    
    try {
      if (!process.env.TIKTOK_ACCESS_TOKEN) {
        throw new Error('TikTok Access Token not provided (requires OAuth flow)');
      }

      // Test TikTok API connection - User Info endpoint
      const response = await fetch('https://open.tiktokapis.com/v2/user/info/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'follower_count']
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ TikTok: Connected to ${data.data.display_name} (${data.data.follower_count || 0} followers)`);
        this.results.tiktok.status = 'success';
        this.results.tiktok.data = data.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ TikTok: ${error.message}`);
      this.results.tiktok.status = 'error';
      this.results.tiktok.error = error.message;
    }
  }

  async validateTwitter() {
    console.log('🔍 Testing Twitter API...');
    
    try {
      if (!process.env.TWITTER_BEARER_TOKEN) {
        throw new Error('Twitter Bearer Token not provided');
      }

      // Test Twitter API connection - Get user by username
      const response = await fetch('https://api.twitter.com/2/users/by/username/untrapd.hub?user.fields=public_metrics,verified', {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.data;
        console.log(`✅ Twitter: Connected to @${user.username} (${user.public_metrics.followers_count} followers)`);
        this.results.twitter.status = 'success';
        this.results.twitter.data = user;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Twitter: ${error.message}`);
      this.results.twitter.status = 'error';
      this.results.twitter.error = error.message;
    }
  }

  async validateAll() {
    console.log('🚀 UNTRAPD HUB API VALIDATION');
    console.log('='.repeat(50));
    console.log('Testing connections to all platforms...\n');

    // Run validations in parallel
    await Promise.all([
      this.validateInstagram(),
      this.validateFacebook(),
      this.validateTikTok(),
      this.validateTwitter()
    ]);

    this.printSummary();
    return this.getOverallStatus();
  }

  printSummary() {
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));

    const platforms = ['instagram', 'facebook', 'tiktok', 'twitter'];
    let successCount = 0;

    platforms.forEach(platform => {
      const result = this.results[platform];
      const emoji = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳';
      const name = platform.charAt(0).toUpperCase() + platform.slice(1);
      
      console.log(`${emoji} ${name}: ${result.status}`);
      
      if (result.status === 'success') {
        successCount++;
      } else if (result.status === 'error') {
        console.log(`    Error: ${result.error}`);
      }
    });

    console.log(`\n🎯 ${successCount}/${platforms.length} platforms connected successfully`);

    if (successCount === platforms.length) {
      console.log('\n🎉 ALL SYSTEMS GO! Ready to launch automation.');
    } else if (successCount >= 2) {
      console.log('\n⚡ Partial success - automation can start with connected platforms.');
    } else {
      console.log('\n⚠️  Need at least 2 platforms connected to start automation.');
    }
  }

  getOverallStatus() {
    const platforms = ['instagram', 'facebook', 'tiktok', 'twitter'];
    const successCount = platforms.filter(p => this.results[p].status === 'success').length;
    
    return {
      success: successCount >= 2,
      connectedCount: successCount,
      totalCount: platforms.length,
      results: this.results
    };
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new TokenValidator();
  validator.validateAll()
    .then(status => {
      process.exit(status.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = TokenValidator;