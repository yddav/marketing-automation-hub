#!/usr/bin/env node
/**
 * UNTRAPD Hub Token Configuration Helper
 * Secure token configuration and validation
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class TokenConfigurator {
  constructor() {
    this.envPath = path.join(__dirname, '.env');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async promptToken(name, description, required = true) {
    return new Promise((resolve) => {
      const prompt = required ? 
        `🔑 Enter ${name} (${description}): ` :
        `🔑 Enter ${name} (${description}) [Optional]: `;
      
      this.rl.question(prompt, (answer) => {
        if (required && !answer.trim()) {
          console.log('❌ This token is required for the automation to work.');
          this.promptToken(name, description, required).then(resolve);
        } else {
          resolve(answer.trim());
        }
      });
    });
  }

  async updateEnvFile(tokenName, tokenValue) {
    let envContent = fs.readFileSync(this.envPath, 'utf8');
    
    // Find the line with the token placeholder
    const lines = envContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(`${tokenName}=`)) {
        lines[i] = `${tokenName}=${tokenValue}`;
        updated = true;
        break;
      }
    }
    
    if (updated) {
      fs.writeFileSync(this.envPath, lines.join('\n'));
      console.log(`✅ Updated ${tokenName}`);
    } else {
      console.log(`⚠️  Could not find ${tokenName} in .env file`);
    }
  }

  async configureMeta() {
    console.log('\n🔥 META (INSTAGRAM/FACEBOOK) API CONFIGURATION');
    console.log('='.repeat(50));
    
    const metaAppId = await this.promptToken(
      'INSTAGRAM_APP_ID', 
      'Meta App ID from developers.facebook.com'
    );
    await this.updateEnvFile('INSTAGRAM_APP_ID', metaAppId);
    await this.updateEnvFile('FACEBOOK_APP_ID', metaAppId); // Same for both
    
    const metaAppSecret = await this.promptToken(
      'INSTAGRAM_APP_SECRET',
      'Meta App Secret from developers.facebook.com'
    );
    await this.updateEnvFile('INSTAGRAM_APP_SECRET', metaAppSecret);
    await this.updateEnvFile('FACEBOOK_APP_SECRET', metaAppSecret); // Same for both
    
    const instagramToken = await this.promptToken(
      'INSTAGRAM_ACCESS_TOKEN',
      'Instagram User Access Token (long-lived)'
    );
    await this.updateEnvFile('INSTAGRAM_ACCESS_TOKEN', instagramToken);
    
    const facebookPageToken = await this.promptToken(
      'FACEBOOK_PAGE_TOKEN',
      'Facebook Page Access Token for Untrapd Hub page'
    );
    await this.updateEnvFile('FACEBOOK_PAGE_TOKEN', facebookPageToken);
    
    console.log('✅ Meta API tokens configured!');
  }

  async configureTikTok() {
    console.log('\n🎵 TIKTOK BUSINESS API CONFIGURATION');
    console.log('='.repeat(50));
    
    const clientKey = await this.promptToken(
      'TIKTOK_CLIENT_KEY',
      'TikTok Client Key from developers.tiktok.com'
    );
    await this.updateEnvFile('TIKTOK_CLIENT_KEY', clientKey);
    
    const clientSecret = await this.promptToken(
      'TIKTOK_CLIENT_SECRET',
      'TikTok Client Secret from developers.tiktok.com'
    );
    await this.updateEnvFile('TIKTOK_CLIENT_SECRET', clientSecret);
    
    const accessToken = await this.promptToken(
      'TIKTOK_ACCESS_TOKEN',
      'TikTok Access Token (from OAuth flow)',
      false
    );
    if (accessToken) {
      await this.updateEnvFile('TIKTOK_ACCESS_TOKEN', accessToken);
    }
    
    const refreshToken = await this.promptToken(
      'TIKTOK_REFRESH_TOKEN',
      'TikTok Refresh Token (from OAuth flow)',
      false
    );
    if (refreshToken) {
      await this.updateEnvFile('TIKTOK_REFRESH_TOKEN', refreshToken);
    }
    
    const openId = await this.promptToken(
      'TIKTOK_OPEN_ID',
      'TikTok Business Account Open ID',
      false
    );
    if (openId) {
      await this.updateEnvFile('TIKTOK_OPEN_ID', openId);
    }
    
    console.log('✅ TikTok API tokens configured!');
  }

  async configureTwitter() {
    console.log('\n🐦 TWITTER/X API CONFIGURATION');
    console.log('='.repeat(50));
    
    const apiKey = await this.promptToken(
      'TWITTER_API_KEY',
      'Twitter API Key from developer.twitter.com'
    );
    await this.updateEnvFile('TWITTER_API_KEY', apiKey);
    
    const apiSecret = await this.promptToken(
      'TWITTER_API_SECRET',
      'Twitter API Secret from developer.twitter.com'
    );
    await this.updateEnvFile('TWITTER_API_SECRET', apiSecret);
    
    const bearerToken = await this.promptToken(
      'TWITTER_BEARER_TOKEN',
      'Twitter Bearer Token from developer.twitter.com'
    );
    await this.updateEnvFile('TWITTER_BEARER_TOKEN', bearerToken);
    
    const accessToken = await this.promptToken(
      'TWITTER_ACCESS_TOKEN',
      'Twitter Access Token from developer.twitter.com'
    );
    await this.updateEnvFile('TWITTER_ACCESS_TOKEN', accessToken);
    
    const accessSecret = await this.promptToken(
      'TWITTER_ACCESS_TOKEN_SECRET',
      'Twitter Access Token Secret from developer.twitter.com'
    );
    await this.updateEnvFile('TWITTER_ACCESS_TOKEN_SECRET', accessSecret);
    
    console.log('✅ Twitter API tokens configured!');
  }

  async validateConfiguration() {
    console.log('\n🔍 VALIDATING CONFIGURATION');
    console.log('='.repeat(50));
    
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const requiredTokens = [
      'INSTAGRAM_APP_ID',
      'INSTAGRAM_APP_SECRET', 
      'INSTAGRAM_ACCESS_TOKEN',
      'FACEBOOK_PAGE_TOKEN',
      'TIKTOK_CLIENT_KEY',
      'TIKTOK_CLIENT_SECRET'
    ];
    
    let allConfigured = true;
    
    for (const token of requiredTokens) {
      const match = envContent.match(new RegExp(`${token}=(.+)`));
      if (!match || match[1].includes('your_') || match[1].includes('here')) {
        console.log(`❌ ${token} not configured`);
        allConfigured = false;
      } else {
        console.log(`✅ ${token} configured`);
      }
    }
    
    return allConfigured;
  }

  async run() {
    console.log('🚀 UNTRAPD HUB TOKEN CONFIGURATION');
    console.log('='.repeat(50));
    console.log('This script will help you configure API tokens for:');
    console.log('• Instagram Business API (@untrapd.hub)');
    console.log('• Facebook Page API (Untrapd Hub)');
    console.log('• TikTok Business API (@untrapd.hub)');
    console.log('• Twitter API (@untrapd.hub)');
    console.log('');
    
    // Configure Meta first
    await this.configureMeta();
    
    // Configure TikTok second
    await this.configureTikTok();
    
    // Ask if they want to configure Twitter now
    const configureTwitterNow = await new Promise((resolve) => {
      this.rl.question('\n🐦 Configure Twitter API now? (y/n): ', (answer) => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
    
    if (configureTwitterNow) {
      await this.configureTwitter();
    } else {
      console.log('⏭️  Skipping Twitter configuration (you can add it later)');
    }
    
    // Validate configuration
    const isValid = await this.validateConfiguration();
    
    if (isValid) {
      console.log('\n🎉 CONFIGURATION COMPLETE!');
      console.log('Your automation system is ready to launch.');
      console.log('');
      console.log('Next steps:');
      console.log('1. npm run validate    # Test API connections');
      console.log('2. npm start          # Launch automation');
      console.log('3. npm run status     # Monitor performance');
    } else {
      console.log('\n⚠️  CONFIGURATION INCOMPLETE');
      console.log('Please run this script again to complete missing tokens.');
    }
    
    this.rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  const configurator = new TokenConfigurator();
  configurator.run().catch(console.error);
}

module.exports = TokenConfigurator;