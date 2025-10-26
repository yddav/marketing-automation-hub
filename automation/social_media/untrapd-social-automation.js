#!/usr/bin/env node

/**
 * UNTRAPD Hub Social Media Automation
 * Direct API integration bypassing Postiz authentication issues
 * 
 * This implements direct social media API integration as a fallback
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class UNTRAPDSocialAutomation {
    constructor() {
        this.config = require('./untrapd-hub-config.js');
        this.platforms = {
            instagram: {
                enabled: false,
                api: null
            },
            facebook: {
                enabled: false,
                api: null
            },
            tiktok: {
                enabled: false,
                api: null
            }
        };
    }

    /**
     * Initialize platform connections
     */
    async initialize() {
        console.log('🚀 Initializing UNTRAPD Hub Social Media Automation');
        console.log('=================================================\n');

        // Check for API tokens
        this.checkAPITokens();
        
        // Since Postiz has issues, we'll implement direct API integration
        console.log('📋 Current Status:');
        console.log('- Postiz frontend: ❌ Authentication issues');
        console.log('- Postiz API: ⚠️  Requires OAuth for social connections');
        console.log('- Direct API: ✅ Recommended approach\n');
    }

    /**
     * Check which API tokens are configured
     */
    checkAPITokens() {
        console.log('🔑 Checking API Token Configuration:');
        
        const tokens = {
            'Instagram': process.env.INSTAGRAM_ACCESS_TOKEN || this.config.platforms.instagram.accessToken,
            'Facebook': process.env.FACEBOOK_PAGE_TOKEN || this.config.platforms.facebook.pageAccessToken,
            'TikTok': process.env.TIKTOK_ACCESS_TOKEN || this.config.platforms.tiktok.accessToken
        };

        Object.entries(tokens).forEach(([platform, token]) => {
            if (token && token !== 'process.env.' + platform.toUpperCase() + '_ACCESS_TOKEN') {
                console.log(`✅ ${platform}: Token configured`);
                this.platforms[platform.toLowerCase()].enabled = true;
            } else {
                console.log(`❌ ${platform}: No token found`);
            }
        });
        console.log('');
    }

    /**
     * Post to Instagram using Graph API
     */
    async postToInstagram(content, imageUrl = null) {
        if (!this.platforms.instagram.enabled) {
            console.log('❌ Instagram: No access token configured');
            return null;
        }

        const { accessToken, businessAccountId } = this.config.platforms.instagram;
        
        try {
            if (imageUrl) {
                // Create media container
                const mediaResponse = await axios.post(
                    `https://graph.facebook.com/v18.0/${businessAccountId}/media`,
                    {
                        image_url: imageUrl,
                        caption: content,
                        access_token: accessToken
                    }
                );

                // Publish the media
                const publishResponse = await axios.post(
                    `https://graph.facebook.com/v18.0/${businessAccountId}/media_publish`,
                    {
                        creation_id: mediaResponse.data.id,
                        access_token: accessToken
                    }
                );

                console.log('✅ Posted to Instagram:', publishResponse.data.id);
                return publishResponse.data;
            } else {
                console.log('⚠️  Instagram requires an image for posts');
                return null;
            }
        } catch (error) {
            console.error('❌ Instagram post failed:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Post to Facebook using Graph API
     */
    async postToFacebook(content, imageUrl = null) {
        if (!this.platforms.facebook.enabled) {
            console.log('❌ Facebook: No page token configured');
            return null;
        }

        const { pageId, pageAccessToken } = this.config.platforms.facebook;
        
        try {
            const postData = {
                message: content,
                access_token: pageAccessToken
            };

            if (imageUrl) {
                postData.url = imageUrl;
                const response = await axios.post(
                    `https://graph.facebook.com/v18.0/${pageId}/photos`,
                    postData
                );
                console.log('✅ Posted to Facebook with image:', response.data.id);
                return response.data;
            } else {
                const response = await axios.post(
                    `https://graph.facebook.com/v18.0/${pageId}/feed`,
                    postData
                );
                console.log('✅ Posted to Facebook:', response.data.id);
                return response.data;
            }
        } catch (error) {
            console.error('❌ Facebook post failed:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Post to TikTok using Business API
     */
    async postToTikTok(videoPath, caption) {
        if (!this.platforms.tiktok.enabled) {
            console.log('❌ TikTok: No access token configured');
            return null;
        }

        console.log('⚠️  TikTok posting requires video upload implementation');
        // TikTok API implementation would go here
        return null;
    }

    /**
     * Schedule a post across all platforms
     */
    async schedulePost(content, options = {}) {
        console.log('\n📝 Scheduling Post:');
        console.log(`Content: "${content}"`);
        console.log(`Platforms: ${Object.keys(this.platforms).filter(p => this.platforms[p].enabled).join(', ') || 'None configured'}`);
        
        const results = {
            instagram: null,
            facebook: null,
            tiktok: null
        };

        // For immediate posting (scheduling would require a job queue)
        if (this.platforms.instagram.enabled && options.imageUrl) {
            results.instagram = await this.postToInstagram(content, options.imageUrl);
        }

        if (this.platforms.facebook.enabled) {
            results.facebook = await this.postToFacebook(content, options.imageUrl);
        }

        if (this.platforms.tiktok.enabled && options.videoPath) {
            results.tiktok = await this.postToTikTok(options.videoPath, content);
        }

        return results;
    }

    /**
     * Get setup instructions
     */
    getSetupInstructions() {
        console.log('\n📚 Setup Instructions:');
        console.log('====================\n');

        console.log('Since Postiz has authentication issues, we recommend direct API integration:\n');

        console.log('1️⃣ Instagram Business Account:');
        console.log('   - Convert Instagram to Business Account');
        console.log('   - Connect to Facebook Page');
        console.log('   - Get Access Token from Meta Developer Console');
        console.log('   - Set INSTAGRAM_ACCESS_TOKEN environment variable\n');

        console.log('2️⃣ Facebook Page:');
        console.log('   - Create Facebook App at developers.facebook.com');
        console.log('   - Add Instagram Basic Display and Pages API');
        console.log('   - Get Page Access Token');
        console.log('   - Set FACEBOOK_PAGE_TOKEN environment variable\n');

        console.log('3️⃣ TikTok Business:');
        console.log('   - Apply for TikTok Business API access');
        console.log('   - Create TikTok Developer App');
        console.log('   - Get Access Token');
        console.log('   - Set TIKTOK_ACCESS_TOKEN environment variable\n');

        console.log('4️⃣ Alternative: Fix Postiz');
        console.log('   - Fork Postiz repository');
        console.log('   - Add provider field to login form');
        console.log('   - Use modified version\n');

        console.log('5️⃣ Quick Start with APIs:');
        console.log('   export INSTAGRAM_ACCESS_TOKEN="your_token"');
        console.log('   export FACEBOOK_PAGE_TOKEN="your_token"');
        console.log('   node untrapd-social-automation.js');
    }
}

// Example usage
async function main() {
    const automation = new UNTRAPDSocialAutomation();
    await automation.initialize();

    if (!automation.platforms.instagram.enabled && 
        !automation.platforms.facebook.enabled && 
        !automation.platforms.tiktok.enabled) {
        
        automation.getSetupInstructions();
        
        console.log('\n💡 Recommendation:');
        console.log('Since Postiz frontend has authentication issues and the API requires');
        console.log('OAuth for social connections, we recommend using direct API integration');
        console.log('with the social media platforms.');
        
        return;
    }

    // Example post
    const testContent = "🚀 UNTRAPD Hub - Your intelligence hub unleashed! Check out FINDERR, our flagship app that ensures you never lose your phone permanently. #UNTRAPDHub #FINDERR #TechInnovation";
    
    const results = await automation.schedulePost(testContent, {
        imageUrl: 'https://example.com/untrapd-hub-promo.jpg' // Would need actual image
    });

    console.log('\n📊 Posting Results:', results);
}

// Export for use in other scripts
module.exports = UNTRAPDSocialAutomation;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}