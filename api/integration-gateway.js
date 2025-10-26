/**
 * Integration Gateway - API-Based Loose Coupling Architecture
 * Enables seamless integration between Automated Hub Engine and Marketing Automation Hub
 * Designed for Phase 2: "Powered by Automated Hub Engine" strategy
 */

const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

class IntegrationGateway {
  constructor(config) {
    this.config = {
      // Default configuration
      automated_hub_engine_url: config.automated_hub_engine_url || 'https://api.automatedhubengine.com',
      marketing_automation_hub_url: config.marketing_automation_hub_url || 'https://api.marketingautomationhub.com',
      api_version: config.api_version || 'v1',
      rate_limit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
      },
      auth: {
        jwt_secret: config.jwt_secret || process.env.JWT_SECRET,
        token_expiry: config.token_expiry || '24h'
      },
      // Override with provided config
      ...config
    };
    
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    
    // Integration state tracking
    this.integrationMetrics = {
      requests_processed: 0,
      successful_integrations: 0,
      failed_integrations: 0,
      average_response_time: 0,
      last_health_check: null
    };
    
    // Health monitoring
    this.startHealthMonitoring();
  }

  setupMiddleware() {
    // Basic middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Rate limiting
    this.app.use(rateLimit(this.config.rate_limit));
    
    // CORS for cross-origin requests
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
    
    // Authentication middleware
    this.app.use('/api/integration', this.authenticateIntegration.bind(this));
  }

  async authenticateIntegration(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
      }
      
      const decoded = jwt.verify(token, this.config.auth.jwt_secret);
      req.integration_context = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid authentication token' });
    }
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        version: this.config.api_version,
        integration_metrics: this.integrationMetrics,
        timestamp: new Date().toISOString()
      });
    });

    // Authentication endpoint
    this.app.post('/api/auth/integration-token', [
      body('client_id').notEmpty().withMessage('Client ID is required'),
      body('client_secret').notEmpty().withMessage('Client secret is required'),
      body('integration_type').isIn(['mah_to_ahe', 'ahe_to_mah']).withMessage('Valid integration type required')
    ], this.generateIntegrationToken.bind(this));

    // Cross-system user onboarding integration
    this.app.post('/api/integration/onboarding/sync', [
      body('user_id').notEmpty().withMessage('User ID is required'),
      body('user_data').isObject().withMessage('User data object required'),
      body('source_system').isIn(['mah', 'ahe']).withMessage('Valid source system required')
    ], this.syncUserOnboarding.bind(this));

    // Campaign orchestration integration
    this.app.post('/api/integration/campaigns/orchestrate', [
      body('campaign_data').isObject().withMessage('Campaign data required'),
      body('platforms').isArray().withMessage('Platforms array required'),
      body('source_system').isIn(['mah', 'ahe']).withMessage('Valid source system required')
    ], this.orchestrateCrossPlatformCampaign.bind(this));

    // Analytics integration
    this.app.get('/api/integration/analytics/unified', this.getUnifiedAnalytics.bind(this));
    
    // Behavioral trigger synchronization
    this.app.post('/api/integration/triggers/sync', [
      body('user_id').notEmpty().withMessage('User ID is required'),
      body('trigger_data').isObject().withMessage('Trigger data required'),
      body('source_system').isIn(['mah', 'ahe']).withMessage('Valid source system required')
    ], this.syncBehavioralTriggers.bind(this));

    // Premium add-on activation
    this.app.post('/api/integration/premium/activate', [
      body('customer_id').notEmpty().withMessage('Customer ID is required'),
      body('plan_tier').isIn(['basic', 'professional', 'enterprise']).withMessage('Valid plan tier required'),
      body('features').isArray().withMessage('Features array required')
    ], this.activatePremiumIntegration.bind(this));

    // Data export/import for migration
    this.app.post('/api/integration/data/export', this.exportIntegrationData.bind(this));
    this.app.post('/api/integration/data/import', this.importIntegrationData.bind(this));

    // Real-time webhook endpoints
    this.app.post('/api/integration/webhooks/mah', this.handleMAHWebhook.bind(this));
    this.app.post('/api/integration/webhooks/ahe', this.handleAHEWebhook.bind(this));
  }

  async generateIntegrationToken(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { client_id, client_secret, integration_type } = req.body;
      
      // Validate client credentials (implement your own validation logic)
      const isValidClient = await this.validateClientCredentials(client_id, client_secret);
      if (!isValidClient) {
        return res.status(401).json({ error: 'Invalid client credentials' });
      }

      const token = jwt.sign({
        client_id,
        integration_type,
        issued_at: new Date().toISOString(),
        permissions: this.getIntegrationPermissions(integration_type)
      }, this.config.auth.jwt_secret, { expiresIn: this.config.auth.token_expiry });

      res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: this.config.auth.token_expiry,
        integration_type
      });
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({ error: 'Failed to generate integration token' });
    }
  }

  async syncUserOnboarding(req, res) {
    const startTime = Date.now();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user_id, user_data, source_system } = req.body;
      
      let result;
      if (source_system === 'mah') {
        // Sync MAH user to Automated Hub Engine
        result = await this.syncToAutomatedHubEngine('onboarding/initialize', {
          user_id,
          user_profile: user_data,
          source: 'marketing_automation_hub',
          integration_context: req.integration_context
        });
      } else {
        // Sync AHE user to Marketing Automation Hub
        result = await this.syncToMarketingAutomationHub('users/import', {
          user_id,
          user_data,
          source: 'automated_hub_engine',
          integration_context: req.integration_context
        });
      }

      // Track metrics
      this.updateMetrics(startTime, true);

      res.json({
        success: true,
        sync_result: result,
        user_id,
        synced_at: new Date().toISOString()
      });
    } catch (error) {
      this.updateMetrics(startTime, false);
      console.error('User onboarding sync error:', error);
      res.status(500).json({ error: 'Failed to sync user onboarding data' });
    }
  }

  async orchestrateCrossPlatformCampaign(req, res) {
    const startTime = Date.now();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { campaign_data, platforms, source_system } = req.body;
      
      // Orchestrate campaign across both systems
      const results = await Promise.allSettled([
        // Send to Automated Hub Engine for advanced orchestration
        this.syncToAutomatedHubEngine('campaigns/orchestrate', {
          campaign_data,
          platforms,
          source_system,
          integration_context: req.integration_context
        }),
        
        // Send to Marketing Automation Hub for content distribution
        this.syncToMarketingAutomationHub('campaigns/distribute', {
          campaign_data,
          platforms,
          source_system,
          integration_context: req.integration_context
        })
      ]);

      const successful_orchestrations = results.filter(r => r.status === 'fulfilled');
      const failed_orchestrations = results.filter(r => r.status === 'rejected');

      this.updateMetrics(startTime, failed_orchestrations.length === 0);

      res.json({
        success: true,
        orchestration_results: {
          total_platforms: platforms.length,
          successful_orchestrations: successful_orchestrations.length,
          failed_orchestrations: failed_orchestrations.length,
          results: results
        },
        campaign_id: campaign_data.id,
        orchestrated_at: new Date().toISOString()
      });
    } catch (error) {
      this.updateMetrics(startTime, false);
      console.error('Campaign orchestration error:', error);
      res.status(500).json({ error: 'Failed to orchestrate cross-platform campaign' });
    }
  }

  async getUnifiedAnalytics(req, res) {
    try {
      const { timeframe = '30d', metrics = 'all' } = req.query;
      
      // Fetch analytics from both systems
      const [aheAnalytics, mahAnalytics] = await Promise.allSettled([
        this.fetchFromAutomatedHubEngine(`analytics/dashboard?timeframe=${timeframe}&metrics=${metrics}`),
        this.fetchFromMarketingAutomationHub(`analytics/performance?timeframe=${timeframe}&metrics=${metrics}`)
      ]);

      // Combine and normalize analytics data
      const unifiedAnalytics = this.combineAnalyticsData(
        aheAnalytics.status === 'fulfilled' ? aheAnalytics.value : null,
        mahAnalytics.status === 'fulfilled' ? mahAnalytics.value : null
      );

      res.json({
        success: true,
        unified_analytics: unifiedAnalytics,
        data_sources: {
          automated_hub_engine: aheAnalytics.status === 'fulfilled',
          marketing_automation_hub: mahAnalytics.status === 'fulfilled'
        },
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Unified analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch unified analytics' });
    }
  }

  async syncBehavioralTriggers(req, res) {
    const startTime = Date.now();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user_id, trigger_data, source_system } = req.body;
      
      // Sync behavioral triggers across systems
      const syncResults = [];
      
      if (source_system === 'mah') {
        // Sync MAH triggers to AHE for advanced behavioral analysis
        const result = await this.syncToAutomatedHubEngine('triggers/sync', {
          user_id,
          trigger_data,
          source: 'marketing_automation_hub',
          timestamp: new Date().toISOString()
        });
        syncResults.push({ target: 'automated_hub_engine', result });
      } else {
        // Sync AHE triggers to MAH for marketing automation
        const result = await this.syncToMarketingAutomationHub('automation/triggers', {
          user_id,
          trigger_data,
          source: 'automated_hub_engine',
          timestamp: new Date().toISOString()
        });
        syncResults.push({ target: 'marketing_automation_hub', result });
      }

      this.updateMetrics(startTime, true);

      res.json({
        success: true,
        sync_results: syncResults,
        user_id,
        synced_at: new Date().toISOString()
      });
    } catch (error) {
      this.updateMetrics(startTime, false);
      console.error('Behavioral trigger sync error:', error);
      res.status(500).json({ error: 'Failed to sync behavioral triggers' });
    }
  }

  async activatePremiumIntegration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customer_id, plan_tier, features } = req.body;
      
      // Activate premium features across both systems
      const activationResults = await Promise.allSettled([
        this.syncToAutomatedHubEngine('premium/activate', {
          customer_id,
          plan_tier,
          features,
          integration_type: 'mah_premium_addon'
        }),
        
        this.syncToMarketingAutomationHub('billing/premium-addon', {
          customer_id,
          addon_product: 'automated_hub_engine',
          plan_tier,
          features
        })
      ]);

      const successful_activations = activationResults.filter(r => r.status === 'fulfilled');

      res.json({
        success: successful_activations.length > 0,
        activation_results: activationResults,
        customer_id,
        plan_tier,
        activated_features: features,
        activated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Premium integration activation error:', error);
      res.status(500).json({ error: 'Failed to activate premium integration' });
    }
  }

  // Webhook handlers for real-time synchronization
  async handleMAHWebhook(req, res) {
    try {
      const { event_type, data } = req.body;
      
      // Process different webhook events
      switch (event_type) {
        case 'user.created':
          await this.syncToAutomatedHubEngine('webhooks/user-created', data);
          break;
        case 'campaign.launched':
          await this.syncToAutomatedHubEngine('webhooks/campaign-launched', data);
          break;
        case 'user.converted':
          await this.syncToAutomatedHubEngine('webhooks/user-converted', data);
          break;
        default:
          console.log(`Unhandled MAH webhook event: ${event_type}`);
      }

      res.json({ success: true, processed_at: new Date().toISOString() });
    } catch (error) {
      console.error('MAH webhook error:', error);
      res.status(500).json({ error: 'Failed to process MAH webhook' });
    }
  }

  async handleAHEWebhook(req, res) {
    try {
      const { event_type, data } = req.body;
      
      // Process different webhook events
      switch (event_type) {
        case 'onboarding.completed':
          await this.syncToMarketingAutomationHub('webhooks/onboarding-completed', data);
          break;
        case 'churn.predicted':
          await this.syncToMarketingAutomationHub('webhooks/churn-predicted', data);
          break;
        case 'milestone.achieved':
          await this.syncToMarketingAutomationHub('webhooks/milestone-achieved', data);
          break;
        default:
          console.log(`Unhandled AHE webhook event: ${event_type}`);
      }

      res.json({ success: true, processed_at: new Date().toISOString() });
    } catch (error) {
      console.error('AHE webhook error:', error);
      res.status(500).json({ error: 'Failed to process AHE webhook' });
    }
  }

  // Helper methods for external API communication
  async syncToAutomatedHubEngine(endpoint, data) {
    const response = await axios.post(`${this.config.automated_hub_engine_url}/api/${this.config.api_version}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${process.env.AHE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  }

  async syncToMarketingAutomationHub(endpoint, data) {
    const response = await axios.post(`${this.config.marketing_automation_hub_url}/api/${this.config.api_version}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${process.env.MAH_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  }

  async fetchFromAutomatedHubEngine(endpoint) {
    const response = await axios.get(`${this.config.automated_hub_engine_url}/api/${this.config.api_version}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${process.env.AHE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  }

  async fetchFromMarketingAutomationHub(endpoint) {
    const response = await axios.get(`${this.config.marketing_automation_hub_url}/api/${this.config.api_version}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MAH_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  }

  // Utility methods
  async validateClientCredentials(client_id, client_secret) {
    // Implement your client validation logic
    // This could check against a database of registered integration clients
    return true; // Placeholder
  }

  getIntegrationPermissions(integration_type) {
    const permissions = {
      'mah_to_ahe': ['onboarding.sync', 'analytics.read', 'triggers.sync'],
      'ahe_to_mah': ['campaigns.orchestrate', 'analytics.read', 'users.import']
    };
    return permissions[integration_type] || [];
  }

  combineAnalyticsData(aheData, mahData) {
    // Implement logic to combine and normalize analytics data from both systems
    return {
      combined_metrics: {
        total_users: (aheData?.total_users || 0) + (mahData?.total_users || 0),
        activation_rate: this.calculateWeightedAverage(aheData?.activation_rate, mahData?.activation_rate),
        retention_rate: this.calculateWeightedAverage(aheData?.retention_rate, mahData?.retention_rate),
        revenue_impact: (aheData?.revenue_impact || 0) + (mahData?.revenue_impact || 0)
      },
      system_specific: {
        automated_hub_engine: aheData,
        marketing_automation_hub: mahData
      }
    };
  }

  calculateWeightedAverage(value1, value2) {
    if (!value1 && !value2) return 0;
    if (!value1) return value2;
    if (!value2) return value1;
    return (value1 + value2) / 2;
  }

  updateMetrics(startTime, success) {
    this.integrationMetrics.requests_processed++;
    if (success) {
      this.integrationMetrics.successful_integrations++;
    } else {
      this.integrationMetrics.failed_integrations++;
    }
    
    const responseTime = Date.now() - startTime;
    this.integrationMetrics.average_response_time = 
      (this.integrationMetrics.average_response_time + responseTime) / 2;
  }

  startHealthMonitoring() {
    setInterval(async () => {
      try {
        // Check health of both systems
        const [aheHealth, mahHealth] = await Promise.allSettled([
          axios.get(`${this.config.automated_hub_engine_url}/health`),
          axios.get(`${this.config.marketing_automation_hub_url}/health`)
        ]);

        this.integrationMetrics.last_health_check = {
          timestamp: new Date().toISOString(),
          automated_hub_engine: aheHealth.status === 'fulfilled',
          marketing_automation_hub: mahHealth.status === 'fulfilled'
        };
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`Integration Gateway running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  }
}

module.exports = IntegrationGateway;

// Example usage
if (require.main === module) {
  const gateway = new IntegrationGateway({
    automated_hub_engine_url: process.env.AHE_API_URL || 'https://api.automatedhubengine.com',
    marketing_automation_hub_url: process.env.MAH_API_URL || 'https://api.marketingautomationhub.com',
    jwt_secret: process.env.INTEGRATION_JWT_SECRET
  });
  
  gateway.start();
}