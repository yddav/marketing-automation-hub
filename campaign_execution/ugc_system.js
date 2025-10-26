/**
 * User-Generated Content (UGC) System
 * Enterprise-grade collection, curation, and amplification of user-generated content
 * Handles automatic discovery, quality scoring, and cross-platform distribution
 */

const EventEmitter = require('events');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class UGCSystem extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            databasePath: config.databasePath || './data/ugc_content.json',
            mediaStoragePath: config.mediaStoragePath || './data/ugc_media',
            webhookUrl: config.webhookUrl,
            brandHashtags: config.brandHashtags || ['#MarketingAutomationHub', '#CreatorTools', '#MarketingAutomation'],
            brandMentions: config.brandMentions || ['@MarketingHub', 'Marketing Automation Hub', 'MarketingAutomationHub'],
            qualityThresholds: {
                minEngagement: config.minEngagement || 10,
                minFollowers: config.minFollowers || 100,
                minQualityScore: config.minQualityScore || 0.6,
                maxContentAge: config.maxContentAge || 7 // days
            },
            platforms: {
                twitter: config.platforms?.twitter || true,
                instagram: config.platforms?.instagram || true,
                linkedin: config.platforms?.linkedin || true,
                tiktok: config.platforms?.tiktok || true,
                youtube: config.platforms?.youtube || true,
                reddit: config.platforms?.reddit || true
            },
            amplificationRules: {
                autoShare: config.autoShare || false,
                requireApproval: config.requireApproval || true,
                qualityThreshold: config.qualityThreshold || 0.8,
                maxDailyShares: config.maxDailyShares || 10
            },
            ...config
        };
        
        this.state = {
            totalContent: 0,
            pendingReview: 0,
            approved: 0,
            amplified: 0,
            engagementRate: 0,
            dailyAmplifications: 0,
            lastReset: new Date(),
            systemActive: false
        };
        
        this.contentDatabase = new Map();
        this.curationQueue = [];
        this.amplificationQueue = [];
        this.moderationRules = new Map();
        this.engagementTracking = new Map();
        this.rateLimiter = new Map();
        
        this.initializeSystem();
    }

    /**
     * Initialize the UGC system
     */
    async initializeSystem() {
        console.log('🚀 Initializing User-Generated Content System');
        
        try {
            await this.loadContentDatabase();
            await this.setupModerationRules();
            await this.setupRateLimiting();
            this.startContentDiscovery();
            this.startAutomationScheduler();
            
            this.state.systemActive = true;
            console.log('✅ UGC System initialized successfully');
            this.emit('system_initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize UGC system:', error);
            throw error;
        }
    }

    /**
     * Load existing UGC content database
     */
    async loadContentDatabase() {
        try {
            const dbExists = await fs.access(this.config.databasePath).then(() => true).catch(() => false);
            
            if (dbExists) {
                const data = await fs.readFile(this.config.databasePath, 'utf8');
                const content = JSON.parse(data);
                
                content.forEach(item => {
                    this.contentDatabase.set(item.id, {
                        ...item,
                        discoveredAt: new Date(item.discoveredAt),
                        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
                        lastModerated: item.lastModerated ? new Date(item.lastModerated) : null
                    });
                });
                
                console.log(`📊 Loaded ${this.contentDatabase.size} UGC items from database`);
            } else {
                console.log('📊 Creating new UGC content database');
                await this.saveContentDatabase();
            }
            
            this.updateStateCounts();
            
        } catch (error) {
            console.error('❌ Failed to load UGC database:', error);
            throw error;
        }
    }

    /**
     * Setup content moderation rules
     */
    async setupModerationRules() {
        const rules = new Map([
            // Quality rules
            ['min_engagement', (content) => content.engagementCount >= this.config.qualityThresholds.minEngagement],
            ['min_followers', (content) => content.author.followers >= this.config.qualityThresholds.minFollowers],
            ['content_age', (content) => this.isContentFresh(content)],
            ['quality_score', (content) => content.qualityScore >= this.config.qualityThresholds.minQualityScore],
            
            // Content safety rules
            ['no_spam', (content) => !this.detectSpam(content)],
            ['brand_appropriate', (content) => this.isBrandAppropriate(content)],
            ['no_offensive_content', (content) => !this.detectOffensiveContent(content)],
            ['authentic_engagement', (content) => this.hasAuthenticEngagement(content)],
            
            // Brand relevance rules
            ['brand_mention', (content) => this.hasBrandMention(content)],
            ['relevant_hashtags', (content) => this.hasRelevantHashtags(content)],
            ['contextual_relevance', (content) => this.isContextuallyRelevant(content)],
            
            // Technical rules
            ['media_quality', (content) => this.hasGoodMediaQuality(content)],
            ['copyright_clear', (content) => this.isCopyrightClear(content)],
            ['platform_compliant', (content) => this.isPlatformCompliant(content)]
        ]);
        
        this.moderationRules = rules;
        console.log(`✅ Setup ${rules.size} moderation rules`);
    }

    /**
     * Setup rate limiting for different platforms
     */
    async setupRateLimiting() {
        const limits = {
            twitter: { requests: 100, window: 3600000 }, // 100 per hour
            instagram: { requests: 50, window: 3600000 }, // 50 per hour
            linkedin: { requests: 30, window: 3600000 }, // 30 per hour
            tiktok: { requests: 40, window: 3600000 }, // 40 per hour
            youtube: { requests: 20, window: 3600000 }, // 20 per hour
            reddit: { requests: 60, window: 3600000 } // 60 per hour
        };
        
        Object.entries(limits).forEach(([platform, limit]) => {
            this.rateLimiter.set(platform, {
                requests: [],
                limit: limit.requests,
                window: limit.window
            });
        });
    }

    /**
     * Start continuous content discovery
     */
    startContentDiscovery() {
        console.log('🔍 Starting continuous content discovery');
        
        // Discover content every 30 minutes
        setInterval(() => {
            this.discoverNewContent();
        }, 30 * 60 * 1000);
        
        // Process curation queue every 10 minutes
        setInterval(() => {
            this.processCurationQueue();
        }, 10 * 60 * 1000);
        
        // Process amplification queue every 15 minutes
        setInterval(() => {
            this.processAmplificationQueue();
        }, 15 * 60 * 1000);
    }

    /**
     * Discover new user-generated content
     */
    async discoverNewContent() {
        console.log('🔍 Discovering new user-generated content');
        
        const discovered = [];
        
        for (const [platform, enabled] of Object.entries(this.config.platforms)) {
            if (!enabled) continue;
            
            try {
                const platformContent = await this.discoverOnPlatform(platform);
                discovered.push(...platformContent);
                
                console.log(`📱 Discovered ${platformContent.length} items on ${platform}`);
                
            } catch (error) {
                console.error(`❌ Discovery failed on ${platform}:`, error);
            }
        }
        
        if (discovered.length > 0) {
            await this.processDiscoveredContent(discovered);
        }
        
        this.emit('content_discovered', { count: discovered.length });
    }

    /**
     * Discover content on specific platform
     */
    async discoverOnPlatform(platform) {
        switch (platform) {
            case 'twitter':
                return await this.discoverTwitterContent();
            case 'instagram':
                return await this.discoverInstagramContent();
            case 'linkedin':
                return await this.discoverLinkedInContent();
            case 'tiktok':
                return await this.discoverTikTokContent();
            case 'youtube':
                return await this.discoverYouTubeContent();
            case 'reddit':
                return await this.discoverRedditContent();
            default:
                return [];
        }
    }

    /**
     * Discover Twitter content
     */
    async discoverTwitterContent() {
        const content = [];
        
        try {
            // Search for brand hashtags
            for (const hashtag of this.config.brandHashtags) {
                const searchResults = await this.searchTwitter(hashtag, {
                    result_type: 'recent',
                    count: 50,
                    include_entities: true
                });
                
                for (const tweet of searchResults.statuses || []) {
                    // Skip if already discovered
                    if (this.contentDatabase.has(`twitter_${tweet.id_str}`)) continue;
                    
                    const contentItem = {
                        id: `twitter_${tweet.id_str}`,
                        platform: 'twitter',
                        type: this.determineTweetType(tweet),
                        url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
                        content: tweet.text,
                        media: this.extractTwitterMedia(tweet),
                        author: {
                            id: tweet.user.id_str,
                            username: tweet.user.screen_name,
                            displayName: tweet.user.name,
                            followers: tweet.user.followers_count,
                            verified: tweet.user.verified,
                            profileImage: tweet.user.profile_image_url_https
                        },
                        metrics: {
                            likes: tweet.favorite_count,
                            retweets: tweet.retweet_count,
                            replies: tweet.reply_count || 0,
                            engagementCount: tweet.favorite_count + tweet.retweet_count + (tweet.reply_count || 0)
                        },
                        hashtags: this.extractHashtags(tweet.text),
                        mentions: this.extractMentions(tweet.text),
                        publishedAt: new Date(tweet.created_at),
                        discoveredAt: new Date(),
                        discoveredVia: hashtag,
                        status: 'discovered',
                        qualityScore: 0,
                        moderationStatus: 'pending'
                    };
                    
                    content.push(contentItem);
                }
            }
            
            // Search for brand mentions
            for (const mention of this.config.brandMentions) {
                const searchResults = await this.searchTwitter(`"${mention}"`, {
                    result_type: 'recent',
                    count: 30
                });
                
                for (const tweet of searchResults.statuses || []) {
                    const contentId = `twitter_${tweet.id_str}`;
                    
                    // Skip if already discovered
                    if (this.contentDatabase.has(contentId) || 
                        content.find(item => item.id === contentId)) continue;
                    
                    const contentItem = {
                        id: contentId,
                        platform: 'twitter',
                        type: this.determineTweetType(tweet),
                        url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
                        content: tweet.text,
                        media: this.extractTwitterMedia(tweet),
                        author: {
                            id: tweet.user.id_str,
                            username: tweet.user.screen_name,
                            displayName: tweet.user.name,
                            followers: tweet.user.followers_count,
                            verified: tweet.user.verified,
                            profileImage: tweet.user.profile_image_url_https
                        },
                        metrics: {
                            likes: tweet.favorite_count,
                            retweets: tweet.retweet_count,
                            replies: tweet.reply_count || 0,
                            engagementCount: tweet.favorite_count + tweet.retweet_count + (tweet.reply_count || 0)
                        },
                        hashtags: this.extractHashtags(tweet.text),
                        mentions: this.extractMentions(tweet.text),
                        publishedAt: new Date(tweet.created_at),
                        discoveredAt: new Date(),
                        discoveredVia: mention,
                        status: 'discovered',
                        qualityScore: 0,
                        moderationStatus: 'pending'
                    };
                    
                    content.push(contentItem);
                }
            }
            
        } catch (error) {
            console.error('❌ Twitter content discovery failed:', error);
        }
        
        return content;
    }

    /**
     * Search Twitter API
     */
    async searchTwitter(query, params = {}) {
        if (!this.checkRateLimit('twitter')) {
            throw new Error('Twitter rate limit exceeded');
        }
        
        try {
            const response = await axios.get('https://api.twitter.com/1.1/search/tweets.json', {
                params: { q: query, ...params },
                headers: {
                    'Authorization': `Bearer ${this.config.apiKeys?.twitter}`
                }
            });
            
            this.recordRateLimitUse('twitter');
            return response.data;
            
        } catch (error) {
            console.error('Twitter API error:', error);
            throw error;
        }
    }

    /**
     * Discover Instagram content (placeholder - requires Instagram API setup)
     */
    async discoverInstagramContent() {
        // Instagram Basic Display API would be used here
        // For now, return mock data structure
        return [];
    }

    /**
     * Discover LinkedIn content (placeholder)
     */
    async discoverLinkedInContent() {
        // LinkedIn API would be used here
        return [];
    }

    /**
     * Discover TikTok content (placeholder)
     */
    async discoverTikTokContent() {
        // TikTok API would be used here
        return [];
    }

    /**
     * Discover YouTube content (placeholder)
     */
    async discoverYouTubeContent() {
        // YouTube Data API would be used here
        return [];
    }

    /**
     * Discover Reddit content (placeholder)
     */
    async discoverRedditContent() {
        // Reddit API would be used here
        return [];
    }

    /**
     * Process discovered content
     */
    async processDiscoveredContent(discovered) {
        console.log(`🔍 Processing ${discovered.length} discovered content items`);
        
        for (const contentItem of discovered) {
            try {
                // Calculate quality score
                contentItem.qualityScore = this.calculateQualityScore(contentItem);
                
                // Apply initial moderation
                const moderationResult = await this.moderateContent(contentItem);
                contentItem.moderationStatus = moderationResult.status;
                contentItem.moderationNotes = moderationResult.notes;
                
                // Add to database
                this.contentDatabase.set(contentItem.id, contentItem);
                
                // Add to curation queue if passed initial moderation
                if (moderationResult.status === 'approved' || moderationResult.status === 'pending_review') {
                    this.curationQueue.push(contentItem);
                }
                
                console.log(`✅ Processed ${contentItem.platform} content from @${contentItem.author.username}`);
                
            } catch (error) {
                console.error(`❌ Failed to process content ${contentItem.id}:`, error);
            }
        }
        
        // Save updated database
        await this.saveContentDatabase();
        this.updateStateCounts();
        
        this.emit('content_processed', { processed: discovered.length });
    }

    /**
     * Calculate quality score for content
     */
    calculateQualityScore(content) {
        let score = 0;
        
        // Engagement score (40%)
        const engagementRate = content.metrics.engagementCount / Math.max(content.author.followers, 1);
        score += Math.min(engagementRate * 100, 1) * 0.4;
        
        // Author credibility (25%)
        let authorScore = 0;
        authorScore += content.author.verified ? 0.3 : 0;
        authorScore += Math.min(content.author.followers / 10000, 1) * 0.7;
        score += authorScore * 0.25;
        
        // Content quality (20%)
        let contentScore = 0;
        contentScore += this.hasGoodMediaQuality(content) ? 0.5 : 0;
        contentScore += this.hasGoodTextQuality(content) ? 0.5 : 0;
        score += contentScore * 0.2;
        
        // Brand relevance (15%)
        let relevanceScore = 0;
        relevanceScore += this.hasBrandMention(content) ? 0.4 : 0;
        relevanceScore += this.hasRelevantHashtags(content) ? 0.3 : 0;
        relevanceScore += this.isContextuallyRelevant(content) ? 0.3 : 0;
        score += relevanceScore * 0.15;
        
        return Math.min(score, 1);
    }

    /**
     * Moderate content using automated rules
     */
    async moderateContent(content) {
        const results = [];
        
        // Apply all moderation rules
        for (const [ruleName, ruleFunction] of this.moderationRules) {
            try {
                const passed = ruleFunction(content);
                results.push({
                    rule: ruleName,
                    passed: passed,
                    critical: this.isCriticalRule(ruleName)
                });
                
                if (!passed && this.isCriticalRule(ruleName)) {
                    return {
                        status: 'rejected',
                        notes: `Failed critical rule: ${ruleName}`,
                        ruleResults: results
                    };
                }
                
            } catch (error) {
                console.error(`❌ Moderation rule ${ruleName} failed:`, error);
                results.push({
                    rule: ruleName,
                    passed: false,
                    error: error.message
                });
            }
        }
        
        // Determine final status
        const failedRules = results.filter(r => !r.passed && !r.critical);
        const totalRules = results.length;
        const passRate = (totalRules - failedRules.length) / totalRules;
        
        let status;
        if (passRate >= 0.9) {
            status = 'approved';
        } else if (passRate >= 0.7) {
            status = 'pending_review';
        } else {
            status = 'rejected';
        }
        
        return {
            status: status,
            notes: `Passed ${totalRules - failedRules.length}/${totalRules} rules`,
            ruleResults: results,
            passRate: passRate
        };
    }

    /**
     * Process curation queue
     */
    async processCurationQueue() {
        if (this.curationQueue.length === 0) return;
        
        console.log(`📋 Processing ${this.curationQueue.length} items in curation queue`);
        
        const batch = this.curationQueue.splice(0, 20); // Process 20 at a time
        
        for (const content of batch) {
            try {
                // Enhanced quality analysis
                const enhancedScore = await this.performEnhancedQualityAnalysis(content);
                content.qualityScore = enhancedScore;
                
                // Update status based on quality
                if (enhancedScore >= this.config.qualityThresholds.minQualityScore) {
                    content.status = 'curated';
                    
                    // Add to amplification queue if auto-share enabled
                    if (this.config.amplificationRules.autoShare && 
                        enhancedScore >= this.config.amplificationRules.qualityThreshold) {
                        this.amplificationQueue.push(content);
                    }
                } else {
                    content.status = 'low_quality';
                }
                
                content.lastModerated = new Date();
                
            } catch (error) {
                console.error(`❌ Failed to curate content ${content.id}:`, error);
                content.status = 'curation_failed';
            }
        }
        
        await this.saveContentDatabase();
        this.emit('curation_processed', { processed: batch.length });
    }

    /**
     * Perform enhanced quality analysis
     */
    async performEnhancedQualityAnalysis(content) {
        let enhancedScore = content.qualityScore;
        
        // Sentiment analysis bonus
        const sentiment = await this.analyzeSentiment(content.content);
        if (sentiment.score > 0.6) enhancedScore += 0.1;
        
        // Engagement velocity bonus
        const engagementVelocity = this.calculateEngagementVelocity(content);
        enhancedScore += Math.min(engagementVelocity, 0.1);
        
        // Author history bonus
        const authorHistory = await this.analyzeAuthorHistory(content.author);
        if (authorHistory.qualityScore > 0.7) enhancedScore += 0.05;
        
        // Content freshness bonus
        const freshnessBonus = this.calculateFreshnessBonus(content);
        enhancedScore += freshnessBonus;
        
        return Math.min(enhancedScore, 1);
    }

    /**
     * Process amplification queue
     */
    async processAmplificationQueue() {
        if (this.amplificationQueue.length === 0) return;
        
        // Check daily amplification limit
        if (this.state.dailyAmplifications >= this.config.amplificationRules.maxDailyShares) {
            console.log('⚠️ Daily amplification limit reached');
            return;
        }
        
        console.log(`📢 Processing ${this.amplificationQueue.length} items in amplification queue`);
        
        const batch = this.amplificationQueue.splice(0, 5); // Process 5 at a time
        
        for (const content of batch) {
            try {
                // Final approval check
                if (this.config.amplificationRules.requireApproval && content.status !== 'approved_for_amplification') {
                    continue;
                }
                
                // Amplify content
                const amplificationResult = await this.amplifyContent(content);
                
                if (amplificationResult.success) {
                    content.status = 'amplified';
                    content.amplifiedAt = new Date();
                    content.amplificationResults = amplificationResult.results;
                    
                    this.state.dailyAmplifications++;
                    this.state.amplified++;
                    
                    console.log(`📢 Amplified content from @${content.author.username} on ${content.platform}`);
                    this.emit('content_amplified', content);
                }
                
            } catch (error) {
                console.error(`❌ Failed to amplify content ${content.id}:`, error);
                content.status = 'amplification_failed';
            }
        }
        
        await this.saveContentDatabase();
    }

    /**
     * Amplify content across platforms
     */
    async amplifyContent(content) {
        const results = [];
        
        // Determine amplification strategy
        const strategy = this.determineAmplificationStrategy(content);
        
        for (const action of strategy.actions) {
            try {
                const result = await this.executeAmplificationAction(content, action);
                results.push(result);
                
            } catch (error) {
                console.error(`❌ Amplification action ${action.type} failed:`, error);
                results.push({
                    action: action.type,
                    success: false,
                    error: error.message
                });
            }
        }
        
        const successfulActions = results.filter(r => r.success).length;
        
        return {
            success: successfulActions > 0,
            results: results,
            strategy: strategy,
            successRate: successfulActions / results.length
        };
    }

    /**
     * Determine amplification strategy for content
     */
    determineAmplificationStrategy(content) {
        const strategy = {
            actions: [],
            reasoning: []
        };
        
        // Always retweet/share original content
        strategy.actions.push({
            type: 'native_share',
            platform: content.platform,
            original_url: content.url,
            message: this.generateShareMessage(content)
        });
        
        // Cross-platform sharing for high-quality content
        if (content.qualityScore >= 0.8) {
            const crossPlatforms = ['twitter', 'linkedin', 'facebook'];
            
            crossPlatforms.forEach(platform => {
                if (platform !== content.platform && this.config.platforms[platform]) {
                    strategy.actions.push({
                        type: 'cross_platform_share',
                        platform: platform,
                        content: this.adaptContentForPlatform(content, platform),
                        original_url: content.url
                    });
                }
            });
        }
        
        // Email newsletter inclusion for premium content
        if (content.qualityScore >= 0.9) {
            strategy.actions.push({
                type: 'newsletter_inclusion',
                section: 'community_highlights',
                content: content
            });
        }
        
        // Website feature for exceptional content
        if (content.qualityScore >= 0.95) {
            strategy.actions.push({
                type: 'website_feature',
                location: 'homepage_testimonials',
                content: content
            });
        }
        
        return strategy;
    }

    /**
     * Execute individual amplification action
     */
    async executeAmplificationAction(content, action) {
        switch (action.type) {
            case 'native_share':
                return await this.executeNativeShare(content, action);
            case 'cross_platform_share':
                return await this.executeCrossPlatformShare(content, action);
            case 'newsletter_inclusion':
                return await this.executeNewsletterInclusion(content, action);
            case 'website_feature':
                return await this.executeWebsiteFeature(content, action);
            default:
                throw new Error(`Unknown amplification action: ${action.type}`);
        }
    }

    /**
     * Execute native platform share (retweet, share, etc.)
     */
    async executeNativeShare(content, action) {
        const payload = {
            platform: action.platform,
            action: 'share',
            original_url: content.url,
            message: action.message,
            content_id: content.id
        };
        
        try {
            const response = await axios.post(`${this.config.webhookUrl}/social/share`, payload);
            
            return {
                action: 'native_share',
                platform: action.platform,
                success: true,
                response_id: response.data.id,
                timestamp: new Date()
            };
            
        } catch (error) {
            throw new Error(`Native share failed: ${error.message}`);
        }
    }

    /**
     * Execute cross-platform share
     */
    async executeCrossPlatformShare(content, action) {
        const payload = {
            platform: action.platform,
            content: action.content,
            original_url: content.url,
            source_platform: content.platform,
            content_id: content.id
        };
        
        try {
            const response = await axios.post(`${this.config.webhookUrl}/social/post`, payload);
            
            return {
                action: 'cross_platform_share',
                platform: action.platform,
                success: true,
                post_id: response.data.id,
                timestamp: new Date()
            };
            
        } catch (error) {
            throw new Error(`Cross-platform share failed: ${error.message}`);
        }
    }

    /**
     * Generate share message for content
     */
    generateShareMessage(content) {
        const messages = [
            `Amazing feedback from our community! 🎉`,
            `Love seeing our users create amazing content! 🔥`,
            `This is exactly why we built Marketing Automation Hub! ✨`,
            `Community love! Thank you for sharing your experience! 💙`,
            `Real results from real creators! 🚀`
        ];
        
        const baseMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Add user attribution
        const attribution = `\n\nCredit: @${content.author.username}`;
        
        // Add relevant hashtags
        const hashtags = this.selectRelevantHashtags(content).slice(0, 3).join(' ');
        
        return `${baseMessage}${attribution}\n\n${hashtags}`;
    }

    /**
     * Helper functions for content analysis
     */
    isContentFresh(content) {
        const ageInDays = (Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
        return ageInDays <= this.config.qualityThresholds.maxContentAge;
    }

    detectSpam(content) {
        const spamIndicators = [
            /buy now/gi,
            /click here/gi,
            /limited time/gi,
            /act fast/gi,
            /urgent/gi
        ];
        
        return spamIndicators.some(pattern => pattern.test(content.content));
    }

    isBrandAppropriate(content) {
        const inappropriateKeywords = [
            'scam', 'fake', 'terrible', 'waste', 'awful', 'horrible'
        ];
        
        const contentLower = content.content.toLowerCase();
        return !inappropriateKeywords.some(keyword => contentLower.includes(keyword));
    }

    detectOffensiveContent(content) {
        // Basic offensive content detection
        const offensivePatterns = [
            /hate/gi,
            /violent/gi,
            // Add more patterns as needed
        ];
        
        return offensivePatterns.some(pattern => pattern.test(content.content));
    }

    hasAuthenticEngagement(content) {
        // Check for suspicious engagement patterns
        const engagementRate = content.metrics.engagementCount / Math.max(content.author.followers, 1);
        
        // Flag if engagement rate is suspiciously high (possible bot engagement)
        return engagementRate <= 0.15; // 15% max engagement rate
    }

    hasBrandMention(content) {
        const contentLower = content.content.toLowerCase();
        
        return this.config.brandMentions.some(mention => 
            contentLower.includes(mention.toLowerCase())
        ) || content.mentions.some(mention => 
            this.config.brandMentions.some(brandMention => 
                brandMention.toLowerCase().includes(mention.toLowerCase())
            )
        );
    }

    hasRelevantHashtags(content) {
        return content.hashtags.some(hashtag => 
            this.config.brandHashtags.some(brandHashtag => 
                brandHashtag.toLowerCase() === hashtag.toLowerCase()
            )
        );
    }

    isContextuallyRelevant(content) {
        const relevantKeywords = [
            'marketing', 'automation', 'creator', 'tools', 'productivity',
            'business', 'entrepreneurship', 'content', 'social media'
        ];
        
        const contentLower = content.content.toLowerCase();
        return relevantKeywords.some(keyword => contentLower.includes(keyword));
    }

    hasGoodMediaQuality(content) {
        if (!content.media || content.media.length === 0) return true; // No media requirement
        
        // Check if media meets quality standards
        return content.media.every(media => {
            return media.width >= 400 && media.height >= 400; // Minimum resolution
        });
    }

    hasGoodTextQuality(content) {
        const text = content.content;
        
        // Check minimum length
        if (text.length < 10) return false;
        
        // Check for excessive caps
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > 0.3) return false;
        
        // Check for excessive punctuation
        const punctuationRatio = (text.match(/[!?.,;:]/g) || []).length / text.length;
        if (punctuationRatio > 0.15) return false;
        
        return true;
    }

    isCopyrightClear(content) {
        // Basic copyright check - in real implementation, this would be more sophisticated
        const copyrightIndicators = [
            '©', 'copyright', 'all rights reserved', 'unauthorized'
        ];
        
        const contentLower = content.content.toLowerCase();
        return !copyrightIndicators.some(indicator => contentLower.includes(indicator));
    }

    isPlatformCompliant(content) {
        // Check platform-specific compliance rules
        // This is a simplified check - real implementation would be more comprehensive
        return true;
    }

    isCriticalRule(ruleName) {
        const criticalRules = [
            'no_offensive_content',
            'copyright_clear',
            'no_spam',
            'platform_compliant'
        ];
        
        return criticalRules.includes(ruleName);
    }

    /**
     * Utility functions
     */
    determineTweetType(tweet) {
        if (tweet.in_reply_to_status_id) return 'reply';
        if (tweet.retweeted_status) return 'retweet';
        if (tweet.is_quote_status) return 'quote_tweet';
        return 'original';
    }

    extractTwitterMedia(tweet) {
        const media = [];
        
        if (tweet.entities && tweet.entities.media) {
            tweet.entities.media.forEach(mediaItem => {
                media.push({
                    type: mediaItem.type,
                    url: mediaItem.media_url_https,
                    width: mediaItem.sizes.large.w,
                    height: mediaItem.sizes.large.h
                });
            });
        }
        
        return media;
    }

    extractHashtags(text) {
        const hashtagRegex = /#[a-zA-Z0-9_]+/g;
        const matches = text.match(hashtagRegex);
        return matches ? matches.map(tag => tag.toLowerCase()) : [];
    }

    extractMentions(text) {
        const mentionRegex = /@[a-zA-Z0-9_]+/g;
        const matches = text.match(mentionRegex);
        return matches ? matches.map(mention => mention.substring(1)) : [];
    }

    async analyzeSentiment(text) {
        // Mock sentiment analysis - in real implementation, use actual sentiment analysis service
        const positiveWords = ['love', 'amazing', 'great', 'awesome', 'fantastic', 'excellent'];
        const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'horrible', 'worst'];
        
        const textLower = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
        
        const score = (positiveCount - negativeCount + 5) / 10; // Normalize to 0-1
        
        return {
            score: Math.max(0, Math.min(1, score)),
            positive: positiveCount,
            negative: negativeCount
        };
    }

    calculateEngagementVelocity(content) {
        const ageInHours = (Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60);
        const engagementPerHour = content.metrics.engagementCount / Math.max(ageInHours, 1);
        
        // Normalize to 0-0.1 bonus
        return Math.min(engagementPerHour / 100, 0.1);
    }

    async analyzeAuthorHistory(author) {
        // Mock author analysis - in real implementation, analyze author's historical content
        return {
            qualityScore: Math.random() * 0.4 + 0.6, // Random score between 0.6-1.0
            contentCount: Math.floor(Math.random() * 100),
            avgEngagement: Math.random() * 0.1
        };
    }

    calculateFreshnessBonus(content) {
        const ageInHours = (Date.now() - content.publishedAt.getTime()) / (1000 * 60 * 60);
        
        // Bonus decreases with age
        if (ageInHours <= 1) return 0.05;
        if (ageInHours <= 6) return 0.03;
        if (ageInHours <= 24) return 0.01;
        return 0;
    }

    adaptContentForPlatform(content, platform) {
        // Adapt content for different platform requirements
        const adaptations = {
            twitter: content.content.substring(0, 250) + (content.content.length > 250 ? '...' : ''),
            linkedin: `Great to see: "${content.content}"\n\nOriginal: ${content.url}`,
            facebook: `Amazing feedback from our community!\n\n"${content.content}"\n\nSource: ${content.url}`
        };
        
        return adaptations[platform] || content.content;
    }

    selectRelevantHashtags(content) {
        const baseHashtags = ['#MarketingAutomationHub', '#CreatorFeedback', '#UserLove'];
        const contentHashtags = content.hashtags.filter(tag => 
            this.config.brandHashtags.includes(tag)
        );
        
        return [...baseHashtags, ...contentHashtags];
    }

    checkRateLimit(platform) {
        const limiter = this.rateLimiter.get(platform);
        if (!limiter) return true;
        
        const now = Date.now();
        limiter.requests = limiter.requests.filter(timestamp => 
            now - timestamp < limiter.window
        );
        
        return limiter.requests.length < limiter.limit;
    }

    recordRateLimitUse(platform) {
        const limiter = this.rateLimiter.get(platform);
        if (limiter) {
            limiter.requests.push(Date.now());
        }
    }

    updateStateCounts() {
        let pending = 0, approved = 0, amplified = 0;
        
        this.contentDatabase.forEach(content => {
            switch (content.status) {
                case 'pending_review':
                    pending++;
                    break;
                case 'curated':
                case 'approved':
                    approved++;
                    break;
                case 'amplified':
                    amplified++;
                    break;
            }
        });
        
        this.state.totalContent = this.contentDatabase.size;
        this.state.pendingReview = pending;
        this.state.approved = approved;
        this.state.amplified = amplified;
    }

    async saveContentDatabase() {
        try {
            const data = Array.from(this.contentDatabase.values());
            const jsonData = JSON.stringify(data, null, 2);
            
            await fs.writeFile(this.config.databasePath, jsonData, 'utf8');
            
        } catch (error) {
            console.error('❌ Failed to save UGC database:', error);
        }
    }

    startAutomationScheduler() {
        // Reset daily counters at midnight
        setInterval(() => {
            this.resetDailyCounters();
        }, 24 * 60 * 60 * 1000);
        
        // Update engagement tracking every hour
        setInterval(() => {
            this.updateEngagementTracking();
        }, 60 * 60 * 1000);
        
        console.log('⏰ UGC automation scheduler started');
    }

    resetDailyCounters() {
        if (this.isNewDay()) {
            this.state.dailyAmplifications = 0;
            this.state.lastReset = new Date();
            console.log('🔄 Daily UGC counters reset');
        }
    }

    isNewDay() {
        const now = new Date();
        const lastReset = this.state.lastReset;
        
        return now.getDate() !== lastReset.getDate() ||
               now.getMonth() !== lastReset.getMonth() ||
               now.getFullYear() !== lastReset.getFullYear();
    }

    updateEngagementTracking() {
        // Track engagement performance of amplified content
        // This would involve checking updated metrics from platform APIs
        console.log('📊 Updating engagement tracking for amplified content');
    }

    /**
     * Get UGC system statistics
     */
    getStats() {
        const stats = {
            system: {
                active: this.state.systemActive,
                totalContent: this.state.totalContent,
                pendingReview: this.state.pendingReview,
                approved: this.state.approved,
                amplified: this.state.amplified,
                dailyAmplifications: this.state.dailyAmplifications
            },
            quality: {
                averageQualityScore: this.calculateAverageQualityScore(),
                topQualityContent: this.getTopQualityContent(5),
                rejectionRate: this.calculateRejectionRate()
            },
            platforms: this.getPlatformBreakdown(),
            performance: {
                amplificationSuccessRate: this.calculateAmplificationSuccessRate(),
                engagementRate: this.state.engagementRate,
                topPerformingContent: this.getTopPerformingContent(5)
            }
        };
        
        return stats;
    }

    calculateAverageQualityScore() {
        if (this.contentDatabase.size === 0) return 0;
        
        let totalScore = 0;
        let count = 0;
        
        this.contentDatabase.forEach(content => {
            if (content.qualityScore > 0) {
                totalScore += content.qualityScore;
                count++;
            }
        });
        
        return count > 0 ? totalScore / count : 0;
    }

    getTopQualityContent(limit) {
        return Array.from(this.contentDatabase.values())
            .filter(content => content.qualityScore > 0)
            .sort((a, b) => b.qualityScore - a.qualityScore)
            .slice(0, limit)
            .map(content => ({
                id: content.id,
                platform: content.platform,
                author: content.author.username,
                qualityScore: content.qualityScore,
                status: content.status
            }));
    }

    calculateRejectionRate() {
        const totalModerated = Array.from(this.contentDatabase.values()).filter(
            content => content.moderationStatus && content.moderationStatus !== 'pending'
        ).length;
        
        const rejected = Array.from(this.contentDatabase.values()).filter(
            content => content.moderationStatus === 'rejected'
        ).length;
        
        return totalModerated > 0 ? rejected / totalModerated : 0;
    }

    getPlatformBreakdown() {
        const breakdown = {};
        
        this.contentDatabase.forEach(content => {
            if (!breakdown[content.platform]) {
                breakdown[content.platform] = {
                    total: 0,
                    approved: 0,
                    amplified: 0,
                    averageQuality: 0
                };
            }
            
            breakdown[content.platform].total++;
            
            if (content.status === 'approved' || content.status === 'curated') {
                breakdown[content.platform].approved++;
            }
            
            if (content.status === 'amplified') {
                breakdown[content.platform].amplified++;
            }
        });
        
        // Calculate average quality per platform
        Object.keys(breakdown).forEach(platform => {
            const platformContent = Array.from(this.contentDatabase.values()).filter(
                content => content.platform === platform && content.qualityScore > 0
            );
            
            if (platformContent.length > 0) {
                const totalQuality = platformContent.reduce((sum, content) => sum + content.qualityScore, 0);
                breakdown[platform].averageQuality = totalQuality / platformContent.length;
            }
        });
        
        return breakdown;
    }

    calculateAmplificationSuccessRate() {
        const amplified = Array.from(this.contentDatabase.values()).filter(
            content => content.status === 'amplified'
        );
        
        const attempted = Array.from(this.contentDatabase.values()).filter(
            content => content.amplificationResults || content.status === 'amplification_failed'
        );
        
        return attempted.length > 0 ? amplified.length / attempted.length : 0;
    }

    getTopPerformingContent(limit) {
        return Array.from(this.contentDatabase.values())
            .filter(content => content.status === 'amplified' && content.metrics)
            .sort((a, b) => b.metrics.engagementCount - a.metrics.engagementCount)
            .slice(0, limit)
            .map(content => ({
                id: content.id,
                platform: content.platform,
                author: content.author.username,
                engagement: content.metrics.engagementCount,
                qualityScore: content.qualityScore
            }));
    }
}

module.exports = UGCSystem;