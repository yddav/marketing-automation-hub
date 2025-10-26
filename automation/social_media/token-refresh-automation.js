#!/usr/bin/env node

/**
 * 🔄 AUTOMATED TOKEN REFRESH SYSTEM
 *
 * Handles automatic token refresh for all social media platforms
 * Prevents campaign interruptions from expired tokens
 *
 * Features:
 * - Meta (Instagram/Facebook) long-lived token exchange
 * - Twitter OAuth 2.0 token refresh
 * - TikTok refresh token handling
 * - Pinterest token management
 * - Automatic .env file updates
 * - Expiration monitoring and alerts
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

class TokenRefreshAutomation {
  constructor(options = {}) {
    this.envPath = options.envPath || path.join(__dirname, '.env');
    this.logger = options.logger || console;
    this.tokens = {};
    this.expirationDates = {};
  }

  // ============================
  // META (INSTAGRAM/FACEBOOK) TOKEN REFRESH
  // ============================

  /**
   * Exchange short-lived Meta token for long-lived token (60 days)
   * @param {string} shortLivedToken - Token from Graph API Explorer
   * @returns {Promise<Object>} Long-lived token and expiration
   */
  async exchangeMetaToken(shortLivedToken) {
    this.logger.log('🔄 Exchanging Meta short-lived token for long-lived token...');

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('META_APP_ID and META_APP_SECRET required in .env file');
    }

    const url = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortLivedToken}`;

    try {
      const response = await this.httpsRequest(url);
      const data = JSON.parse(response);

      if (data.access_token) {
        const expiresInDays = Math.floor(data.expires_in / 86400);
        const expirationDate = new Date(Date.now() + data.expires_in * 1000);

        this.logger.log(`✅ Long-lived token obtained! Valid for ${expiresInDays} days`);
        this.logger.log(`📅 Expires: ${expirationDate.toLocaleDateString()}`);

        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          expirationDate: expirationDate.toISOString()
        };
      } else {
        throw new Error('No access_token in response');
      }
    } catch (error) {
      this.logger.error('❌ Meta token exchange failed:', error.message);
      throw error;
    }
  }

  /**
   * Get Instagram Business Account ID from Meta token
   */
  async getInstagramBusinessAccountId(accessToken) {
    this.logger.log('🔍 Fetching Instagram Business Account ID...');

    try {
      // First get Facebook Page ID
      const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`;
      const pagesResponse = await this.httpsRequest(pagesUrl);
      const pagesData = JSON.parse(pagesResponse);

      if (!pagesData.data || pagesData.data.length === 0) {
        throw new Error('No Facebook pages found. Create a Facebook page first.');
      }

      const pageId = pagesData.data[0].id;
      this.logger.log(`✅ Facebook Page ID: ${pageId}`);

      // Get Instagram Business Account linked to page
      const igUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`;
      const igResponse = await this.httpsRequest(igUrl);
      const igData = JSON.parse(igResponse);

      if (igData.instagram_business_account) {
        const igId = igData.instagram_business_account.id;
        this.logger.log(`✅ Instagram Business Account ID: ${igId}`);
        return { pageId, instagramBusinessAccountId: igId };
      } else {
        throw new Error('No Instagram Business Account linked to Facebook page');
      }
    } catch (error) {
      this.logger.error('❌ Failed to get Instagram Business Account ID:', error.message);
      throw error;
    }
  }

  // ============================
  // TWITTER TOKEN REFRESH
  // ============================

  /**
   * Refresh Twitter OAuth 2.0 access token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<Object>} New access token and refresh token
   */
  async refreshTwitterToken(refreshToken) {
    this.logger.log('🔄 Refreshing Twitter access token...');

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.warn('⚠️  Twitter OAuth 2.0 credentials not found. Using OAuth 1.0a tokens.');
      return null;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const postData = `grant_type=refresh_token&refresh_token=${refreshToken}`;

    const options = {
      hostname: 'api.twitter.com',
      path: '/2/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    try {
      const response = await this.httpsPost(options, postData);
      const data = JSON.parse(response);

      if (data.access_token) {
        this.logger.log('✅ Twitter token refreshed successfully!');
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in
        };
      } else {
        throw new Error('No access_token in response');
      }
    } catch (error) {
      this.logger.error('❌ Twitter token refresh failed:', error.message);
      throw error;
    }
  }

  // ============================
  // TIKTOK TOKEN REFRESH
  // ============================

  /**
   * Refresh TikTok access token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<Object>} New access token and refresh token
   */
  async refreshTikTokToken(refreshToken) {
    this.logger.log('🔄 Refreshing TikTok access token...');

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      throw new Error('TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET required');
    }

    const postData = JSON.stringify({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const options = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/oauth/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    try {
      const response = await this.httpsPost(options, postData);
      const data = JSON.parse(response);

      if (data.data && data.data.access_token) {
        this.logger.log('✅ TikTok token refreshed successfully!');
        return {
          accessToken: data.data.access_token,
          refreshToken: data.data.refresh_token,
          expiresIn: data.data.expires_in
        };
      } else {
        throw new Error('No access_token in response');
      }
    } catch (error) {
      this.logger.error('❌ TikTok token refresh failed:', error.message);
      throw error;
    }
  }

  // ============================
  // PINTEREST TOKEN REFRESH
  // ============================

  /**
   * Refresh Pinterest access token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshPinterestToken(refreshToken) {
    this.logger.log('🔄 Refreshing Pinterest access token...');

    const appId = process.env.PINTEREST_APP_ID;
    const appSecret = process.env.PINTEREST_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('PINTEREST_APP_ID and PINTEREST_APP_SECRET required');
    }

    const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    const postData = `grant_type=refresh_token&refresh_token=${refreshToken}`;

    const options = {
      hostname: 'api.pinterest.com',
      path: '/v5/oauth/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    try {
      const response = await this.httpsPost(options, postData);
      const data = JSON.parse(response);

      if (data.access_token) {
        this.logger.log('✅ Pinterest token refreshed successfully!');
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresIn: data.expires_in
        };
      } else {
        throw new Error('No access_token in response');
      }
    } catch (error) {
      this.logger.error('❌ Pinterest token refresh failed:', error.message);
      throw error;
    }
  }

  // ============================
  // TOKEN MONITORING
  // ============================

  /**
   * Check all token expiration dates and alert if expiring soon
   */
  async checkTokenExpirations() {
    this.logger.log('🔍 Checking token expiration dates...');

    const warnings = [];
    const now = new Date();

    // Load current .env
    await this.loadEnv();

    // Check Meta token (if expiration date is stored)
    if (process.env.META_TOKEN_EXPIRES) {
      const metaExpires = new Date(process.env.META_TOKEN_EXPIRES);
      const daysUntilExpiry = Math.floor((metaExpires - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 7) {
        warnings.push(`⚠️  Meta token expires in ${daysUntilExpiry} days! Refresh needed.`);
      } else {
        this.logger.log(`✅ Meta token valid for ${daysUntilExpiry} more days`);
      }
    }

    // Check TikTok token
    if (process.env.TIKTOK_TOKEN_EXPIRES) {
      const tiktokExpires = new Date(process.env.TIKTOK_TOKEN_EXPIRES);
      const daysUntilExpiry = Math.floor((tiktokExpires - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 7) {
        warnings.push(`⚠️  TikTok token expires in ${daysUntilExpiry} days! Refresh needed.`);
      } else {
        this.logger.log(`✅ TikTok token valid for ${daysUntilExpiry} more days`);
      }
    }

    // Display warnings
    if (warnings.length > 0) {
      this.logger.warn('\n' + warnings.join('\n'));
      return warnings;
    }

    this.logger.log('✅ All tokens are valid!');
    return [];
  }

  // ============================
  // ENV FILE MANAGEMENT
  // ============================

  /**
   * Load current .env file
   */
  async loadEnv() {
    try {
      const envContent = await fs.readFile(this.envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          process.env[match[1]] = match[2];
        }
      });
    } catch (error) {
      this.logger.error('❌ Failed to load .env file:', error.message);
      throw error;
    }
  }

  /**
   * Update .env file with new tokens
   */
  async updateEnvFile(updates) {
    this.logger.log('💾 Updating .env file with new tokens...');

    try {
      let envContent = await fs.readFile(this.envPath, 'utf8');

      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      }

      await fs.writeFile(this.envPath, envContent);
      this.logger.log('✅ .env file updated successfully!');
    } catch (error) {
      this.logger.error('❌ Failed to update .env file:', error.message);
      throw error;
    }
  }

  // ============================
  // INTERACTIVE SETUP
  // ============================

  /**
   * Interactive guided setup for refreshing all tokens
   */
  async interactiveSetup() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  🔄 SOCIAL MEDIA TOKEN REFRESH - INTERACTIVE SETUP   ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('This wizard will help you refresh all your social media tokens.\n');

    // Meta (Instagram/Facebook) setup
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 STEP 1: META (INSTAGRAM/FACEBOOK) TOKEN REFRESH');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
    console.log('2. Select your app from dropdown');
    console.log('3. Click "Generate Access Token"');
    console.log('4. Select permissions:');
    console.log('   • instagram_basic');
    console.log('   • instagram_content_publish');
    console.log('   • pages_show_list');
    console.log('   • pages_read_engagement');
    console.log('   • pages_manage_posts');
    console.log('5. Copy the generated token\n');

    console.log('📝 Paste your short-lived token here (or press Enter to skip):');
    console.log('   Then run: node token-refresh-automation.js --meta-token YOUR_TOKEN\n');

    // Twitter setup
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🐦 STEP 2: TWITTER TOKEN SETUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1. Go to: https://developer.twitter.com/en/portal/dashboard');
    console.log('2. Select your app: "1979161952715722752DavisUntrap"');
    console.log('3. Verify settings:');
    console.log('   • Access level: Elevated (not Essential)');
    console.log('   • App permissions: Read and Write');
    console.log('4. If needed, request Elevated access (takes 1-3 days)\n');

    console.log('✅ Your current Twitter OAuth 1.0a tokens should work.');
    console.log('   No refresh needed for OAuth 1.0a!\n');

    // TikTok setup
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎵 STEP 3: TIKTOK TOKEN (PENDING APPROVAL)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⏳ Your TikTok API is pending approval.');
    console.log('   You\'ll receive access token after approval (7-30 days).\n');

    // Pinterest setup
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 STEP 4: PINTEREST TOKEN SETUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 See PINTEREST_API_SETUP_GUIDE.md for detailed instructions.\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 QUICK START COMMANDS:\n');
    console.log('   # Refresh Meta token:');
    console.log('   node token-refresh-automation.js --meta-token YOUR_TOKEN\n');
    console.log('   # Check token expirations:');
    console.log('   node token-refresh-automation.js --check\n');
    console.log('   # Auto-refresh all tokens:');
    console.log('   node token-refresh-automation.js --auto-refresh\n');
  }

  // ============================
  // UTILITY METHODS
  // ============================

  httpsRequest(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  httpsPost(options, postData) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

// ============================
// CLI INTERFACE
// ============================

if (require.main === module) {
  const args = process.argv.slice(2);
  const refresher = new TokenRefreshAutomation();

  (async () => {
    if (args.includes('--help')) {
      console.log(`
🔄 TOKEN REFRESH AUTOMATION

Usage:
  node token-refresh-automation.js [options]

Options:
  --interactive         Interactive guided setup
  --meta-token TOKEN    Refresh Meta (Instagram/Facebook) token
  --check               Check token expiration dates
  --auto-refresh        Automatically refresh expiring tokens
  --help                Show this help message

Examples:
  # Interactive setup
  node token-refresh-automation.js --interactive

  # Refresh Meta token
  node token-refresh-automation.js --meta-token YOUR_SHORT_LIVED_TOKEN

  # Check token status
  node token-refresh-automation.js --check
      `);
      return;
    }

    if (args.includes('--interactive')) {
      await refresher.interactiveSetup();
      return;
    }

    if (args.includes('--check')) {
      await refresher.checkTokenExpirations();
      return;
    }

    const metaTokenIndex = args.indexOf('--meta-token');
    if (metaTokenIndex !== -1 && args[metaTokenIndex + 1]) {
      const shortToken = args[metaTokenIndex + 1];
      const result = await refresher.exchangeMetaToken(shortToken);
      const accounts = await refresher.getInstagramBusinessAccountId(result.accessToken);

      await refresher.updateEnvFile({
        'INSTAGRAM_ACCESS_TOKEN': result.accessToken,
        'FACEBOOK_PAGE_TOKEN': result.accessToken,
        'INSTAGRAM_BUSINESS_ACCOUNT_ID': accounts.instagramBusinessAccountId,
        'FACEBOOK_PAGE_ID': accounts.pageId,
        'META_TOKEN_EXPIRES': result.expirationDate
      });

      console.log('\n✅ Meta tokens updated successfully!');
      console.log('🚀 You can now run your automation campaign!');
      return;
    }

    // Default: show interactive setup
    await refresher.interactiveSetup();
  })().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = TokenRefreshAutomation;
