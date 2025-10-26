#!/usr/bin/env node

/**
 * PAGE ACCESS TOKEN GENERATOR
 *
 * Gets Page Access Tokens which have more permissions than User tokens
 * Works with apps in Development Mode
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const currentToken = process.env.FACEBOOK_PAGE_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                    PAGE ACCESS TOKEN GENERATOR                         ║
╚════════════════════════════════════════════════════════════════════════╝

Using your current User Access Token to get Page-level tokens...

Page Access Tokens have FULL permissions to post on Pages and Instagram,
even when the app is in Development Mode!

`);

async function getPageTokens() {
  try {
    console.log('🔍 Fetching your Facebook Pages...\n');

    // Get list of pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: currentToken
      }
    });

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      console.log('❌ No Pages found with this token.\n');
      console.log('Make sure:');
      console.log('1. You are an admin of the Facebook Page');
      console.log('2. The Page ID is correct: 750014458192598\n');
      return;
    }

    console.log(`✅ Found ${pagesResponse.data.data.length} Page(s):\n`);

    let targetPage = null;

    for (const page of pagesResponse.data.data) {
      console.log(`📄 ${page.name} (ID: ${page.id})`);
      console.log(`   Access Token: ${page.access_token.substring(0, 30)}...`);
      console.log(`   Category: ${page.category || 'N/A'}`);
      console.log('');

      if (page.id === '750014458192598') {
        targetPage = page;
      }
    }

    if (!targetPage) {
      console.log('⚠️  Target Page (750014458192598) not found in your pages.');
      console.log('   Using the first page instead...\n');
      targetPage = pagesResponse.data.data[0];
    }

    console.log('🎯 Selected Page:');
    console.log(`   Name: ${targetPage.name}`);
    console.log(`   ID: ${targetPage.id}`);
    console.log('');

    // Check if Page has Instagram connected
    try {
      const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${targetPage.id}`, {
        params: {
          fields: 'instagram_business_account',
          access_token: targetPage.access_token
        }
      });

      if (igResponse.data.instagram_business_account) {
        console.log('✅ Instagram Business Account Connected:');
        console.log(`   ID: ${igResponse.data.instagram_business_account.id}`);
        console.log('');
      } else {
        console.log('⚠️  No Instagram Business Account connected to this Page.');
        console.log('   Facebook posts will work, but Instagram posts need IG connection.\n');
      }
    } catch (err) {
      console.log('⚠️  Could not check Instagram connection.');
      console.log('');
    }

    // Update .env file
    console.log('📝 Updating .env file with Page Access Token...\n');

    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    envContent = envContent.replace(
      /FACEBOOK_PAGE_TOKEN=.*/,
      `FACEBOOK_PAGE_TOKEN=${targetPage.access_token}`
    );

    envContent = envContent.replace(
      /INSTAGRAM_ACCESS_TOKEN=.*/,
      `INSTAGRAM_ACCESS_TOKEN=${targetPage.access_token}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Updated .env file:');
    console.log('   → FACEBOOK_PAGE_TOKEN');
    console.log('   → INSTAGRAM_ACCESS_TOKEN\n');

    console.log('🔧 NEXT STEPS:\n');
    console.log('1. Test posting with Page Access Token:');
    console.log('   node finderr-native-launcher.js day 1\n');
    console.log('2. If successful, launch campaign:');
    console.log('   node finderr-native-launcher.js launch\n');

    console.log('💡 Page Access Tokens can post to Facebook Pages and Instagram');
    console.log('   without requiring App Review or Advanced Access!\n');

  } catch (error) {
    console.error('❌ Error fetching pages:');
    console.error(`   ${error.response?.data?.error?.message || error.message}\n`);

    if (error.response?.data?.error?.code === 190) {
      console.error('Token is invalid. You need a valid User Access Token first.');
      console.error('Run this to get one:');
      console.error('   firefox "https://developers.facebook.com/tools/explorer/738653215879612/"\n');
      console.error('Then generate a token with just "pages_show_list" permission,');
      console.error('and run this script again.\n');
    }
  }
}

getPageTokens();
