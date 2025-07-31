/**
 * Comprehensive Alerting System for Marketing Automation Hub
 * 
 * Features:
 * - Severity-based escalation with multiple channels
 * - Intelligent alert correlation and suppression
 * - Context-aware notifications with incident management
 * - Integration with all monitoring components
 * - Automated incident response and escalation
 */

const redis = require('redis');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const WebSocket = require('ws');
const axios = require('axios');
const EventEmitter = require('events');

class ComprehensiveAlertingSystem extends EventEmitter {
    constructor() {
        super();
        this.redis = redis.createClient();
        this.setupCommunicationChannels();
        this.alertRules = new Map();
        this.activeIncidents = new Map();
        this.alertHistory = [];
        this.suppressionRules = new Map();
        this.escalationPolicies = new Map();
        this.setupDefaultRules();
        this.startAlertProcessor();
    }

    /**
     * Setup communication channels
     */
    setupCommunicationChannels() {
        // Email transporter
        this.emailTransporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.ALERT_EMAIL_USER,
                pass: process.env.ALERT_EMAIL_PASS
            }
        });

        // SMS/Voice via Twilio
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Slack webhook
        this.slackWebhook = process.env.SLACK_WEBHOOK_URL;

        // WebSocket for real-time dashboard updates
        this.wss = new WebSocket.Server({ port: 8081 });
        
        // PagerDuty integration
        this.pagerDutyIntegrationKey = process.env.PAGERDUTY_INTEGRATION_KEY;
    }

    /**
     * Setup default alerting rules
     */
    setupDefaultRules() {
        // Critical system alerts
        this.addAlertRule('system_down', {
            severity: 'critical',
            condition: (data) => data.status === 'down',
            channels: ['email', 'sms', 'slack', 'pagerduty'],
            escalationTime: 2, // minutes
            suppressionTime: 5, // minutes
            maxOccurrences: 1
        });

        // Performance degradation alerts
        this.addAlertRule('performance_degraded', {
            severity: 'high',
            condition: (data) => data.responseTime > 1000 || data.errorRate > 5,
            channels: ['email', 'slack'],
            escalationTime: 5,
            suppressionTime: 10,
            maxOccurrences: 3
        });

        // Resource utilization alerts
        this.addAlertRule('resource_high', {
            severity: 'medium',
            condition: (data) => data.cpuUsage > 80 || data.memoryUsage > 85,
            channels: ['slack'],
            escalationTime: 10,
            suppressionTime: 15,
            maxOccurrences: 5
        });

        // Business metric alerts
        this.addAlertRule('business_anomaly', {
            severity: 'medium',
            condition: (data) => data.conversionRate < 2.0 || data.revenuePerUser < 50,
            channels: ['email', 'slack'],
            escalationTime: 15,
            suppressionTime: 30,
            maxOccurrences: 2
        });

        // User experience alerts
        this.addAlertRule('ux_degraded', {
            severity: 'medium',
            condition: (data) => data.pageLCP > 2500 || data.satisfactionScore < 3.5,
            channels: ['slack'],
            escalationTime: 10,
            suppressionTime: 20,
            maxOccurrences: 3
        });

        // Anomaly detection alerts
        this.addAlertRule('anomaly_detected', {
            severity: 'low',
            condition: (data) => data.anomalyScore > 0.8,
            channels: ['slack'],
            escalationTime: 30,
            suppressionTime: 60,
            maxOccurrences: 10
        });

        // Setup escalation policies
        this.setupEscalationPolicies();
    }

    /**
     * Setup escalation policies for different severity levels
     */
    setupEscalationPolicies() {
        this.escalationPolicies.set('critical', {
            levels: [
                { time: 0, contacts: ['on-call-engineer'], channels: ['sms', 'email'] },
                { time: 2, contacts: ['team-lead'], channels: ['sms', 'email', 'voice'] },
                { time: 5, contacts: ['engineering-manager'], channels: ['sms', 'voice'] },
                { time: 10, contacts: ['cto'], channels: ['sms', 'voice'] }
            ]
        });

        this.escalationPolicies.set('high', {
            levels: [
                { time: 0, contacts: ['on-call-engineer'], channels: ['email', 'slack'] },
                { time: 5, contacts: ['team-lead'], channels: ['sms', 'email'] },
                { time: 15, contacts: ['engineering-manager'], channels: ['email'] }
            ]
        });

        this.escalationPolicies.set('medium', {
            levels: [
                { time: 0, contacts: ['team'], channels: ['slack'] },
                { time: 10, contacts: ['on-call-engineer'], channels: ['email'] }
            ]
        });

        this.escalationPolicies.set('low', {
            levels: [
                { time: 0, contacts: ['team'], channels: ['slack'] }
            ]
        });
    }

    /**
     * Add custom alert rule
     */
    addAlertRule(name, rule) {
        this.alertRules.set(name, {
            ...rule,
            created: new Date(),
            triggerCount: 0,
            lastTriggered: null
        });
    }

    /**
     * Start alert processing system
     */
    startAlertProcessor() {
        // Process alerts from all monitoring systems
        setInterval(() => {
            this.processSystemHealthAlerts();
            this.processPerformanceAlerts();
            this.processUXAlerts();
            this.processBusinessAlerts();  
            this.processAnomalyAlerts();
            this.processPredictiveAlerts();
            this.checkEscalations();
            this.cleanupOldIncidents();
        }, 10000); // Every 10 seconds

        // Real-time alert processing from Redis streams
        this.subscribeToAlertStreams();
    }

    /**
     * Subscribe to Redis alert streams
     */
    async subscribeToAlertStreams() {
        const subscriber = this.redis.duplicate();
        await subscriber.connect();

        subscriber.subscribe('alerts:system', (message) => {
            this.processAlert('system', JSON.parse(message));
        });

        subscriber.subscribe('alerts:performance', (message) => {
            this.processAlert('performance', JSON.parse(message));
        });

        subscriber.subscribe('alerts:ux', (message) => {
            this.processAlert('ux', JSON.parse(message));
        });

        subscriber.subscribe('alerts:business', (message) => {
            this.processAlert('business', JSON.parse(message));
        });

        subscriber.subscribe('alerts:anomaly', (message) => {
            this.processAlert('anomaly', JSON.parse(message));
        });
    }

    /**
     * Process system health alerts
     */
    async processSystemHealthAlerts() {
        try {
            const healthData = await this.redis.hGetAll('health:current');
            
            for (const [component, status] of Object.entries(healthData)) {
                const data = JSON.parse(status);
                
                // Check for system down
                if (data.status === 'down') {
                    await this.triggerAlert('system_down', {
                        component,
                        status: data.status,
                        responseTime: data.responseTime,
                        lastCheck: data.timestamp,
                        details: `Component ${component} is down`
                    });
                }

                // Check for performance issues
                if (data.responseTime > 1000) {
                    await this.triggerAlert('performance_degraded', {
                        component,
                        responseTime: data.responseTime,
                        threshold: 1000,
                        details: `High response time detected for ${component}`
                    });
                }
            }
        } catch (error) {
            console.error('Error processing system health alerts:', error);
        }
    }

    /**
     * Process performance analytics alerts
     */
    async processPerformanceAlerts() {
        try {
            const perfData = await this.redis.hGetAll('performance:current');
            
            for (const [metric, value] of Object.entries(perfData)) {
                const data = JSON.parse(value);
                
                // Check resource utilization
                if (data.cpuUsage > 80 || data.memoryUsage > 85) {
                    await this.triggerAlert('resource_high', {
                        metric,
                        cpuUsage: data.cpuUsage,
                        memoryUsage: data.memoryUsage,
                        details: `High resource utilization detected`
                    });
                }

                // Check error rates
                if (data.errorRate > 5) {
                    await this.triggerAlert('performance_degraded', {
                        metric,
                        errorRate: data.errorRate,
                        threshold: 5,
                        details: `High error rate detected`
                    });
                }
            }
        } catch (error) {
            console.error('Error processing performance alerts:', error);
        }
    }

    /**
     * Process UX monitoring alerts
     */
    async processUXAlerts() {
        try {
            const uxData = await this.redis.hGetAll('ux:current');
            
            for (const [page, metrics] of Object.entries(uxData)) {
                const data = JSON.parse(metrics);
                
                // Check Core Web Vitals
                if (data.lcp > 2500 || data.fid > 100 || data.cls > 0.1) {
                    await this.triggerAlert('ux_degraded', {
                        page,
                        pageLCP: data.lcp,
                        pageFID: data.fid,
                        pageCLS: data.cls,
                        details: `Poor Core Web Vitals for ${page}`
                    });
                }

                // Check satisfaction scores
                if (data.satisfactionScore < 3.5) {
                    await this.triggerAlert('ux_degraded', {
                        page,
                        satisfactionScore: data.satisfactionScore,
                        threshold: 3.5,
                        details: `Low user satisfaction for ${page}`
                    });
                }
            }
        } catch (error) {
            console.error('Error processing UX alerts:', error);
        }
    }

    /**
     * Process business intelligence alerts
     */
    async processBusinessAlerts() {
        try {
            const biData = await this.redis.hGetAll('business:current');
            
            for (const [metric, value] of Object.entries(biData)) {
                const data = JSON.parse(value);
                
                // Check conversion rates
                if (data.conversionRate < 2.0) {
                    await this.triggerAlert('business_anomaly', {
                        metric,
                        conversionRate: data.conversionRate,
                        threshold: 2.0,
                        details: `Low conversion rate detected`
                    });
                }

                // Check revenue per user
                if (data.revenuePerUser < 50) {
                    await this.triggerAlert('business_anomaly', {
                        metric,
                        revenuePerUser: data.revenuePerUser,
                        threshold: 50,
                        details: `Low revenue per user detected`
                    });
                }
            }
        } catch (error) {
            console.error('Error processing business alerts:', error);
        }
    }

    /**
     * Process anomaly detection alerts
     */
    async processAnomalyAlerts() {
        try {
            const anomalies = await this.redis.lRange('anomalies:detected', 0, -1);
            
            for (const anomaly of anomalies) {
                const data = JSON.parse(anomaly);
                
                if (data.severity === 'high' && data.confidence > 0.8) {
                    await this.triggerAlert('anomaly_detected', {
                        type: data.type,
                        anomalyScore: data.confidence,
                        metric: data.metric,
                        details: `High-confidence anomaly detected: ${data.description}`
                    });
                }
            }
        } catch (error) {
            console.error('Error processing anomaly alerts:', error);
        }
    }

    /**
     * Process predictive alerts
     */
    async processPredictiveAlerts() {
        try {
            const predictions = await this.redis.hGetAll('predictions:alerts');
            
            for (const [type, prediction] of Object.entries(predictions)) {
                const data = JSON.parse(prediction);
                
                if (data.riskLevel === 'high' && data.timeToImpact < 15) {
                    await this.triggerAlert('predictive_issue', {
                        type,
                        riskLevel: data.riskLevel,
                        timeToImpact: data.timeToImpact,
                        predictedImpact: data.impact,
                        details: `Predictive alert: ${data.description}`
                    });
                }
            }
        } catch (error) {
            console.error('Error processing predictive alerts:', error);
        }
    }

    /**
     * Trigger alert with correlation and suppression
     */
    async triggerAlert(ruleName, alertData) {
        const rule = this.alertRules.get(ruleName);
        if (!rule || !rule.condition(alertData)) {
            return;
        }

        // Check suppression
        if (this.isAlertSuppressed(ruleName, alertData)) {
            return;
        }

        // Create incident
        const incident = {
            id: `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            rule: ruleName,
            severity: rule.severity,
            data: alertData,
            timestamp: new Date(),
            status: 'open',
            escalationLevel: 0,
            channels: rule.channels,
            acknowledgments: []
        };

        // Store incident
        this.activeIncidents.set(incident.id, incident);
        await this.redis.hSet('incidents:active', incident.id, JSON.stringify(incident));

        // Send notifications
        await this.sendNotifications(incident);

        // Update rule statistics
        rule.triggerCount++;
        rule.lastTriggered = new Date();

        // Add to history
        this.alertHistory.push({
            ...incident,
            action: 'triggered'
        });

        // Schedule escalation
        this.scheduleEscalation(incident);

        // Emit event for real-time updates
        this.emit('alert', incident);

        console.log(`Alert triggered: ${ruleName} - ${incident.id}`);
    }

    /**
     * Check if alert should be suppressed
     */
    isAlertSuppressed(ruleName, alertData) {
        const rule = this.alertRules.get(ruleName);
        const suppressionKey = `${ruleName}:${this.getAlertFingerprint(alertData)}`;
        
        // Check recent occurrences
        const recentAlerts = this.alertHistory.filter(alert => 
            alert.rule === ruleName &&
            Date.now() - alert.timestamp.getTime() < rule.suppressionTime * 60 * 1000
        );

        return recentAlerts.length >= rule.maxOccurrences;
    }

    /**
     * Generate alert fingerprint for deduplication
     */
    getAlertFingerprint(alertData) {
        const keys = ['component', 'metric', 'page', 'type'];
        return keys.map(key => alertData[key] || '').join(':');
    }

    /**
     * Send notifications through configured channels
     */
    async sendNotifications(incident) {
        const promises = incident.channels.map(channel => {
            switch (channel) {
                case 'email':
                    return this.sendEmailAlert(incident);
                case 'sms':
                    return this.sendSMSAlert(incident);
                case 'slack':
                    return this.sendSlackAlert(incident);
                case 'pagerduty':
                    return this.sendPagerDutyAlert(incident);
                case 'voice':
                    return this.sendVoiceAlert(incident);
                case 'webhook':
                    return this.sendWebhookAlert(incident);
                default:
                    return Promise.resolve();
            }
        });

        try {
            await Promise.allSettled(promises);
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    }

    /**
     * Send email alert
     */
    async sendEmailAlert(incident) {
        const subject = `[${incident.severity.toUpperCase()}] Alert: ${incident.rule}`;
        const body = this.formatAlertEmail(incident);

        try {
            await this.emailTransporter.sendMail({
                from: process.env.ALERT_EMAIL_USER,
                to: this.getContactsForSeverity(incident.severity, 'email'),
                subject,
                html: body
            });
        } catch (error) {
            console.error('Failed to send email alert:', error);
        }
    }

    /**
     * Send SMS alert
     */
    async sendSMSAlert(incident) {
        const message = this.formatAlertSMS(incident);
        const contacts = this.getContactsForSeverity(incident.severity, 'sms');

        for (const contact of contacts) {
            try {
                await this.twilioClient.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: contact.phone
                });
            } catch (error) {
                console.error('Failed to send SMS alert:', error);
            }
        }
    }

    /**
     * Send Slack alert
     */
    async sendSlackAlert(incident) {
        const payload = this.formatSlackAlert(incident);

        try {
            await axios.post(this.slackWebhook, payload);
        } catch (error) {
            console.error('Failed to send Slack alert:', error);
        }
    }

    /**
     * Send PagerDuty alert
     */
    async sendPagerDutyAlert(incident) {
        const payload = {
            routing_key: this.pagerDutyIntegrationKey,
            event_action: 'trigger',
            dedup_key: incident.id,
            payload: {
                summary: `${incident.rule}: ${incident.data.details}`,
                severity: incident.severity,
                source: 'Marketing Automation Hub',
                timestamp: incident.timestamp.toISOString(),
                custom_details: incident.data
            }
        };

        try {
            await axios.post('https://events.pagerduty.com/v2/enqueue', payload);
        } catch (error) {
            console.error('Failed to send PagerDuty alert:', error);
        }
    }

    /**
     * Send voice alert
     */
    async sendVoiceAlert(incident) {
        const message = this.formatAlertVoice(incident);
        const contacts = this.getContactsForSeverity(incident.severity, 'voice');

        for (const contact of contacts) {
            try {
                await this.twilioClient.calls.create({
                    twiml: `<Response><Say>${message}</Say></Response>`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: contact.phone
                });
            } catch (error) {
                console.error('Failed to send voice alert:', error);
            }
        }
    }

    /**
     * Check and process escalations
     */
    checkEscalations() {
        for (const [incidentId, incident] of this.activeIncidents) {
            if (incident.status !== 'open') continue;

            const escalationPolicy = this.escalationPolicies.get(incident.severity);
            if (!escalationPolicy) continue;

            const timeSinceCreated = (Date.now() - incident.timestamp.getTime()) / (1000 * 60);
            const nextLevel = escalationPolicy.levels[incident.escalationLevel + 1];

            if (nextLevel && timeSinceCreated >= nextLevel.time) {
                this.escalateIncident(incident, nextLevel);
            }
        }
    }

    /**
     * Escalate incident to next level
     */
    async escalateIncident(incident, nextLevel) {
        incident.escalationLevel++;
        incident.channels = nextLevel.channels;

        // Send escalation notifications
        await this.sendNotifications(incident);

        // Update incident
        await this.redis.hSet('incidents:active', incident.id, JSON.stringify(incident));

        // Log escalation
        this.alertHistory.push({
            ...incident,
            action: 'escalated',
            escalationLevel: incident.escalationLevel
        });

        console.log(`Incident escalated: ${incident.id} to level ${incident.escalationLevel}`);
    }

    /**
     * Schedule escalation timer
     */
    scheduleEscalation(incident) {
        const escalationPolicy = this.escalationPolicies.get(incident.severity);
        if (!escalationPolicy || escalationPolicy.levels.length <= 1) return;

        const nextLevel = escalationPolicy.levels[1];
        setTimeout(() => {
            if (this.activeIncidents.has(incident.id) && 
                this.activeIncidents.get(incident.id).status === 'open') {
                this.escalateIncident(incident, nextLevel);
            }
        }, nextLevel.time * 60 * 1000);
    }

    /**
     * Acknowledge incident
     */
    async acknowledgeIncident(incidentId, acknowledgedBy) {
        const incident = this.activeIncidents.get(incidentId);
        if (!incident) return false;

        incident.acknowledgments.push({
            by: acknowledgedBy,
            timestamp: new Date()
        });

        incident.status = 'acknowledged';
        await this.redis.hSet('incidents:active', incidentId, JSON.stringify(incident));

        this.alertHistory.push({
            ...incident,
            action: 'acknowledged',
            acknowledgedBy
        });

        return true;
    }

    /**
     * Resolve incident
     */
    async resolveIncident(incidentId, resolvedBy, resolution) {
        const incident = this.activeIncidents.get(incidentId);
        if (!incident) return false;

        incident.status = 'resolved';
        incident.resolvedBy = resolvedBy;
        incident.resolution = resolution;
        incident.resolvedAt = new Date();

        // Move to resolved incidents
        await this.redis.hSet('incidents:resolved', incidentId, JSON.stringify(incident));
        await this.redis.hDel('incidents:active', incidentId);
        this.activeIncidents.delete(incidentId);

        this.alertHistory.push({
            ...incident,
            action: 'resolved',
            resolvedBy,
            resolution
        });

        return true;
    }

    /**
     * Get contacts for severity level and channel
     */
    getContactsForSeverity(severity, channel) {
        // Mock contact list - should be configurable
        const contacts = {
            'on-call-engineer': { email: 'oncall@company.com', phone: '+1234567890' },
            'team-lead': { email: 'teamlead@company.com', phone: '+1234567891' },
            'engineering-manager': { email: 'em@company.com', phone: '+1234567892' },
            'cto': { email: 'cto@company.com', phone: '+1234567893' },
            'team': { email: 'team@company.com', slack: '#alerts' }
        };

        const escalationPolicy = this.escalationPolicies.get(severity);
        if (!escalationPolicy) return [];

        const currentLevel = escalationPolicy.levels[0];
        return currentLevel.contacts.map(contact => contacts[contact]).filter(Boolean);
    }

    /**
     * Format alert email
     */
    formatAlertEmail(incident) {
        return `
            <h2>Alert: ${incident.rule}</h2>
            <p><strong>Severity:</strong> ${incident.severity}</p>
            <p><strong>Incident ID:</strong> ${incident.id}</p>
            <p><strong>Time:</strong> ${incident.timestamp}</p>
            <p><strong>Details:</strong> ${incident.data.details}</p>
            <h3>Alert Data:</h3>
            <pre>${JSON.stringify(incident.data, null, 2)}</pre>
            <p><a href="http://monitoring.company.com/incidents/${incident.id}">View Incident</a></p>
        `;
    }

    /**
     * Format alert SMS
     */
    formatAlertSMS(incident) {
        return `[${incident.severity.toUpperCase()}] Alert: ${incident.rule} - ${incident.data.details} - ID: ${incident.id}`;
    }

    /**
     * Format Slack alert
     */
    formatSlackAlert(incident) {
        const color = {
            critical: 'danger',
            high: 'warning', 
            medium: 'good',
            low: '#cccccc'
        }[incident.severity] || 'good';

        return {
            attachments: [{
                color,
                title: `Alert: ${incident.rule}`,
                text: incident.data.details,
                fields: [
                    { title: 'Severity', value: incident.severity, short: true },
                    { title: 'Incident ID', value: incident.id, short: true },
                    { title: 'Time', value: incident.timestamp.toISOString(), short: true }
                ],
                actions: [
                    {
                        type: 'button',
                        text: 'Acknowledge',
                        url: `http://monitoring.company.com/incidents/${incident.id}/ack`
                    },
                    {
                        type: 'button',
                        text: 'View Details',
                        url: `http://monitoring.company.com/incidents/${incident.id}`
                    }
                ]
            }]
        };
    }

    /**
     * Format voice alert
     */
    formatAlertVoice(incident) {
        return `Alert: ${incident.severity} severity ${incident.rule}. ${incident.data.details}. Incident ID: ${incident.id}`;
    }

    /**
     * Clean up old incidents
     */
    cleanupOldIncidents() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        this.alertHistory = this.alertHistory.filter(alert => 
            alert.timestamp.getTime() > oneWeekAgo
        );
    }

    /**
     * Get incident statistics
     */
    async getIncidentStats() {
        const activeCount = this.activeIncidents.size;
        const resolvedToday = this.alertHistory.filter(alert => 
            alert.action === 'resolved' && 
            Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000
        ).length;

        const severityBreakdown = {};
        for (const incident of this.activeIncidents.values()) {
            severityBreakdown[incident.severity] = (severityBreakdown[incident.severity] || 0) + 1;
        }

        return {
            activeIncidents: activeCount,
            resolvedToday,
            severityBreakdown,
            totalHistory: this.alertHistory.length
        };
    }

    /**
     * Get current system status
     */
    async getSystemStatus() {
        const criticalIncidents = Array.from(this.activeIncidents.values())
            .filter(incident => incident.severity === 'critical').length;

        if (criticalIncidents > 0) {
            return 'critical';
        }

        const highIncidents = Array.from(this.activeIncidents.values())
            .filter(incident => incident.severity === 'high').length;

        if (highIncidents > 2) {
            return 'degraded';
        }

        return 'operational';
    }
}

module.exports = ComprehensiveAlertingSystem;