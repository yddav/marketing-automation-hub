#!/usr/bin/env node

/**
 * Postiz API Client for UNTRAPD Hub
 * API-only approach to bypass frontend authentication issues
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class PostizAPIClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:3000';
        this.publicApiUrl = `${this.baseUrl}/public/v1`;
        this.authToken = null;
        this.apiKey = null;
    }

    /**
     * Authenticate using email/password
     * Note: This uses internal API, not public API
     */
    async authenticate(email, password) {
        try {
            console.log('🔐 Authenticating with Postiz...');
            const response = await axios.post(`${this.baseUrl}/auth/login`, {
                email,
                password,
                provider: 'LOCAL'
            }, {
                withCredentials: true
            });

            // Extract token from cookie
            const setCookie = response.headers['set-cookie']?.[0];
            if (setCookie) {
                this.authToken = setCookie.match(/auth=([^;]+)/)?.[1];
                console.log('✅ Authentication successful');
                return true;
            }
            console.error('❌ No auth cookie received');
            return false;
        } catch (error) {
            console.error('❌ Authentication failed:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Get user profile
     */
    async getProfile() {
        try {
            const response = await axios.get(`${this.baseUrl}/auth/me`, {
                headers: {
                    'Cookie': `auth=${this.authToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get profile:', error.message);
            return null;
        }
    }

    /**
     * Get all connected social media channels
     */
    async getChannels() {
        try {
            console.log('📱 Fetching connected channels...');
            const response = await axios.get(`${this.baseUrl}/integrations`, {
                headers: {
                    'Cookie': `auth=${this.authToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get channels:', error.message);
            return [];
        }
    }

    /**
     * Connect a new social media channel
     * Note: This is complex as it requires OAuth flow
     */
    async connectChannel(platform, credentials) {
        console.log(`🔗 Connecting ${platform} channel...`);
        // Platform-specific connection logic would go here
        // This typically requires OAuth redirect flow which is hard to do via API
        console.log('⚠️  Channel connection requires OAuth flow - use web UI or manual setup');
        return null;
    }

    /**
     * Upload an image for posting
     */
    async uploadImage(imagePath) {
        try {
            console.log('📸 Uploading image...');
            const FormData = require('form-data');
            const form = new FormData();
            
            const imageBuffer = await fs.readFile(imagePath);
            form.append('file', imageBuffer, path.basename(imagePath));

            const response = await axios.post(`${this.baseUrl}/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    'Cookie': `auth=${this.authToken}`
                }
            });

            console.log('✅ Image uploaded successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to upload image:', error.message);
            return null;
        }
    }

    /**
     * Create a scheduled post
     */
    async createPost(content, channelIds, scheduleDate = null, images = []) {
        try {
            console.log('📝 Creating post...');
            
            const postData = {
                type: scheduleDate ? 'schedule' : 'now',
                date: scheduleDate || new Date().toISOString(),
                posts: channelIds.map(channelId => ({
                    integration: {
                        id: channelId
                    },
                    value: [{
                        content: content,
                        image: images
                    }]
                }))
            };

            const response = await axios.post(`${this.baseUrl}/posts`, postData, {
                headers: {
                    'Cookie': `auth=${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Post created successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to create post:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Get all scheduled posts
     */
    async getScheduledPosts() {
        try {
            console.log('📅 Fetching scheduled posts...');
            const response = await axios.get(`${this.baseUrl}/posts?status=scheduled`, {
                headers: {
                    'Cookie': `auth=${this.authToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get posts:', error.message);
            return [];
        }
    }

    /**
     * Delete a post
     */
    async deletePost(postId) {
        try {
            console.log(`🗑️ Deleting post ${postId}...`);
            const response = await axios.delete(`${this.baseUrl}/posts/${postId}`, {
                headers: {
                    'Cookie': `auth=${this.authToken}`
                }
            });
            console.log('✅ Post deleted successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to delete post:', error.message);
            return false;
        }
    }

    /**
     * Get analytics for a channel
     */
    async getAnalytics(channelId, startDate, endDate) {
        try {
            console.log(`📊 Fetching analytics for channel ${channelId}...`);
            const params = new URLSearchParams({
                channel: channelId,
                start: startDate,
                end: endDate
            });

            const response = await axios.get(`${this.baseUrl}/analytics?${params}`, {
                headers: {
                    'Cookie': `auth=${this.authToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get analytics:', error.message);
            return null;
        }
    }
}

// Example usage
async function main() {
    const client = new PostizAPIClient();
    
    // Try to authenticate with the admin account
    const authenticated = await client.authenticate('admin@untrapd.hub', 'UNTRAPDHub2025!');
    
    if (!authenticated) {
        console.log('\n🔧 Authentication failed. Trying to create account first...');
        // Account creation would need to be done via database or registration endpoint
        return;
    }

    // Get user profile
    const profile = await client.getProfile();
    if (profile) {
        console.log('\n👤 User Profile:', JSON.stringify(profile, null, 2));
    }

    // Get connected channels
    const channels = await client.getChannels();
    console.log('\n📱 Connected Channels:', channels.length);
    
    if (channels.length === 0) {
        console.log('\n⚠️  No channels connected. Please connect social media accounts.');
        console.log('This typically requires using the web UI for OAuth authentication.');
        console.log('\nTo connect accounts programmatically, you would need to:');
        console.log('1. Implement OAuth flow for each platform');
        console.log('2. Store access tokens securely');
        console.log('3. Register them with Postiz');
        return;
    }

    // Example: Create a test post
    const testContent = "🚀 Testing UNTRAPD Hub automated posting via Postiz API!";
    const channelIds = channels.map(ch => ch.id);
    
    // Schedule for 5 minutes from now
    const scheduleDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const post = await client.createPost(testContent, channelIds, scheduleDate);
    if (post) {
        console.log('\n✅ Test post scheduled!');
    }

    // Get scheduled posts
    const scheduledPosts = await client.getScheduledPosts();
    console.log(`\n📅 Total scheduled posts: ${scheduledPosts.length}`);
}

// Export for use in other scripts
module.exports = PostizAPIClient;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}