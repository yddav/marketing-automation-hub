#!/usr/bin/env node

/**
 * Postiz OAuth Setup Script
 * Configures social media providers and handles authentication
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class PostizOAuthSetup {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.frontendUrl = 'http://localhost:4200';
        this.authToken = null;
    }

    /**
     * Step 1: Fix the authentication by directly creating a valid session
     */
    async createValidSession() {
        console.log('🔐 Creating valid Postiz session...');
        
        // Since frontend login is broken, we'll use the registration endpoint with proper validation
        try {
            // First, let's check if we can register
            const registrationData = {
                email: 'admin@untrapd.hub',
                password: 'UNTRAPDHub2025!',
                company: 'UNTRAPD Hub'
            };

            console.log('📝 Attempting registration...');
            const registerResponse = await axios.post(`${this.baseUrl}/auth/register`, registrationData);
            console.log('✅ Registration successful');

            // Now try to login
            const loginResponse = await axios.post(`${this.baseUrl}/auth/login`, {
                email: registrationData.email,
                password: registrationData.password,
                provider: 'LOCAL'
            }, {
                withCredentials: true
            });

            const authCookie = loginResponse.headers['set-cookie']?.[0];
            if (authCookie) {
                this.authToken = authCookie.match(/auth=([^;]+)/)?.[1];
                console.log('✅ Authentication successful!');
                return true;
            }

        } catch (error) {
            if (error.response?.status === 409) {
                console.log('ℹ️  Account already exists, trying login...');
                
                // Try login directly
                try {
                    const loginResponse = await axios.post(`${this.baseUrl}/auth/login`, {
                        email: 'admin@untrapd.hub',
                        password: 'UNTRAPDHub2025!',
                        provider: 'LOCAL'
                    }, {
                        withCredentials: true
                    });

                    const authCookie = loginResponse.headers['set-cookie']?.[0];
                    if (authCookie) {
                        this.authToken = authCookie.match(/auth=([^;]+)/)?.[1];
                        console.log('✅ Login successful!');
                        return true;
                    }
                } catch (loginError) {
                    console.error('❌ Login failed:', loginError.response?.data);
                }
            } else {
                console.error('❌ Registration failed:', error.response?.data || error.message);
            }
        }

        return false;
    }

    /**
     * Step 2: Configure OAuth providers
     */
    async configureOAuthProviders() {
        console.log('\n🔧 OAuth Provider Configuration:');
        console.log('=====================================\n');

        // Read current docker-compose environment
        const dockerComposePath = path.join(__dirname, 'postiz-docker-compose.yml');
        let dockerCompose = '';
        
        try {
            dockerCompose = await fs.readFile(dockerComposePath, 'utf8');
        } catch (error) {
            console.log('⚠️  Docker compose file not found, will provide manual setup');
        }

        const oauthConfig = {
            instagram: {
                envVars: {
                    'INSTAGRAM_APP_ID': 'your_instagram_app_id',
                    'INSTAGRAM_APP_SECRET': 'your_instagram_app_secret'
                },
                redirectUri: `${this.frontendUrl}/integrations/social/instagram`,
                setup: [
                    '1. Go to https://developers.facebook.com/apps/',
                    '2. Create new app → Other → Business',
                    '3. Add Instagram Basic Display product',
                    '4. Set redirect URI: ' + `${this.frontendUrl}/integrations/social/instagram`,
                    '5. Request permissions: instagram_basic, pages_read_engagement, instagram_content_publish'
                ]
            },
            facebook: {
                envVars: {
                    'FACEBOOK_APP_ID': 'your_facebook_app_id',
                    'FACEBOOK_APP_SECRET': 'your_facebook_app_secret'
                },
                redirectUri: `${this.frontendUrl}/integrations/social/facebook`,
                setup: [
                    '1. Use same app as Instagram (recommended)',
                    '2. Add Facebook Login product',
                    '3. Set redirect URI: ' + `${this.frontendUrl}/integrations/social/facebook`,
                    '4. Request permissions: pages_show_list, pages_manage_posts, pages_read_engagement'
                ]
            },
            tiktok: {
                envVars: {
                    'TIKTOK_CLIENT_ID': 'your_tiktok_client_id',
                    'TIKTOK_CLIENT_SECRET': 'your_tiktok_client_secret'
                },
                redirectUri: `${this.frontendUrl}/integrations/social/tiktok`,
                setup: [
                    '1. Go to https://developers.tiktok.com/apps/',
                    '2. Create new app',
                    '3. Add Login Kit and Content Posting API',
                    '4. Enable Direct Post',
                    '5. Set redirect URI: ' + `${this.frontendUrl}/integrations/social/tiktok`,
                    '6. Note: Requires HTTPS in production'
                ]
            }
        };

        // Display configuration for each provider
        Object.entries(oauthConfig).forEach(([provider, config]) => {
            console.log(`📱 ${provider.toUpperCase()} Configuration:`);
            console.log('Environment Variables:');
            Object.entries(config.envVars).forEach(([key, value]) => {
                console.log(`   ${key}=${value}`);
            });
            console.log(`Redirect URI: ${config.redirectUri}`);
            console.log('Setup Steps:');
            config.setup.forEach(step => console.log(`   ${step}`));
            console.log('');
        });

        return oauthConfig;
    }

    /**
     * Step 3: Generate updated docker-compose with OAuth variables
     */
    async generateDockerCompose(oauthConfig) {
        console.log('🐳 Generating updated docker-compose.yml...\n');

        const dockerComposeContent = `version: '3.8'

services:
  postiz-db:
    image: postgres:15
    container_name: untrapd-postiz-db
    environment:
      POSTGRES_USER: postiz
      POSTGRES_PASSWORD: postiz_password
      POSTGRES_DB: postiz
    volumes:
      - postiz_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postiz"]
      interval: 10s
      timeout: 5s
      retries: 5

  postiz-redis:
    image: redis:7-alpine
    container_name: untrapd-postiz-redis
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  postiz:
    image: ghcr.io/gitroomhq/postiz-app:latest
    container_name: untrapd-postiz
    ports:
      - "3000:3000"
      - "4200:4200"
    environment:
      # Database Configuration
      DATABASE_URL: postgresql://postiz:postiz_password@untrapd-postiz-db:5432/postiz
      REDIS_URL: redis://untrapd-postiz-redis:6379
      
      # NextAuth Configuration
      NEXTAUTH_SECRET: THVT576Wl3Dm/4tpC8w0FuE+KLIZ5Ho1B85h7HxaiIk=
      NEXTAUTH_URL: http://localhost:4200
      
      # JWT Configuration
      JWT_SECRET: I4m1/eUqf6TBWgeN5sUTyUW6OPH0QBS3R8V21dXQr84=
      
      # Application URLs
      MAIN_URL: http://localhost:4200
      FRONTEND_URL: http://localhost:4200
      NEXT_PUBLIC_BACKEND_URL: http://localhost:3000
      BACKEND_INTERNAL_URL: http://localhost:3000
      
      # Storage Configuration
      STORAGE_PROVIDER: local
      UPLOAD_DIRECTORY: /app/uploads
      
      # Application Settings
      NODE_ENV: production
      NEXT_PUBLIC_VERSION: v2.2.5
      DISABLE_EMAIL: "true"
      
      # ===== OAUTH PROVIDER CONFIGURATION =====
      # Instagram (Standalone or Business)
      INSTAGRAM_APP_ID: "\${INSTAGRAM_APP_ID:-}"
      INSTAGRAM_APP_SECRET: "\${INSTAGRAM_APP_SECRET:-}"
      
      # Facebook (can use same app as Instagram)
      FACEBOOK_APP_ID: "\${FACEBOOK_APP_ID:-}"
      FACEBOOK_APP_SECRET: "\${FACEBOOK_APP_SECRET:-}"
      
      # TikTok
      TIKTOK_CLIENT_ID: "\${TIKTOK_CLIENT_ID:-}"
      TIKTOK_CLIENT_SECRET: "\${TIKTOK_CLIENT_SECRET:-}"
      
    depends_on:
      postiz-db:
        condition: service_healthy
      postiz-redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  postiz_db_data:`;

        const outputPath = path.join(__dirname, 'postiz-oauth-docker-compose.yml');
        await fs.writeFile(outputPath, dockerComposeContent);
        console.log(`✅ Updated docker-compose saved to: ${outputPath}`);

        // Generate .env template
        const envTemplate = `# UNTRAPD Hub Postiz OAuth Configuration
# Copy this to .env and fill in your actual values

# Instagram Configuration
# Get these from https://developers.facebook.com/apps/
INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here

# Facebook Configuration (can use same app as Instagram)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# TikTok Configuration
# Get these from https://developers.tiktok.com/apps/
TIKTOK_CLIENT_ID=your_tiktok_client_id_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here`;

        const envPath = path.join(__dirname, '.env.oauth.template');
        await fs.writeFile(envPath, envTemplate);
        console.log(`✅ Environment template saved to: ${envPath}`);

        return { dockerCompose: outputPath, envTemplate: envPath };
    }

    /**
     * Step 4: Test social media connections
     */
    async testSocialConnections() {
        if (!this.authToken) {
            console.log('❌ No authentication token - cannot test connections');
            return;
        }

        console.log('\n🧪 Testing Social Media Connections:');
        console.log('===================================\n');

        try {
            // Get available integrations
            const integrationsResponse = await axios.get(`${this.baseUrl}/integrations`, {
                headers: {
                    'Cookie': `auth=${this.authToken}`
                }
            });

            console.log('📱 Connected Channels:', integrationsResponse.data.length);
            
            if (integrationsResponse.data.length === 0) {
                console.log('⚠️  No channels connected yet.');
                console.log('\n🔗 To connect channels:');
                console.log('1. Configure OAuth environment variables');
                console.log('2. Restart Postiz containers');
                console.log('3. Visit http://localhost:4200/dashboard');
                console.log('4. Click "Add Channel" and select your platform');
                console.log('5. Complete OAuth authorization');
            } else {
                integrationsResponse.data.forEach((channel, index) => {
                    console.log(`${index + 1}. ${channel.name} (${channel.providerIdentifier})`);
                });
            }

        } catch (error) {
            console.error('❌ Failed to get integrations:', error.message);
        }
    }

    /**
     * Main setup flow
     */
    async setup() {
        console.log('🚀 UNTRAPD Hub Postiz OAuth Setup');
        console.log('==================================\n');

        // Step 1: Fix authentication
        const authenticated = await this.createValidSession();
        
        if (!authenticated) {
            console.log('\n❌ Authentication failed. Manual steps required:');
            console.log('1. Visit http://localhost:4200 and register manually');
            console.log('2. Note: Login form has a bug - provider field missing');
            console.log('3. After registration, login works via API');
            console.log('\nAlternatively, wait for the OAuth setup below and try again.');
        }

        // Step 2: Configure OAuth providers
        const oauthConfig = await this.configureOAuthProviders();

        // Step 3: Generate docker-compose
        const files = await this.generateDockerCompose(oauthConfig);

        // Step 4: Test connections
        await this.testSocialConnections();

        console.log('\n🎉 Setup Complete!');
        console.log('==================\n');

        console.log('📋 Next Steps:');
        console.log('1. Configure your OAuth apps (see instructions above)');
        console.log('2. Copy .env.oauth.template to .env and fill in values');
        console.log('3. Run: docker-compose -f postiz-oauth-docker-compose.yml up -d');
        console.log('4. Visit http://localhost:4200/dashboard to add channels');
        console.log('5. Use the postiz-api-client.js to schedule posts');

        console.log('\n💡 Tips:');
        console.log('- Instagram Standalone works with personal accounts');
        console.log('- Facebook can use the same app as Instagram');
        console.log('- TikTok requires HTTPS redirect URI in production');
        console.log('- All OAuth flows happen in the web interface');

        return {
            authenticated,
            oauthConfig,
            files
        };
    }
}

// Export for use in other scripts
module.exports = PostizOAuthSetup;

// Run if called directly
if (require.main === module) {
    const setup = new PostizOAuthSetup();
    setup.setup().catch(console.error);
}