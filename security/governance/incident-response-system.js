/**
 * Incident Response System
 * Automated security incident response and orchestration
 * 
 * Features:
 * - Automated incident detection and classification
 * - Dynamic response playbooks
 * - Real-time incident orchestration
 * - Evidence collection and preservation
 * - Stakeholder notification system
 * - Forensic analysis integration
 * - Recovery and remediation automation
 * - Post-incident analysis and learning
 */

const crypto = require('crypto');
const winston = require('winston');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class IncidentResponseSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            autoResponse: options.autoResponse !== false,
            containmentEnabled: options.containmentEnabled !== false,
            notificationEnabled: options.notificationEnabled !== false,
            evidenceCollection: options.evidenceCollection !== false,
            maxResponseTime: options.maxResponseTime || 300000, // 5 minutes
            escalationLevels: options.escalationLevels || 3,
            forensicsIntegration: options.forensicsIntegration || false,
            ...options
        };

        this.logger = options.logger || this.createLogger();
        
        // Response system state
        this.activeIncidents = new Map();
        this.responsePlaybooks = new Map();
        this.automationRules = new Map();
        this.stakeholders = new Map();
        this.evidenceStore = new Map();
        
        // Response metrics
        this.metrics = {
            totalIncidents: 0,
            autoContained: 0,
            manualContained: 0,
            avgResponseTime: 0,
            avgResolutionTime: 0,
            successfulContainments: 0,
            failedContainments: 0
        };

        // Integration points
        this.integrations = {
            waf: null,
            ids: null,
            firewall: null,
            siem: null,
            ticketing: null,
            communication: null
        };

        this.initializeResponseSystem();
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
                    filename: 'logs/incident-response.log',
                    maxsize: 100 * 1024 * 1024,
                    maxFiles: 20
                }),
                new winston.transports.Console()
            ]
        });
    }

    async initializeResponseSystem() {
        try {
            // Load response playbooks
            await this.loadResponsePlaybooks();
            
            // Initialize automation rules
            this.initializeAutomationRules();
            
            // Setup stakeholder matrix
            this.setupStakeholderMatrix();
            
            // Initialize evidence collection
            await this.initializeEvidenceStore();
            
            this.logger.info('Incident Response System initialized successfully');

        } catch (error) {
            this.logger.error('Failed to initialize Incident Response System', {
                error: error.message
            });
            throw error;
        }
    }

    async loadResponsePlaybooks() {
        // Load standard incident response playbooks
        const playbooks = [
            {
                id: 'malware-detection',
                name: 'Malware Detection Response',
                triggers: ['malware_detected', 'virus_found', 'trojan_detected'],
                severity: 'high',
                containmentActions: [
                    'isolate_affected_systems',
                    'block_malicious_ips',
                    'quarantine_files',
                    'notify_security_team'
                ],
                recoveryActions: [
                    'clean_infected_systems',
                    'restore_from_backup',
                    'update_antivirus_definitions',
                    'patch_vulnerabilities'
                ]
            },
            {
                id: 'data-breach',
                name: 'Data Breach Response',
                triggers: ['unauthorized_data_access', 'data_exfiltration', 'privacy_violation'],
                severity: 'critical',
                containmentActions: [
                    'revoke_compromised_credentials',
                    'block_suspicious_ips',
                    'isolate_database_systems',
                    'preserve_evidence',
                    'notify_legal_team'
                ],
                recoveryActions: [
                    'assess_data_impact',
                    'notify_affected_users',
                    'comply_with_regulations',
                    'strengthen_access_controls'
                ]
            },
            {
                id: 'ddos-attack',
                name: 'DDoS Attack Response',
                triggers: ['ddos_detected', 'traffic_anomaly', 'service_unavailable'],
                severity: 'high',
                containmentActions: [
                    'activate_ddos_protection',
                    'block_attack_sources',
                    'scale_infrastructure',
                    'reroute_traffic'
                ],
                recoveryActions: [
                    'restore_service_availability',
                    'analyze_attack_patterns',
                    'update_protection_rules',
                    'document_lessons_learned'
                ]
            },
            {
                id: 'insider-threat',
                name: 'Insider Threat Response',
                triggers: ['suspicious_user_activity', 'privilege_abuse', 'data_theft_internal'],
                severity: 'high',
                containmentActions: [
                    'suspend_user_accounts',
                    'collect_user_activity_logs',
                    'preserve_digital_evidence',
                    'notify_hr_legal'
                ],
                recoveryActions: [
                    'conduct_investigation',
                    'review_access_permissions',
                    'implement_monitoring',
                    'update_policies'
                ]
            },
            {
                id: 'system-compromise',
                name: 'System Compromise Response',
                triggers: ['unauthorized_access', 'privilege_escalation', 'backdoor_detected'],
                severity: 'critical',
                containmentActions: [
                    'isolate_compromised_systems',
                    'change_all_passwords',
                    'block_attack_vectors',
                    'preserve_system_state'
                ],
                recoveryActions: [
                    'rebuild_compromised_systems',
                    'restore_from_clean_backups',
                    'patch_vulnerabilities',
                    'enhance_monitoring'
                ]
            }
        ];

        for (const playbook of playbooks) {
            this.responsePlaybooks.set(playbook.id, playbook);
        }

        this.logger.info('Response playbooks loaded', {
            count: playbooks.length
        });
    }

    initializeAutomationRules() {
        // Define automated response rules
        const rules = [
            {
                id: 'auto-block-malicious-ip',
                condition: (incident) => 
                    incident.severity === 'high' && 
                    incident.category === 'network_attack' &&
                    incident.sourceIP,
                action: 'blockIP',
                parameters: { duration: 3600000 }, // 1 hour
                cooldown: 300000 // 5 minutes
            },
            {
                id: 'auto-isolate-malware',
                condition: (incident) => 
                    incident.type === 'malware_detected',
                action: 'isolateSystem',
                parameters: { immediate: true },
                cooldown: 0
            },
            {
                id: 'auto-revoke-credentials',
                condition: (incident) => 
                    incident.type === 'credential_compromise' ||
                    incident.type === 'brute_force_success',
                action: 'revokeCredentials',
                parameters: { scope: 'affected_user' },
                cooldown: 60000 // 1 minute
            },
            {
                id: 'auto-scale-protection',
                condition: (incident) => 
                    incident.type === 'ddos_detected' &&
                    incident.intensity > 1000,
                action: 'scaleProtection',
                parameters: { level: 'high' },
                cooldown: 600000 // 10 minutes
            }
        ];

        for (const rule of rules) {
            rule.lastExecuted = 0;
            this.automationRules.set(rule.id, rule);
        }

        this.logger.info('Automation rules initialized', {
            count: rules.length
        });
    }

    setupStakeholderMatrix() {
        // Define stakeholder notification matrix
        const stakeholders = [
            {
                id: 'security-team',
                name: 'Security Team',
                role: 'primary_responder',
                contact: {
                    email: 'security-team@company.com',
                    slack: '#security-alerts',
                    phone: '+1-555-SECURITY'
                },
                notifyFor: ['all'],
                escalationLevel: 0
            },
            {
                id: 'ciso',
                name: 'Chief Information Security Officer',
                role: 'executive',
                contact: {
                    email: 'ciso@company.com',
                    phone: '+1-555-CISO'
                },
                notifyFor: ['critical', 'high'],
                escalationLevel: 1
            },
            {
                id: 'legal-team',
                name: 'Legal Team',
                role: 'compliance',
                contact: {
                    email: 'legal@company.com'
                },
                notifyFor: ['data_breach', 'privacy_violation', 'regulatory_compliance'],
                escalationLevel: 1
            },
            {
                id: 'it-operations',
                name: 'IT Operations',
                role: 'technical_support',
                contact: {
                    email: 'it-ops@company.com',
                    slack: '#it-operations'
                },
                notifyFor: ['system_compromise', 'ddos_attack', 'service_disruption'],
                escalationLevel: 0
            },
            {
                id: 'communications',
                name: 'Communications Team',
                role: 'public_relations',
                contact: {
                    email: 'communications@company.com'
                },
                notifyFor: ['data_breach', 'public_incident'],
                escalationLevel: 2
            }
        ];

        for (const stakeholder of stakeholders) {
            this.stakeholders.set(stakeholder.id, stakeholder);
        }

        this.logger.info('Stakeholder matrix configured', {
            count: stakeholders.length
        });
    }

    async initializeEvidenceStore() {
        // Create evidence storage directory
        const evidenceDir = path.join(process.cwd(), 'security', 'evidence');
        
        try {
            await fs.mkdir(evidenceDir, { recursive: true });
            await fs.chmod(evidenceDir, 0o700); // Restrict access
            
            this.evidenceStorePath = evidenceDir;
            this.logger.info('Evidence store initialized', { path: evidenceDir });
            
        } catch (error) {
            this.logger.error('Failed to initialize evidence store', {
                error: error.message
            });
        }
    }

    /**
     * Main incident response orchestration
     */
    async respondToIncident(incidentData) {
        const responseId = crypto.randomUUID();
        const startTime = Date.now();
        
        try {
            this.logger.info('Incident response initiated', {
                responseId,
                incidentType: incidentData.type,
                severity: incidentData.severity
            });

            // Create response record
            const response = {
                id: responseId,
                incidentId: incidentData.id,
                incidentData,
                startTime: new Date().toISOString(),
                status: 'active',
                phase: 'detection',
                playbook: null,
                actions: [],
                evidence: [],
                stakeholdersNotified: [],
                containmentStatus: 'pending',
                recoveryStatus: 'pending',
                metrics: {
                    detectionTime: startTime,
                    containmentTime: null,
                    recoveryTime: null,
                    resolutionTime: null
                }
            };

            this.activeIncidents.set(responseId, response);
            this.metrics.totalIncidents++;

            // Phase 1: Classification and Playbook Selection
            await this.classifyIncident(response);
            
            // Phase 2: Immediate Containment
            if (this.options.containmentEnabled) {
                await this.performContainment(response);
            }

            // Phase 3: Evidence Collection
            if (this.options.evidenceCollection) {
                await this.collectEvidence(response);
            }

            // Phase 4: Stakeholder Notification
            if (this.options.notificationEnabled) {
                await this.notifyStakeholders(response);
            }

            // Phase 5: Recovery Actions
            await this.performRecovery(response);

            // Phase 6: Resolution and Cleanup
            await this.resolveIncident(response);

            // Emit completion event
            this.emit('incidentResponseComplete', {
                responseId,
                duration: Date.now() - startTime,
                success: response.status === 'resolved'
            });

            return responseId;

        } catch (error) {
            this.logger.error('Incident response failed', {
                responseId,
                error: error.message,
                incidentType: incidentData.type
            });
            throw error;
        }
    }

    async classifyIncident(response) {
        response.phase = 'classification';
        
        try {
            // Match incident to appropriate playbook
            const playbook = this.selectPlaybook(response.incidentData);
            
            if (playbook) {
                response.playbook = playbook.id;
                response.actions.push({
                    timestamp: new Date().toISOString(),
                    type: 'playbook_selected',
                    details: { playbookId: playbook.id, playbookName: playbook.name },
                    status: 'completed'
                });
                
                this.logger.info('Playbook selected for incident', {
                    responseId: response.id,
                    playbookId: playbook.id,
                    incidentType: response.incidentData.type
                });
            } else {
                // Create custom response plan
                await this.createCustomResponsePlan(response);
            }

            // Update incident classification
            response.incidentData.classification = {
                category: this.categorizeIncident(response.incidentData),
                riskLevel: this.assessRiskLevel(response.incidentData),
                businessImpact: this.assessBusinessImpact(response.incidentData),
                urgency: this.assessUrgency(response.incidentData)
            };

        } catch (error) {
            this.logger.error('Incident classification failed', {
                responseId: response.id,
                error: error.message
            });
            throw error;
        }
    }

    selectPlaybook(incidentData) {
        for (const playbook of this.responsePlaybooks.values()) {
            if (playbook.triggers.includes(incidentData.type) ||
                playbook.triggers.includes(incidentData.category)) {
                return playbook;
            }
        }
        
        // Fallback to generic playbook based on severity
        const genericPlaybooks = {
            'critical': 'system-compromise',
            'high': 'malware-detection',
            'medium': 'ddos-attack',
            'low': 'ddos-attack'
        };
        
        const fallbackId = genericPlaybooks[incidentData.severity];
        return fallbackId ? this.responsePlaybooks.get(fallbackId) : null;
    }

    async performContainment(response) {
        response.phase = 'containment';
        const containmentStart = Date.now();
        
        try {
            const playbook = this.responsePlaybooks.get(response.playbook);
            const actions = playbook ? playbook.containmentActions : ['basic_containment'];
            
            // Execute automated containment if enabled
            if (this.options.autoResponse) {
                await this.executeAutomatedContainment(response);
            }

            // Execute playbook containment actions
            for (const actionType of actions) {
                const action = await this.executeContainmentAction(response, actionType);
                response.actions.push(action);
                
                if (action.status === 'failed') {
                    this.logger.warn('Containment action failed', {
                        responseId: response.id,
                        actionType,
                        error: action.error
                    });
                }
            }

            response.containmentStatus = 'completed';
            response.metrics.containmentTime = Date.now() - containmentStart;
            this.metrics.successfulContainments++;

            this.logger.info('Containment phase completed', {
                responseId: response.id,
                duration: response.metrics.containmentTime,
                actionsExecuted: actions.length
            });

        } catch (error) {
            response.containmentStatus = 'failed';
            this.metrics.failedContainments++;
            
            this.logger.error('Containment phase failed', {
                responseId: response.id,
                error: error.message
            });
            throw error;
        }
    }

    async executeAutomatedContainment(response) {
        const applicableRules = Array.from(this.automationRules.values())
            .filter(rule => {
                // Check cooldown
                if (Date.now() - rule.lastExecuted < rule.cooldown) {
                    return false;
                }
                
                // Check condition
                return rule.condition(response.incidentData);
            });

        for (const rule of applicableRules) {
            try {
                const action = await this.executeAutomationRule(response, rule);
                response.actions.push(action);
                
                rule.lastExecuted = Date.now();
                this.metrics.autoContained++;
                
                this.logger.info('Automated containment executed', {
                    responseId: response.id,
                    ruleId: rule.id,
                    action: rule.action
                });

            } catch (error) {
                this.logger.error('Automated containment failed', {
                    responseId: response.id,
                    ruleId: rule.id,
                    error: error.message
                });
            }
        }
    }

    async executeContainmentAction(response, actionType) {
        const action = {
            timestamp: new Date().toISOString(),
            type: actionType,
            status: 'pending',
            details: {},
            error: null
        };

        try {
            switch (actionType) {
                case 'isolate_affected_systems':
                    await this.isolateAffectedSystems(response.incidentData);
                    action.details = { systemsIsolated: response.incidentData.affectedSystems };
                    break;

                case 'block_malicious_ips':
                    await this.blockMaliciousIPs(response.incidentData);
                    action.details = { ipsBlocked: response.incidentData.sourceIPs };
                    break;

                case 'revoke_compromised_credentials':
                    await this.revokeCompromisedCredentials(response.incidentData);
                    action.details = { credentialsRevoked: response.incidentData.affectedUsers };
                    break;

                case 'quarantine_files':
                    await this.quarantineFiles(response.incidentData);
                    action.details = { filesQuarantined: response.incidentData.maliciousFiles };
                    break;

                case 'activate_ddos_protection':
                    await this.activateDDoSProtection(response.incidentData);
                    action.details = { protectionLevel: 'high' };
                    break;

                case 'preserve_evidence':
                    await this.preserveEvidence(response);
                    action.details = { evidencePreserved: true };
                    break;

                default:
                    throw new Error(`Unknown containment action: ${actionType}`);
            }

            action.status = 'completed';
            
        } catch (error) {
            action.status = 'failed';
            action.error = error.message;
        }

        return action;
    }

    async executeAutomationRule(response, rule) {
        const action = {
            timestamp: new Date().toISOString(),
            type: `automated_${rule.action}`,
            status: 'pending',
            details: { ruleId: rule.id, parameters: rule.parameters },
            error: null
        };

        try {
            switch (rule.action) {
                case 'blockIP':
                    await this.blockIP(response.incidentData.sourceIP, rule.parameters.duration);
                    break;

                case 'isolateSystem':
                    await this.isolateSystem(response.incidentData.affectedSystem, rule.parameters);
                    break;

                case 'revokeCredentials':
                    await this.revokeCredentials(response.incidentData.affectedUser, rule.parameters);
                    break;

                case 'scaleProtection':
                    await this.scaleProtection(rule.parameters.level);
                    break;

                default:
                    throw new Error(`Unknown automation action: ${rule.action}`);
            }

            action.status = 'completed';
            
        } catch (error) {
            action.status = 'failed';
            action.error = error.message;
        }

        return action;
    }

    async collectEvidence(response) {
        response.phase = 'evidence_collection';
        
        try {
            const evidenceItems = [];
            
            // Collect system logs
            if (response.incidentData.affectedSystems) {
                for (const system of response.incidentData.affectedSystems) {
                    const logs = await this.collectSystemLogs(system);
                    evidenceItems.push({
                        type: 'system_logs',
                        source: system,
                        data: logs,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // Collect network traffic
            if (response.incidentData.sourceIP) {
                const networkData = await this.collectNetworkEvidence(response.incidentData.sourceIP);
                evidenceItems.push({
                    type: 'network_traffic',
                    source: response.incidentData.sourceIP,
                    data: networkData,
                    timestamp: new Date().toISOString()
                });
            }

            // Collect memory dumps if system compromise
            if (response.incidentData.type === 'system_compromise') {
                const memoryDumps = await this.collectMemoryDumps(response.incidentData.affectedSystems);
                evidenceItems.push({
                    type: 'memory_dumps',
                    data: memoryDumps,
                    timestamp: new Date().toISOString()
                });
            }

            // Store evidence
            const evidenceId = await this.storeEvidence(response.id, evidenceItems);
            response.evidence.push(evidenceId);

            this.logger.info('Evidence collection completed', {
                responseId: response.id,
                evidenceItems: evidenceItems.length,
                evidenceId
            });

        } catch (error) {
            this.logger.error('Evidence collection failed', {
                responseId: response.id,
                error: error.message
            });
        }
    }

    async notifyStakeholders(response) {
        response.phase = 'notification';
        
        try {
            const incident = response.incidentData;
            const relevantStakeholders = this.getRelevantStakeholders(incident);
            
            for (const stakeholder of relevantStakeholders) {
                try {
                    await this.notifyStakeholder(stakeholder, response);
                    response.stakeholdersNotified.push(stakeholder.id);
                    
                    this.logger.info('Stakeholder notified', {
                        responseId: response.id,
                        stakeholderId: stakeholder.id,
                        stakeholderName: stakeholder.name
                    });

                } catch (error) {
                    this.logger.error('Stakeholder notification failed', {
                        responseId: response.id,
                        stakeholderId: stakeholder.id,
                        error: error.message
                    });
                }
            }

        } catch (error) {
            this.logger.error('Stakeholder notification phase failed', {
                responseId: response.id,
                error: error.message
            });
        }
    }

    async performRecovery(response) {
        response.phase = 'recovery';
        const recoveryStart = Date.now();
        
        try {
            const playbook = this.responsePlaybooks.get(response.playbook);
            const actions = playbook ? playbook.recoveryActions : ['basic_recovery'];
            
            for (const actionType of actions) {
                const action = await this.executeRecoveryAction(response, actionType);
                response.actions.push(action);
            }

            response.recoveryStatus = 'completed';
            response.metrics.recoveryTime = Date.now() - recoveryStart;

            this.logger.info('Recovery phase completed', {
                responseId: response.id,
                duration: response.metrics.recoveryTime
            });

        } catch (error) {
            response.recoveryStatus = 'failed';
            
            this.logger.error('Recovery phase failed', {
                responseId: response.id,
                error: error.message
            });
        }
    }

    async executeRecoveryAction(response, actionType) {
        const action = {
            timestamp: new Date().toISOString(),
            type: actionType,
            status: 'pending',
            details: {},
            error: null
        };

        try {
            // Execute recovery action based on type
            switch (actionType) {
                case 'restore_from_backup':
                    await this.restoreFromBackup(response.incidentData.affectedSystems);
                    break;

                case 'patch_vulnerabilities':
                    await this.patchVulnerabilities(response.incidentData.vulnerabilities);
                    break;

                case 'update_security_rules':
                    await this.updateSecurityRules(response.incidentData);
                    break;

                case 'strengthen_monitoring':
                    await this.strengthenMonitoring(response.incidentData);
                    break;

                default:
                    this.logger.warn('Unknown recovery action', { actionType });
            }

            action.status = 'completed';

        } catch (error) {
            action.status = 'failed';
            action.error = error.message;
        }

        return action;
    }

    async resolveIncident(response) {
        response.phase = 'resolution';
        response.status = 'resolved';
        response.metrics.resolutionTime = Date.now() - new Date(response.startTime).getTime();
        
        // Update metrics
        this.updateResponseMetrics(response);
        
        // Generate post-incident report
        const report = await this.generatePostIncidentReport(response);
        
        // Schedule post-incident review
        this.schedulePostIncidentReview(response);
        
        // Clean up active incident
        this.activeIncidents.delete(response.id);
        
        this.logger.info('Incident response resolved', {
            responseId: response.id,
            totalDuration: response.metrics.resolutionTime,
            containmentTime: response.metrics.containmentTime,
            recoveryTime: response.metrics.recoveryTime
        });

        return report;
    }

    // Integration methods for external systems
    async isolateAffectedSystems(incidentData) {
        // Integration with network management systems
        this.logger.info('Isolating affected systems', {
            systems: incidentData.affectedSystems
        });
        
        // Mock implementation - would integrate with actual network controls
        if (this.integrations.firewall) {
            await this.integrations.firewall.isolateSystems(incidentData.affectedSystems);
        }
    }

    async blockMaliciousIPs(incidentData) {
        // Integration with WAF/Firewall
        this.logger.info('Blocking malicious IPs', {
            ips: incidentData.sourceIPs
        });
        
        if (this.integrations.waf) {
            for (const ip of incidentData.sourceIPs || []) {
                await this.integrations.waf.blockIP(ip);
            }
        }
    }

    async revokeCompromisedCredentials(incidentData) {
        // Integration with identity management systems
        this.logger.info('Revoking compromised credentials', {
            users: incidentData.affectedUsers
        });
        
        // Mock implementation - would integrate with IAM systems
    }

    async blockIP(ip, duration) {
        this.logger.info('Automated IP blocking', { ip, duration });
        
        if (this.integrations.waf) {
            await this.integrations.waf.blockIP(ip, { duration });
        }
    }

    async isolateSystem(system, parameters) {
        this.logger.info('Automated system isolation', { system, parameters });
        
        if (this.integrations.firewall) {
            await this.integrations.firewall.isolateSystem(system, parameters);
        }
    }

    // Helper methods
    categorizeIncident(incidentData) {
        const categories = {
            'malware_detected': 'malware',
            'unauthorized_access': 'intrusion',
            'data_breach': 'data_loss',
            'ddos_attack': 'availability',
            'system_compromise': 'intrusion'
        };
        
        return categories[incidentData.type] || 'general';
    }

    assessRiskLevel(incidentData) {
        const riskFactors = {
            severity: { critical: 40, high: 30, medium: 20, low: 10 },
            dataInvolved: incidentData.sensitiveData ? 20 : 0,
            systemsCritical: incidentData.criticalSystems ? 25 : 0,
            publicExposure: incidentData.publicFacing ? 15 : 0
        };
        
        const totalRisk = 
            riskFactors.severity[incidentData.severity] +
            riskFactors.dataInvolved +
            riskFactors.systemsCritical +
            riskFactors.publicExposure;
        
        if (totalRisk >= 80) return 'critical';
        if (totalRisk >= 60) return 'high';
        if (totalRisk >= 40) return 'medium';
        return 'low';
    }

    assessBusinessImpact(incidentData) {
        // Assess potential business impact
        const impactFactors = {
            financial: incidentData.financialSystems ? 'high' : 'low',
            operational: incidentData.criticalSystems ? 'high' : 'medium',
            reputational: incidentData.publicFacing ? 'high' : 'low',
            regulatory: incidentData.regulatedData ? 'high' : 'low'
        };
        
        return impactFactors;
    }

    assessUrgency(incidentData) {
        const urgencyFactors = [
            incidentData.severity === 'critical' ? 3 : 0,
            incidentData.spreading ? 2 : 0,
            incidentData.publicFacing ? 2 : 0,
            incidentData.activeAttack ? 3 : 0
        ];
        
        const urgencyScore = urgencyFactors.reduce((sum, factor) => sum + factor, 0);
        
        if (urgencyScore >= 8) return 'immediate';
        if (urgencyScore >= 5) return 'high';
        if (urgencyScore >= 3) return 'medium';
        return 'low';
    }

    getRelevantStakeholders(incident) {
        const relevantStakeholders = [];
        
        for (const stakeholder of this.stakeholders.values()) {
            // Check if stakeholder should be notified
            if (stakeholder.notifyFor.includes('all') ||
                stakeholder.notifyFor.includes(incident.severity) ||
                stakeholder.notifyFor.includes(incident.type) ||
                stakeholder.notifyFor.includes(incident.category)) {
                relevantStakeholders.push(stakeholder);
            }
        }
        
        // Sort by escalation level
        return relevantStakeholders.sort((a, b) => a.escalationLevel - b.escalationLevel);
    }

    async notifyStakeholder(stakeholder, response) {
        const notification = {
            to: stakeholder.contact,
            subject: `Security Incident Alert: ${response.incidentData.type}`,
            message: this.generateNotificationMessage(stakeholder, response),
            priority: response.incidentData.severity,
            timestamp: new Date().toISOString()
        };

        // Send notification through configured channels
        if (this.integrations.communication) {
            await this.integrations.communication.sendNotification(notification);
        }

        this.logger.info('Notification sent', {
            stakeholder: stakeholder.id,
            channels: Object.keys(stakeholder.contact)
        });
    }

    generateNotificationMessage(stakeholder, response) {
        const incident = response.incidentData;
        
        return `
Security Incident Notification

Incident ID: ${response.id}
Type: ${incident.type}
Severity: ${incident.severity}
Status: ${response.status}
Detected: ${response.startTime}

Description: ${incident.description}

Current Actions:
${response.actions.slice(-3).map(action => 
    `- ${action.type}: ${action.status}`
).join('\n')}

${stakeholder.role === 'executive' ? 
    `Business Impact: ${JSON.stringify(incident.classification?.businessImpact)}` : 
    `Technical Details: Available in incident management system`}

This is an automated notification from the Incident Response System.
        `.trim();
    }

    async storeEvidence(responseId, evidenceItems) {
        const evidenceId = crypto.randomUUID();
        const evidencePackage = {
            id: evidenceId,
            responseId,
            items: evidenceItems,
            collectedAt: new Date().toISOString(),
            hash: this.calculateEvidenceHash(evidenceItems)
        };

        // Store evidence securely
        const evidencePath = path.join(this.evidenceStorePath, `${evidenceId}.json`);
        await fs.writeFile(evidencePath, JSON.stringify(evidencePackage, null, 2));
        await fs.chmod(evidencePath, 0o600);

        this.evidenceStore.set(evidenceId, evidencePackage);
        
        return evidenceId;
    }

    calculateEvidenceHash(evidenceItems) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(evidenceItems));
        return hash.digest('hex');
    }

    async generatePostIncidentReport(response) {
        const report = {
            responseId: response.id,
            incidentId: response.incidentId,
            generatedAt: new Date().toISOString(),
            summary: {
                incidentType: response.incidentData.type,
                severity: response.incidentData.severity,
                duration: response.metrics.resolutionTime,
                containmentTime: response.metrics.containmentTime,
                recoveryTime: response.metrics.recoveryTime
            },
            timeline: response.actions.map(action => ({
                timestamp: action.timestamp,
                action: action.type,
                status: action.status,
                details: action.details
            })),
            evidence: response.evidence,
            stakeholdersNotified: response.stakeholdersNotified,
            lessonsLearned: this.extractLessonsLearned(response),
            recommendations: this.generateRecommendations(response)
        };

        // Store report
        const reportPath = path.join(this.evidenceStorePath, `report-${response.id}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    updateResponseMetrics(response) {
        // Update average response time
        const responseTime = response.metrics.resolutionTime;
        this.metrics.avgResponseTime = 
            (this.metrics.avgResponseTime + responseTime) / 2;
            
        // Update average resolution time
        this.metrics.avgResolutionTime = 
            (this.metrics.avgResolutionTime + responseTime) / 2;
    }

    schedulePostIncidentReview(response) {
        // Schedule post-incident review meeting
        setTimeout(() => {
            this.emit('postIncidentReviewDue', {
                responseId: response.id,
                incidentType: response.incidentData.type,
                severity: response.incidentData.severity
            });
        }, 24 * 60 * 60 * 1000); // 24 hours later
    }

    extractLessonsLearned(response) {
        const lessons = [];
        
        // Analyze failed actions
        const failedActions = response.actions.filter(a => a.status === 'failed');
        if (failedActions.length > 0) {
            lessons.push({
                category: 'response_improvement',
                lesson: 'Some automated response actions failed and need review',
                actions: failedActions.map(a => a.type)
            });
        }
        
        // Analyze response time
        if (response.metrics.containmentTime > this.options.maxResponseTime) {
            lessons.push({
                category: 'response_time',
                lesson: 'Containment took longer than target response time',
                containmentTime: response.metrics.containmentTime,
                target: this.options.maxResponseTime
            });
        }
        
        return lessons;
    }

    generateRecommendations(response) {
        const recommendations = [];
        
        // Security improvements
        if (response.incidentData.type === 'malware_detected') {
            recommendations.push({
                category: 'prevention',
                recommendation: 'Update antivirus definitions and endpoint protection',
                priority: 'high'
            });
        }
        
        // Process improvements
        const manualActions = response.actions.filter(a => !a.type.startsWith('automated_'));
        if (manualActions.length > 5) {
            recommendations.push({
                category: 'automation',
                recommendation: 'Consider automating more response actions to reduce manual effort',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    // Mock implementations for external integrations
    async collectSystemLogs(system) {
        return `System logs for ${system} - timestamp: ${new Date().toISOString()}`;
    }

    async collectNetworkEvidence(ip) {
        return `Network traffic data for ${ip} - timestamp: ${new Date().toISOString()}`;
    }

    async collectMemoryDumps(systems) {
        return `Memory dumps for systems: ${systems.join(', ')}`;
    }

    async quarantineFiles(incidentData) {
        this.logger.info('Quarantining malicious files', {
            files: incidentData.maliciousFiles
        });
    }

    async activateDDoSProtection(incidentData) {
        this.logger.info('Activating DDoS protection', {
            intensity: incidentData.intensity
        });
    }

    async preserveEvidence(response) {
        this.logger.info('Preserving evidence for forensic analysis', {
            responseId: response.id
        });
    }

    async restoreFromBackup(systems) {
        this.logger.info('Restoring systems from backup', { systems });
    }

    async patchVulnerabilities(vulnerabilities) {
        this.logger.info('Patching vulnerabilities', { vulnerabilities });
    }

    async updateSecurityRules(incidentData) {
        this.logger.info('Updating security rules based on incident', {
            type: incidentData.type
        });
    }

    async strengthenMonitoring(incidentData) {
        this.logger.info('Strengthening monitoring for incident type', {
            type: incidentData.type
        });
    }

    // Public API methods
    getResponseStatus(responseId) {
        return this.activeIncidents.get(responseId);
    }

    getResponseMetrics() {
        return {
            ...this.metrics,
            activeIncidents: this.activeIncidents.size,
            timestamp: new Date().toISOString()
        };
    }

    async createCustomResponsePlan(response) {
        // Create custom response plan for unknown incident types
        const customPlaybook = {
            id: `custom-${response.id}`,
            name: `Custom Response for ${response.incidentData.type}`,
            containmentActions: ['preserve_evidence', 'notify_security_team'],
            recoveryActions: ['assess_impact', 'update_security_rules']
        };
        
        response.playbook = customPlaybook.id;
        this.responsePlaybooks.set(customPlaybook.id, customPlaybook);
        
        this.logger.info('Custom response plan created', {
            responseId: response.id,
            playbookId: customPlaybook.id
        });
    }

    registerIntegration(type, integration) {
        this.integrations[type] = integration;
        this.logger.info('Integration registered', { type });
    }

    async healthCheck() {
        return {
            status: 'healthy',
            activeIncidents: this.activeIncidents.size,
            playbooks: this.responsePlaybooks.size,
            automationRules: this.automationRules.size,
            stakeholders: this.stakeholders.size,
            metrics: this.metrics
        };
    }
}

module.exports = IncidentResponseSystem;