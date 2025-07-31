/**
 * Real-Time System Health Monitor
 * Tracks all agents, APIs, databases, and integrations
 * Target: 99.9% uptime, <200ms response times
 */

const Redis = require('redis');
const winston = require('winston');
const os = require('os');
const fs = require('fs').promises;

class SystemHealthMonitor {
    constructor() {
        this.redis = Redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/system-health.log' }),
                new winston.transports.Console()
            ]
        });

        this.healthChecks = new Map();
        this.metrics = new Map();
        this.alertThresholds = {
            responseTime: 200, // ms
            errorRate: 0.1, // 0.1%
            uptime: 99.9, // 99.9%
            cpuUsage: 80, // 80%
            memoryUsage: 85, // 85%
            diskUsage: 90, // 90%
            queueLength: 1000 // max queue items
        };

        this.systemComponents = {
            agents: ['agent-a-social', 'agent-b-api', 'agent-c-analytics'],
            apis: ['mailchimp', 'sendgrid', 'twitter', 'instagram', 'facebook', 'etsy'],
            databases: ['postgres', 'redis', 'sqlite'],
            services: ['email-service', 'social-media-service', 'analytics-collector']
        };

        this.initialize();
    }

    async initialize() {
        await this.redis.connect();
        this.logger.info('System Health Monitor initialized');

        // Start continuous monitoring
        this.startHealthChecks();
        this.startMetricsCollection();
        this.startPerformanceMonitoring();

        // Initialize health status for all components
        await this.initializeComponentHealth();
    }

    async initializeComponentHealth() {
        const timestamp = Date.now();
        
        for (const [category, components] of Object.entries(this.systemComponents)) {
            for (const component of components) {
                const healthStatus = {
                    component,
                    category,
                    status: 'unknown',
                    lastCheck: timestamp,
                    responseTime: 0,
                    uptime: 0,
                    errorCount: 0,
                    totalRequests: 0,
                    version: '1.0.0',
                    dependencies: [],
                    healthScore: 0
                };

                await this.redis.hSet(`health:${component}`, healthStatus);
                this.healthChecks.set(component, healthStatus);
            }
        }
    }

    startHealthChecks() {
        // Run health checks every 30 seconds
        setInterval(async () => {
            await this.performHealthChecks();
        }, 30000);

        // Run deep health checks every 5 minutes
        setInterval(async () => {
            await this.performDeepHealthChecks();
        }, 300000);
    }

    async performHealthChecks() {
        const timestamp = Date.now();
        const healthResults = [];

        try {
            // Check Agents
            for (const agent of this.systemComponents.agents) {
                const health = await this.checkAgentHealth(agent);
                healthResults.push(health);
            }

            // Check APIs
            for (const api of this.systemComponents.apis) {
                const health = await this.checkAPIHealth(api);
                healthResults.push(health);
            }

            // Check Databases
            for (const db of this.systemComponents.databases) {
                const health = await this.checkDatabaseHealth(db);
                healthResults.push(health);
            }

            // Check Services
            for (const service of this.systemComponents.services) {
                const health = await this.checkServiceHealth(service);
                healthResults.push(health);
            }

            // Store results and trigger alerts if needed
            await this.processHealthResults(healthResults);

        } catch (error) {
            this.logger.error('Health check failed:', error);
        }
    }

    async checkAgentHealth(agent) {
        const startTime = Date.now();
        
        try {
            // Check agent-specific endpoints
            let status = 'healthy';
            let responseTime = 0;
            let errorCount = 0;

            switch (agent) {
                case 'agent-a-social':
                    // Check social media scheduling service
                    responseTime = await this.pingEndpoint('/api/social/health');
                    break;
                case 'agent-b-api':
                    // Check API integration service
                    responseTime = await this.pingEndpoint('/api/integration/health');
                    break;
                case 'agent-c-analytics':
                    // Check analytics dashboard service
                    responseTime = await this.pingEndpoint('/api/analytics/health');
                    break;
            }

            if (responseTime > this.alertThresholds.responseTime) {
                status = 'degraded';
            }

            return {
                component: agent,
                category: 'agents',
                status,
                responseTime,
                timestamp: Date.now(),
                errorCount,
                healthScore: this.calculateHealthScore(status, responseTime, errorCount)
            };

        } catch (error) {
            return {
                component: agent,
                category: 'agents',
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                timestamp: Date.now(),
                error: error.message,
                healthScore: 0
            };
        }
    }

    async checkAPIHealth(api) {
        const startTime = Date.now();
        
        try {
            let status = 'healthy';
            let responseTime = 0;
            let rateLimitStatus = {};

            switch (api) {
                case 'mailchimp':
                    responseTime = await this.checkMailchimpHealth();
                    rateLimitStatus = await this.getMailchimpRateLimit();
                    break;
                case 'sendgrid':
                    responseTime = await this.checkSendgridHealth();
                    break;
                case 'twitter':
                    responseTime = await this.checkTwitterHealth();
                    rateLimitStatus = await this.getTwitterRateLimit();
                    break;
                case 'instagram':
                    responseTime = await this.checkInstagramHealth();
                    break;
                case 'facebook':
                    responseTime = await this.checkFacebookHealth();
                    break;
                case 'etsy':
                    responseTime = await this.checkEtsyHealth();
                    break;
            }

            if (responseTime > this.alertThresholds.responseTime * 2) {
                status = 'degraded';
            }

            return {
                component: api,
                category: 'apis',
                status,
                responseTime,
                timestamp: Date.now(),
                rateLimitStatus,
                healthScore: this.calculateHealthScore(status, responseTime, 0)
            };

        } catch (error) {
            return {
                component: api,
                category: 'apis',
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                timestamp: Date.now(),
                error: error.message,
                healthScore: 0
            };
        }
    }

    async checkDatabaseHealth(db) {
        const startTime = Date.now();
        
        try {
            let status = 'healthy';
            let responseTime = 0;
            let connectionCount = 0;
            let queryPerformance = {};

            switch (db) {
                case 'postgres':
                    responseTime = await this.checkPostgresHealth();
                    connectionCount = await this.getPostgresConnections();
                    queryPerformance = await this.getPostgresQueryStats();
                    break;
                case 'redis':
                    responseTime = await this.checkRedisHealth();
                    connectionCount = await this.getRedisConnections();
                    break;
                case 'sqlite':
                    responseTime = await this.checkSqliteHealth();
                    break;
            }

            if (responseTime > this.alertThresholds.responseTime) {
                status = 'degraded';
            }

            return {
                component: db,
                category: 'databases',
                status,
                responseTime,
                timestamp: Date.now(),
                connectionCount,
                queryPerformance,
                healthScore: this.calculateHealthScore(status, responseTime, 0)
            };

        } catch (error) {
            return {
                component: db,
                category: 'databases',
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                timestamp: Date.now(),
                error: error.message,
                healthScore: 0
            };
        }
    }

    async checkServiceHealth(service) {
        const startTime = Date.now();
        
        try {
            let status = 'healthy';
            let responseTime = 0;
            let queueLength = 0;
            let processingRate = 0;

            switch (service) {
                case 'email-service':
                    responseTime = await this.pingEndpoint('/api/email/health');
                    queueLength = await this.getEmailQueueLength();
                    break;
                case 'social-media-service':
                    responseTime = await this.pingEndpoint('/api/social/health');
                    queueLength = await this.getSocialQueueLength();
                    break;
                case 'analytics-collector':
                    responseTime = await this.pingEndpoint('/api/analytics/health');
                    processingRate = await this.getAnalyticsProcessingRate();
                    break;
            }

            if (responseTime > this.alertThresholds.responseTime || 
                queueLength > this.alertThresholds.queueLength) {
                status = 'degraded';
            }

            return {
                component: service,
                category: 'services',
                status,
                responseTime,
                timestamp: Date.now(),
                queueLength,
                processingRate,
                healthScore: this.calculateHealthScore(status, responseTime, 0)
            };

        } catch (error) {
            return {
                component: service,
                category: 'services',
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                timestamp: Date.now(),
                error: error.message,
                healthScore: 0
            };
        }
    }

    async performDeepHealthChecks() {
        const systemHealth = {
            timestamp: Date.now(),
            systemResources: await this.getSystemResources(),
            networkLatency: await this.checkNetworkLatency(),
            diskHealth: await this.checkDiskHealth(),
            memoryHealth: await this.checkMemoryHealth(),
            processHealth: await this.checkProcessHealth(),
            integrationHealth: await this.checkCrossAgentIntegration()
        };

        await this.redis.hSet('system:deep-health', JSON.stringify(systemHealth));
        
        // Trigger alerts for critical issues
        await this.evaluateSystemHealth(systemHealth);
    }

    async getSystemResources() {
        return {
            cpu: {
                usage: await this.getCPUUsage(),
                loadAverage: os.loadavg(),
                cores: os.cpus().length
            },
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
            },
            disk: await this.getDiskUsage(),
            network: await this.getNetworkStats(),
            uptime: os.uptime()
        };
    }

    calculateHealthScore(status, responseTime, errorCount) {
        let score = 100;

        // Status penalty
        if (status === 'degraded') score -= 25;
        if (status === 'unhealthy') score = 0;

        // Response time penalty
        if (responseTime > this.alertThresholds.responseTime) {
            score -= Math.min(50, (responseTime / this.alertThresholds.responseTime) * 10);
        }

        // Error count penalty
        score -= Math.min(20, errorCount * 2);

        return Math.max(0, Math.round(score));
    }

    async processHealthResults(results) {
        const overallHealth = {
            timestamp: Date.now(),
            components: results,
            summary: {
                healthy: results.filter(r => r.status === 'healthy').length,
                degraded: results.filter(r => r.status === 'degraded').length,
                unhealthy: results.filter(r => r.status === 'unhealthy').length,
                averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
                overallHealthScore: results.reduce((sum, r) => sum + r.healthScore, 0) / results.length
            }
        };

        // Store health summary
        await this.redis.hSet('system:health-summary', JSON.stringify(overallHealth));

        // Store individual component health
        for (const result of results) {
            await this.redis.hSet(`health:${result.component}`, JSON.stringify(result));
        }

        // Trigger alerts if needed
        await this.evaluateHealthAlerts(overallHealth);

        this.logger.info('Health check completed', overallHealth.summary);
    }

    async evaluateHealthAlerts(healthData) {
        const alerts = [];

        // Check overall system health
        if (healthData.summary.overallHealthScore < 70) {
            alerts.push({
                severity: 'critical',
                type: 'system_health',
                message: `System health score below threshold: ${healthData.summary.overallHealthScore}%`
            });
        }

        // Check response time
        if (healthData.summary.averageResponseTime > this.alertThresholds.responseTime) {
            alerts.push({
                severity: 'warning',
                type: 'performance',
                message: `Average response time: ${healthData.summary.averageResponseTime}ms`
            });
        }

        // Check unhealthy components
        if (healthData.summary.unhealthy > 0) {
            alerts.push({
                severity: 'critical',
                type: 'component_failure',
                message: `${healthData.summary.unhealthy} components are unhealthy`
            });
        }

        // Send alerts
        for (const alert of alerts) {
            await this.sendAlert(alert);
        }
    }

    async sendAlert(alert) {
        const alertData = {
            ...alert,
            timestamp: Date.now(),
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Store alert
        await this.redis.lPush('alerts:active', JSON.stringify(alertData));

        // Log alert
        this.logger[alert.severity === 'critical' ? 'error' : 'warn']('ALERT:', alertData);

        // Trigger notification systems (email, Slack, etc.)
        await this.triggerAlertNotifications(alertData);
    }

    // Utility methods for specific health checks
    async pingEndpoint(endpoint, timeout = 5000) {
        const startTime = Date.now();
        try {
            // Simulate endpoint ping - replace with actual HTTP requests
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            return Date.now() - startTime;
        } catch (error) {
            throw new Error(`Endpoint ${endpoint} unreachable: ${error.message}`);
        }
    }

    async checkMailchimpHealth() {
        // Simulate Mailchimp API health check
        return Math.random() * 150; // Random response time
    }

    async checkSendgridHealth() {
        // Simulate SendGrid API health check
        return Math.random() * 100;
    }

    async checkTwitterHealth() {
        // Simulate Twitter API health check
        return Math.random() * 200;
    }

    async checkInstagramHealth() {
        // Simulate Instagram API health check
        return Math.random() * 180;
    }

    async checkFacebookHealth() {
        // Simulate Facebook API health check
        return Math.random() * 160;
    }

    async checkEtsyHealth() {
        // Simulate Etsy API health check
        return Math.random() * 140;
    }

    async checkPostgresHealth() {
        // Simulate PostgreSQL health check
        return Math.random() * 50;
    }

    async checkRedisHealth() {
        // Test Redis connectivity
        const startTime = Date.now();
        await this.redis.ping();
        return Date.now() - startTime;
    }

    async checkSqliteHealth() {
        // Simulate SQLite health check
        return Math.random() * 30;
    }

    async getCPUUsage() {
        // Get CPU usage percentage
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - Math.floor((idle / total) * 100);

        return usage;
    }

    async getDiskUsage() {
        try {
            const stats = await fs.stat('.');
            // Simplified disk usage calculation
            return {
                total: 1000000000, // 1GB
                used: 500000000,   // 500MB
                free: 500000000,   // 500MB
                usage: 50          // 50%
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getNetworkStats() {
        const interfaces = os.networkInterfaces();
        return {
            interfaces: Object.keys(interfaces).length,
            active: Object.keys(interfaces).filter(name => 
                interfaces[name].some(addr => !addr.internal)
            ).length
        };
    }

    startMetricsCollection() {
        // Collect metrics every minute
        setInterval(async () => {
            await this.collectSystemMetrics();
        }, 60000);
    }

    async collectSystemMetrics() {
        const metrics = {
            timestamp: Date.now(),
            system: await this.getSystemResources(),
            application: {
                activeConnections: await this.getActiveConnections(),
                queueSizes: await this.getQueueSizes(),
                errorRates: await this.getErrorRates(),
                throughput: await this.getThroughputMetrics()
            }
        };

        await this.redis.lPush('metrics:system', JSON.stringify(metrics));
        await this.redis.lTrim('metrics:system', 0, 1440); // Keep 24 hours of data
    }

    async getHealthStatus() {
        const healthSummary = await this.redis.hGet('system:health-summary');
        return healthSummary ? JSON.parse(healthSummary) : null;
    }

    async getComponentHealth(component) {
        const health = await this.redis.hGet(`health:${component}`);
        return health ? JSON.parse(health) : null;
    }

    async getActiveAlerts() {
        const alerts = await this.redis.lRange('alerts:active', 0, -1);
        return alerts.map(alert => JSON.parse(alert));
    }

    async getSystemMetrics(hours = 1) {
        const count = hours * 60; // Metrics collected every minute
        const metrics = await this.redis.lRange('metrics:system', 0, count - 1);
        return metrics.map(metric => JSON.parse(metric));
    }

    startPerformanceMonitoring() {
        // Monitor performance every 10 seconds
        setInterval(async () => {
            await this.collectPerformanceMetrics();
        }, 10000);
    }

    async collectPerformanceMetrics() {
        const performance = {
            timestamp: Date.now(),
            responseTime: await this.measureAverageResponseTime(),
            throughput: await this.measureThroughput(),
            errorRate: await this.calculateErrorRate(),
            concurrentUsers: await this.getConcurrentUsers(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: await this.getCPUUsage()
        };

        await this.redis.lPush('metrics:performance', JSON.stringify(performance));
        await this.redis.lTrim('metrics:performance', 0, 8640); // Keep 24 hours of data
    }

    async measureAverageResponseTime() {
        // Get average response time from recent health checks
        const recentChecks = await this.redis.lRange('metrics:performance', 0, 5);
        if (recentChecks.length === 0) return 0;

        const times = recentChecks.map(check => JSON.parse(check).responseTime || 0);
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    async measureThroughput() {
        // Measure requests per second
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // This would typically query your request logs
        return Math.floor(Math.random() * 100) + 50; // Simulated throughput
    }

    async calculateErrorRate() {
        // Calculate error rate percentage
        return Math.random() * 0.5; // Simulated error rate (0-0.5%)
    }

    async getConcurrentUsers() {
        // Get concurrent user count
        return Math.floor(Math.random() * 500) + 100; // Simulated concurrent users
    }

    // Helper methods for queue and connection monitoring
    async getActiveConnections() {
        return {
            database: Math.floor(Math.random() * 50) + 10,
            redis: Math.floor(Math.random() * 20) + 5,
            external_apis: Math.floor(Math.random() * 30) + 10
        };
    }

    async getQueueSizes() {
        return {
            email: await this.getEmailQueueLength(),
            social: await this.getSocialQueueLength(),
            analytics: Math.floor(Math.random() * 100)
        };
    }

    async getEmailQueueLength() {
        return Math.floor(Math.random() * 200);
    }

    async getSocialQueueLength() {
        return Math.floor(Math.random() * 150);
    }

    async getAnalyticsProcessingRate() {
        return Math.floor(Math.random() * 1000) + 500; // Events per minute
    }

    async getErrorRates() {
        return {
            email_service: Math.random() * 0.1,
            social_service: Math.random() * 0.2,
            analytics_service: Math.random() * 0.05,
            api_integrations: Math.random() * 0.3
        };
    }

    async getThroughputMetrics() {
        return {
            emails_sent: Math.floor(Math.random() * 1000) + 500,
            posts_published: Math.floor(Math.random() * 100) + 50,
            analytics_events: Math.floor(Math.random() * 5000) + 2000,
            api_requests: Math.floor(Math.random() * 10000) + 5000
        };
    }

    async triggerAlertNotifications(alert) {
        // Implementation for sending notifications
        // This could include email, Slack, SMS, etc.
        console.log('ALERT NOTIFICATION:', alert);
    }

    async checkCrossAgentIntegration() {
        // Test integration between all three agents
        const integrationTests = [
            { from: 'agent-a', to: 'agent-b', endpoint: '/api/integration/content-delivery' },
            { from: 'agent-b', to: 'agent-c', endpoint: '/api/integration/performance-data' },
            { from: 'agent-c', to: 'agent-a', endpoint: '/api/integration/optimization-feedback' }
        ];

        const results = [];
        for (const test of integrationTests) {
            try {
                const responseTime = await this.pingEndpoint(test.endpoint);
                results.push({
                    ...test,
                    status: 'healthy',
                    responseTime,
                    timestamp: Date.now()
                });
            } catch (error) {
                results.push({
                    ...test,
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        }

        return results;
    }
}

module.exports = SystemHealthMonitor;