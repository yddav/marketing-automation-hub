#!/usr/bin/env node

/**
 * Working Postiz API Client
 * Based on discovered endpoints and OAuth configuration
 */

const axios = require('axios');

class PostizClient {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.frontendUrl = 'http://localhost:4200';
        this.authToken = null;
    }

    /**
     * Authenticate and get session token
     */
    async authenticate() {
        try {
            console.log('🔐 Authenticating with Postiz...');
            
            const loginResponse = await axios.post(`${this.baseUrl}/auth/login`, {
                email: 'admin@untrapd.hub',
                password: 'UNTRAPDHub2025!',
                provider: 'LOCAL'
            }, {
                withCredentials: true
            });

            const authCookie = loginResponse.headers['set-cookie']?.[0];
            this.authToken = authCookie?.match(/auth=([^;]+)/)?.[1];
            
            if (this.authToken) {
                console.log('✅ Authentication successful');
                return true;
            } else {
                console.log('❌ No auth token received');
                return false;
            }
        } catch (error) {
            console.error('❌ Authentication failed:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Get request headers with authentication
     */
    getHeaders() {
        return {
            'Cookie': `auth=${this.authToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get connected social media integrations
     */
    async getIntegrations() {
        try {
            console.log('📱 Fetching connected integrations...');
            
            const response = await axios.get(`${this.baseUrl}/integrations`, {
                headers: this.getHeaders()
            });
            
            console.log(`Found ${response.data.length || 0} connected channels`);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get integrations:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Get posts with date range
     */
    async getPosts(startDate = null, endDate = null) {
        try {
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
            const end = endDate || new Date().toISOString(); // now
            
            console.log(`📝 Fetching posts from ${start.split('T')[0]} to ${end.split('T')[0]}...`);
            
            const response = await axios.get(`${this.baseUrl}/posts`, {
                headers: this.getHeaders(),
                params: {
                    startDate: start,
                    endDate: end
                }
            });
            
            console.log(`Found ${response.data.length || 0} posts`);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get posts:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Create a new post
     */
    async createPost(content, integrationIds = [], scheduleDate = null, images = []) {
        try {
            console.log('📝 Creating new post...');
            
            const postData = {
                content,
                integrations: integrationIds,
                publishDate: scheduleDate || new Date().toISOString(),
                images
            };
            
            const response = await axios.post(`${this.baseUrl}/posts`, postData, {
                headers: this.getHeaders()
            });
            
            console.log('✅ Post created successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to create post:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Upload an image
     */
    async uploadImage(imagePath) {
        try {
            console.log('📸 Uploading image...');
            
            const FormData = require('form-data');
            const fs = require('fs');
            const form = new FormData();
            
            form.append('file', fs.createReadStream(imagePath));
            
            const response = await axios.post(`${this.baseUrl}/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    'Cookie': `auth=${this.authToken}`
                }
            });
            
            console.log('✅ Image uploaded successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to upload image:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Get OAuth URL for adding a new integration
     */
    getOAuthUrls() {
        return {
            instagram: `${this.frontendUrl}/integrations/social/instagram`,
            facebook: `${this.frontendUrl}/integrations/social/facebook`, 
            tiktok: `${this.frontendUrl}/integrations/social/tiktok`
        };
    }

    /**
     * Display setup instructions for OAuth
     */
    showOAuthSetup() {
        console.log('\n🔗 OAuth Setup Instructions:');
        console.log('============================\n');

        console.log('📱 To connect social media accounts:');
        console.log('1. Configure OAuth apps (see postiz-oauth-setup.js)');
        console.log('2. Set environment variables in docker-compose');
        console.log('3. Restart Postiz containers');
        console.log('4. Visit these URLs to connect accounts:\n');

        const urls = this.getOAuthUrls();
        Object.entries(urls).forEach(([platform, url]) => {
            console.log(`   ${platform.toUpperCase()}: ${url}`);
        });

        console.log('\n💡 OAuth Environment Variables Needed:');
        console.log('   INSTAGRAM_APP_ID & INSTAGRAM_APP_SECRET');
        console.log('   FACEBOOK_APP_ID & FACEBOOK_APP_SECRET');
        console.log('   TIKTOK_CLIENT_ID & TIKTOK_CLIENT_SECRET');
    }
}

/**
 * Main demonstration
 */
async function main() {
    console.log('🚀 UNTRAPD Hub Postiz Integration Test');
    console.log('======================================\n');

    const client = new PostizClient();
    
    // Step 1: Authenticate
    const authenticated = await client.authenticate();
    if (!authenticated) {
        console.log('❌ Cannot proceed without authentication');
        return;
    }

    // Step 2: Check integrations
    const integrations = await client.getIntegrations();
    const integrationArray = Array.isArray(integrations) ? integrations : [];
    
    if (integrationArray.length === 0) {
        console.log('\n⚠️  No social media accounts connected');
        client.showOAuthSetup();
        
        console.log('\n📋 After setting up OAuth:');
        console.log('1. Social accounts will appear in integrations list');
        console.log('2. You can create and schedule posts');
        console.log('3. Run this script again to test posting');
        return;
    }

    // Step 3: Show connected accounts
    console.log('\n✅ Connected Accounts:');
    integrationArray.forEach((integration, index) => {
        console.log(`${index + 1}. ${integration.name} (${integration.providerIdentifier})`);
    });

    // Step 4: Test posting (if accounts are connected)
    console.log('\n🧪 Testing post creation...');
    
    const testContent = '🚀 Test post from UNTRAPD Hub automation! #UNTRAPDHub #TestPost';
    const integrationIds = integrationArray.map(i => i.id);
    
    // Schedule for 5 minutes from now
    const scheduleDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const post = await client.createPost(testContent, integrationIds, scheduleDate);
    
    if (post) {
        console.log('✅ Test post scheduled successfully!');
        console.log(`Scheduled for: ${scheduleDate}`);
    }

    // Step 5: Get existing posts
    const posts = await client.getPosts();
    console.log(`\n📊 Total posts in system: ${posts.length}`);

    console.log('\n🎉 Integration test complete!');
    console.log('============================\n');

    console.log('💡 Next steps:');
    console.log('1. Connect social media accounts via OAuth');
    console.log('2. Use this client for automated posting');
    console.log('3. Schedule content using UNTRAPD Hub templates');
}

// Export for use in other scripts
module.exports = PostizClient;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}