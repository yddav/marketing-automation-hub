/**
 * Crisis Management System
 * Enterprise-grade automated response system for negative feedback and crisis situations
 * Handles real-time monitoring, threat classification, and coordinated response protocols
 */

const EventEmitter = require('events');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class CrisisManagementSystem extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            databasePath: config.databasePath || './data/crisis_events.json',
            responsePath: config.responsePath || './content_templates/crisis_responses',
            webhookUrl: config.webhookUrl,
            monitoringKeywords: config.monitoringKeywords || [
                'scam', 'fraud', 'fake', 'terrible', 'awful', 'hate', 'worst', 
                'ripoff', 'waste', 'broken', 'useless', 'disappointed', 'angry'
            ],
            brandMentions: config.brandMentions || [
                'Marketing Automation Hub', 'MarketingAutomationHub', '@MarketingHub'
            ],
            platforms: config.platforms || ['twitter', 'instagram', 'facebook', 'linkedin', 'reddit', 'youtube'],
            severityThresholds: {
                low: { mentions: 3, sentiment: -0.3, timeframe: 3600000 }, // 1 hour
                medium: { mentions: 10, sentiment: -0.5, timeframe: 1800000 }, // 30 minutes
                high: { mentions: 25, sentiment: -0.7, timeframe: 900000 }, // 15 minutes
                critical: { mentions: 50, sentiment: -0.8, timeframe: 300000 } // 5 minutes
            },
            responseDelays: {
                critical: 300000, // 5 minutes
                high: 900000, // 15 minutes
                medium: 1800000, // 30 minutes
                low: 3600000 // 1 hour
            },
            escalationRules: {
                autoEscalate: config.autoEscalate || true,
                manualOverride: config.manualOverride || true,
                teamNotification: config.teamNotification || true
            },
            ...config
        };
        
        this.state = {
            monitoringActive: false,
            activeCrises: new Map(),
            totalEvents: 0,
            resolvedEvents: 0,
            averageResponseTime: 0,
            currentThreatLevel: 'green',
            lastEvaluation: null
        };
        
        this.eventDatabase = new Map();
        this.responseTemplates = new Map();
        this.alertRules = new Map();
        this.escalationChain = [];
        this.sentimentTracker = new Map();
        this.responseQueue = [];
        this.suppressionRules = new Map();
        
        this.initializeSystem();
    }

    /**
     * Initialize the crisis management system
     */
    async initializeSystem() {
        console.log('🚨 Initializing Crisis Management System');
        
        try {
            await this.loadEventDatabase();
            await this.loadResponseTemplates();
            await this.setupAlertRules();
            await this.setupEscalationChain();
            this.startContinuousMonitoring();
            
            this.state.monitoringActive = true;
            console.log('✅ Crisis Management System initialized and monitoring active');
            this.emit('system_initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize crisis management system:', error);
            throw error;
        }
    }

    /**
     * Load existing crisis event database
     */
    async loadEventDatabase() {
        try {
            const dbExists = await fs.access(this.config.databasePath).then(() => true).catch(() => false);
            
            if (dbExists) {
                const data = await fs.readFile(this.config.databasePath, 'utf8');
                const events = JSON.parse(data);
                
                events.forEach(event => {
                    this.eventDatabase.set(event.id, {
                        ...event,
                        detectedAt: new Date(event.detectedAt),
                        lastUpdated: new Date(event.lastUpdated),
                        resolvedAt: event.resolvedAt ? new Date(event.resolvedAt) : null
                    });
                });
                
                console.log(`📊 Loaded ${this.eventDatabase.size} crisis events from database`);
            } else {
                console.log('📊 Creating new crisis events database');
                await this.saveEventDatabase();
            }
            
            this.updateStateCounts();
            
        } catch (error) {
            console.error('❌ Failed to load crisis event database:', error);
            throw error;
        }
    }

    /**
     * Load crisis response templates
     */
    async loadResponseTemplates() {
        const templates = new Map([
            // Immediate acknowledgment templates
            ['acknowledge_issue', {
                priority: 'critical',
                delay: 0,
                template: "Hi {{user_name}}, we've seen your feedback about {{issue_description}}. We take all concerns seriously and are looking into this immediately. I'll personally follow up with you within {{response_timeframe}}. Thank you for bringing this to our attention. - {{responder_name}}"
            }],
            
            ['acknowledge_bug', {
                priority: 'high',
                delay: 300000, // 5 minutes
                template: "Thanks for reporting this, {{user_name}}. We've identified the {{bug_type}} issue you mentioned and our engineering team is working on a fix. I'll update you as soon as we have more information. In the meantime, here's a workaround: {{workaround}}. - {{responder_name}}"
            }],
            
            // Explanation templates
            ['explain_misunderstanding', {
                priority: 'medium',
                delay: 600000, // 10 minutes
                template: "Hi {{user_name}}, I think there might be a misunderstanding about {{feature_name}}. Let me clarify: {{explanation}}. I'd be happy to walk you through this personally - would a quick call help? Here's my calendar: {{calendar_link}}. - {{responder_name}}"
            }],
            
            ['explain_limitation', {
                priority: 'medium',
                delay: 900000, // 15 minutes
                template: "{{user_name}}, you're absolutely right that {{limitation}} isn't ideal. This is a current limitation we're aware of. Here's what we're doing about it: {{roadmap_item}}. Expected timeline: {{timeline}}. In the meantime, {{alternative_solution}}. - {{responder_name}}"
            }],
            
            // Apology and resolution templates
            ['apologize_and_fix', {
                priority: 'critical',
                delay: 0,
                template: "{{user_name}}, I sincerely apologize for {{problem_description}}. This doesn't reflect our standards. Here's what happened: {{root_cause}} and here's what we're doing: {{resolution_steps}}. I've also {{compensation}} as an apology. Thank you for your patience. - {{responder_name}}"
            }],
            
            ['service_recovery', {
                priority: 'high',
                delay: 300000, // 5 minutes
                template: "Hi {{user_name}}, I'm {{responder_name}}, {{title}} at Marketing Automation Hub. I've personally reviewed your experience and want to make this right. {{specific_resolution}}. I'd also like to offer {{compensation}} and a direct line to me for any future concerns: {{direct_contact}}. - {{responder_name}}"
            }],
            
            // Escalation templates
            ['founder_response', {
                priority: 'critical',
                delay: 0,
                template: "{{user_name}}, this is {{founder_name}}, founder of Marketing Automation Hub. {{personal_note}}. Your feedback is exactly what helps us improve. I'd love to speak with you directly to understand better and make this right. Here's my personal calendar: {{founder_calendar}}. - {{founder_name}}"
            }],
            
            // Follow-up templates
            ['followup_resolution', {
                priority: 'medium',
                delay: 86400000, // 24 hours
                template: "Hi {{user_name}}, following up on {{issue_reference}}. How are things working now? The {{solution_implemented}} should have resolved the issue, but please let me know if you're still experiencing any problems. Your satisfaction is important to us. - {{responder_name}}"
            }],
            
            ['followup_satisfaction', {
                priority: 'low',
                delay: 259200000, // 72 hours
                template: "{{user_name}}, just checking in after our recent interaction about {{issue_summary}}. I hope the resolution we provided is working well for you. If you have any other questions or feedback, please don't hesitate to reach out. - {{responder_name}}"
            }],
            
            // Platform-specific templates
            ['twitter_response', {
                priority: 'high',
                delay: 180000, // 3 minutes
                template: "Hi {{username}}, saw your tweet about {{issue}}. DMing you now to resolve this quickly. We're committed to making this right! 🛠️"
            }],
            
            ['reddit_response', {
                priority: 'medium',
                delay: 900000, // 15 minutes
                template: "Thanks for the honest feedback, {{username}}. You're right about {{concern}}. Here's the full context: {{detailed_explanation}}. Happy to discuss further - feel free to DM me or comment below."
            }],
            
            // Proactive communication templates
            ['proactive_outreach', {
                priority: 'high',
                delay: 0,
                template: "Hi {{user_name}}, we noticed you might have experienced {{potential_issue}} recently. We've since {{preventive_action}} to prevent this from happening again. If you were affected, please let us know and we'll {{resolution_offer}}. - {{responder_name}}"
            }],
            
            // Legal/Compliance templates
            ['legal_response', {
                priority: 'critical',
                delay: 0,
                template: "{{user_name}}, thank you for bringing this to our attention. We take {{legal_concern}} very seriously. Our legal team is reviewing this matter and we'll respond within {{legal_timeframe}}. For immediate concerns, please contact {{legal_contact}}. - {{legal_responder}}"
            }]
        ]);
        
        this.responseTemplates = templates;
        console.log(`✅ Loaded ${templates.size} crisis response templates`);
    }

    /**
     * Setup alert rules for different crisis scenarios
     */
    async setupAlertRules() {
        const rules = new Map([
            // Volume-based alerts
            ['high_negative_volume', {
                condition: (metrics) => {
                    const recentNegative = this.getRecentNegativeMentions(3600000); // 1 hour
                    return recentNegative.length >= 10;
                },
                severity: 'high',
                action: 'immediate_response',
                notification: ['team_lead', 'community_manager']
            }],
            
            // Sentiment-based alerts
            ['sentiment_drop', {
                condition: (metrics) => {
                    const avgSentiment = this.calculateAverageSentiment(1800000); // 30 minutes
                    return avgSentiment <= -0.6;
                },
                severity: 'medium',
                action: 'monitor_and_respond',
                notification: ['community_manager']
            }],
            
            // Influencer/high-profile mentions
            ['influencer_negative', {
                condition: (mention) => {
                    return mention.author.followers >= 10000 && mention.sentiment <= -0.5;
                },
                severity: 'high',
                action: 'priority_response',
                notification: ['team_lead', 'founder']
            }],
            
            // Platform-wide trending
            ['trending_negative', {
                condition: (metrics) => {
                    return metrics.trendingScore >= 0.7 && metrics.sentiment <= -0.4;
                },
                severity: 'critical',
                action: 'crisis_protocol',
                notification: ['all_hands']
            }],
            
            // Legal/compliance concerns
            ['legal_keyword', {
                condition: (mention) => {
                    const legalKeywords = ['lawsuit', 'legal action', 'lawyer', 'sue', 'court', 'illegal'];
                    const content = mention.content.toLowerCase();
                    return legalKeywords.some(keyword => content.includes(keyword));
                },
                severity: 'critical',
                action: 'legal_escalation',
                notification: ['legal_team', 'founder']
            }],
            
            // Security concerns
            ['security_issue', {
                condition: (mention) => {
                    const securityKeywords = ['hack', 'breach', 'security', 'password', 'data', 'privacy'];
                    const content = mention.content.toLowerCase();
                    return securityKeywords.some(keyword => content.includes(keyword)) && mention.sentiment <= -0.3;
                },
                severity: 'critical',
                action: 'security_protocol',
                notification: ['security_team', 'cto', 'founder']
            }],
            
            // Feature/product issues  
            ['product_failure', {
                condition: (mention) => {
                    const failureKeywords = ['broken', 'not working', 'crashed', 'bug', 'error', 'failed'];
                    const content = mention.content.toLowerCase();
                    return failureKeywords.some(keyword => content.includes(keyword));
                },
                severity: 'medium',
                action: 'technical_support',
                notification: ['support_team', 'engineering_lead']
            }],
            
            // Customer service issues
            ['service_complaint', {
                condition: (mention) => {
                    const serviceKeywords = ['support', 'help', 'response', 'ignored', 'waiting'];
                    const content = mention.content.toLowerCase();
                    return serviceKeywords.some(keyword => content.includes(keyword)) && mention.sentiment <= -0.4;
                },
                severity: 'medium',
                action: 'service_escalation',
                notification: ['support_manager']
            }]
        ]);
        
        this.alertRules = rules;
        console.log(`✅ Setup ${rules.size} crisis alert rules`);
    }

    /**
     * Setup escalation chain
     */
    async setupEscalationChain() {
        this.escalationChain = [
            {
                level: 1,
                role: 'community_manager',
                name: 'Community Manager',
                contact: 'community@marketingautomationhub.com',
                autoEscalateAfter: 1800000, // 30 minutes
                handlesTypes: ['general_negative', 'product_questions', 'feature_requests']
            },
            {
                level: 2,
                role: 'support_manager',
                name: 'Support Manager',
                contact: 'support-manager@marketingautomationhub.com',
                autoEscalateAfter: 3600000, // 1 hour
                handlesTypes: ['technical_issues', 'billing_problems', 'service_complaints']
            },
            {
                level: 3,
                role: 'team_lead',
                name: 'Marketing Team Lead',
                contact: 'marketing-lead@marketingautomationhub.com',
                autoEscalateAfter: 7200000, // 2 hours
                handlesTypes: ['brand_issues', 'influencer_complaints', 'high_volume_negative']
            },
            {
                level: 4,
                role: 'founder',
                name: 'Alex (Founder)',
                contact: 'alex@marketingautomationhub.com',
                autoEscalateAfter: null, // No auto-escalation from founder
                handlesTypes: ['crisis_situations', 'legal_issues', 'major_complaints']
            }
        ];
        
        console.log(`✅ Setup ${this.escalationChain.length}-level escalation chain`);
    }

    /**
     * Start continuous monitoring across platforms
     */
    startContinuousMonitoring() {
        console.log('👁️ Starting continuous crisis monitoring');
        
        // Monitor for new mentions every 2 minutes
        setInterval(() => {
            this.scanForCrisisTriggers();
        }, 2 * 60 * 1000);
        
        // Evaluate overall threat level every 5 minutes
        setInterval(() => {
            this.evaluateOverallThreatLevel();
        }, 5 * 60 * 1000);
        
        // Process response queue every minute
        setInterval(() => {
            this.processResponseQueue();
        }, 60 * 1000);
        
        // Check for escalation triggers every 10 minutes
        setInterval(() => {
            this.checkEscalationTriggers();
        }, 10 * 60 * 1000);
        
        // Generate crisis reports every hour
        setInterval(() => {
            this.generateCrisisReport();
        }, 60 * 60 * 1000);
    }

    /**
     * Scan for crisis triggers across platforms
     */
    async scanForCrisisTriggers() {
        console.log('🔍 Scanning for crisis triggers');
        
        try {
            const mentions = await this.fetchRecentMentions();
            
            for (const mention of mentions) {
                // Skip if already processed
                if (this.eventDatabase.has(mention.id)) continue;
                
                // Analyze sentiment and context
                const analysis = await this.analyzeMention(mention);
                
                // Check against alert rules
                const triggeredRules = await this.checkAlertRules(mention, analysis);
                
                if (triggeredRules.length > 0) {
                    await this.handleCrisisTrigger(mention, analysis, triggeredRules);
                }
            }
            
        } catch (error) {
            console.error('❌ Crisis scanning failed:', error);
        }
    }

    /**
     * Fetch recent mentions across platforms
     */
    async fetchRecentMentions() {
        const mentions = [];
        
        for (const platform of this.config.platforms) {
            try {
                const platformMentions = await this.fetchPlatformMentions(platform);
                mentions.push(...platformMentions);
                
            } catch (error) {
                console.error(`❌ Failed to fetch mentions from ${platform}:`, error);
            }
        }
        
        return mentions;
    }

    /**
     * Fetch mentions from specific platform
     */
    async fetchPlatformMentions(platform) {
        // This would integrate with actual platform APIs
        // For now, we'll simulate mention detection
        
        const mockMentions = [];
        
        // Simulate some negative mentions for demonstration
        if (Math.random() < 0.1) { // 10% chance of negative mention
            mockMentions.push({
                id: `${platform}_${Date.now()}_${Math.random()}`,
                platform: platform,
                author: {
                    username: `user_${Math.floor(Math.random() * 1000)}`,
                    followers: Math.floor(Math.random() * 50000),
                    verified: Math.random() < 0.1
                },
                content: this.generateMockNegativeMention(),
                url: `https://${platform}.com/post/${Date.now()}`,
                publishedAt: new Date(),
                metrics: {
                    likes: Math.floor(Math.random() * 100),
                    shares: Math.floor(Math.random() * 50),
                    comments: Math.floor(Math.random() * 20)
                }
            });
        }
        
        return mockMentions;
    }

    /**
     * Generate mock negative mention for testing
     */
    generateMockNegativeMention() {
        const negativePhrases = [
            "Marketing Automation Hub is a complete waste of money",
            "Terrible experience with @MarketingHub support",
            "This MarketingAutomationHub software is broken and useless",
            "Scam alert: Marketing Automation Hub took my money",
            "Worst automation tool ever. Save your money!"
        ];
        
        return negativePhrases[Math.floor(Math.random() * negativePhrases.length)];
    }

    /**
     * Analyze mention for sentiment and context
     */
    async analyzeMention(mention) {
        const analysis = {
            sentiment: await this.analyzeSentiment(mention.content),
            toxicity: await this.analyzeToxicity(mention.content),
            urgency: this.calculateUrgency(mention),
            influence: this.calculateInfluence(mention.author),
            category: this.categorizeIssue(mention.content),
            keywords: this.extractKeywords(mention.content),
            brandMentioned: this.detectBrandMention(mention.content),
            requiresResponse: false,
            suggestedTemplate: null,
            escalationLevel: 0
        };
        
        // Determine if response is required
        analysis.requiresResponse = this.shouldRespond(analysis);
        
        // Suggest response template
        if (analysis.requiresResponse) {
            analysis.suggestedTemplate = this.suggestResponseTemplate(analysis);
        }
        
        // Determine escalation level
        analysis.escalationLevel = this.calculateEscalationLevel(analysis);
        
        return analysis;
    }

    /**
     * Analyze sentiment of content
     */
    async analyzeSentiment(content) {
        // Mock sentiment analysis - in production, use actual sentiment analysis service
        const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'scam', 'fraud', 'broken', 'useless'];
        const positiveWords = ['love', 'great', 'amazing', 'excellent', 'fantastic', 'wonderful'];
        
        const contentLower = content.toLowerCase();
        let score = 0;
        
        negativeWords.forEach(word => {
            if (contentLower.includes(word)) score -= 0.3;
        });
        
        positiveWords.forEach(word => {
            if (contentLower.includes(word)) score += 0.2;
        });
        
        return {
            score: Math.max(-1, Math.min(1, score)),
            magnitude: Math.abs(score),
            label: score <= -0.3 ? 'negative' : score >= 0.3 ? 'positive' : 'neutral'
        };
    }

    /**
     * Analyze toxicity of content
     */
    async analyzeToxicity(content) {
        // Mock toxicity analysis
        const toxicWords = ['hate', 'stupid', 'idiot', 'scam', 'fraud'];
        const contentLower = content.toLowerCase();
        
        const toxicCount = toxicWords.filter(word => contentLower.includes(word)).length;
        const toxicityScore = Math.min(toxicCount / toxicWords.length, 1);
        
        return {
            score: toxicityScore,
            level: toxicityScore >= 0.7 ? 'high' : toxicityScore >= 0.4 ? 'medium' : 'low'
        };
    }

    /**
     * Calculate urgency of mention
     */
    calculateUrgency(mention) {
        let urgency = 0;
        
        // Author influence adds urgency
        if (mention.author.followers >= 10000) urgency += 0.3;
        if (mention.author.verified) urgency += 0.2;
        
        // Engagement adds urgency
        const totalEngagement = mention.metrics.likes + mention.metrics.shares + mention.metrics.comments;
        urgency += Math.min(totalEngagement / 1000, 0.3);
        
        // Time sensitivity
        const ageInMinutes = (Date.now() - mention.publishedAt.getTime()) / (1000 * 60);
        if (ageInMinutes <= 60) urgency += 0.2; // Recent mentions are more urgent
        
        return Math.min(urgency, 1);
    }

    /**
     * Calculate influence of author
     */
    calculateInfluence(author) {
        let influence = 0;
        
        // Follower count influence
        influence += Math.min(author.followers / 100000, 0.5);
        
        // Verification influence
        if (author.verified) influence += 0.3;
        
        // Engagement rate (mock calculation)
        const estimatedEngagementRate = Math.max(0.01, Math.min(0.1, Math.random() * 0.1));
        influence += estimatedEngagementRate * 2;
        
        return Math.min(influence, 1);
    }

    /**
     * Categorize the issue type
     */
    categorizeIssue(content) {
        const categories = {
            'technical': ['bug', 'error', 'broken', 'not working', 'crash', 'glitch'],
            'billing': ['charge', 'payment', 'refund', 'billing', 'money', 'price'],
            'support': ['support', 'help', 'response', 'contact', 'service'],
            'feature': ['feature', 'missing', 'need', 'request', 'suggestion'],
            'performance': ['slow', 'lag', 'performance', 'speed', 'timeout'],
            'security': ['security', 'privacy', 'hack', 'breach', 'data'],
            'general': []
        };
        
        const contentLower = content.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => contentLower.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    /**
     * Extract relevant keywords from content
     */
    extractKeywords(content) {
        const keywords = [];
        const relevantWords = this.config.monitoringKeywords;
        const contentLower = content.toLowerCase();
        
        relevantWords.forEach(word => {
            if (contentLower.includes(word)) {
                keywords.push(word);
            }
        });
        
        return keywords;
    }

    /**
     * Detect brand mention in content
     */
    detectBrandMention(content) {
        const contentLower = content.toLowerCase();
        
        return this.config.brandMentions.some(brand => 
            contentLower.includes(brand.toLowerCase())
        );
    }

    /**
     * Determine if mention requires response
     */
    shouldRespond(analysis) {
        // Always respond to highly negative sentiment
        if (analysis.sentiment.score <= -0.5) return true;
        
        // Respond to high-influence negative mentions
        if (analysis.sentiment.score <= -0.3 && analysis.influence >= 0.5) return true;
        
        // Respond to urgent technical issues
        if (analysis.category === 'technical' && analysis.urgency >= 0.6) return true;
        
        // Always respond to security or legal concerns
        if (['security', 'legal'].includes(analysis.category)) return true;
        
        // Respond to high toxicity
        if (analysis.toxicity.level === 'high') return true;
        
        return false;
    }

    /**
     * Suggest appropriate response template
     */
    suggestResponseTemplate(analysis) {
        // Critical issues - immediate response
        if (analysis.sentiment.score <= -0.7 || analysis.toxicity.level === 'high') {
            return 'apologize_and_fix';
        }
        
        // Category-specific templates
        switch (analysis.category) {
            case 'technical':
                return 'acknowledge_bug';
            case 'security':
                return 'security_protocol';
            case 'legal':
                return 'legal_response';
            case 'support':
                return 'service_recovery';
            case 'billing':
                return 'acknowledge_issue';
            default:
                if (analysis.sentiment.score <= -0.5) {
                    return 'acknowledge_issue';
                } else {
                    return 'explain_misunderstanding';
                }
        }
    }

    /**
     * Calculate escalation level
     */
    calculateEscalationLevel(analysis) {
        let level = 0;
        
        // Sentiment-based escalation
        if (analysis.sentiment.score <= -0.8) level = Math.max(level, 3);
        else if (analysis.sentiment.score <= -0.6) level = Math.max(level, 2);
        else if (analysis.sentiment.score <= -0.4) level = Math.max(level, 1);
        
        // Influence-based escalation
        if (analysis.influence >= 0.8) level = Math.max(level, 3);
        else if (analysis.influence >= 0.6) level = Math.max(level, 2);
        
        // Category-based escalation
        const categoryLevels = {
            'security': 4,
            'legal': 4,
            'technical': 2,
            'billing': 2,
            'support': 1
        };
        
        if (categoryLevels[analysis.category]) {
            level = Math.max(level, categoryLevels[analysis.category]);
        }
        
        return Math.min(level, 4);
    }

    /**
     * Check alert rules against mention
     */
    async checkAlertRules(mention, analysis) {
        const triggeredRules = [];
        
        for (const [ruleName, rule] of this.alertRules) {
            try {
                let triggered = false;
                
                // Check condition
                if (typeof rule.condition === 'function') {
                    triggered = rule.condition(mention);
                }
                
                if (triggered) {
                    triggeredRules.push({
                        name: ruleName,
                        severity: rule.severity,
                        action: rule.action,
                        notification: rule.notification,
                        triggeredAt: new Date()
                    });
                }
                
            } catch (error) {
                console.error(`❌ Alert rule ${ruleName} failed:`, error);
            }
        }
        
        return triggeredRules;
    }

    /**
     * Handle crisis trigger
     */
    async handleCrisisTrigger(mention, analysis, triggeredRules) {
        console.log(`🚨 CRISIS TRIGGER: ${mention.platform} mention from @${mention.author.username}`);
        
        // Create crisis event
        const crisisEvent = {
            id: `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            mention: mention,
            analysis: analysis,
            triggeredRules: triggeredRules,
            severity: this.calculateEventSeverity(triggeredRules),
            status: 'active',
            assignedTo: null,
            responses: [],
            escalations: [],
            detectedAt: new Date(),
            lastUpdated: new Date(),
            resolvedAt: null,
            resolution: null
        };
        
        // Store event
        this.eventDatabase.set(crisisEvent.id, crisisEvent);
        this.state.activeCrises.set(crisisEvent.id, crisisEvent);
        
        // Send notifications
        await this.sendCrisisNotifications(crisisEvent);
        
        // Queue immediate response if required
        if (analysis.requiresResponse) {
            await this.queueCrisisResponse(crisisEvent);
        }
        
        // Auto-escalate if needed
        if (crisisEvent.severity === 'critical') {
            await this.escalateCrisis(crisisEvent, 'auto_critical');
        }
        
        this.emit('crisis_detected', crisisEvent);
        
        // Save updated database
        await this.saveEventDatabase();
        this.updateStateCounts();
    }

    /**
     * Calculate event severity from triggered rules
     */
    calculateEventSeverity(triggeredRules) {
        if (triggeredRules.length === 0) return 'low';
        
        const severities = triggeredRules.map(rule => rule.severity);
        
        if (severities.includes('critical')) return 'critical';
        if (severities.includes('high')) return 'high';
        if (severities.includes('medium')) return 'medium';
        return 'low';
    }

    /**
     * Send crisis notifications to team
     */
    async sendCrisisNotifications(crisisEvent) {
        const notifications = new Set();
        
        // Collect all notification targets
        crisisEvent.triggeredRules.forEach(rule => {
            rule.notification.forEach(target => notifications.add(target));
        });
        
        // Send notifications
        for (const target of notifications) {
            try {
                await this.sendNotification(target, crisisEvent);
            } catch (error) {
                console.error(`❌ Failed to send notification to ${target}:`, error);
            }
        }
    }

    /**
     * Send notification to team member or channel
     */
    async sendNotification(target, crisisEvent) {
        const notification = {
            target: target,
            type: 'crisis_alert',
            severity: crisisEvent.severity,
            event: {
                id: crisisEvent.id,
                platform: crisisEvent.mention.platform,
                author: crisisEvent.mention.author.username,
                content: crisisEvent.mention.content.substring(0, 200),
                sentiment: crisisEvent.analysis.sentiment.score,
                influence: crisisEvent.analysis.influence,
                url: crisisEvent.mention.url
            },
            timestamp: new Date(),
            actionRequired: this.getRequiredActions(crisisEvent)
        };
        
        // Send via webhook
        try {
            await axios.post(`${this.config.webhookUrl}/notifications/crisis`, notification);
            console.log(`🔔 Crisis notification sent to ${target}`);
        } catch (error) {
            console.error(`❌ Notification delivery failed for ${target}:`, error);
        }
    }

    /**
     * Get required actions for crisis event
     */
    getRequiredActions(crisisEvent) {
        const actions = [];
        
        crisisEvent.triggeredRules.forEach(rule => {
            switch (rule.action) {
                case 'immediate_response':
                    actions.push('Respond within 5 minutes');
                    break;
                case 'priority_response':
                    actions.push('Priority response required');
                    break;
                case 'crisis_protocol':
                    actions.push('Activate crisis protocol');
                    break;
                case 'legal_escalation':
                    actions.push('Escalate to legal team');
                    break;
                case 'security_protocol':
                    actions.push('Activate security protocol');
                    break;
            }
        });
        
        return [...new Set(actions)];
    }

    /**
     * Queue crisis response
     */
    async queueCrisisResponse(crisisEvent) {
        const template = this.responseTemplates.get(crisisEvent.analysis.suggestedTemplate);
        
        if (!template) {
            console.error(`❌ Response template not found: ${crisisEvent.analysis.suggestedTemplate}`);
            return;
        }
        
        const response = {
            eventId: crisisEvent.id,
            platform: crisisEvent.mention.platform,
            targetUser: crisisEvent.mention.author.username,
            template: template,
            priority: template.priority,
            scheduledFor: new Date(Date.now() + template.delay),
            status: 'queued',
            attempts: 0,
            personalizationData: this.generatePersonalizationData(crisisEvent)
        };
        
        this.responseQueue.push(response);
        
        // Sort queue by priority and schedule time
        this.responseQueue.sort((a, b) => {
            const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            return a.scheduledFor.getTime() - b.scheduledFor.getTime();
        });
        
        console.log(`📝 Response queued for crisis ${crisisEvent.id} (${template.priority} priority)`);
    }

    /**
     * Generate personalization data for response
     */
    generatePersonalizationData(crisisEvent) {
        return {
            user_name: crisisEvent.mention.author.username,
            issue_description: this.summarizeIssue(crisisEvent),
            response_timeframe: this.getResponseTimeframe(crisisEvent.severity),
            responder_name: this.getAssignedResponder(crisisEvent).name,
            platform: crisisEvent.mention.platform,
            issue_category: crisisEvent.analysis.category,
            company_name: 'Marketing Automation Hub',
            support_email: 'support@marketingautomationhub.com',
            calendar_link: 'https://calendly.com/marketing-hub/support',
            direct_contact: 'support@marketingautomationhub.com'
        };
    }

    /**
     * Process response queue
     */
    async processResponseQueue() {
        if (this.responseQueue.length === 0) return;
        
        const now = new Date();
        const readyResponses = this.responseQueue.filter(response => 
            response.scheduledFor <= now && response.status === 'queued'
        );
        
        if (readyResponses.length === 0) return;
        
        console.log(`📤 Processing ${readyResponses.length} crisis responses`);
        
        for (const response of readyResponses) {
            try {
                await this.sendCrisisResponse(response);
                
                // Remove from queue
                const index = this.responseQueue.indexOf(response);
                if (index > -1) {
                    this.responseQueue.splice(index, 1);
                }
                
            } catch (error) {
                console.error(`❌ Failed to send crisis response:`, error);
                
                response.attempts++;
                response.status = 'failed';
                
                // Retry up to 3 times
                if (response.attempts < 3) {
                    response.status = 'queued';
                    response.scheduledFor = new Date(Date.now() + 300000); // Retry in 5 minutes
                }
            }
        }
    }

    /**
     * Send crisis response
     */
    async sendCrisisResponse(response) {
        // Personalize the message
        const personalizedMessage = this.personalizeMessage(
            response.template.template,
            response.personalizationData
        );
        
        // Prepare payload
        const payload = {
            platform: response.platform,
            target_user: response.targetUser,
            message: personalizedMessage,
            type: 'crisis_response',
            event_id: response.eventId,
            priority: response.priority,
            timestamp: new Date().toISOString()
        };
        
        // Send via platform API
        const result = await axios.post(`${this.config.webhookUrl}/social/respond`, payload);
        
        // Record response
        const crisisEvent = this.eventDatabase.get(response.eventId);
        if (crisisEvent) {
            crisisEvent.responses.push({
                template: response.template,
                message: personalizedMessage,
                sentAt: new Date(),
                platform: response.platform,
                responseId: result.data.id,
                success: true
            });
            
            crisisEvent.lastUpdated = new Date();
            
            // Check if this resolves the crisis
            if (this.isResolutionResponse(response.template)) {
                crisisEvent.status = 'resolved';
                crisisEvent.resolvedAt = new Date();
                this.state.activeCrises.delete(crisisEvent.id);
            }
        }
        
        response.status = 'sent';
        
        console.log(`✅ Crisis response sent for event ${response.eventId}`);
        this.emit('response_sent', { eventId: response.eventId, response: result.data });
    }

    /**
     * Personalize message template
     */
    personalizeMessage(template, data) {
        let message = template;
        
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            message = message.replace(placeholder, value || '');
        });
        
        // Clean up any remaining placeholders
        message = message.replace(/{{[^}]+}}/g, '');
        
        return message.trim();
    }

    /**
     * Check if response template indicates resolution
     */
    isResolutionResponse(template) {
        const resolutionTemplates = [
            'apologize_and_fix',
            'service_recovery',
            'followup_resolution'
        ];
        
        return resolutionTemplates.some(templateName => 
            template.template.includes(templateName)
        );
    }

    /**
     * Evaluate overall threat level
     */
    evaluateOverallThreatLevel() {
        const recentEvents = this.getRecentEvents(3600000); // 1 hour
        const activeEvents = Array.from(this.state.activeCrises.values());
        
        let threatLevel = 'green';
        
        // Check for critical events
        const criticalEvents = activeEvents.filter(event => event.severity === 'critical');
        if (criticalEvents.length >= 1) {
            threatLevel = 'red';
        } else if (activeEvents.filter(event => event.severity === 'high').length >= 3) {
            threatLevel = 'orange';
        } else if (recentEvents.length >= 10) {
            threatLevel = 'yellow';
        }
        
        // Update threat level if changed
        if (this.state.currentThreatLevel !== threatLevel) {
            const previousLevel = this.state.currentThreatLevel;
            this.state.currentThreatLevel = threatLevel;
            this.state.lastEvaluation = new Date();
            
            console.log(`🚨 Threat level changed: ${previousLevel} → ${threatLevel}`);
            this.emit('threat_level_changed', { previous: previousLevel, current: threatLevel });
            
            // Send threat level notification
            this.sendThreatLevelNotification(threatLevel, previousLevel);
        }
    }

    /**
     * Send threat level notification
     */
    async sendThreatLevelNotification(currentLevel, previousLevel) {
        const notification = {
            type: 'threat_level_change',
            current_level: currentLevel,
            previous_level: previousLevel,
            active_crises: this.state.activeCrises.size,
            recent_events: this.getRecentEvents(3600000).length,
            timestamp: new Date(),
            recommended_actions: this.getRecommendedActions(currentLevel)
        };
        
        try {
            await axios.post(`${this.config.webhookUrl}/notifications/threat-level`, notification);
        } catch (error) {
            console.error('❌ Failed to send threat level notification:', error);
        }
    }

    /**
     * Get recommended actions for threat level
     */
    getRecommendedActions(threatLevel) {
        const actions = {
            'green': ['Continue normal monitoring'],
            'yellow': ['Increase monitoring frequency', 'Prepare response templates'],
            'orange': ['Activate crisis team', 'Prepare public statement', 'Monitor social sentiment'],
            'red': ['Full crisis protocol', 'Executive notification', 'Consider public response', 'Legal consultation']
        };
        
        return actions[threatLevel] || [];
    }

    /**
     * Check escalation triggers
     */
    checkEscalationTriggers() {
        this.state.activeCrises.forEach(crisisEvent => {
            const timeActive = Date.now() - crisisEvent.detectedAt.getTime();
            const assignedLevel = this.getAssignedResponder(crisisEvent).level;
            
            // Check if auto-escalation time has passed
            const escalationTime = this.escalationChain[assignedLevel - 1]?.autoEscalateAfter;
            
            if (escalationTime && timeActive >= escalationTime && crisisEvent.status === 'active') {
                this.escalateCrisis(crisisEvent, 'auto_timeout');
            }
        });
    }

    /**
     * Escalate crisis to next level
     */
    async escalateCrisis(crisisEvent, reason) {
        const currentLevel = crisisEvent.escalations.length;
        const nextLevel = Math.min(currentLevel + 1, this.escalationChain.length);
        
        if (nextLevel > currentLevel) {
            const escalation = {
                from_level: currentLevel,
                to_level: nextLevel,
                reason: reason,
                escalated_at: new Date(),
                escalated_by: 'system'
            };
            
            crisisEvent.escalations.push(escalation);
            crisisEvent.assignedTo = this.escalationChain[nextLevel - 1];
            crisisEvent.lastUpdated = new Date();
            
            // Send escalation notification
            await this.sendEscalationNotification(crisisEvent, escalation);
            
            console.log(`⬆️ Crisis ${crisisEvent.id} escalated to level ${nextLevel} (${reason})`);
            this.emit('crisis_escalated', { event: crisisEvent, escalation });
        }
    }

    /**
     * Send escalation notification
     */
    async sendEscalationNotification(crisisEvent, escalation) {
        const notification = {
            type: 'crisis_escalation',
            event_id: crisisEvent.id,
            escalation: escalation,
            assigned_to: crisisEvent.assignedTo,
            severity: crisisEvent.severity,
            summary: this.summarizeIssue(crisisEvent),
            timestamp: new Date()
        };
        
        try {
            await axios.post(`${this.config.webhookUrl}/notifications/escalation`, notification);
        } catch (error) {
            console.error('❌ Failed to send escalation notification:', error);
        }
    }

    /**
     * Generate crisis report
     */
    generateCrisisReport() {
        const report = {
            timestamp: new Date(),
            threat_level: this.state.currentThreatLevel,
            active_crises: this.state.activeCrises.size,
            total_events_today: this.getTodayEvents().length,
            resolved_events_today: this.getTodayResolvedEvents().length,
            average_response_time: this.calculateAverageResponseTime(),
            platform_breakdown: this.getPlatformBreakdown(),
            sentiment_trend: this.getSentimentTrend(),
            top_issues: this.getTopIssues()
        };
        
        console.log(`📊 Crisis report generated: ${report.active_crises} active, threat level ${report.threat_level}`);
        this.emit('crisis_report', report);
        
        return report;
    }

    /**
     * Utility functions
     */
    getRecentNegativeMentions(timeframe) {
        const cutoff = Date.now() - timeframe;
        return Array.from(this.eventDatabase.values()).filter(event => 
            event.detectedAt.getTime() >= cutoff && 
            event.analysis.sentiment.score <= -0.3
        );
    }

    calculateAverageSentiment(timeframe) {
        const recentEvents = this.getRecentEvents(timeframe);
        if (recentEvents.length === 0) return 0;
        
        const totalSentiment = recentEvents.reduce((sum, event) => 
            sum + event.analysis.sentiment.score, 0
        );
        
        return totalSentiment / recentEvents.length;
    }

    getRecentEvents(timeframe) {
        const cutoff = Date.now() - timeframe;
        return Array.from(this.eventDatabase.values()).filter(event => 
            event.detectedAt.getTime() >= cutoff
        );
    }

    getTodayEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return Array.from(this.eventDatabase.values()).filter(event => 
            event.detectedAt >= today
        );
    }

    getTodayResolvedEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return Array.from(this.eventDatabase.values()).filter(event => 
            event.resolvedAt && event.resolvedAt >= today
        );
    }

    calculateAverageResponseTime() {
        const resolvedEvents = Array.from(this.eventDatabase.values()).filter(event => 
            event.resolvedAt && event.responses.length > 0
        );
        
        if (resolvedEvents.length === 0) return 0;
        
        const totalResponseTime = resolvedEvents.reduce((sum, event) => {
            const firstResponse = event.responses[0];
            const responseTime = firstResponse.sentAt.getTime() - event.detectedAt.getTime();
            return sum + responseTime;
        }, 0);
        
        return totalResponseTime / resolvedEvents.length;
    }

    getPlatformBreakdown() {
        const breakdown = {};
        
        this.eventDatabase.forEach(event => {
            const platform = event.mention.platform;
            if (!breakdown[platform]) {
                breakdown[platform] = { total: 0, active: 0, resolved: 0 };
            }
            
            breakdown[platform].total++;
            
            if (event.status === 'active') breakdown[platform].active++;
            if (event.status === 'resolved') breakdown[platform].resolved++;
        });
        
        return breakdown;
    }

    getSentimentTrend() {
        const last24Hours = this.getRecentEvents(86400000); // 24 hours
        const hourlyData = {};
        
        last24Hours.forEach(event => {
            const hour = event.detectedAt.getHours();
            if (!hourlyData[hour]) {
                hourlyData[hour] = { count: 0, totalSentiment: 0 };
            }
            
            hourlyData[hour].count++;
            hourlyData[hour].totalSentiment += event.analysis.sentiment.score;
        });
        
        // Calculate average sentiment per hour
        Object.keys(hourlyData).forEach(hour => {
            const data = hourlyData[hour];
            data.averageSentiment = data.totalSentiment / data.count;
        });
        
        return hourlyData;
    }

    getTopIssues() {
        const issueCount = {};
        
        this.getTodayEvents().forEach(event => {
            const category = event.analysis.category;
            issueCount[category] = (issueCount[category] || 0) + 1;
        });
        
        return Object.entries(issueCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count }));
    }

    summarizeIssue(crisisEvent) {
        const content = crisisEvent.mention.content;
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }

    getResponseTimeframe(severity) {
        const timeframes = {
            'critical': '15 minutes',
            'high': '30 minutes',
            'medium': '1 hour',
            'low': '2 hours'
        };
        
        return timeframes[severity] || '2 hours';
    }

    getAssignedResponder(crisisEvent) {
        // Default to first escalation level if not explicitly assigned
        if (crisisEvent.assignedTo) {
            return crisisEvent.assignedTo;
        }
        
        // Assign based on escalation level
        const escalationLevel = Math.min(crisisEvent.escalations.length, this.escalationChain.length - 1);
        return this.escalationChain[escalationLevel];
    }

    updateStateCounts() {
        this.state.totalEvents = this.eventDatabase.size;
        this.state.resolvedEvents = Array.from(this.eventDatabase.values()).filter(
            event => event.status === 'resolved'
        ).length;
        
        this.state.averageResponseTime = this.calculateAverageResponseTime();
    }

    async saveEventDatabase() {
        try {
            const data = Array.from(this.eventDatabase.values());
            const jsonData = JSON.stringify(data, null, 2);
            
            await fs.writeFile(this.config.databasePath, jsonData, 'utf8');
            
        } catch (error) {
            console.error('❌ Failed to save crisis event database:', error);
        }
    }

    /**
     * Get system statistics
     */
    getStats() {
        return {
            system: {
                monitoring_active: this.state.monitoringActive,
                threat_level: this.state.currentThreatLevel,
                active_crises: this.state.activeCrises.size,
                total_events: this.state.totalEvents,
                resolved_events: this.state.resolvedEvents
            },
            performance: {
                average_response_time: this.state.averageResponseTime,
                resolution_rate: this.state.totalEvents > 0 ? this.state.resolvedEvents / this.state.totalEvents : 0,
                response_queue_length: this.responseQueue.length
            },
            recent_activity: {
                events_last_hour: this.getRecentEvents(3600000).length,
                events_today: this.getTodayEvents().length,
                resolved_today: this.getTodayResolvedEvents().length
            },
            breakdown: {
                by_platform: this.getPlatformBreakdown(),
                by_severity: this.getSeverityBreakdown(),
                top_issues: this.getTopIssues()
            }
        };
    }

    getSeverityBreakdown() {
        const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
        
        this.eventDatabase.forEach(event => {
            breakdown[event.severity] = (breakdown[event.severity] || 0) + 1;
        });
        
        return breakdown;
    }
}

module.exports = CrisisManagementSystem;