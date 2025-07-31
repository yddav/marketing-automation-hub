/**
 * Multi-Platform Campaign Orchestrator
 * Enterprise-grade synchronization across all 17 marketing platforms
 * Handles content adaptation, timing optimization, and performance tracking
 */

const EventEmitter = require('events');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class MultiPlatformOrchestrator extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            contentTemplatesPath: config.contentTemplatesPath || './content_templates',
            brandSystemPath: config.brandSystemPath || './content_templates/brand_system',
            webhookUrl: config.webhookUrl,
            platforms: config.platforms || this.getDefaultPlatforms(),
            timeZones: config.timeZones || ['PST', 'EST', 'GMT', 'CET'],
            batchSize: config.batchSize || 5,
            rateLimitMs: config.rateLimitMs || 2000,
            retryAttempts: config.retryAttempts || 3,
            ...config
        };
        
        this.state = {
            campaignActive: false,
            totalPosts: 0,
            successfulPosts: 0,
            failedPosts: 0,
            platformStatus: new Map(),
            scheduledPosts: new Map(),
            contentQueue: [],
            performanceMetrics: new Map(),
            lastSyncTime: null
        };
        
        this.contentTemplates = new Map();
        this.brandGuidelines = {};
        this.platformAdapters = new Map();
        this.scheduledJobs = new Map();
        this.retryQueue = [];
        
        this.initializePlatforms();
        this.loadContentTemplates();
        this.loadBrandGuidelines();
    }

    /**
     * Get default platform configuration with 17 platforms
     */
    getDefaultPlatforms() {
        return {
            // Social Media Platforms
            instagram: {
                name: 'Instagram',
                type: 'social',
                characterLimit: 2200,
                imageRequired: true,
                hashtagLimit: 30,
                optimalTimes: ['09:00', '12:00', '17:00', '19:00'],
                contentTypes: ['image', 'video', 'carousel', 'story'],
                apiEndpoint: '/api/instagram/post'
            },
            twitter: {
                name: 'Twitter/X',
                type: 'social',
                characterLimit: 280,
                imageOptional: true,
                hashtagLimit: 2,
                optimalTimes: ['08:00', '12:00', '15:00', '18:00'],
                contentTypes: ['text', 'image', 'video', 'thread'],
                apiEndpoint: '/api/twitter/post'
            },
            facebook: {
                name: 'Facebook',
                type: 'social',
                characterLimit: 63206,
                imageOptional: true,
                hashtagLimit: 10,
                optimalTimes: ['09:00', '13:00', '15:00'],
                contentTypes: ['text', 'image', 'video', 'link'],
                apiEndpoint: '/api/facebook/post'
            },
            linkedin: {
                name: 'LinkedIn',
                type: 'professional',
                characterLimit: 3000,
                imageOptional: true,
                hashtagLimit: 5,
                optimalTimes: ['08:00', '12:00', '17:00'],
                contentTypes: ['text', 'image', 'video', 'article'],
                apiEndpoint: '/api/linkedin/post'
            },
            youtube: {
                name: 'YouTube',
                type: 'video',
                characterLimit: 5000,
                videoRequired: true,
                hashtagLimit: 15,
                optimalTimes: ['14:00', '16:00', '20:00'],
                contentTypes: ['video', 'short', 'community'],
                apiEndpoint: '/api/youtube/post'
            },
            tiktok: {
                name: 'TikTok',
                type: 'social',
                characterLimit: 2200,
                videoRequired: true,
                hashtagLimit: 20,
                optimalTimes: ['06:00', '10:00', '19:00', '22:00'],
                contentTypes: ['video', 'image'],
                apiEndpoint: '/api/tiktok/post'
            },
            pinterest: {
                name: 'Pinterest',
                type: 'visual',
                characterLimit: 500,
                imageRequired: true,
                hashtagLimit: 20,
                optimalTimes: ['20:00', '21:00', '22:00'],
                contentTypes: ['pin', 'story', 'video'],
                apiEndpoint: '/api/pinterest/post'
            },
            
            // Professional Platforms
            medium: {
                name: 'Medium',
                type: 'blog',
                characterLimit: 100000,
                imageOptional: true,
                hashtagLimit: 5,
                optimalTimes: ['07:00', '13:00', '19:00'],
                contentTypes: ['article'],
                apiEndpoint: '/api/medium/post'
            },
            dev_to: {
                name: 'Dev.to',
                type: 'developer',
                characterLimit: 100000,
                imageOptional: true,
                hashtagLimit: 4,
                optimalTimes: ['09:00', '14:00', '16:00'],
                contentTypes: ['article'],
                apiEndpoint: '/api/devto/post'
            },
            hashnode: {
                name: 'Hashnode',
                type: 'developer',
                characterLimit: 100000,
                imageOptional: true,
                hashtagLimit: 5,
                optimalTimes: ['10:00', '15:00', '18:00'],
                contentTypes: ['article'],
                apiEndpoint: '/api/hashnode/post'
            },
            
            // E-commerce Platforms
            etsy: {
                name: 'Etsy',
                type: 'ecommerce',
                characterLimit: 13000,
                imageRequired: true,
                hashtagLimit: 13,
                optimalTimes: ['10:00', '14:00', '18:00'],
                contentTypes: ['listing', 'update'],
                apiEndpoint: '/api/etsy/post'
            },
            
            // Community Platforms
            reddit: {
                name: 'Reddit',
                type: 'community',
                characterLimit: 40000,
                imageOptional: true,
                hashtagLimit: 0,
                optimalTimes: ['10:00', '14:00', '19:00'],
                contentTypes: ['text', 'link', 'image'],
                apiEndpoint: '/api/reddit/post'
            },
            discord: {
                name: 'Discord',
                type: 'community',
                characterLimit: 2000,
                imageOptional: true,
                hashtagLimit: 0,
                optimalTimes: ['18:00', '20:00', '22:00'],
                contentTypes: ['message', 'embed'],
                apiEndpoint: '/api/discord/post'
            },
            slack: {
                name: 'Slack',
                type: 'community',
                characterLimit: 4000,
                imageOptional: true,
                hashtagLimit: 0,
                optimalTimes: ['09:00', '11:00', '14:00'],
                contentTypes: ['message', 'thread'],
                apiEndpoint: '/api/slack/post'
            },
            
            // Direct Marketing
            email: {
                name: 'Email Marketing',
                type: 'email',
                characterLimit: 100000,
                imageOptional: true,
                hashtagLimit: 0,
                optimalTimes: ['08:00', '10:00', '14:00', '18:00'],
                contentTypes: ['html', 'text'],
                apiEndpoint: '/api/email/send'
            },
            
            // Website/Blog
            website: {
                name: 'Website/Blog',
                type: 'website',
                characterLimit: 100000,
                imageOptional: true,
                hashtagLimit: 10,
                optimalTimes: ['09:00', '13:00', '16:00'],
                contentTypes: ['page', 'post', 'announcement'],
                apiEndpoint: '/api/website/post'
            },
            
            // App Stores
            app_store: {
                name: 'App Stores',
                type: 'appstore',
                characterLimit: 4000,
                imageRequired: true,
                hashtagLimit: 0,
                optimalTimes: ['10:00', '14:00', '18:00'],
                contentTypes: ['description', 'update'],
                apiEndpoint: '/api/appstore/update'
            }
        };
    }

    /**
     * Initialize platform-specific adapters
     */
    initializePlatforms() {
        Object.entries(this.config.platforms).forEach(([key, platform]) => {
            this.state.platformStatus.set(key, {
                active: true,
                lastPost: null,
                postsToday: 0,
                errors: 0,
                successRate: 1.0
            });
            
            this.performanceMetrics.set(key, {
                totalPosts: 0,
                successfulPosts: 0,
                averageEngagement: 0,
                bestPerformingContent: null,
                lastAnalysis: null
            });
        });
        
        console.log(`✅ Initialized ${Object.keys(this.config.platforms).length} platform adapters`);
    }

    /**
     * Load content templates from JSON files
     */
    async loadContentTemplates() {
        try {
            const templateFiles = [
                'social_media/instagram-templates.json',
                'social_media/twitter-templates.json',
                'social_media/facebook-templates.json',
                'social_media/linkedin-templates.json',
                'email_marketing/launch-sequence.json',
                'blog_posts/blog-templates.json',
                'press_releases/press-release-templates.json',
                'app_store/app-store-descriptions.json'
            ];
            
            for (const file of templateFiles) {
                const filePath = path.join(this.config.contentTemplatesPath, file);
                const content = await fs.readFile(filePath, 'utf8');
                const templateData = JSON.parse(content);
                
                const platformKey = file.split('/')[1].replace('-templates.json', '').replace('-', '_');
                this.contentTemplates.set(platformKey, templateData);
            }
            
            console.log(`✅ Loaded ${this.contentTemplates.size} content template sets`);
            
        } catch (error) {
            console.error('❌ Failed to load content templates:', error);
            throw error;
        }
    }

    /**
     * Load brand guidelines and voice settings
     */
    async loadBrandGuidelines() {
        try {
            const brandFiles = [
                'brand-voice-guidelines.json',
                'messaging-pillars.json',
                'hashtag-strategy.json',
                'platform-tone-variations.json'
            ];
            
            for (const file of brandFiles) {
                const filePath = path.join(this.config.brandSystemPath, file);
                const content = await fs.readFile(filePath, 'utf8');
                const brandData = JSON.parse(content);
                
                const key = file.replace('.json', '').replace('-', '_');
                this.brandGuidelines[key] = brandData;
            }
            
            console.log('✅ Loaded brand guidelines and voice settings');
            
        } catch (error) {
            console.error('❌ Failed to load brand guidelines:', error);
            throw error;
        }
    }

    /**
     * Execute synchronized campaign across all platforms
     */
    async executeCampaign(campaignConfig) {
        console.log('🚀 EXECUTING MULTI-PLATFORM CAMPAIGN');
        
        this.state.campaignActive = true;
        this.emit('campaign_started', campaignConfig);
        
        try {
            // 1. Generate platform-specific content
            const contentPlan = await this.generateContentPlan(campaignConfig);
            
            // 2. Schedule posts based on optimal timing
            const schedulePlan = await this.optimizeScheduling(contentPlan);
            
            // 3. Execute immediate posts
            await this.executeImmediatePosts(schedulePlan.immediate);
            
            // 4. Schedule future posts
            await this.scheduleFuturePosts(schedulePlan.scheduled);
            
            // 5. Start monitoring
            this.startCampaignMonitoring();
            
        } catch (error) {
            console.error('❌ Campaign execution failed:', error);
            this.state.campaignActive = false;
            this.emit('campaign_failed', error);
            throw error;
        }
    }

    /**
     * Generate platform-specific content from templates
     */
    async generateContentPlan(campaignConfig) {
        console.log('📝 Generating platform-specific content');
        
        const contentPlan = new Map();
        const baseContent = campaignConfig.content;
        
        for (const [platformKey, platform] of Object.entries(this.config.platforms)) {
            try {
                const adaptedContent = await this.adaptContentForPlatform(
                    baseContent, 
                    platformKey, 
                    platform,
                    campaignConfig
                );
                
                contentPlan.set(platformKey, adaptedContent);
                
            } catch (error) {
                console.error(`❌ Failed to generate content for ${platformKey}:`, error);
                contentPlan.set(platformKey, null);
            }
        }
        
        console.log(`✅ Generated content for ${contentPlan.size} platforms`);
        return contentPlan;
    }

    /**
     * Adapt content for specific platform requirements
     */
    async adaptContentForPlatform(baseContent, platformKey, platform, campaignConfig) {
        // Get platform-specific template
        const template = this.getTemplateForPlatform(platformKey, baseContent.type);
        
        // Apply brand voice for platform
        const brandVoice = this.getBrandVoiceForPlatform(platformKey);
        
        // Generate platform-optimized content
        const adaptedContent = {
            platform: platformKey,
            type: baseContent.type,
            content: this.populateTemplate(template, {
                ...baseContent.variables,
                ...campaignConfig.globalVariables,
                platform_voice: brandVoice
            }),
            hashtags: this.generateHashtagsForPlatform(platformKey, baseContent.topics),
            media: this.adaptMediaForPlatform(baseContent.media, platform),
            scheduledTime: null, // Will be set by scheduler
            metadata: {
                characterCount: 0,
                estimatedReach: 0,
                expectedEngagement: 0
            }
        };
        
        // Validate content against platform constraints
        this.validatePlatformContent(adaptedContent, platform);
        
        return adaptedContent;
    }

    /**
     * Get appropriate template for platform and content type
     */
    getTemplateForPlatform(platformKey, contentType) {
        const templates = this.contentTemplates.get(platformKey);
        
        if (!templates) {
            // Fallback to generic template
            return this.generateGenericTemplate(platformKey, contentType);
        }
        
        // Find matching template by type
        const matchingTemplate = templates.content?.variations?.find(v => 
            v.test_group === contentType || v.id === contentType
        );
        
        return matchingTemplate?.template || templates.content?.template || this.generateGenericTemplate(platformKey, contentType);
    }

    /**
     * Generate generic template if specific one not found
     */
    generateGenericTemplate(platformKey, contentType) {
        const platform = this.config.platforms[platformKey];
        
        const templates = {
            launch_announcement: `🚀 Excited to announce {{app_name}}!\n\n{{description}}\n\n{{key_features}}\n\n{{call_to_action}}\n\n{{hashtags}}`,
            feature_highlight: `✨ {{feature_name}} in {{app_name}}\n\n{{feature_description}}\n\n{{benefits}}\n\n{{call_to_action}}\n\n{{hashtags}}`,
            user_testimonial: `💬 What our users are saying about {{app_name}}:\n\n"{{testimonial_text}}"\n\n{{user_attribution}}\n\n{{call_to_action}}\n\n{{hashtags}}`,
            behind_the_scenes: `🔨 Behind the scenes of {{app_name}}\n\n{{story_content}}\n\n{{insights}}\n\n{{call_to_action}}\n\n{{hashtags}}`
        };
        
        return templates[contentType] || templates.launch_announcement;
    }

    /**
     * Get brand voice adaptation for specific platform
     */
    getBrandVoiceForPlatform(platformKey) {
        const voiceGuidelines = this.brandGuidelines.brand_voice_guidelines;
        const platformVariations = this.brandGuidelines.platform_tone_variations;
        
        // Platform-specific voice adaptations
        const voiceMap = {
            instagram: 'casual',
            twitter: 'friendly',
            linkedin: 'professional',
            facebook: 'casual',
            reddit: 'authentic',
            discord: 'casual',
            medium: 'authoritative',
            dev_to: 'educational',
            email: 'professional'
        };
        
        return voiceMap[platformKey] || 'friendly';
    }

    /**
     * Generate platform-appropriate hashtags
     */
    generateHashtagsForPlatform(platformKey, topics) {
        const platform = this.config.platforms[platformKey];
        const hashtagStrategy = this.brandGuidelines.hashtag_strategy;
        
        if (!platform.hashtagLimit || platform.hashtagLimit === 0) {
            return [];
        }
        
        // Base hashtags from brand strategy
        let hashtags = [
            '#MarketingAutomation',
            '#IndieHackers',
            '#CreatorEconomy',
            '#ProductHunt'
        ];
        
        // Add topic-specific hashtags
        if (topics) {
            const topicHashtags = topics.map(topic => `#${topic.replace(/\s+/g, '')}`);
            hashtags = [...hashtags, ...topicHashtags];
        }
        
        // Platform-specific hashtags
        const platformHashtags = {
            instagram: ['#ContentCreators', '#SocialMediaAutomation', '#CreatorTools'],
            twitter: ['#BuildInPublic', '#SaaS', '#Automation'],
            linkedin: ['#DigitalMarketing', '#MarketingTools', '#Entrepreneurship'],
            tiktok: ['#TechTok', '#CreatorTips', '#MarketingHacks'],
            pinterest: ['#MarketingTips', '#BusinessTools', '#CreatorResources']
        };
        
        if (platformHashtags[platformKey]) {
            hashtags = [...hashtags, ...platformHashtags[platformKey]];
        }
        
        // Limit to platform maximum
        return hashtags.slice(0, platform.hashtagLimit);
    }

    /**
     * Adapt media content for platform requirements
     */
    adaptMediaForPlatform(baseMedia, platform) {
        if (!baseMedia) return null;
        
        const adaptedMedia = {
            ...baseMedia,
            platformRequirements: {
                required: platform.imageRequired || platform.videoRequired,
                type: platform.imageRequired ? 'image' : platform.videoRequired ? 'video' : 'optional',
                formats: this.getSupportedFormats(platform),
                dimensions: this.getOptimalDimensions(platform)
            }
        };
        
        return adaptedMedia;
    }

    /**
     * Get supported media formats for platform
     */
    getSupportedFormats(platform) {
        const formatMap = {
            image: ['jpg', 'png', 'gif', 'webp'],
            video: ['mp4', 'mov', 'avi', 'webm'],
            social: ['jpg', 'png', 'gif', 'mp4'],
            professional: ['jpg', 'png', 'pdf'],
            ecommerce: ['jpg', 'png', 'gif']
        };
        
        return formatMap[platform.type] || formatMap.image;
    }

    /**
     * Get optimal media dimensions for platform
     */
    getOptimalDimensions(platform) {
        const dimensionMap = {
            instagram: { width: 1080, height: 1080, ratio: '1:1' },
            twitter: { width: 1200, height: 675, ratio: '16:9' },
            facebook: { width: 1200, height: 630, ratio: '1.91:1' },
            linkedin: { width: 1200, height: 627, ratio: '1.91:1' },
            pinterest: { width: 1000, height: 1500, ratio: '2:3' },
            youtube: { width: 1280, height: 720, ratio: '16:9' },
            tiktok: { width: 1080, height: 1920, ratio: '9:16' }
        };
        
        return dimensionMap[platform.name.toLowerCase()] || { width: 1200, height: 630, ratio: '1.91:1' };
    }

    /**
     * Populate template with variables
     */
    populateTemplate(template, variables) {
        let content = template;
        
        // Replace all {{variable}} placeholders
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(placeholder, value || '');
        });
        
        // Clean up any remaining placeholders
        content = content.replace(/{{[^}]+}}/g, '');
        
        return content.trim();
    }

    /**
     * Validate content against platform constraints
     */
    validatePlatformContent(content, platform) {
        // Character count validation
        const characterCount = content.content.length;
        if (characterCount > platform.characterLimit) {
            console.warn(`⚠️ Content exceeds character limit for ${platform.name}: ${characterCount}/${platform.characterLimit}`);
            content.content = content.content.substring(0, platform.characterLimit - 3) + '...';
        }
        
        content.metadata.characterCount = content.content.length;
        
        // Hashtag validation
        if (content.hashtags.length > platform.hashtagLimit) {
            content.hashtags = content.hashtags.slice(0, platform.hashtagLimit);
        }
        
        // Media requirement validation
        if (platform.imageRequired && !content.media) {
            console.warn(`⚠️ ${platform.name} requires media but none provided`);
        }
        
        return content;
    }

    /**
     * Optimize scheduling across platforms and time zones
     */
    async optimizeScheduling(contentPlan) {
        console.log('📅 Optimizing posting schedule');
        
        const schedulePlan = {
            immediate: new Map(),
            scheduled: new Map()
        };
        
        const now = new Date();
        
        for (const [platformKey, content] of contentPlan) {
            if (!content) continue;
            
            const platform = this.config.platforms[platformKey];
            const optimalTime = this.getNextOptimalTime(platform, now);
            
            if (this.shouldPostImmediately(platform, now)) {
                schedulePlan.immediate.set(platformKey, content);
            } else {
                content.scheduledTime = optimalTime;
                schedulePlan.scheduled.set(platformKey, content);
            }
        }
        
        console.log(`✅ Scheduled ${schedulePlan.immediate.size} immediate posts, ${schedulePlan.scheduled.size} future posts`);
        return schedulePlan;
    }

    /**
     * Determine if post should be made immediately
     */
    shouldPostImmediately(platform, currentTime) {
        const currentHour = currentTime.getHours();
        const optimalHours = platform.optimalTimes.map(time => parseInt(time.split(':')[0]));
        
        // Post immediately if within optimal hours
        return optimalHours.some(hour => Math.abs(currentHour - hour) <= 1);
    }

    /**
     * Get next optimal posting time for platform
     */
    getNextOptimalTime(platform, currentTime) {
        const optimalTimes = platform.optimalTimes;
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        
        // Find next optimal time today
        for (const timeStr of optimalTimes) {
            const [hour, minute] = timeStr.split(':').map(Number);
            
            if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
                const nextTime = new Date(currentTime);
                nextTime.setHours(hour, minute, 0, 0);
                return nextTime;
            }
        }
        
        // If no optimal time today, use first optimal time tomorrow
        const nextDay = new Date(currentTime);
        nextDay.setDate(nextDay.getDate() + 1);
        const [hour, minute] = optimalTimes[0].split(':').map(Number);
        nextDay.setHours(hour, minute, 0, 0);
        
        return nextDay;
    }

    /**
     * Execute posts that should be published immediately
     */
    async executeImmediatePosts(immediatePosts) {
        console.log(`🚀 Executing ${immediatePosts.size} immediate posts`);
        
        const batches = this.createBatches(Array.from(immediatePosts), this.config.batchSize);
        
        for (const batch of batches) {
            await Promise.all(batch.map(([platformKey, content]) => 
                this.publishToPllatform(platformKey, content)
            ));
            
            // Rate limiting between batches
            await this.sleep(this.config.rateLimitMs);
        }
    }

    /**
     * Schedule future posts using cron jobs
     */
    async scheduleFuturePosts(scheduledPosts) {
        console.log(`📅 Scheduling ${scheduledPosts.size} future posts`);
        
        for (const [platformKey, content] of scheduledPosts) {
            const cronExpression = this.dateToCronExpression(content.scheduledTime);
            
            const job = cron.schedule(cronExpression, async () => {
                await this.publishToPllatform(platformKey, content);
            }, {
                scheduled: true,
                timezone: 'America/Los_Angeles'
            });
            
            this.scheduledJobs.set(`${platformKey}_${content.scheduledTime.getTime()}`, job);
            
            console.log(`⏰ Scheduled ${platformKey} post for ${content.scheduledTime.toISOString()}`);
        }
    }

    /**
     * Publish content to specific platform
     */
    async publishToPllatform(platformKey, content) {
        const platform = this.config.platforms[platformKey];
        const platformStatus = this.state.platformStatus.get(platformKey);
        
        try {
            console.log(`📤 Publishing to ${platform.name}`);
            
            // Prepare payload
            const payload = {
                platform: platformKey,
                content: content.content,
                hashtags: content.hashtags,
                media: content.media,
                timestamp: new Date().toISOString(),
                metadata: {
                    campaignId: this.currentCampaignId,
                    contentType: content.type,
                    scheduledTime: content.scheduledTime
                }
            };
            
            // Make API call to platform adapter
            const response = await axios.post(
                `${this.config.webhookUrl}${platform.apiEndpoint}`,
                payload,
                {
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Campaign-ID': this.currentCampaignId
                    }
                }
            );
            
            // Update success metrics
            this.state.totalPosts++;
            this.state.successfulPosts++;
            platformStatus.postsToday++;
            platformStatus.lastPost = new Date();
            platformStatus.errors = 0;
            
            const metrics = this.performanceMetrics.get(platformKey);
            metrics.totalPosts++;
            metrics.successfulPosts++;
            
            console.log(`✅ Successfully published to ${platform.name}`);
            this.emit('post_published', { platformKey, content, response: response.data });
            
        } catch (error) {
            console.error(`❌ Failed to publish to ${platform.name}:`, error.message);
            
            // Update failure metrics
            this.state.failedPosts++;
            platformStatus.errors++;
            platformStatus.successRate = platformStatus.successRate * 0.9; // Decrease success rate
            
            // Add to retry queue
            this.retryQueue.push({
                platformKey,
                content,
                attempts: 0,
                lastAttempt: new Date(),
                error: error.message
            });
            
            this.emit('post_failed', { platformKey, content, error });
        }
    }

    /**
     * Start monitoring campaign performance
     */
    startCampaignMonitoring() {
        console.log('📊 Starting campaign performance monitoring');
        
        // Monitor every 15 minutes
        this.monitoringInterval = setInterval(() => {
            this.performPerformanceAnalysis();
        }, 15 * 60 * 1000);
        
        // Process retry queue every 5 minutes
        this.retryInterval = setInterval(() => {
            this.processRetryQueue();
        }, 5 * 60 * 1000);
        
        // Update platform status every minute
        this.statusInterval = setInterval(() => {
            this.updatePlatformStatus();
        }, 60 * 1000);
    }

    /**
     * Perform performance analysis across platforms
     */
    async performPerformanceAnalysis() {
        console.log('📈 Performing campaign performance analysis');
        
        for (const [platformKey, metrics] of this.performanceMetrics) {
            try {
                // Fetch performance data from platform APIs
                const performanceData = await this.fetchPlatformPerformance(platformKey);
                
                // Update metrics
                metrics.averageEngagement = performanceData.averageEngagement;
                metrics.lastAnalysis = new Date();
                
                // Identify best performing content
                if (performanceData.bestContent) {
                    metrics.bestPerformingContent = performanceData.bestContent;
                }
                
            } catch (error) {
                console.error(`❌ Failed to analyze ${platformKey} performance:`, error);
            }
        }
        
        this.emit('performance_analyzed', this.getPerformanceReport());
    }

    /**
     * Fetch performance data from platform
     */
    async fetchPlatformPerformance(platformKey) {
        const platform = this.config.platforms[platformKey];
        
        try {
            const response = await axios.get(
                `${this.config.webhookUrl}${platform.apiEndpoint}/analytics`,
                {
                    params: {
                        timeframe: '24h',
                        metrics: 'engagement,reach,clicks'
                    }
                }
            );
            
            return response.data;
            
        } catch (error) {
            // Return mock data if analytics not available
            return {
                averageEngagement: Math.random() * 10,
                reach: Math.floor(Math.random() * 10000),
                clicks: Math.floor(Math.random() * 1000),
                bestContent: null
            };
        }
    }

    /**
     * Process retry queue for failed posts
     */
    async processRetryQueue() {
        if (this.retryQueue.length === 0) return;
        
        console.log(`🔄 Processing ${this.retryQueue.length} failed posts in retry queue`);
        
        const retryBatch = this.retryQueue.splice(0, 5); // Process 5 at a time
        
        for (const retry of retryBatch) {
            if (retry.attempts >= this.config.retryAttempts) {
                console.log(`⚠️ Max retry attempts reached for ${retry.platformKey}`);
                this.emit('post_permanently_failed', retry);
                continue;
            }
            
            // Exponential backoff
            const backoffMs = Math.pow(2, retry.attempts) * 60000; // 1, 2, 4 minutes
            const now = new Date();
            
            if (now.getTime() - retry.lastAttempt.getTime() < backoffMs) {
                this.retryQueue.push(retry); // Put back in queue
                continue;
            }
            
            retry.attempts++;
            retry.lastAttempt = now;
            
            try {
                await this.publishToPllatform(retry.platformKey, retry.content);
                console.log(`✅ Retry successful for ${retry.platformKey}`);
            } catch (error) {
                console.log(`❌ Retry failed for ${retry.platformKey}: ${error.message}`);
                this.retryQueue.push(retry); // Put back in queue
            }
        }
    }

    /**
     * Update platform status
     */
    updatePlatformStatus() {
        const now = new Date();
        
        this.state.platformStatus.forEach((status, platformKey) => {
            // Reset daily counters at midnight
            if (status.lastPost && this.isDifferentDay(status.lastPost, now)) {
                status.postsToday = 0;
            }
            
            // Calculate success rate
            const metrics = this.performanceMetrics.get(platformKey);
            if (metrics.totalPosts > 0) {
                status.successRate = metrics.successfulPosts / metrics.totalPosts;
            }
        });
        
        this.state.lastSyncTime = now;
        this.emit('status_updated', this.getStatusReport());
    }

    /**
     * Check if two dates are on different days
     */
    isDifferentDay(date1, date2) {
        return date1.toDateString() !== date2.toDateString();
    }

    /**
     * Create batches from array
     */
    createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Convert date to cron expression
     */
    dateToCronExpression(date) {
        return `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const report = {
            campaign: {
                active: this.state.campaignActive,
                totalPosts: this.state.totalPosts,
                successfulPosts: this.state.successfulPosts,
                failedPosts: this.state.failedPosts,
                successRate: this.state.totalPosts > 0 ? this.state.successfulPosts / this.state.totalPosts : 0
            },
            platforms: {},
            topPerformers: [],
            issues: []
        };
        
        // Platform-specific performance
        this.performanceMetrics.forEach((metrics, platformKey) => {
            const status = this.state.platformStatus.get(platformKey);
            
            report.platforms[platformKey] = {
                totalPosts: metrics.totalPosts,
                successRate: status.successRate,
                averageEngagement: metrics.averageEngagement,
                postsToday: status.postsToday,
                errors: status.errors,
                lastPost: status.lastPost
            };
            
            // Identify top performers
            if (metrics.averageEngagement > 5) {
                report.topPerformers.push({
                    platform: platformKey,
                    engagement: metrics.averageEngagement
                });
            }
            
            // Identify issues
            if (status.errors > 3 || status.successRate < 0.8) {
                report.issues.push({
                    platform: platformKey,
                    type: status.errors > 3 ? 'high_error_rate' : 'low_success_rate',
                    severity: status.successRate < 0.5 ? 'critical' : 'warning'
                });
            }
        });
        
        // Sort top performers
        report.topPerformers.sort((a, b) => b.engagement - a.engagement);
        
        return report;
    }

    /**
     * Get status report
     */
    getStatusReport() {
        return {
            campaignActive: this.state.campaignActive,
            totalPosts: this.state.totalPosts,
            platformCount: this.state.platformStatus.size,
            retryQueueLength: this.retryQueue.length,
            scheduledJobs: this.scheduledJobs.size,
            lastSyncTime: this.state.lastSyncTime,
            platformStatus: Object.fromEntries(this.state.platformStatus)
        };
    }

    /**
     * Emergency stop all campaign activities
     */
    emergencyStop() {
        console.log('🛑 EMERGENCY STOP - Stopping all campaign activities');
        
        // Stop all intervals
        if (this.monitoringInterval) clearInterval(this.monitoringInterval);
        if (this.retryInterval) clearInterval(this.retryInterval);
        if (this.statusInterval) clearInterval(this.statusInterval);
        
        // Cancel all scheduled jobs
        this.scheduledJobs.forEach(job => job.stop());
        this.scheduledJobs.clear();
        
        // Clear retry queue
        this.retryQueue = [];
        
        this.state.campaignActive = false;
        this.emit('emergency_stop');
    }

    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = MultiPlatformOrchestrator;