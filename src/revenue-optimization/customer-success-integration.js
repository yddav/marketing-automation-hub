// Customer Success Integration - Revenue-driven success metrics and intervention triggers
// Agent C - Phase 3: Advanced Revenue Optimization Systems

const winston = require('winston');
const moment = require('moment');

/**
 * Customer Success Integration
 * Revenue-driven success metrics and intervention triggers
 * 
 * Key Features:
 * - Revenue health scoring for customer success prioritization
 * - Automated intervention triggers based on revenue risk
 * - Customer journey mapping with revenue milestones
 * - Success metrics aligned with revenue outcomes
 * - Proactive engagement automation
 * - Expansion opportunity identification
 */
class CustomerSuccessIntegration {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/customer-success.log' }),
        new winston.transports.Console()
      ]
    });

    // Customer health scoring configuration
    this.healthScoringConfig = {
      metrics: {
        usage_frequency: { weight: 0.25, ideal: 0.8, threshold: 0.3 },
        feature_adoption: { weight: 0.2, ideal: 0.7, threshold: 0.4 },
        support_interactions: { weight: 0.15, ideal: 0.1, threshold: 0.6 },
        payment_health: { weight: 0.2, ideal: 1.0, threshold: 0.8 },
        engagement_trend: { weight: 0.2, ideal: 0.9, threshold: 0.5 }
      },
      segments: {
        champions: { min: 0.8, color: 'green', priority: 'low' },
        healthy: { min: 0.6, color: 'blue', priority: 'medium' },
        at_risk: { min: 0.4, color: 'yellow', priority: 'high' },
        critical: { min: 0.0, color: 'red', priority: 'urgent' }
      }
    };

    // Revenue milestones and success indicators
    this.revenueMilestones = {
      onboarding: {
        timeframe: 30, // days
        revenue_threshold: 0,
        success_indicators: [
          'first_campaign_created',
          'first_email_sent',
          'analytics_viewed',
          'integration_completed'
        ],
        failure_indicators: [
          'no_activity_7_days',
          'login_frequency_low',
          'support_tickets_high'
        ]
      },
      adoption: {
        timeframe: 90, // days
        revenue_threshold: 199, // minimum plan value
        success_indicators: [
          'multiple_campaigns_created',
          'advanced_features_used',
          'positive_roi_achieved',
          'team_members_invited'
        ],
        failure_indicators: [
          'usage_declining',
          'feature_adoption_low',
          'payment_issues'
        ]
      },
      growth: {
        timeframe: 180, // days
        revenue_threshold: 499, // pro plan threshold
        success_indicators: [
          'consistent_usage_pattern',
          'expansion_features_explored',
          'referrals_generated',
          'case_study_potential'
        ],
        failure_indicators: [
          'churn_risk_indicators',
          'competitive_research',
          'usage_plateau'
        ]
      },
      advocacy: {
        timeframe: 365, // days
        revenue_threshold: 999, // enterprise threshold
        success_indicators: [
          'public_testimonial',
          'referral_program_participation',
          'case_study_completed',
          'speaking_opportunity'
        ],
        failure_indicators: [
          'renewal_risk',
          'support_escalations',
          'feature_requests_unmet'
        ]
      }
    };

    // Intervention triggers and playbooks
    this.interventionTriggers = {
      churn_risk_high: {
        conditions: [
          'health_score < 0.4',
          'usage_decline > 50%',
          'payment_issues > 0',
          'support_sentiment < 0.3'
        ],
        urgency: 'critical',
        playbook: 'churn_prevention',
        assignee: 'senior_csm',
        sla: 2 // hours
      },
      expansion_opportunity: {
        conditions: [
          'health_score > 0.7',
          'usage_approaching_limits',
          'feature_requests_advanced',
          'team_growth_indicators'
        ],
        urgency: 'medium',
        playbook: 'expansion_nurture',
        assignee: 'account_manager',
        sla: 24 // hours
      },
      onboarding_stalled: {
        conditions: [
          'days_since_signup > 7',
          'campaigns_created = 0',
          'login_frequency < 0.2',
          'support_requests = 0'
        ],
        urgency: 'high',
        playbook: 'onboarding_rescue',
        assignee: 'onboarding_specialist',
        sla: 4 // hours
      },
      feature_adoption_low: {
        conditions: [
          'days_since_signup > 30',
          'feature_adoption_score < 0.3',
          'advanced_features_unused',
          'plan_utilization < 0.4'
        ],
        urgency: 'medium',
        playbook: 'feature_education',
        assignee: 'product_specialist',
        sla: 12 // hours
      },
      payment_health_declining: {
        conditions: [
          'payment_failures > 0',
          'card_expiry_approaching',
          'billing_disputes > 0',
          'downgrade_signals'
        ],
        urgency: 'high',
        playbook: 'payment_recovery',
        assignee: 'billing_specialist',
        sla: 6 // hours
      },
      renewal_risk: {
        conditions: [
          'days_to_renewal < 60',
          'health_score < 0.6',
          'usage_trend_negative',
          'expansion_declined'
        ],
        urgency: 'high',
        playbook: 'renewal_preparation',
        assignee: 'renewal_specialist',
        sla: 8 // hours
      }
    };

    // Success playbooks and action sequences
    this.successPlaybooks = {
      churn_prevention: {
        steps: [
          'immediate_outreach',
          'usage_analysis',
          'pain_point_identification',
          'success_plan_creation',
          'executive_engagement',
          'retention_offer'
        ],
        success_metrics: ['health_score_improvement', 'usage_recovery', 'sentiment_positive'],
        timeline: 14 // days
      },
      expansion_nurture: {
        steps: [
          'usage_analysis',
          'upgrade_opportunity_assessment',
          'roi_calculation',
          'proposal_preparation',
          'stakeholder_meeting',
          'expansion_close'
        ],
        success_metrics: ['upgrade_conversion', 'revenue_increase', 'feature_adoption'],
        timeline: 30 // days
      },
      onboarding_rescue: {
        steps: [
          'welcome_call_scheduling',
          'setup_assistance',
          'quick_win_identification',
          'training_provision',
          'milestone_tracking',
          'feedback_collection'
        ],
        success_metrics: ['first_value_achieved', 'usage_establishment', 'satisfaction_score'],
        timeline: 21 // days
      }
    };

    // Customer data and metrics tracking
    this.customerProfiles = new Map(); // customerId -> profile data
    this.healthScores = new Map(); // customerId -> health score data
    this.interventions = new Map(); // interventionId -> intervention data
    this.milestoneTracking = new Map(); // customerId -> milestone progress
    this.successMetrics = new Map(); // period -> aggregated metrics

    this.startCustomerSuccessEngine();
  }

  /**
   * Start the customer success engine
   */
  startCustomerSuccessEngine() {
    this.logger.info('Customer Success Integration starting...');

    // Update health scores every 30 minutes
    setInterval(() => {
      this.updateHealthScores();
    }, 30 * 60 * 1000);

    // Check for intervention triggers every 10 minutes
    setInterval(() => {
      this.checkInterventionTriggers();
    }, 10 * 60 * 1000);

    // Process milestone tracking every hour
    setInterval(() => {
      this.processMilestoneTracking();
    }, 60 * 60 * 1000);

    // Update success metrics every 6 hours
    setInterval(() => {
      this.updateSuccessMetrics();
    }, 6 * 60 * 60 * 1000);

    // Generate success reports daily
    setInterval(() => {
      this.generateSuccessReport();
    }, 24 * 60 * 60 * 1000);

    this.logger.info('Customer Success Integration started successfully');
  }

  /**
   * Track customer activity for success scoring
   * @param {Object} activityData - Customer activity data
   */
  trackCustomerActivity(activityData) {
    const {
      customerId,
      activity,
      timestamp = new Date().toISOString(),
      metadata = {}
    } = activityData;

    // Initialize customer profile if not exists
    if (!this.customerProfiles.has(customerId)) {
      this.initializeCustomerProfile(customerId, metadata);
    }

    const profile = this.customerProfiles.get(customerId);
    
    // Update activity tracking
    this.updateActivityMetrics(profile, activity, metadata, timestamp);
    
    // Update milestone progress
    this.updateMilestoneProgress(customerId, activity, metadata);
    
    // Recalculate health score
    this.calculateHealthScore(customerId);
    
    // Check for immediate interventions
    this.checkImmediateInterventions(customerId, activity, metadata);

    this.logger.info('Customer activity tracked', {
      customerId,
      activity,
      healthScore: this.healthScores.get(customerId)?.score
    });
  }

  /**
   * Initialize customer profile
   * @param {string} customerId - Customer identifier
   * @param {Object} metadata - Initial metadata
   */
  initializeCustomerProfile(customerId, metadata) {
    const profile = {
      customerId,
      signupDate: metadata.signupDate || new Date().toISOString(),
      currentPlan: metadata.plan || 'starter',
      totalRevenue: metadata.revenue || 0,
      lastActivity: new Date().toISOString(),
      activityMetrics: {
        loginFrequency: 0,
        campaignsCreated: 0,
        emailsSent: 0,
        featuresUsed: new Set(),
        supportTickets: 0,
        paymentIssues: 0
      },
      engagement: {
        totalSessions: 0,
        averageSessionDuration: 0,
        lastLogin: null,
        streakDays: 0
      },
      milestones: {
        completed: [],
        current: 'onboarding',
        progress: {}
      },
      interventions: [],
      tags: metadata.tags || []
    };

    this.customerProfiles.set(customerId, profile);
    
    // Initialize milestone tracking
    this.initializeMilestoneTracking(customerId);

    this.logger.info('Customer profile initialized', { customerId });
  }

  /**
   * Calculate customer health score
   * @param {string} customerId - Customer identifier
   * @returns {Object} Health score data
   */
  calculateHealthScore(customerId) {
    const profile = this.customerProfiles.get(customerId);
    if (!profile) {
      return null;
    }

    const config = this.healthScoringConfig.metrics;
    let totalScore = 0;
    let totalWeight = 0;
    const componentScores = {};

    // Usage frequency score
    const daysSinceSignup = moment().diff(moment(profile.signupDate), 'days') || 1;
    const loginFrequency = profile.activityMetrics.loginFrequency / daysSinceSignup;
    const usageScore = Math.min(loginFrequency / config.usage_frequency.ideal, 1);
    componentScores.usage_frequency = usageScore;
    totalScore += usageScore * config.usage_frequency.weight;
    totalWeight += config.usage_frequency.weight;

    // Feature adoption score
    const totalFeatures = 10; // Assume 10 key features
    const adoptedFeatures = profile.activityMetrics.featuresUsed.size;
    const adoptionScore = Math.min(adoptedFeatures / (totalFeatures * config.feature_adoption.ideal), 1);
    componentScores.feature_adoption = adoptionScore;
    totalScore += adoptionScore * config.feature_adoption.weight;
    totalWeight += config.feature_adoption.weight;

    // Support interactions score (inverse - fewer is better)
    const supportScore = Math.max(0, 1 - (profile.activityMetrics.supportTickets / 10));
    componentScores.support_interactions = supportScore;
    totalScore += supportScore * config.support_interactions.weight;
    totalWeight += config.support_interactions.weight;

    // Payment health score
    const paymentScore = profile.activityMetrics.paymentIssues === 0 ? 1 : 0.5;
    componentScores.payment_health = paymentScore;
    totalScore += paymentScore * config.payment_health.weight;
    totalWeight += config.payment_health.weight;

    // Engagement trend score
    const recentActivity = this.calculateRecentEngagement(profile);
    const trendScore = Math.min(recentActivity / config.engagement_trend.ideal, 1);
    componentScores.engagement_trend = trendScore;
    totalScore += trendScore * config.engagement_trend.weight;
    totalWeight += config.engagement_trend.weight;

    // Calculate final score
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    // Determine segment
    const segment = this.determineHealthSegment(finalScore);

    const healthScore = {
      customerId,
      score: Math.round(finalScore * 100) / 100,
      segment: segment.name,
      priority: segment.priority,
      componentScores,
      lastUpdated: new Date().toISOString(),
      trend: this.calculateScoreTrend(customerId, finalScore),
      riskFactors: this.identifyRiskFactors(profile, componentScores),
      opportunities: this.identifyOpportunities(profile, componentScores)
    };

    this.healthScores.set(customerId, healthScore);

    this.logger.info('Health score calculated', {
      customerId,
      score: healthScore.score,
      segment: healthScore.segment
    });

    return healthScore;
  }

  /**
   * Determine health segment based on score
   * @param {number} score - Health score
   * @returns {Object} Health segment
   */
  determineHealthSegment(score) {
    const segments = this.healthScoringConfig.segments;
    
    if (score >= segments.champions.min) {
      return { name: 'champions', ...segments.champions };
    } else if (score >= segments.healthy.min) {
      return { name: 'healthy', ...segments.healthy };
    } else if (score >= segments.at_risk.min) {
      return { name: 'at_risk', ...segments.at_risk };
    } else {
      return { name: 'critical', ...segments.critical };
    }
  }

  /**
   * Check for intervention triggers
   */
  checkInterventionTriggers() {
    for (const [customerId, profile] of this.customerProfiles.entries()) {
      const healthScore = this.healthScores.get(customerId);
      if (!healthScore) continue;

      for (const [triggerName, trigger] of Object.entries(this.interventionTriggers)) {
        if (this.evaluateTriggerConditions(profile, healthScore, trigger.conditions)) {
          this.createIntervention(customerId, triggerName, trigger);
        }
      }
    }
  }

  /**
   * Create intervention
   * @param {string} customerId - Customer identifier
   * @param {string} triggerName - Trigger name
   * @param {Object} trigger - Trigger configuration
   */
  createIntervention(customerId, triggerName, trigger) {
    const interventionId = `${customerId}_${triggerName}_${Date.now()}`;
    
    // Check if similar intervention exists recently
    const recentIntervention = this.hasRecentIntervention(customerId, triggerName, 7); // 7 days
    if (recentIntervention) {
      return;
    }

    const intervention = {
      id: interventionId,
      customerId,
      triggerName,
      urgency: trigger.urgency,
      playbook: trigger.playbook,
      assignee: trigger.assignee,
      sla: trigger.sla,
      createdAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + (trigger.sla * 60 * 60 * 1000)).toISOString(),
      status: 'open',
      actions: [],
      outcome: null,
      notes: []
    };

    this.interventions.set(interventionId, intervention);

    // Add to customer profile
    const profile = this.customerProfiles.get(customerId);
    profile.interventions.push(interventionId);

    // Execute playbook
    this.executePlaybook(intervention);

    this.logger.info('Intervention created', {
      interventionId,
      customerId,
      triggerName,
      urgency: trigger.urgency
    });
  }

  /**
   * Execute success playbook
   * @param {Object} intervention - Intervention data
   */
  executePlaybook(intervention) {
    const playbook = this.successPlaybooks[intervention.playbook];
    if (!playbook) {
      this.logger.warn('Playbook not found', { playbook: intervention.playbook });
      return;
    }

    // Schedule playbook steps
    playbook.steps.forEach((step, index) => {
      const action = {
        id: `${intervention.id}_step_${index}`,
        step,
        scheduledAt: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString(), // Spread over days
        status: 'scheduled',
        executedAt: null,
        result: null
      };

      intervention.actions.push(action);
    });

    this.logger.info('Playbook scheduled', {
      interventionId: intervention.id,
      playbook: intervention.playbook,
      steps: playbook.steps.length
    });
  }

  /**
   * Get customer success dashboard data
   * @param {Object} options - Query options
   * @returns {Object} Dashboard data
   */
  getCustomerSuccessDashboard(options = {}) {
    const {
      timeframe = '30d',
      segment = null,
      includeInterventions = true,
      includeMilestones = true
    } = options;

    const cutoffDate = moment().subtract(parseInt(timeframe), timeframe.slice(-1)).toDate();
    
    // Filter customers by timeframe and segment
    let customers = Array.from(this.customerProfiles.values());
    
    if (segment) {
      customers = customers.filter(customer => {
        const healthScore = this.healthScores.get(customer.customerId);
        return healthScore && healthScore.segment === segment;
      });
    }

    // Calculate metrics
    const healthScores = Array.from(this.healthScores.values());
    const segmentDistribution = this.calculateSegmentDistribution(healthScores);
    const interventionMetrics = includeInterventions ? this.calculateInterventionMetrics(cutoffDate) : null;
    const milestoneMetrics = includeMilestones ? this.calculateMilestoneMetrics(cutoffDate) : null;

    const dashboard = {
      timeframe,
      summary: {
        totalCustomers: customers.length,
        averageHealthScore: this.calculateAverageHealthScore(healthScores),
        healthyCustomers: healthScores.filter(h => h.segment === 'healthy' || h.segment === 'champions').length,
        atRiskCustomers: healthScores.filter(h => h.segment === 'at_risk' || h.segment === 'critical').length,
        activeInterventions: Array.from(this.interventions.values()).filter(i => i.status === 'open').length
      },
      segments: segmentDistribution,
      healthTrends: this.calculateHealthTrends(cutoffDate),
      topRisks: this.identifyTopRisks(healthScores),
      expansionOpportunities: this.identifyExpansionOpportunities(customers),
      interventions: interventionMetrics,
      milestones: milestoneMetrics,
      recommendations: this.generateSuccessRecommendations(customers, healthScores)
    };

    return dashboard;
  }

  /**
   * Get customer health details
   * @param {string} customerId - Customer identifier
   * @returns {Object} Customer health details
   */
  getCustomerHealth(customerId) {
    const profile = this.customerProfiles.get(customerId);
    const healthScore = this.healthScores.get(customerId);
    const milestones = this.milestoneTracking.get(customerId);
    
    if (!profile || !healthScore) {
      return null;
    }

    // Get active interventions
    const activeInterventions = Array.from(this.interventions.values())
      .filter(i => i.customerId === customerId && i.status === 'open');

    // Calculate revenue metrics
    const revenueMetrics = this.calculateCustomerRevenueMetrics(profile);

    return {
      profile: {
        customerId: profile.customerId,
        signupDate: profile.signupDate,
        currentPlan: profile.currentPlan,
        totalRevenue: profile.totalRevenue,
        daysSinceSignup: moment().diff(moment(profile.signupDate), 'days'),
        lastActivity: profile.lastActivity
      },
      health: {
        score: healthScore.score,
        segment: healthScore.segment,
        priority: healthScore.priority,
        trend: healthScore.trend,
        componentScores: healthScore.componentScores,
        riskFactors: healthScore.riskFactors,
        opportunities: healthScore.opportunities
      },
      milestones: {
        current: milestones?.current,
        completed: milestones?.completed || [],
        progress: milestones?.progress || {}
      },
      interventions: activeInterventions.map(i => ({
        id: i.id,
        triggerName: i.triggerName,
        urgency: i.urgency,
        status: i.status,
        createdAt: i.createdAt,
        dueAt: i.dueAt
      })),
      revenue: revenueMetrics,
      recommendations: this.generateCustomerRecommendations(profile, healthScore)
    };
  }

  /**
   * Update activity metrics
   * @param {Object} profile - Customer profile
   * @param {string} activity - Activity type
   * @param {Object} metadata - Activity metadata
   * @param {string} timestamp - Activity timestamp
   */
  updateActivityMetrics(profile, activity, metadata, timestamp) {
    profile.lastActivity = timestamp;

    switch (activity) {
      case 'login':
        profile.activityMetrics.loginFrequency++;
        profile.engagement.totalSessions++;
        profile.engagement.lastLogin = timestamp;
        break;
      
      case 'campaign_created':
        profile.activityMetrics.campaignsCreated++;
        profile.activityMetrics.featuresUsed.add('campaigns');
        break;
      
      case 'email_sent':
        profile.activityMetrics.emailsSent += metadata.count || 1;
        profile.activityMetrics.featuresUsed.add('email');
        break;
      
      case 'feature_used':
        profile.activityMetrics.featuresUsed.add(metadata.feature);
        break;
      
      case 'support_ticket':
        profile.activityMetrics.supportTickets++;
        break;
      
      case 'payment_issue':
        profile.activityMetrics.paymentIssues++;
        break;
      
      case 'payment_resolved':
        profile.activityMetrics.paymentIssues = Math.max(0, profile.activityMetrics.paymentIssues - 1);
        break;
    }
  }

  /**
   * Update milestone progress
   * @param {string} customerId - Customer identifier
   * @param {string} activity - Activity type
   * @param {Object} metadata - Activity metadata
   */
  updateMilestoneProgress(customerId, activity, metadata) {
    const milestones = this.milestoneTracking.get(customerId);
    if (!milestones) return;

    const currentMilestone = this.revenueMilestones[milestones.current];
    if (!currentMilestone) return;

    // Check if activity matches success indicators
    if (currentMilestone.success_indicators.includes(activity)) {
      if (!milestones.progress[activity]) {
        milestones.progress[activity] = {
          completedAt: new Date().toISOString(),
          metadata
        };

        // Check if milestone is complete
        this.checkMilestoneCompletion(customerId);
      }
    }

    // Check for failure indicators
    if (currentMilestone.failure_indicators.includes(activity)) {
      this.handleMilestoneFailure(customerId, activity, metadata);
    }
  }

  /**
   * Initialize milestone tracking for customer
   * @param {string} customerId - Customer identifier
   */
  initializeMilestoneTracking(customerId) {
    this.milestoneTracking.set(customerId, {
      customerId,
      current: 'onboarding',
      completed: [],
      progress: {},
      startedAt: new Date().toISOString()
    });
  }

  // Helper methods for calculations and analysis
  calculateRecentEngagement(profile) {
    const recentDays = 7;
    const daysSinceLogin = profile.engagement.lastLogin ? 
      moment().diff(moment(profile.engagement.lastLogin), 'days') : 999;
    
    if (daysSinceLogin > recentDays) return 0;
    
    // Simple engagement calculation based on recent activity
    return Math.max(0, 1 - (daysSinceLogin / recentDays));
  }

  calculateScoreTrend(customerId, currentScore) {
    // In real implementation, this would compare with historical scores
    return 'stable'; // 'improving', 'stable', 'declining'
  }

  identifyRiskFactors(profile, componentScores) {
    const risks = [];
    
    if (componentScores.usage_frequency < 0.3) {
      risks.push('Low usage frequency');
    }
    if (componentScores.feature_adoption < 0.4) {
      risks.push('Poor feature adoption');
    }
    if (componentScores.payment_health < 0.8) {
      risks.push('Payment issues');
    }
    if (componentScores.support_interactions < 0.5) {
      risks.push('High support burden');
    }
    
    return risks;
  }

  identifyOpportunities(profile, componentScores) {
    const opportunities = [];
    
    if (componentScores.usage_frequency > 0.7 && profile.currentPlan === 'starter') {
      opportunities.push('Upgrade opportunity');
    }
    if (componentScores.feature_adoption > 0.6) {
      opportunities.push('Advanced feature introduction');
    }
    if (profile.activityMetrics.campaignsCreated > 10) {
      opportunities.push('Case study potential');
    }
    
    return opportunities;
  }

  evaluateTriggerConditions(profile, healthScore, conditions) {
    // Simplified condition evaluation
    for (const condition of conditions) {
      if (condition.includes('health_score < 0.4') && healthScore.score >= 0.4) {
        return false;
      }
      // Additional condition evaluations would be implemented here
    }
    return true;
  }

  hasRecentIntervention(customerId, triggerName, days) {
    const cutoff = moment().subtract(days, 'days').toDate();
    
    return Array.from(this.interventions.values()).some(intervention =>
      intervention.customerId === customerId &&
      intervention.triggerName === triggerName &&
      new Date(intervention.createdAt) > cutoff
    );
  }

  // Additional helper methods would be implemented here...
  processMilestoneTracking() {}
  updateSuccessMetrics() {}
  generateSuccessReport() {}
  checkImmediateInterventions(customerId, activity, metadata) {}
  checkMilestoneCompletion(customerId) {}
  handleMilestoneFailure(customerId, activity, metadata) {}
  calculateSegmentDistribution(healthScores) { return {}; }
  calculateInterventionMetrics(cutoffDate) { return {}; }
  calculateMilestoneMetrics(cutoffDate) { return {}; }
  calculateAverageHealthScore(healthScores) { return 0.7; }
  calculateHealthTrends(cutoffDate) { return {}; }
  identifyTopRisks(healthScores) { return []; }
  identifyExpansionOpportunities(customers) { return []; }
  generateSuccessRecommendations(customers, healthScores) { return []; }
  calculateCustomerRevenueMetrics(profile) { return {}; }
  generateCustomerRecommendations(profile, healthScore) { return []; }
}

module.exports = CustomerSuccessIntegration;