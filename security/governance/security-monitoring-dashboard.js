/**
 * Security Monitoring Dashboard
 * Real-time security operations center and incident management
 * 
 * Features:
 * - Real-time threat visualization
 * - Security metrics and KPIs
 * - Incident management workflow
 * - Automated alerting system
 * - Compliance reporting
 * - Risk assessment dashboard
 * - Security team collaboration
 * - Integration with SIEM systems
 */

const crypto = require('crypto');
const winston = require('winston');
const EventEmitter = require('events');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

class SecurityMonitoringDashboard extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            port: options.port || 3001,
            enableRealTime: options.enableRealTime !== false,
            enableAPI: options.enableAPI !== false,
            alertThresholds: {
                critical: 1,
                high: 5,
                medium: 10,
                low: 20
            },
            refreshInterval: options.refreshInterval || 5000,
            dataRetention: options.dataRetention || 30 * 24 * 60 * 60 * 1000, // 30 days
            ...options
        };

        this.logger = options.logger || this.createLogger();
        
        // Dashboard data
        this.dashboardData = {
            overview: {
                totalIncidents: 0,
                activeIncidents: 0,
                resolvedIncidents: 0,
                riskScore: 0,
                complianceScore: 0,
                lastUpdated: new Date().toISOString()
            },
            threats: {
                realTime: [],
                trends: [],
                topSources: [],
                categories: {}
            },
            incidents: new Map(),
            metrics: {
                responseTime: [],
                detectionAccuracy: 0,
                falsePositiveRate: 0,
                meanTimeToResolution: 0
            },
            compliance: {
                frameworks: ['SOC2', 'ISO27001', 'GDPR', 'PCI-DSS'],
                scores: {},
                violations: []
            },
            team: {
                members: [],
                workload: {},
                shifts: []
            }
        };

        // WebSocket connections
        this.wsServer = null;
        this.connectedClients = new Set();
        
        // Express app for API
        this.app = null;
        this.server = null;
        
        // Alert system
        this.alertQueue = [];
        this.alertHistory = new Map();
        
        // Security integrations
        this.integrations = new Map();
        
        this.initializeDashboard();
    }

    createLogger() {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ 
                    filename: 'logs/security-dashboard.log',
                    maxsize: 50 * 1024 * 1024,
                    maxFiles: 10
                }),
                new winston.transports.Console()
            ]
        });
    }

    async initializeDashboard() {
        try {
            // Initialize Express app
            if (this.options.enableAPI) {
                await this.initializeAPI();
            }

            // Initialize WebSocket server
            if (this.options.enableRealTime) {
                await this.initializeWebSocket();
            }

            // Start data collection
            this.startDataCollection();
            
            // Start alert processing
            this.startAlertProcessing();
            
            // Setup periodic tasks
            this.setupPeriodicTasks();

            this.logger.info('Security Monitoring Dashboard initialized', {
                port: this.options.port,
                realTime: this.options.enableRealTime,
                api: this.options.enableAPI
            });

        } catch (error) {
            this.logger.error('Failed to initialize Security Monitoring Dashboard', {
                error: error.message
            });
            throw error;
        }
    }

    async initializeAPI() {
        this.app = express();
        
        // Middleware
        this.app.use(cors({
            origin: process.env.DASHBOARD_ORIGIN || 'http://localhost:3000',
            credentials: true
        }));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.static('security/dashboard/public'));

        // Security middleware
        this.app.use(this.securityMiddleware());

        // API routes
        this.setupAPIRoutes();

        // Start server
        this.server = this.app.listen(this.options.port, () => {
            this.logger.info(`Security Dashboard API listening on port ${this.options.port}`);
        });
    }

    async initializeWebSocket() {
        this.wsServer = new WebSocket.Server({ 
            server: this.server,
            path: '/ws/security'
        });

        this.wsServer.on('connection', (ws, req) => {
            const clientId = crypto.randomUUID();
            ws.clientId = clientId;
            this.connectedClients.add(ws);

            this.logger.info('WebSocket client connected', { 
                clientId,
                ip: req.socket.remoteAddress
            });

            // Send initial dashboard data
            ws.send(JSON.stringify({
                type: 'initial_data',
                data: this.getDashboardSnapshot()
            }));

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    this.logger.warn('Invalid WebSocket message', { error: error.message });
                }
            });

            ws.on('close', () => {
                this.connectedClients.delete(ws);
                this.logger.info('WebSocket client disconnected', { clientId });
            });

            ws.on('error', (error) => {
                this.logger.error('WebSocket error', { clientId, error: error.message });
                this.connectedClients.delete(ws);
            });
        });
    }

    securityMiddleware() {
        return (req, res, next) => {
            // Add security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            
            // API key authentication (simplified)
            const apiKey = req.headers['x-api-key'];
            if (req.path.startsWith('/api/') && apiKey !== process.env.DASHBOARD_API_KEY) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            next();
        };
    }

    setupAPIRoutes() {
        // Dashboard overview
        this.app.get('/api/dashboard/overview', (req, res) => {
            res.json(this.dashboardData.overview);
        });

        // Real-time threats
        this.app.get('/api/threats/realtime', (req, res) => {
            res.json({
                threats: this.dashboardData.threats.realTime.slice(-100),
                timestamp: new Date().toISOString()
            });
        });

        // Incidents management
        this.app.get('/api/incidents', (req, res) => {
            const { status, severity, page = 1, limit = 20 } = req.query;
            const incidents = this.getFilteredIncidents(status, severity);
            const startIndex = (page - 1) * limit;
            const paginatedIncidents = incidents.slice(startIndex, startIndex + limit);
            
            res.json({
                incidents: paginatedIncidents,
                total: incidents.length,
                page: parseInt(page),
                totalPages: Math.ceil(incidents.length / limit)
            });
        });

        this.app.get('/api/incidents/:id', (req, res) => {
            const incident = this.dashboardData.incidents.get(req.params.id);
            if (!incident) {
                return res.status(404).json({ error: 'Incident not found' });
            }
            res.json(incident);
        });

        this.app.patch('/api/incidents/:id', (req, res) => {
            const incident = this.dashboardData.incidents.get(req.params.id);
            if (!incident) {
                return res.status(404).json({ error: 'Incident not found' });
            }
            
            this.updateIncident(req.params.id, req.body);
            res.json(incident);
        });

        // Security metrics
        this.app.get('/api/metrics', (req, res) => {
            const { timeRange = '24h' } = req.query;
            res.json(this.getSecurityMetrics(timeRange));
        });

        // Threat intelligence
        this.app.get('/api/threats/intelligence', (req, res) => {
            res.json({
                trends: this.dashboardData.threats.trends,
                topSources: this.dashboardData.threats.topSources,
                categories: this.dashboardData.threats.categories
            });
        });

        // Compliance dashboard
        this.app.get('/api/compliance', (req, res) => {
            res.json(this.dashboardData.compliance);
        });

        // Team management
        this.app.get('/api/team', (req, res) => {
            res.json(this.dashboardData.team);
        });

        // Alert management
        this.app.get('/api/alerts', (req, res) => {
            const { status = 'active' } = req.query;
            const alerts = this.getAlerts(status);
            res.json(alerts);
        });

        this.app.post('/api/alerts/:id/acknowledge', (req, res) => {
            const result = this.acknowledgeAlert(req.params.id, req.body.userId);
            res.json(result);
        });

        // Export reports
        this.app.get('/api/reports/security', async (req, res) => {
            const { format = 'json', timeRange = '7d' } = req.query;
            const report = await this.generateSecurityReport(timeRange);
            
            if (format === 'pdf') {
                // Would generate PDF report
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=security-report.pdf');
                // res.send(pdfBuffer);
            } else {
                res.json(report);
            }
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                connections: this.connectedClients.size,
                incidents: this.dashboardData.incidents.size
            });
        });
    }

    /**
     * Security event processing
     */
    async processSecurityEvent(event) {
        try {
            const processedEvent = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: event.type,
                severity: event.severity,
                source: event.source,
                sourceIP: event.sourceIP,
                description: event.description,
                rawData: event.rawData,
                processed: true
            };

            // Add to real-time threats
            this.dashboardData.threats.realTime.unshift(processedEvent);
            
            // Maintain real-time data size
            if (this.dashboardData.threats.realTime.length > 1000) {
                this.dashboardData.threats.realTime = this.dashboardData.threats.realTime.slice(0, 500);
            }

            // Update threat categories
            const category = event.category || 'unknown';
            this.dashboardData.threats.categories[category] = 
                (this.dashboardData.threats.categories[category] || 0) + 1;

            // Check if incident should be created
            if (this.shouldCreateIncident(processedEvent)) {
                await this.createIncident(processedEvent);
            }

            // Check alert thresholds
            await this.checkAlertThresholds(processedEvent);

            // Broadcast to connected clients
            this.broadcastToClients({
                type: 'security_event',
                event: processedEvent
            });

            this.logger.debug('Security event processed', {
                eventId: processedEvent.id,
                type: event.type,
                severity: event.severity
            });

        } catch (error) {
            this.logger.error('Failed to process security event', {
                error: error.message,
                event: event.type
            });
        }
    }

    shouldCreateIncident(event) {
        const severityThresholds = {
            'critical': true,
            'high': true,
            'medium': event.source === 'ids' || event.source === 'waf',
            'low': false
        };

        return severityThresholds[event.severity] || false;
    }

    async createIncident(event) {
        const incidentId = crypto.randomUUID();
        
        const incident = {
            id: incidentId,
            title: this.generateIncidentTitle(event),
            description: event.description,
            severity: event.severity,
            status: 'open',
            category: event.category || 'general',
            source: event.source,
            sourceIP: event.sourceIP,
            affectedSystems: [event.source],
            evidence: [event],
            timeline: [{
                timestamp: new Date().toISOString(),
                action: 'incident_created',
                user: 'system',
                details: 'Incident automatically created from security event'
            }],
            assignedTo: null,
            priority: this.calculateIncidentPriority(event),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: this.generateIncidentTags(event),
            metrics: {
                detectionTime: 0,
                responseTime: null,
                resolutionTime: null
            }
        };

        this.dashboardData.incidents.set(incidentId, incident);
        this.dashboardData.overview.totalIncidents++;
        this.dashboardData.overview.activeIncidents++;

        // Auto-assign if rules configured
        await this.autoAssignIncident(incident);

        // Create alert
        await this.createAlert({
            type: 'incident_created',
            severity: incident.severity,
            title: `New ${incident.severity} incident: ${incident.title}`,
            incident: incidentId,
            message: `Incident ${incidentId} has been created and requires attention`
        });

        // Broadcast to clients
        this.broadcastToClients({
            type: 'incident_created',
            incident
        });

        this.logger.info('Security incident created', {
            incidentId,
            severity: incident.severity,
            category: incident.category
        });

        return incidentId;
    }

    async updateIncident(incidentId, updates) {
        const incident = this.dashboardData.incidents.get(incidentId);
        if (!incident) {
            throw new Error('Incident not found');
        }

        const previousStatus = incident.status;
        
        // Apply updates
        Object.assign(incident, updates);
        incident.updatedAt = new Date().toISOString();

        // Add timeline entry
        incident.timeline.push({
            timestamp: new Date().toISOString(),
            action: 'incident_updated',
            user: updates.updatedBy || 'system',
            details: this.generateUpdateDetails(updates)
        });

        // Update overview counters
        if (previousStatus !== incident.status) {
            if (previousStatus === 'open' && incident.status === 'resolved') {
                this.dashboardData.overview.activeIncidents--;
                this.dashboardData.overview.resolvedIncidents++;
                
                // Calculate resolution time
                const createdTime = new Date(incident.createdAt).getTime();
                const resolvedTime = new Date().getTime();
                incident.metrics.resolutionTime = resolvedTime - createdTime;
            }
        }

        // Broadcast update
        this.broadcastToClients({
            type: 'incident_updated',
            incident
        });

        this.logger.info('Security incident updated', {
            incidentId,
            status: incident.status,
            updatedBy: updates.updatedBy
        });
    }

    /**
     * Alert management
     */
    async createAlert(alertData) {
        const alert = {
            id: crypto.randomUUID(),
            type: alertData.type,
            severity: alertData.severity,
            title: alertData.title,
            message: alertData.message,
            incident: alertData.incident,
            createdAt: new Date().toISOString(),
            status: 'active',
            acknowledgedBy: null,
            acknowledgedAt: null,
            escalated: false,
            escalatedAt: null
        };

        this.alertQueue.push(alert);
        this.alertHistory.set(alert.id, alert);

        // Broadcast alert
        this.broadcastToClients({
            type: 'alert_created',
            alert
        });

        this.logger.warn('Security alert created', {
            alertId: alert.id,
            severity: alert.severity,
            type: alert.type
        });

        return alert.id;
    }

    async checkAlertThresholds(event) {
        const recentEvents = this.dashboardData.threats.realTime.slice(0, 100);
        const eventCounts = {};

        // Count events by severity in the last hour
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const recentSevereEvents = recentEvents.filter(e => 
            new Date(e.timestamp).getTime() > oneHourAgo
        );

        for (const evt of recentSevereEvents) {
            eventCounts[evt.severity] = (eventCounts[evt.severity] || 0) + 1;
        }

        // Check thresholds
        for (const [severity, count] of Object.entries(eventCounts)) {
            const threshold = this.options.alertThresholds[severity];
            if (threshold && count >= threshold) {
                await this.createAlert({
                    type: 'threshold_exceeded',
                    severity: 'high',
                    title: `${severity.toUpperCase()} event threshold exceeded`,
                    message: `${count} ${severity} events detected in the last hour (threshold: ${threshold})`
                });
            }
        }
    }

    acknowledgeAlert(alertId, userId) {
        const alert = this.alertHistory.get(alertId);
        if (!alert) {
            throw new Error('Alert not found');
        }

        if (alert.status === 'acknowledged') {
            throw new Error('Alert already acknowledged');
        }

        alert.status = 'acknowledged';
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date().toISOString();

        // Remove from active queue
        const queueIndex = this.alertQueue.findIndex(a => a.id === alertId);
        if (queueIndex !== -1) {
            this.alertQueue.splice(queueIndex, 1);
        }

        this.broadcastToClients({
            type: 'alert_acknowledged',
            alert
        });

        this.logger.info('Alert acknowledged', {
            alertId,
            acknowledgedBy: userId
        });

        return { success: true, alert };
    }

    /**
     * Real-time data management
     */
    startDataCollection() {
        // Collect data every refresh interval
        setInterval(() => {
            this.updateDashboardMetrics();
            this.updateThreatTrends();
            this.updateComplianceScores();
            
            // Broadcast updates to clients
            this.broadcastToClients({
                type: 'dashboard_update',
                data: this.getDashboardSnapshot()
            });
            
        }, this.options.refreshInterval);
    }

    updateDashboardMetrics() {
        // Update overview metrics
        this.dashboardData.overview.lastUpdated = new Date().toISOString();
        this.dashboardData.overview.riskScore = this.calculateRiskScore();
        
        // Update response time metrics
        const responseTime = this.calculateAverageResponseTime();
        this.dashboardData.metrics.responseTime.push({
            timestamp: new Date().toISOString(),
            value: responseTime
        });

        // Keep only last 100 response time measurements
        if (this.dashboardData.metrics.responseTime.length > 100) {
            this.dashboardData.metrics.responseTime = 
                this.dashboardData.metrics.responseTime.slice(-50);
        }
    }

    updateThreatTrends() {
        const now = Date.now();
        const hourly = new Map();
        
        // Group threats by hour
        for (const threat of this.dashboardData.threats.realTime) {
            const threatTime = new Date(threat.timestamp).getTime();
            if (now - threatTime < 24 * 60 * 60 * 1000) { // Last 24 hours
                const hour = Math.floor(threatTime / (60 * 60 * 1000));
                hourly.set(hour, (hourly.get(hour) || 0) + 1);
            }
        }

        // Convert to trend data
        this.dashboardData.threats.trends = Array.from(hourly.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([hour, count]) => ({
                timestamp: new Date(hour * 60 * 60 * 1000).toISOString(),
                count
            }));

        // Update top sources
        const sourceCounts = new Map();
        for (const threat of this.dashboardData.threats.realTime.slice(0, 200)) {
            const source = threat.sourceIP || threat.source || 'unknown';
            sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
        }

        this.dashboardData.threats.topSources = Array.from(sourceCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([source, count]) => ({ source, count }));
    }

    updateComplianceScores() {
        // Mock compliance score calculation
        // In real implementation, this would integrate with compliance systems
        const frameworks = this.dashboardData.compliance.frameworks;
        
        for (const framework of frameworks) {
            const baseScore = 85;
            const violations = this.dashboardData.compliance.violations.filter(
                v => v.framework === framework
            ).length;
            
            this.dashboardData.compliance.scores[framework] = 
                Math.max(0, baseScore - violations * 5);
        }

        this.dashboardData.overview.complianceScore = 
            Object.values(this.dashboardData.compliance.scores)
                .reduce((sum, score) => sum + score, 0) / frameworks.length;
    }

    calculateRiskScore() {
        const incidents = Array.from(this.dashboardData.incidents.values());
        const activeIncidents = incidents.filter(i => i.status === 'open');
        
        let riskScore = 0;
        const weights = { critical: 40, high: 20, medium: 10, low: 5 };
        
        for (const incident of activeIncidents) {
            riskScore += weights[incident.severity] || 1;
        }

        return Math.min(riskScore, 100);
    }

    calculateAverageResponseTime() {
        const incidents = Array.from(this.dashboardData.incidents.values());
        const resolvedIncidents = incidents.filter(i => 
            i.status === 'resolved' && i.metrics.responseTime
        );

        if (resolvedIncidents.length === 0) return 0;

        const totalResponseTime = resolvedIncidents.reduce(
            (sum, incident) => sum + incident.metrics.responseTime, 0
        );

        return totalResponseTime / resolvedIncidents.length;
    }

    /**
     * WebSocket message handling
     */
    handleWebSocketMessage(ws, message) {
        switch (message.type) {
            case 'subscribe':
                ws.subscriptions = message.channels || [];
                this.logger.debug('Client subscribed to channels', {
                    clientId: ws.clientId,
                    channels: ws.subscriptions
                });
                break;
                
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                break;
                
            case 'get_incident':
                const incident = this.dashboardData.incidents.get(message.incidentId);
                ws.send(JSON.stringify({
                    type: 'incident_data',
                    incident
                }));
                break;
                
            default:
                this.logger.warn('Unknown WebSocket message type', {
                    type: message.type,
                    clientId: ws.clientId
                });
        }
    }

    broadcastToClients(message) {
        const messageStr = JSON.stringify(message);
        
        for (const client of this.connectedClients) {
            if (client.readyState === WebSocket.OPEN) {
                // Check subscriptions if available
                if (!client.subscriptions || 
                    client.subscriptions.includes(message.type) ||
                    client.subscriptions.includes('all')) {
                    client.send(messageStr);
                }
            }
        }
    }

    /**
     * Utility methods
     */
    getDashboardSnapshot() {
        return {
            overview: this.dashboardData.overview,
            threats: {
                realTime: this.dashboardData.threats.realTime.slice(0, 50),
                trends: this.dashboardData.threats.trends,
                topSources: this.dashboardData.threats.topSources.slice(0, 5),
                categories: this.dashboardData.threats.categories
            },
            incidents: Array.from(this.dashboardData.incidents.values())
                .filter(i => i.status === 'open')
                .slice(0, 20),
            metrics: this.dashboardData.metrics,
            alerts: this.alertQueue.slice(0, 10)
        };
    }

    getFilteredIncidents(status, severity) {
        let incidents = Array.from(this.dashboardData.incidents.values());
        
        if (status) {
            incidents = incidents.filter(i => i.status === status);
        }
        
        if (severity) {
            incidents = incidents.filter(i => i.severity === severity);
        }
        
        return incidents.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    getAlerts(status = 'active') {
        if (status === 'active') {
            return this.alertQueue;
        } else {
            return Array.from(this.alertHistory.values())
                .filter(a => a.status === status);
        }
    }

    getSecurityMetrics(timeRange) {
        const metrics = {
            responseTime: this.dashboardData.metrics.responseTime,
            detectionAccuracy: this.dashboardData.metrics.detectionAccuracy,
            falsePositiveRate: this.dashboardData.metrics.falsePositiveRate,
            meanTimeToResolution: this.dashboardData.metrics.meanTimeToResolution,
            incidentTrends: this.calculateIncidentTrends(timeRange),
            threatVolume: this.calculateThreatVolume(timeRange)
        };

        return metrics;
    }

    calculateIncidentTrends(timeRange) {
        // Implementation would depend on timeRange
        return [];
    }

    calculateThreatVolume(timeRange) {
        // Implementation would depend on timeRange
        return [];
    }

    generateIncidentTitle(event) {
        const titles = {
            'sql_injection': 'SQL Injection Attempt Detected',
            'xss': 'Cross-Site Scripting Attempt',
            'brute_force': 'Brute Force Attack Detected',
            'malware': 'Malware Activity Detected',
            'data_breach': 'Potential Data Breach',
            'unauthorized_access': 'Unauthorized Access Attempt'
        };

        return titles[event.type] || `Security Event: ${event.type}`;
    }

    calculateIncidentPriority(event) {
        const severityPriority = {
            'critical': 'P1',
            'high': 'P2',
            'medium': 'P3',
            'low': 'P4'
        };

        return severityPriority[event.severity] || 'P4';
    }

    generateIncidentTags(event) {
        const tags = [event.severity, event.source];
        
        if (event.sourceIP) {
            tags.push(`ip:${event.sourceIP}`);
        }
        
        if (event.category) {
            tags.push(`category:${event.category}`);
        }

        return tags;
    }

    generateUpdateDetails(updates) {
        const details = [];
        
        if (updates.status) details.push(`Status changed to ${updates.status}`);
        if (updates.assignedTo) details.push(`Assigned to ${updates.assignedTo}`);
        if (updates.severity) details.push(`Severity changed to ${updates.severity}`);
        if (updates.notes) details.push('Notes added');

        return details.join(', ') || 'Incident updated';
    }

    async autoAssignIncident(incident) {
        // Auto-assignment logic based on severity, category, etc.
        // This would integrate with team management systems
        
        if (incident.severity === 'critical') {
            // Assign to on-call engineer
            incident.assignedTo = 'on-call-engineer';
        }
    }

    async generateSecurityReport(timeRange) {
        // Generate comprehensive security report
        return {
            timeRange,
            generatedAt: new Date().toISOString(),
            summary: this.dashboardData.overview,
            incidents: Array.from(this.dashboardData.incidents.values()),
            threats: this.dashboardData.threats,
            compliance: this.dashboardData.compliance,
            recommendations: this.generateSecurityRecommendations()
        };
    }

    generateSecurityRecommendations() {
        const recommendations = [];
        
        // Analyze patterns and generate recommendations
        const activeIncidents = Array.from(this.dashboardData.incidents.values())
            .filter(i => i.status === 'open');
        
        if (activeIncidents.length > 10) {
            recommendations.push({
                priority: 'high',
                category: 'incident_management',
                title: 'High volume of open incidents',
                description: 'Consider increasing security team capacity or implementing automated response'
            });
        }

        return recommendations;
    }

    startAlertProcessing() {
        // Process alert queue every 30 seconds
        setInterval(() => {
            this.processAlertQueue();
        }, 30000);
    }

    processAlertQueue() {
        // Check for alert escalation
        const now = Date.now();
        const escalationThreshold = 30 * 60 * 1000; // 30 minutes

        for (const alert of this.alertQueue) {
            const alertAge = now - new Date(alert.createdAt).getTime();
            
            if (!alert.escalated && alertAge > escalationThreshold) {
                this.escalateAlert(alert);
            }
        }
    }

    async escalateAlert(alert) {
        alert.escalated = true;
        alert.escalatedAt = new Date().toISOString();

        // Create escalation notification
        await this.createAlert({
            type: 'alert_escalation',
            severity: 'high',
            title: 'Alert Escalation Required',
            message: `Alert ${alert.id} has not been acknowledged and requires escalation`
        });

        this.logger.warn('Alert escalated', { alertId: alert.id });
    }

    setupPeriodicTasks() {
        // Cleanup old data every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 60 * 60 * 1000);

        // Generate hourly metrics
        setInterval(() => {
            this.generateHourlyMetrics();
        }, 60 * 60 * 1000);
    }

    cleanupOldData() {
        const cutoffTime = Date.now() - this.options.dataRetention;
        
        // Clean old threats
        this.dashboardData.threats.realTime = this.dashboardData.threats.realTime
            .filter(threat => new Date(threat.timestamp).getTime() > cutoffTime);

        // Clean old alerts
        for (const [alertId, alert] of this.alertHistory.entries()) {
            if (new Date(alert.createdAt).getTime() < cutoffTime) {
                this.alertHistory.delete(alertId);
            }
        }

        this.logger.debug('Old data cleaned up');
    }

    generateHourlyMetrics() {
        // Generate and store hourly security metrics
        const hourlyMetrics = {
            timestamp: new Date().toISOString(),
            incidents: this.dashboardData.incidents.size,
            threats: this.dashboardData.threats.realTime.length,
            alerts: this.alertQueue.length,
            riskScore: this.dashboardData.overview.riskScore
        };

        // Store metrics (would typically go to time-series database)
        this.logger.info('Hourly metrics generated', hourlyMetrics);
    }

    /**
     * Public API methods
     */
    async shutdown() {
        if (this.wsServer) {
            this.wsServer.close();
        }
        
        if (this.server) {
            this.server.close();
        }

        this.logger.info('Security Monitoring Dashboard shut down');
    }

    async healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            clients: this.connectedClients.size,
            incidents: this.dashboardData.incidents.size,
            alerts: this.alertQueue.length,
            uptime: process.uptime()
        };
    }

    // Integration methods for external systems
    registerIntegration(name, integration) {
        this.integrations.set(name, integration);
        this.logger.info('Security integration registered', { name });
    }

    async forwardEvent(integrationName, event) {
        const integration = this.integrations.get(integrationName);
        if (integration && integration.forwardEvent) {
            await integration.forwardEvent(event);
        }
    }
}

module.exports = SecurityMonitoringDashboard;