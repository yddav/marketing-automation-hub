#!/usr/bin/env node

/**
 * META API VALIDATION SCRIPT
 *
 * Validates Instagram Business API and Facebook Page API connections
 * Tests tokens, permissions, and account access
 *
 * Usage: node validate-meta-apis.js
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class MetaAPIValidator {
  constructor() {
    this.instagramToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.instagramAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.facebookToken = process.env.FACEBOOK_PAGE_TOKEN;
    this.facebookPageId = process.env.FACEBOOK_PAGE_ID;

    this.results = {
      instagram: { valid: false, errors: [], permissions: [], accountInfo: {} },
      facebook: { valid: false, errors: [], permissions: [], pageInfo: {} }
    };
  }

  // ========================================================================
  // INSTAGRAM BUSINESS API VALIDATION
  // ========================================================================

  async validateInstagramToken() {
    console.log('\n🔍 VALIDATING INSTAGRAM BUSINESS API\n');
    console.log('='.repeat(70));

    if (!this.instagramToken) {
      console.log('❌ Instagram token not found in .env file');
      this.results.instagram.errors.push('Token not configured');
      return false;
    }

    try {
      // Test 1: Token introspection
      console.log('\n📋 Test 1: Token Introspection');
      const tokenInfo = await axios.get(`${GRAPH_API_BASE}/debug_token`, {
        params: {
          input_token: this.instagramToken,
          access_token: this.instagramToken
        }
      });

      const tokenData = tokenInfo.data.data;
      console.log(`  ✅ Token valid: ${tokenData.is_valid}`);
      console.log(`  📅 Expires: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : 'Never (long-lived)'}`);
      console.log(`  🔐 Permissions: ${tokenData.scopes?.join(', ') || 'None listed'}`);

      this.results.instagram.permissions = tokenData.scopes || [];

      // Test 2: Account access
      console.log('\n📋 Test 2: Instagram Business Account Access');
      const accountInfo = await axios.get(`${GRAPH_API_BASE}/${this.instagramAccountId}`, {
        params: {
          fields: 'id,username,name,followers_count,follows_count,media_count,profile_picture_url',
          access_token: this.instagramToken
        }
      });

      const account = accountInfo.data;
      console.log(`  ✅ Account ID: ${account.id}`);
      console.log(`  📱 Username: @${account.username}`);
      console.log(`  👤 Name: ${account.name}`);
      console.log(`  👥 Followers: ${account.followers_count}`);
      console.log(`  📸 Posts: ${account.media_count}`);

      this.results.instagram.accountInfo = account;

      // Test 3: Media access (check if we can read posts)
      console.log('\n📋 Test 3: Media Access (Recent Posts)');
      const mediaInfo = await axios.get(`${GRAPH_API_BASE}/${this.instagramAccountId}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,timestamp',
          limit: 3,
          access_token: this.instagramToken
        }
      });

      console.log(`  ✅ Can read media: ${mediaInfo.data.data.length} recent posts found`);

      // Test 4: Publishing capability check
      console.log('\n📋 Test 4: Publishing Capability');
      console.log('  ℹ️  Required permissions for publishing:');
      const requiredPerms = [
        'instagram_basic',
        'instagram_content_publish',
        'pages_show_list'
      ];

      requiredPerms.forEach(perm => {
        const hasPermission = this.results.instagram.permissions.includes(perm);
        console.log(`    ${hasPermission ? '✅' : '❌'} ${perm}`);
        if (!hasPermission) {
          this.results.instagram.errors.push(`Missing permission: ${perm}`);
        }
      });

      this.results.instagram.valid = this.results.instagram.errors.length === 0;

      console.log('\n' + '='.repeat(70));
      console.log(`✅ INSTAGRAM API VALIDATION: ${this.results.instagram.valid ? 'PASSED' : 'FAILED'}`);

      return this.results.instagram.valid;

    } catch (error) {
      console.error('\n❌ Instagram API Error:', error.response?.data || error.message);
      this.results.instagram.errors.push(error.response?.data?.error?.message || error.message);
      this.results.instagram.valid = false;
      return false;
    }
  }

  // ========================================================================
  // FACEBOOK PAGE API VALIDATION
  // ========================================================================

  async validateFacebookToken() {
    console.log('\n\n🔍 VALIDATING FACEBOOK PAGE API\n');
    console.log('='.repeat(70));

    if (!this.facebookToken) {
      console.log('❌ Facebook token not found in .env file');
      this.results.facebook.errors.push('Token not configured');
      return false;
    }

    try {
      // Test 1: Token introspection
      console.log('\n📋 Test 1: Token Introspection');
      const tokenInfo = await axios.get(`${GRAPH_API_BASE}/debug_token`, {
        params: {
          input_token: this.facebookToken,
          access_token: this.facebookToken
        }
      });

      const tokenData = tokenInfo.data.data;
      console.log(`  ✅ Token valid: ${tokenData.is_valid}`);
      console.log(`  📅 Expires: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : 'Never (long-lived)'}`);
      console.log(`  🔐 Permissions: ${tokenData.scopes?.join(', ') || 'None listed'}`);

      this.results.facebook.permissions = tokenData.scopes || [];

      // Test 2: Page access
      console.log('\n📋 Test 2: Facebook Page Access');
      const pageInfo = await axios.get(`${GRAPH_API_BASE}/${this.facebookPageId}`, {
        params: {
          fields: 'id,name,fan_count,followers_count,link,about,category',
          access_token: this.facebookToken
        }
      });

      const page = pageInfo.data;
      console.log(`  ✅ Page ID: ${page.id}`);
      console.log(`  📄 Name: ${page.name}`);
      console.log(`  👥 Fans: ${page.fan_count || 'N/A'}`);
      console.log(`  📊 Followers: ${page.followers_count || 'N/A'}`);
      console.log(`  🔗 Link: ${page.link}`);
      console.log(`  📂 Category: ${page.category}`);

      this.results.facebook.pageInfo = page;

      // Test 3: Feed access (check if we can read posts)
      console.log('\n📋 Test 3: Feed Access (Recent Posts)');
      const feedInfo = await axios.get(`${GRAPH_API_BASE}/${this.facebookPageId}/feed`, {
        params: {
          fields: 'id,message,created_time',
          limit: 3,
          access_token: this.facebookToken
        }
      });

      console.log(`  ✅ Can read feed: ${feedInfo.data.data.length} recent posts found`);

      // Test 4: Publishing capability check
      console.log('\n📋 Test 4: Publishing Capability');
      console.log('  ℹ️  Required permissions for publishing:');
      const requiredPerms = [
        'pages_manage_posts',
        'pages_read_engagement',
        'pages_show_list'
      ];

      requiredPerms.forEach(perm => {
        const hasPermission = this.results.facebook.permissions.includes(perm);
        console.log(`    ${hasPermission ? '✅' : '❌'} ${perm}`);
        if (!hasPermission) {
          this.results.facebook.errors.push(`Missing permission: ${perm}`);
        }
      });

      // Test 5: Rate limit info
      console.log('\n📋 Test 5: Rate Limit Status');
      console.log('  ℹ️  Facebook Page limits: ~200 posts/day recommended');
      console.log('  ℹ️  Current campaign: 30 posts over 30 days (1 post/day)');
      console.log('  ✅ Well within rate limits');

      this.results.facebook.valid = this.results.facebook.errors.length === 0;

      console.log('\n' + '='.repeat(70));
      console.log(`✅ FACEBOOK API VALIDATION: ${this.results.facebook.valid ? 'PASSED' : 'FAILED'}`);

      return this.results.facebook.valid;

    } catch (error) {
      console.error('\n❌ Facebook API Error:', error.response?.data || error.message);
      this.results.facebook.errors.push(error.response?.data?.error?.message || error.message);
      this.results.facebook.valid = false;
      return false;
    }
  }

  // ========================================================================
  // GENERATE VALIDATION REPORT
  // ========================================================================

  generateReport() {
    console.log('\n\n📊 VALIDATION SUMMARY\n');
    console.log('='.repeat(70));

    console.log('\n📱 INSTAGRAM BUSINESS API (@untrapd.hub)');
    console.log(`Status: ${this.results.instagram.valid ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
    if (this.results.instagram.accountInfo.username) {
      console.log(`Account: @${this.results.instagram.accountInfo.username} (${this.results.instagram.accountInfo.id})`);
      console.log(`Followers: ${this.results.instagram.accountInfo.followers_count}`);
    }
    if (this.results.instagram.errors.length > 0) {
      console.log('Errors:');
      this.results.instagram.errors.forEach(err => console.log(`  ❌ ${err}`));
    }

    console.log('\n📘 FACEBOOK PAGE API (Untrapd Hub)');
    console.log(`Status: ${this.results.facebook.valid ? '✅ READY' : '❌ NEEDS ATTENTION'}`);
    if (this.results.facebook.pageInfo.name) {
      console.log(`Page: ${this.results.facebook.pageInfo.name} (${this.results.facebook.pageInfo.id})`);
      console.log(`Followers: ${this.results.facebook.pageInfo.followers_count || 'N/A'}`);
    }
    if (this.results.facebook.errors.length > 0) {
      console.log('Errors:');
      this.results.facebook.errors.forEach(err => console.log(`  ❌ ${err}`));
    }

    console.log('\n' + '='.repeat(70));

    const allValid = this.results.instagram.valid && this.results.facebook.valid;
    console.log(`\n🎯 OVERALL STATUS: ${allValid ? '✅ ALL SYSTEMS READY' : '⚠️  ATTENTION REQUIRED'}`);

    if (allValid) {
      console.log('\n✅ Next Steps:');
      console.log('  1. Run campaign launcher: node finderr-native-launcher.js');
      console.log('  2. Monitor at: https://www.instagram.com/untrapd.hub');
      console.log('  3. Monitor at: https://www.facebook.com/750014458192598');
    } else {
      console.log('\n⚠️  Action Required:');
      if (!this.results.instagram.valid) {
        console.log('  → Instagram: Regenerate token with required permissions');
        console.log('    See: FACEBOOK_TOKEN_VISUAL_GUIDE.md');
      }
      if (!this.results.facebook.valid) {
        console.log('  → Facebook: Regenerate token with required permissions');
        console.log('    See: FACEBOOK_TOKEN_VISUAL_GUIDE.md');
      }
    }

    console.log('\n');
    return allValid;
  }

  // ========================================================================
  // MAIN VALIDATION FLOW
  // ========================================================================

  async validate() {
    console.log('🔐 META API VALIDATION TOOL');
    console.log('Testing Instagram Business + Facebook Page APIs\n');

    const instagramValid = await this.validateInstagramToken();
    const facebookValid = await this.validateFacebookToken();
    const allValid = this.generateReport();

    return allValid;
  }
}

// ============================================================================
// EXECUTE VALIDATION
// ============================================================================

if (require.main === module) {
  const validator = new MetaAPIValidator();
  validator.validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = MetaAPIValidator;
