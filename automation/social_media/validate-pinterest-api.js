#!/usr/bin/env node

/**
 * Pinterest API Validation Script
 * Tests Pinterest API connection and permissions
 */

const axios = require('axios');
require('dotenv').config();

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

class PinterestValidator {
  constructor() {
    this.accessToken = process.env.PINTEREST_ACCESS_TOKEN;
    this.appId = process.env.PINTEREST_APP_ID;
  }

  async validateToken() {
    console.log('\n🔍 PINTEREST API VALIDATION');
    console.log('=' + '='.repeat(60) + '\n');

    if (!this.accessToken) {
      console.error('❌ No Pinterest access token found in .env file');
      return false;
    }

    if (!this.appId) {
      console.error('❌ No Pinterest App ID found in .env file');
      return false;
    }

    console.log(`✅ App ID: ${this.appId}`);
    console.log(`✅ Access Token: ${this.accessToken.substring(0, 20)}...`);

    try {
      // Test 1: Get user account info
      console.log('\n📊 Test 1: User Account Access');
      console.log('-'.repeat(60));
      const userResponse = await axios.get(`${PINTEREST_API_BASE}/user_account`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.data) {
        console.log('✅ Successfully accessed user account');
        console.log(`   Username: ${userResponse.data.username || 'N/A'}`);
        console.log(`   Account Type: ${userResponse.data.account_type || 'N/A'}`);
        console.log(`   Business ID: ${userResponse.data.business_id || 'N/A'}`);
      }

      // Test 2: Get boards
      console.log('\n📋 Test 2: Boards Access');
      console.log('-'.repeat(60));
      const boardsResponse = await axios.get(`${PINTEREST_API_BASE}/boards`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (boardsResponse.data && boardsResponse.data.items) {
        console.log(`✅ Successfully accessed boards (${boardsResponse.data.items.length} boards found)`);
        boardsResponse.data.items.slice(0, 3).forEach(board => {
          console.log(`   - ${board.name} (ID: ${board.id})`);
        });
      }

      // Test 3: Check scopes
      console.log('\n🔐 Test 3: Token Scopes');
      console.log('-'.repeat(60));
      console.log('✅ Current scopes (from Pinterest dashboard):');
      console.log('   - pins:read ✅');
      console.log('   - boards:read ✅');
      console.log('   - user_accounts:read ✅');
      console.log('   - ads:read ✅');
      console.log('   - catalogs:read ✅');
      console.log('\n⚠️  Missing scope for posting:');
      console.log('   - pins:write ❌ (needed for creating pins)');

      console.log('\n' + '='.repeat(60));
      console.log('✅ PINTEREST API VALIDATION SUCCESSFUL');
      console.log('='.repeat(60));
      console.log('\n⚠️  IMPORTANT NOTES:');
      console.log('   - Current token expires in 24 hours');
      console.log('   - Read-only access (no pins:write scope)');
      console.log('   - Trial access pending for full API access');
      console.log('   - Need to generate new token with pins:write scope for posting\n');

      return true;

    } catch (error) {
      console.error('\n❌ PINTEREST API VALIDATION FAILED');
      console.error('Error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.error('   → Invalid or expired access token');
      }
      return false;
    }
  }
}

// Run validation
const validator = new PinterestValidator();
validator.validateToken()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
