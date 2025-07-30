/**
 * Automated Hub Engine - Main Application Entry Point
 * Enterprise Onboarding & Campaign Orchestration Platform
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Core modules
const OnboardingOrchestrator = require('../core/onboarding-orchestrator');
const CampaignExecutor = require('../core/campaign-executor');
const BehavioralEngine = require('../core/behavioral-engine');
const AnalyticsDashboard = require('../core/analytics-dashboard');
const CrisisManagement = require('../core/crisis-management');

// API routes
const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhooks');

// Middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

class AutomatedHubEngine {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Initialize core systems
    this.onboardingOrchestrator = new OnboardingOrchestrator({
      activation_threshold: 0.8,
      time_to_value_target: 300
    });
    
    this.campaignExecutor = new CampaignExecutor({
      max_concurrent_campaigns: 50,
      interaction_capacity_per_hour: 100000
    });
    
    this.behavioralEngine = new BehavioralEngine({
      churn_prediction_threshold: 0.85,
      real_time_processing: true
    });
    
    this.analyticsDashboard = new AnalyticsDashboard({
      real_time_updates: true,
      data_retention_days: 365
    });
    
    this.crisisManagement = new CrisisManagement({
      auto_response_enabled: true,
      escalation_threshold: 0.7
    });
    
    // System state
    this.isHealthy = true;
    this.startupTime = new Date();
    
    // Initialize application
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupEventHandlers();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));
    
    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 1000 : 10000,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);
    
    // Logging
    this.app.use(morgan('combined'));
    this.app.use(requestLogger);
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const health_status = this.getHealthStatus();
      res.status(health_status.healthy ? 200 : 503).json(health_status);
    });
    
    // Detailed health check
    this.app.get('/health/detailed', (req, res) => {
      const detailed_status = this.getDetailedHealthStatus();
      res.status(detailed_status.overall_healthy ? 200 : 503).json(detailed_status);
    });
    
    // Metrics endpoint for monitoring
    this.app.get('/metrics', (req, res) => {
      const metrics = this.getPrometheusMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    });
    
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/onboarding', authMiddleware, onboardingRoutes(this.onboardingOrchestrator));
    this.app.use('/api/campaigns', authMiddleware, campaignRoutes(this.campaignExecutor));
    this.app.use('/api/analytics', authMiddleware, analyticsRoutes(this.analyticsDashboard));
    this.app.use('/api/webhooks', webhookRoutes);
    
    // GraphQL endpoint
    const { graphqlHTTP } = require('express-graphql');
    const schema = require('./graphql/schema');
    
    this.app.use('/graphql', authMiddleware, graphqlHTTP({
      schema: schema,
      context: {
        onboardingOrchestrator: this.onboardingOrchestrator,
        campaignExecutor: this.campaignExecutor,
        behavioralEngine: this.behavioralEngine,
        analyticsDashboard: this.analyticsDashboard
      },
      graphiql: process.env.NODE_ENV === 'development'
    }));
    
    // Serve static files for dashboard
    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static('dashboard/build'));
      
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dashboard/build/index.html'));
      });
    }
  }

  setupWebSocket() {
    // Real-time updates for dashboard
    this.io.on('connection', (socket) => {
      console.log('Dashboard client connected:', socket.id);
      
      // Send initial state
      socket.emit('initial_state', {
        onboarding_metrics: this.onboardingOrchestrator.getMetricsSummary(),
        campaign_metrics: this.campaignExecutor.getPerformanceReport(),
        system_health: this.getHealthStatus()
      });
      
      // Handle dashboard subscriptions
      socket.on('subscribe_metrics', (subscription) => {
        socket.join(`metrics_${subscription.type}`);
      });
      
      socket.on('disconnect', () => {
        console.log('Dashboard client disconnected:', socket.id);
      });
    });
  }

  setupEventHandlers() {
    // Onboarding events
    this.onboardingOrchestrator.on('user_activated', (data) => {
      this.io.to('metrics_onboarding').emit('user_activated', data);
      console.log(`User activated: ${data.user_id} in ${data.time_to_value}s`);
    });
    
    this.onboardingOrchestrator.on('intervention_triggered', (data) => {
      this.io.to('metrics_onboarding').emit('intervention_triggered', data);
      console.log(`Intervention triggered: ${data.trigger_type} for ${data.user_id}`);
    });
    
    // Campaign events
    this.campaignExecutor.on('campaign_execution_completed', (data) => {
      this.io.to('metrics_campaigns').emit('campaign_completed', data);
      console.log(`Campaign completed: ${data.campaign_id} - ${data.interactions_sent} interactions`);
    });
    
    this.campaignExecutor.on('capacity_warning', (data) => {
      this.crisisManagement.handleCapacityWarning(data);
      this.io.emit('system_alert', {
        type: 'capacity_warning',
        message: `System at ${Math.round(data.utilization * 100)}% capacity`,
        data
      });
    });
    
    // Behavioral engine events
    this.behavioralEngine.on('churn_prediction', (data) => {
      this.onboardingOrchestrator.triggerIntervention(
        data.journey_id, 
        'churn_risk_detected', 
        { churn_probability: data.churn_probability }
      );
    });
    
    // Crisis management events
    this.crisisManagement.on('crisis_detected', (data) => {
      this.io.emit('system_alert', {
        type: 'crisis',
        severity: data.severity,
        message: data.message,
        automated_response: data.automated_response
      });
    });
    
    // Performance monitoring
    setInterval(() => {
      const performance_data = {
        timestamp: new Date().toISOString(),
        onboarding: this.onboardingOrchestrator.getMetricsSummary(),
        campaigns: this.campaignExecutor.getPerformanceReport(),
        behavioral: this.behavioralEngine.getEngagementMetrics(),
        system: this.getSystemMetrics()
      };
      
      this.io.to('metrics_performance').emit('performance_update', performance_data);
    }, 5000); // Every 5 seconds
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use(errorHandler);
    
    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.crisisManagement.handleSystemError({
        type: 'unhandled_rejection',
        reason,
        promise
      });
    });
    
    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.crisisManagement.handleSystemError({
        type: 'uncaught_exception',
        error
      });
      
      // Graceful shutdown
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    // Graceful shutdown signals
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
  }

  getHealthStatus() {
    return {
      healthy: this.isHealthy,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startupTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  getDetailedHealthStatus() {
    const memory = process.memoryUsage();
    
    return {
      overall_healthy: this.isHealthy,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startupTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      system: {
        memory: {
          used: Math.round(memory.heapUsed / 1024 / 1024),
          total: Math.round(memory.heapTotal / 1024 / 1024),
          external: Math.round(memory.external / 1024 / 1024),
          rss: Math.round(memory.rss / 1024 / 1024)
        },
        cpu_usage: process.cpuUsage(),
        node_version: process.version
      },
      
      services: {
        onboarding_orchestrator: {
          healthy: true,
          active_journeys: this.onboardingOrchestrator.activeJourneys.size,
          activation_rate: this.onboardingOrchestrator.metrics.activation_rate
        },
        campaign_executor: {
          healthy: true,
          active_campaigns: this.campaignExecutor.activeCampaigns.size,
          interactions_per_hour: this.campaignExecutor.metrics.interactions_per_hour
        },
        behavioral_engine: {
          healthy: true,
          predictions_made: this.behavioralEngine.metrics.predictions_made || 0
        },
        analytics_dashboard: {
          healthy: true,
          data_points_collected: this.analyticsDashboard.metrics.data_points_collected || 0
        }
      },
      
      database: {
        connected: true, // Would check actual database connection
        response_time: '<10ms'
      },
      
      redis: {
        connected: true, // Would check actual Redis connection  
        response_time: '<5ms'
      }
    };
  }

  getPrometheusMetrics() {
    const metrics = [
      `# HELP ahe_active_journeys Number of active user onboarding journeys`,
      `# TYPE ahe_active_journeys gauge`,
      `ahe_active_journeys ${this.onboardingOrchestrator.activeJourneys.size}`,
      
      `# HELP ahe_activation_rate User activation rate percentage`,
      `# TYPE ahe_activation_rate gauge`, 
      `ahe_activation_rate ${this.onboardingOrchestrator.metrics.activation_rate * 100}`,
      
      `# HELP ahe_active_campaigns Number of active campaigns`,
      `# TYPE ahe_active_campaigns gauge`,
      `ahe_active_campaigns ${this.campaignExecutor.activeCampaigns.size}`,
      
      `# HELP ahe_interactions_per_hour Campaign interactions per hour`,
      `# TYPE ahe_interactions_per_hour gauge`,
      `ahe_interactions_per_hour ${this.campaignExecutor.metrics.interactions_per_hour}`,
      
      `# HELP ahe_total_users Total users processed`,
      `# TYPE ahe_total_users counter`,
      `ahe_total_users ${this.onboardingOrchestrator.metrics.total_users}`,
      
      `# HELP ahe_system_uptime System uptime in milliseconds`,
      `# TYPE ahe_system_uptime counter`,
      `ahe_system_uptime ${Date.now() - this.startupTime.getTime()}`
    ];
    
    return metrics.join('\n') + '\n';
  }

  getSystemMetrics() {
    const memory = process.memoryUsage();
    
    return {
      memory_usage_mb: Math.round(memory.heapUsed / 1024 / 1024),
      memory_total_mb: Math.round(memory.heapTotal / 1024 / 1024),
      uptime_ms: Date.now() - this.startupTime.getTime(),
      active_connections: this.io.engine.clientsCount
    };
  }

  async gracefulShutdown(signal) {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    this.isHealthy = false;
    
    // Stop accepting new requests
    this.server.close(() => {
      console.log('HTTP server closed');
    });
    
    // Close WebSocket connections
    this.io.close(() => {
      console.log('WebSocket server closed');
    });
    
    // Cleanup core systems
    try {
      await this.onboardingOrchestrator.gracefulShutdown();
      await this.campaignExecutor.gracefulShutdown();
      await this.behavioralEngine.gracefulShutdown();
      await this.analyticsDashboard.gracefulShutdown();
      
      console.log('All systems shut down gracefully');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  start(port = process.env.PORT || 3000) {
    this.server.listen(port, () => {
      console.log(`
🚀 Automated Hub Engine started successfully!

Environment: ${process.env.NODE_ENV || 'development'}
Port: ${port}
Health Check: http://localhost:${port}/health
GraphQL: http://localhost:${port}/graphql
Dashboard: http://localhost:${port}

🎯 Ready to achieve 80%+ user activation rates!
      `);
    });
    
    return this.server;
  }
}

// Start the application
if (require.main === module) {
  const app = new AutomatedHubEngine();
  app.start();
}

module.exports = AutomatedHubEngine;