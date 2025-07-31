/**
 * GDPR Compliance Manager
 * Comprehensive data protection and privacy compliance system
 * 
 * Features:
 * - Data subject rights management (access, rectification, erasure, portability)
 * - Consent management and tracking
 * - Data processing activity records
 * - Breach notification system
 * - Privacy impact assessments
 * - Data retention policies
 * - Automated compliance reporting
 * - Cross-border data transfer controls
 */

const crypto = require('crypto');
const winston = require('winston');
const EventEmitter = require('events');

class GDPRComplianceManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            dataRetentionPeriod: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
            consentValidityPeriod: 365 * 24 * 60 * 60 * 1000,   // 1 year
            breachNotificationDeadline: 72 * 60 * 60 * 1000,    // 72 hours
            dataTransferCountries: ['US', 'CA', 'UK'],          // Allowed countries
            automaticDeletion: true,
            auditLogging: true,
            ...options
        };

        this.logger = options.logger || this.createLogger();
        this.encryptionService = options.encryptionService;
        this.database = options.database;
        
        // Data processing activities registry
        this.processingActivities = new Map();
        
        // Consent records
        this.consentRecords = new Map();
        
        // Data subject requests tracking
        this.dataSubjectRequests = new Map();
        
        // Breach incidents
        this.breachIncidents = new Map();
        
        // Legal bases for processing
        this.legalBases = {
            CONSENT: 'consent',
            CONTRACT: 'contract',
            LEGAL_OBLIGATION: 'legal_obligation',
            VITAL_INTERESTS: 'vital_interests',
            PUBLIC_TASK: 'public_task',
            LEGITIMATE_INTERESTS: 'legitimate_interests'
        };

        // Data categories
        this.dataCategories = {
            PERSONAL_DATA: 'personal_data',
            SENSITIVE_DATA: 'sensitive_data',
            BIOMETRIC_DATA: 'biometric_data',
            HEALTH_DATA: 'health_data',
            FINANCIAL_DATA: 'financial_data',
            LOCATION_DATA: 'location_data'
        };

        this.initializeCompliance();
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
                    filename: 'logs/gdpr-compliance.log',
                    maxsize: 50 * 1024 * 1024,
                    maxFiles: 10
                }),
                new winston.transports.Console()
            ]
        });
    }

    async initializeCompliance() {
        try {
            // Load existing compliance data
            await this.loadComplianceData();
            
            // Schedule periodic compliance checks
            this.scheduleComplianceChecks();
            
            // Register default processing activities
            await this.registerDefaultProcessingActivities();
            
            this.logger.info('GDPR Compliance Manager initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize GDPR Compliance Manager', { 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Register data processing activity
     */
    async registerProcessingActivity(activity) {
        try {
            const activityId = crypto.randomUUID();
            
            const processingActivity = {
                id: activityId,
                name: activity.name,
                description: activity.description,
                controller: activity.controller,
                processor: activity.processor,
                dataCategories: activity.dataCategories || [],
                dataSubjects: activity.dataSubjects || [],
                purposes: activity.purposes || [],
                legalBasis: activity.legalBasis || this.legalBases.CONSENT,
                retentionPeriod: activity.retentionPeriod || this.options.dataRetentionPeriod,
                recipients: activity.recipients || [],
                crossBorderTransfers: activity.crossBorderTransfers || [],
                securityMeasures: activity.securityMeasures || [],
                registeredAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                status: 'active'
            };

            // Validate processing activity
            this.validateProcessingActivity(processingActivity);
            
            this.processingActivities.set(activityId, processingActivity);
            
            this.logger.info('Processing activity registered', { 
                activityId, 
                name: activity.name,
                legalBasis: processingActivity.legalBasis
            });
            
            this.emit('processingActivityRegistered', processingActivity);
            
            return activityId;
            
        } catch (error) {
            this.logger.error('Failed to register processing activity', { 
                error: error.message,
                activity: activity.name
            });
            throw error;
        }
    }

    validateProcessingActivity(activity) {
        const required = ['name', 'controller', 'purposes', 'legalBasis'];
        
        for (const field of required) {
            if (!activity[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!Object.values(this.legalBases).includes(activity.legalBasis)) {
            throw new Error(`Invalid legal basis: ${activity.legalBasis}`);
        }

        // Validate cross-border transfers
        if (activity.crossBorderTransfers.length > 0) {
            const invalidCountries = activity.crossBorderTransfers.filter(
                country => !this.options.dataTransferCountries.includes(country)
            );
            
            if (invalidCountries.length > 0) {
                this.logger.warn('Cross-border transfers to restricted countries', {
                    activity: activity.name,
                    countries: invalidCountries
                });
            }
        }
    }

    /**
     * Manage consent
     */
    async recordConsent(dataSubjectId, consentData) {
        try {
            const consentId = crypto.randomUUID();
            
            const consent = {
                id: consentId,
                dataSubjectId,
                purposes: consentData.purposes || [],
                dataCategories: consentData.dataCategories || [],
                processingActivities: consentData.processingActivities || [],
                consentMethod: consentData.method || 'explicit',
                consentDate: new Date().toISOString(),
                expirationDate: new Date(Date.now() + this.options.consentValidityPeriod).toISOString(),
                ipAddress: consentData.ipAddress,
                userAgent: consentData.userAgent,
                consentString: consentData.consentString,
                granular: consentData.granular || false,
                isValid: true,
                withdrawnAt: null,
                lastUpdated: new Date().toISOString()
            };

            // Store consent record
            this.consentRecords.set(consentId, consent);
            
            // Create consent proof
            const consentProof = await this.createConsentProof(consent);
            consent.proof = consentProof;
            
            this.logger.info('Consent recorded', { 
                consentId, 
                dataSubjectId,
                purposes: consent.purposes,
                method: consent.consentMethod
            });
            
            this.emit('consentRecorded', consent);
            
            return consentId;
            
        } catch (error) {
            this.logger.error('Failed to record consent', { 
                error: error.message,
                dataSubjectId
            });
            throw error;
        }
    }

    async createConsentProof(consent) {
        const proofData = {
            dataSubjectId: consent.dataSubjectId,
            purposes: consent.purposes,
            consentDate: consent.consentDate,
            ipAddress: consent.ipAddress,
            userAgent: consent.userAgent
        };

        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(proofData));
        
        return {
            hash: hash.digest('hex'),
            algorithm: 'sha256',
            timestamp: consent.consentDate
        };
    }

    async withdrawConsent(dataSubjectId, consentId, reason = null) {
        try {
            const consent = this.consentRecords.get(consentId);
            
            if (!consent || consent.dataSubjectId !== dataSubjectId) {
                throw new Error('Consent record not found or unauthorized');
            }

            if (!consent.isValid) {
                throw new Error('Consent already withdrawn');
            }

            consent.isValid = false;
            consent.withdrawnAt = new Date().toISOString();
            consent.withdrawalReason = reason;
            consent.lastUpdated = new Date().toISOString();
            
            this.logger.info('Consent withdrawn', { 
                consentId, 
                dataSubjectId,
                reason
            });
            
            this.emit('consentWithdrawn', consent);
            
            return true;
            
        } catch (error) {
            this.logger.error('Failed to withdraw consent', { 
                error: error.message,
                consentId,
                dataSubjectId
            });
            throw error;
        }
    }

    /**
     * Data Subject Rights Management
     */
    async handleDataSubjectRequest(request) {
        try {
            const requestId = crypto.randomUUID();
            
            const dsrRequest = {
                id: requestId,
                type: request.type, // access, rectification, erasure, portability, restrict
                dataSubjectId: request.dataSubjectId,
                dataSubjectEmail: request.email,
                description: request.description,
                requestDate: new Date().toISOString(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                status: 'pending',
                assignedTo: null,
                processingNotes: [],
                completedAt: null,
                verificationStatus: 'pending',
                identityProof: request.identityProof
            };

            // Validate request
            this.validateDataSubjectRequest(dsrRequest);
            
            this.dataSubjectRequests.set(requestId, dsrRequest);
            
            this.logger.info('Data subject request received', { 
                requestId, 
                type: request.type,
                dataSubjectId: request.dataSubjectId
            });
            
            this.emit('dataSubjectRequestReceived', dsrRequest);
            
            // Auto-process if possible
            await this.processDataSubjectRequest(requestId);
            
            return requestId;
            
        } catch (error) {
            this.logger.error('Failed to handle data subject request', { 
                error: error.message,
                type: request.type,
                dataSubjectId: request.dataSubjectId
            });
            throw error;
        }
    }

    validateDataSubjectRequest(request) {
        const validTypes = ['access', 'rectification', 'erasure', 'portability', 'restrict'];
        
        if (!validTypes.includes(request.type)) {
            throw new Error(`Invalid request type: ${request.type}`);
        }

        if (!request.dataSubjectId && !request.dataSubjectEmail) {
            throw new Error('Data subject identification required');
        }
    }

    async processDataSubjectRequest(requestId) {
        try {
            const request = this.dataSubjectRequests.get(requestId);
            
            if (!request) {
                throw new Error('Request not found');
            }

            request.status = 'processing';
            request.processingStarted = new Date().toISOString();
            
            let result;
            
            switch (request.type) {
                case 'access':
                    result = await this.processDataAccessRequest(request);
                    break;
                case 'rectification':
                    result = await this.processDataRectificationRequest(request);
                    break;
                case 'erasure':
                    result = await this.processDataErasureRequest(request);
                    break;
                case 'portability':
                    result = await this.processDataPortabilityRequest(request);
                    break;
                case 'restrict':
                    result = await this.processDataRestrictionRequest(request);
                    break;
                default:
                    throw new Error(`Unsupported request type: ${request.type}`);
            }

            request.status = 'completed';
            request.completedAt = new Date().toISOString();
            request.result = result;
            
            this.logger.info('Data subject request processed', { 
                requestId, 
                type: request.type,
                status: request.status
            });
            
            this.emit('dataSubjectRequestCompleted', request);
            
            return result;
            
        } catch (error) {
            const request = this.dataSubjectRequests.get(requestId);
            if (request) {
                request.status = 'failed';
                request.error = error.message;
            }
            
            this.logger.error('Failed to process data subject request', { 
                error: error.message,
                requestId
            });
            throw error;
        }
    }

    async processDataAccessRequest(request) {
        // Collect all personal data for the data subject
        const personalData = {
            dataSubjectId: request.dataSubjectId,
            collectedAt: new Date().toISOString(),
            data: {}
        };

        // This would integrate with your actual data storage
        // For now, we'll return a mock structure
        personalData.data = {
            profile: await this.getPersonalDataFromDatabase('profiles', request.dataSubjectId),
            activities: await this.getPersonalDataFromDatabase('activities', request.dataSubjectId),
            consents: this.getConsentData(request.dataSubjectId),
            processingActivities: this.getProcessingActivitiesForSubject(request.dataSubjectId)
        };

        return personalData;
    }

    async processDataErasureRequest(request) {
        try {
            // Check if erasure is legally possible
            const canErase = await this.canEraseData(request.dataSubjectId);
            
            if (!canErase.allowed) {
                throw new Error(`Erasure not permitted: ${canErase.reason}`);
            }

            // Perform erasure across all systems
            const erasureResults = {
                dataSubjectId: request.dataSubjectId,
                erasedAt: new Date().toISOString(),
                erasureMethod: 'secure_deletion',
                dataCategories: [],
                verificationHash: null
            };

            // This would integrate with your actual data storage
            // For now, we'll simulate the erasure process
            erasureResults.dataCategories = await this.performDataErasure(request.dataSubjectId);
            
            // Create verification hash
            erasureResults.verificationHash = this.createErasureProof(erasureResults);
            
            this.logger.info('Data erasure completed', {
                dataSubjectId: request.dataSubjectId,
                categories: erasureResults.dataCategories
            });
            
            return erasureResults;
            
        } catch (error) {
            this.logger.error('Data erasure failed', {
                error: error.message,
                dataSubjectId: request.dataSubjectId
            });
            throw error;
        }
    }

    async canEraseData(dataSubjectId) {
        // Check for legal obligations that prevent erasure
        const obligations = await this.checkLegalObligations(dataSubjectId);
        
        if (obligations.hasFinancialRecords) {
            return {
                allowed: false,
                reason: 'Financial records must be retained for tax purposes'
            };
        }

        if (obligations.hasLegalProceedings) {
            return {
                allowed: false,
                reason: 'Data required for ongoing legal proceedings'
            };
        }

        return { allowed: true };
    }

    async performDataErasure(dataSubjectId) {
        const erasedCategories = [];
        
        // This would integrate with your actual data storage systems
        const dataSources = ['profiles', 'activities', 'consents', 'analytics'];
        
        for (const source of dataSources) {
            try {
                await this.eraseDataFromSource(source, dataSubjectId);
                erasedCategories.push(source);
            } catch (error) {
                this.logger.error(`Failed to erase data from ${source}`, {
                    error: error.message,
                    dataSubjectId
                });
            }
        }
        
        return erasedCategories;
    }

    createErasureProof(erasureResult) {
        const proofData = {
            dataSubjectId: erasureResult.dataSubjectId,
            erasedAt: erasureResult.erasedAt,
            categories: erasureResult.dataCategories
        };

        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(proofData));
        
        return hash.digest('hex');
    }

    /**
     * Breach Management
     */
    async reportDataBreach(breachData) {
        try {
            const breachId = crypto.randomUUID();
            
            const breach = {
                id: breachId,
                type: breachData.type, // confidentiality, integrity, availability
                severity: breachData.severity, // low, medium, high, critical
                affectedDataSubjects: breachData.affectedDataSubjects || 0,
                dataCategories: breachData.dataCategories || [],
                description: breachData.description,
                detectedAt: new Date().toISOString(),
                reportedAt: new Date().toISOString(),
                reportedBy: breachData.reportedBy,
                containmentActions: [],
                notificationDeadline: new Date(Date.now() + this.options.breachNotificationDeadline).toISOString(),
                regulatoryNotified: false,
                dataSubjectsNotified: false,
                status: 'open',
                riskAssessment: null
            };

            // Perform risk assessment
            breach.riskAssessment = this.assessBreachRisk(breach);
            
            this.breachIncidents.set(breachId, breach);
            
            this.logger.error('Data breach reported', { 
                breachId, 
                type: breach.type,
                severity: breach.severity,
                affectedDataSubjects: breach.affectedDataSubjects
            });
            
            this.emit('dataBreachReported', breach);
            
            // Auto-trigger notifications if high risk
            if (breach.riskAssessment.riskLevel === 'high' || breach.riskAssessment.riskLevel === 'critical') {
                await this.triggerBreachNotifications(breachId);
            }
            
            return breachId;
            
        } catch (error) {
            this.logger.error('Failed to report data breach', { 
                error: error.message,
                breach: breachData
            });
            throw error;
        }
    }

    assessBreachRisk(breach) {
        let riskScore = 0;
        
        // Factor in data categories
        const sensitiveCategories = [
            this.dataCategories.SENSITIVE_DATA,
            this.dataCategories.HEALTH_DATA,
            this.dataCategories.FINANCIAL_DATA,
            this.dataCategories.BIOMETRIC_DATA
        ];
        
        const hasSensitiveData = breach.dataCategories.some(cat => 
            sensitiveCategories.includes(cat)
        );
        
        if (hasSensitiveData) riskScore += 30;
        
        // Factor in number of affected data subjects
        if (breach.affectedDataSubjects > 1000) riskScore += 40;
        else if (breach.affectedDataSubjects > 100) riskScore += 20;
        else if (breach.affectedDataSubjects > 10) riskScore += 10;
        
        // Factor in breach type
        switch (breach.type) {
            case 'confidentiality':
                riskScore += 30;
                break;
            case 'integrity':
                riskScore += 20;
                break;
            case 'availability':
                riskScore += 10;
                break;
        }

        let riskLevel;
        if (riskScore >= 80) riskLevel = 'critical';
        else if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';
        else riskLevel = 'low';
        
        return {
            riskScore,
            riskLevel,
            requiresRegulatoryNotification: riskLevel === 'high' || riskLevel === 'critical',
            requiresDataSubjectNotification: riskLevel === 'high' || riskLevel === 'critical'
        };
    }

    async triggerBreachNotifications(breachId) {
        const breach = this.breachIncidents.get(breachId);
        
        if (!breach) {
            throw new Error('Breach not found');
        }

        // Notify regulatory authority within 72 hours
        if (breach.riskAssessment.requiresRegulatoryNotification) {
            await this.notifyRegulatoryAuthority(breach);
            breach.regulatoryNotified = true;
        }

        // Notify affected data subjects without undue delay
        if (breach.riskAssessment.requiresDataSubjectNotification) {
            await this.notifyDataSubjects(breach);
            breach.dataSubjectsNotified = true;
        }

        this.logger.info('Breach notifications triggered', {
            breachId,
            regulatoryNotified: breach.regulatoryNotified,
            dataSubjectsNotified: breach.dataSubjectsNotified
        });
    }

    /**
     * Compliance Monitoring and Reporting
     */
    async generateComplianceReport(reportType = 'monthly') {
        try {
            const report = {
                reportType,
                generatedAt: new Date().toISOString(),
                period: this.getReportPeriod(reportType),
                summary: {},
                details: {}
            };

            // Processing activities summary
            report.summary.processingActivities = {
                total: this.processingActivities.size,
                active: Array.from(this.processingActivities.values()).filter(
                    activity => activity.status === 'active'
                ).length
            };

            // Consent management summary
            const activeConsents = Array.from(this.consentRecords.values()).filter(
                consent => consent.isValid
            );
            
            report.summary.consents = {
                total: this.consentRecords.size,
                active: activeConsents.length,
                withdrawn: this.consentRecords.size - activeConsents.length
            };

            // Data subject requests summary
            const requests = Array.from(this.dataSubjectRequests.values());
            report.summary.dataSubjectRequests = {
                total: requests.length,
                completed: requests.filter(req => req.status === 'completed').length,
                pending: requests.filter(req => req.status === 'pending').length
            };

            // Breach incidents summary
            const breaches = Array.from(this.breachIncidents.values());
            report.summary.breaches = {
                total: breaches.length,
                open: breaches.filter(breach => breach.status === 'open').length,
                resolved: breaches.filter(breach => breach.status === 'resolved').length
            };

            // Detailed compliance metrics
            report.details = {
                processingActivitiesByLegalBasis: this.getProcessingActivitiesByLegalBasis(),
                consentExpirationSchedule: this.getConsentExpirationSchedule(),
                dataSubjectRequestTrends: this.getDataSubjectRequestTrends(),
                breachRiskAssessment: this.getBreachRiskAssessment()
            };

            this.logger.info('Compliance report generated', {
                reportType,
                processingActivities: report.summary.processingActivities.total,
                consents: report.summary.consents.total,
                requests: report.summary.dataSubjectRequests.total
            });

            return report;
            
        } catch (error) {
            this.logger.error('Failed to generate compliance report', {
                error: error.message,
                reportType
            });
            throw error;
        }
    }

    scheduleComplianceChecks() {
        // Daily compliance checks
        setInterval(async () => {
            try {
                await this.performDailyComplianceChecks();
            } catch (error) {
                this.logger.error('Daily compliance check failed', {
                    error: error.message
                });
            }
        }, 24 * 60 * 60 * 1000);

        // Weekly compliance reports
        setInterval(async () => {
            try {
                const report = await this.generateComplianceReport('weekly');
                this.emit('complianceReport', report);
            } catch (error) {
                this.logger.error('Weekly compliance report failed', {
                    error: error.message
                });
            }
        }, 7 * 24 * 60 * 60 * 1000);
    }

    async performDailyComplianceChecks() {
        // Check for expired consents
        const expiredConsents = this.checkExpiredConsents();
        if (expiredConsents.length > 0) {
            this.emit('expiredConsents', expiredConsents);
        }

        // Check data retention policies
        const dataForDeletion = await this.checkDataRetentionPolicies();
        if (dataForDeletion.length > 0) {
            this.emit('dataRetentionRequired', dataForDeletion);
        }

        // Check breach notification deadlines
        const overdueBreaches = this.checkBreachNotificationDeadlines();
        if (overdueBreaches.length > 0) {
            this.emit('breachDeadlinesOverdue', overdueBreaches);
        }
    }

    // Helper methods (mock implementations)
    async loadComplianceData() {
        // Load from database or storage
        this.logger.debug('Loading compliance data from storage');
    }

    async registerDefaultProcessingActivities() {
        // Register common processing activities
        await this.registerProcessingActivity({
            name: 'User Account Management',
            description: 'Managing user accounts and authentication',
            controller: 'Marketing Automation Hub',
            purposes: ['account_management', 'authentication'],
            legalBasis: this.legalBases.CONTRACT,
            dataCategories: [this.dataCategories.PERSONAL_DATA],
            dataSubjects: ['customers', 'users']
        });
    }

    getReportPeriod(reportType) {
        const now = new Date();
        switch (reportType) {
            case 'daily':
                return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now };
            case 'weekly':
                return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
            case 'monthly':
                return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
            default:
                return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
        }
    }

    checkExpiredConsents() {
        const now = Date.now();
        return Array.from(this.consentRecords.values()).filter(consent => 
            consent.isValid && new Date(consent.expirationDate).getTime() < now
        );
    }

    async checkDataRetentionPolicies() {
        // Mock implementation
        return [];
    }

    checkBreachNotificationDeadlines() {
        const now = Date.now();
        return Array.from(this.breachIncidents.values()).filter(breach => 
            breach.status === 'open' && 
            new Date(breach.notificationDeadline).getTime() < now &&
            !breach.regulatoryNotified
        );
    }

    // Additional helper methods would be implemented based on actual data storage
    async getPersonalDataFromDatabase(table, dataSubjectId) {
        // Mock implementation
        return {};
    }

    getConsentData(dataSubjectId) {
        return Array.from(this.consentRecords.values()).filter(
            consent => consent.dataSubjectId === dataSubjectId
        );
    }

    getProcessingActivitiesForSubject(dataSubjectId) {
        // Return processing activities that apply to this data subject
        return Array.from(this.processingActivities.values());
    }

    async checkLegalObligations(dataSubjectId) {
        // Mock implementation
        return {
            hasFinancialRecords: false,
            hasLegalProceedings: false
        };
    }

    async eraseDataFromSource(source, dataSubjectId) {
        // Mock implementation
        this.logger.debug(`Erasing data from ${source} for subject ${dataSubjectId}`);
    }

    async notifyRegulatoryAuthority(breach) {
        // Mock implementation
        this.logger.info('Notifying regulatory authority of data breach', {
            breachId: breach.id
        });
    }

    async notifyDataSubjects(breach) {
        // Mock implementation
        this.logger.info('Notifying affected data subjects of breach', {
            breachId: breach.id,
            affected: breach.affectedDataSubjects
        });
    }

    getProcessingActivitiesByLegalBasis() {
        const byBasis = {};
        for (const activity of this.processingActivities.values()) {
            byBasis[activity.legalBasis] = (byBasis[activity.legalBasis] || 0) + 1;
        }
        return byBasis;
    }

    getConsentExpirationSchedule() {
        // Return consents expiring in the next 30 days
        const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
        return Array.from(this.consentRecords.values()).filter(consent => 
            consent.isValid && 
            new Date(consent.expirationDate).getTime() < thirtyDaysFromNow
        ).length;
    }

    getDataSubjectRequestTrends() {
        const requests = Array.from(this.dataSubjectRequests.values());
        const byType = {};
        for (const request of requests) {
            byType[request.type] = (byType[request.type] || 0) + 1;
        }
        return byType;
    }

    getBreachRiskAssessment() {
        const breaches = Array.from(this.breachIncidents.values());
        const byRisk = {};
        for (const breach of breaches) {
            const risk = breach.riskAssessment?.riskLevel || 'unknown';
            byRisk[risk] = (byRisk[risk] || 0) + 1;
        }
        return byRisk;
    }
}

module.exports = GDPRComplianceManager;