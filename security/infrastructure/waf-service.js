/**
 * Enterprise Web Application Firewall (WAF) Service
 * Advanced threat protection and traffic filtering
 * 
 * Features:
 * - OWASP Top 10 protection rules
 * - Signature-based and anomaly-based detection
 * - Geo-filtering and IP reputation
 * - Rate limiting and DDoS mitigation
 * - Bot detection and management
 * - Custom rule engine
 * - Real-time threat intelligence
 * - SSL/TLS inspection
 * - Request/response filtering
 */

const crypto = require('crypto');
const winston = require('winston');
const EventEmitter = require('events');
const RateLimiter = require('rate-limiter-flexible').RateLimiterRedis;
const geoip = require('geoip-lite');
const { performance } = require('perf_hooks');

class WAFService extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            enabled: true,
            mode: 'monitor', // monitor, blocking
            logLevel: 'info',
            maxRequestSize: 10 * 1024 * 1024, // 10MB
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            blockedCountries: [],
            allowedCountries: [],
            ipWhitelist: [],
            ipBlacklist: [],
            customRules: [],
            paranoidMode: false,
            ...options
        };

        this.logger = options.logger || this.createLogger();
        this.redis = options.redis;
        
        // Initialize rule engine
        this.initializeRuleEngine();
        
        // Initialize rate limiters
        this.initializeRateLimiters();
        
        // Threat intelligence
        this.threatIntelligence = new Map();
        
        // Request statistics
        this.stats = {
            totalRequests: 0,
            blockedRequests: 0,
            allowedRequests: 0,
            suspiciousRequests: 0,
            avgProcessingTime: 0,
            threatTypes: {}
        };
        
        // Initialize WAF
        this.initializeWAF();
    }

    createLogger() {
        return winston.createLogger({
            level: this.options.logLevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ 
                    filename: 'logs/waf-security.log',
                    maxsize: 100 * 1024 * 1024,
                    maxFiles: 20
                }),
                new winston.transports.Console()
            ]
        });
    }

    initializeRuleEngine() {
        // OWASP Top 10 Protection Rules
        this.protectionRules = {
            // SQL Injection
            sqlInjection: {
                enabled: true,
                severity: 'critical',
                patterns: [
                    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
                    /(\bUNION\b.*\bSELECT\b)/gi,
                    /(\'|\")(\s*)(;|\-\-|\#|\/\*)/gi,
                    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
                    /1=1|1=0|true=true|false=false/gi,
                    /\/\*.*\*\//gi,
                    /\b(exec|execute|sp_|xp_)\b/gi
                ]
            },
            
            // Cross-Site Scripting (XSS)
            xss: {
                enabled: true,
                severity: 'high',
                patterns: [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi,
                    /<iframe\b[^>]*>/gi,
                    /<object\b[^>]*>/gi,
                    /<embed\b[^>]*>/gi,
                    /<link\b[^>]*>/gi,
                    /expression\s*\(/gi,
                    /vbscript:/gi,
                    /data:text\/html/gi
                ]
            },
            
            // Command Injection
            commandInjection: {
                enabled: true,
                severity: 'critical',
                patterns: [
                    /(\||&|;|`|\$\(|\$\{)/g,
                    /\b(cat|ls|pwd|id|whoami|uname|ps|netstat|ifconfig|ping|nslookup|dig|wget|curl)\b/gi,
                    /(\.\.|\/etc\/|\/bin\/|\/usr\/|\/var\/|\/tmp\/)/gi,
                    /(nc|netcat|telnet|ssh|ftp|tftp)/gi
                ]
            },
            
            // Path Traversal
            pathTraversal: {
                enabled: true,
                severity: 'high',
                patterns: [
                    /\.\.[\/\\]/g,
                    /%2e%2e[\/\\]/gi,
                    /\.\.[%2f|%5c]/gi,
                    /%252e%252e/gi,
                    /\.\.\\/g,
                    /\.\.\//g
                ]
            },
            
            // Local File Inclusion (LFI)
            lfi: {
                enabled: true,
                severity: 'high',
                patterns: [
                    /\/etc\/passwd/gi,
                    /\/etc\/shadow/gi,
                    /\/etc\/hosts/gi,
                    /\/proc\/self\/environ/gi,
                    /\/var\/log\//gi,
                    /file:\/\//gi,
                    /php:\/\//gi
                ]
            },
            
            // Remote File Inclusion (RFI)
            rfi: {
                enabled: true,
                severity: 'critical',
                patterns: [
                    /https?:\/\/[^\/\s]+/gi,
                    /ftp:\/\/[^\/\s]+/gi,
                    /data:\/\/[^\/\s]+/gi,
                    /include.*http/gi,
                    /require.*http/gi
                ]
            },
            
            // Server-Side Template Injection (SSTI)
            ssti: {
                enabled: true,
                severity: 'high',
                patterns: [
                    /\{\{.*\}\}/g,
                    /\{%.*%\}/g,
                    /\$\{.*\}/g,
                    /<@.*@>/g,
                    /<%.*%>/g,
                    /\[%.*%\]/g
                ]
            },
            
            // XML External Entity (XXE)
            xxe: {
                enabled: true,
                severity: 'high',
                patterns: [
                    /<!ENTITY/gi,
                    /<!DOCTYPE.*ENTITY/gi,
                    /SYSTEM.*file:/gi,
                    /PUBLIC.*file:/gi,
                    /%.*%;/g
                ]
            },
            
            // LDAP Injection
            ldapInjection: {
                enabled: true,
                severity: 'medium',
                patterns: [
                    /\(\|/g,
                    /\(&/g,
                    /\(!/g,
                    /\*\)/g,
                    /\)\(/g
                ]
            },
            
            // NoSQL Injection
            nosqlInjection: {
                enabled: true,
                severity: 'high',
                patterns: [
                    /\$where/gi,
                    /\$regex/gi,
                    /\$ne/gi,
                    /\$gt/gi,
                    /\$lt/gi,
                    /\$or/gi,
                    /\$and/gi,
                    /javascript:/gi
                ]
            },
            
            // HTTP Request Smuggling
            requestSmuggling: {
                enabled: true,
                severity: 'critical',
                patterns: [
                    /Transfer-Encoding.*chunked/gi,
                    /Content-Length.*0/gi,
                    /\r\n\r\n.*GET/gi,
                    /\r\n\r\n.*POST/gi
                ]
            }
        };

        // Bot detection patterns
        this.botPatterns = [
            /bot|crawl|spider|scan|fetch|monitor|test|check/gi,
            /curl|wget|python|ruby|perl|java|go-http/gi,
            /nikto|sqlmap|nmap|masscan|zap|burp/gi,
            /phantom|headless|selenium|puppeteer/gi
        ];

        // Suspicious patterns
        this.suspiciousPatterns = [
            /admin|administrator|root|test|demo/gi,
            /password|passwd|pwd|secret|key|token/gi,
            /config|conf|cfg|ini|xml|json|yaml/gi,
            /backup|bak|old|tmp|temp/gi,
            /\.log$|\.txt$|\.sql$|\.dump$/gi
        ];
    }

    initializeRateLimiters() {
        // General request rate limiter
        this.rateLimiter = new RateLimiter({
            storeClient: this.redis,
            keyPrefix: 'waf_rl_',
            points: 100, // requests
            duration: 60, // per 60 seconds
            blockDuration: 300 // block for 5 minutes
        });

        // Strict rate limiter for suspicious requests
        this.strictRateLimiter = new RateLimiter({
            storeClient: this.redis,
            keyPrefix: 'waf_strict_',
            points: 10,
            duration: 60,
            blockDuration: 3600 // block for 1 hour
        });

        // DDoS protection
        this.ddosProtection = new RateLimiter({
            storeClient: this.redis,
            keyPrefix: 'waf_ddos_',
            points: 1000, // requests
            duration: 60, // per minute
            blockDuration: 1800 // block for 30 minutes
        });
    }

    async initializeWAF() {
        try {
            // Load custom rules
            await this.loadCustomRules();
            
            // Initialize threat intelligence
            await this.updateThreatIntelligence();
            
            // Schedule periodic updates
            this.scheduleUpdates();
            
            this.logger.info('WAF Service initialized successfully', {
                mode: this.options.mode,
                rulesLoaded: Object.keys(this.protectionRules).length
            });
            
        } catch (error) {
            this.logger.error('Failed to initialize WAF Service', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Main WAF inspection middleware
     */
    inspect() {
        return async (req, res, next) => {
            if (!this.options.enabled) {
                return next();
            }

            const startTime = performance.now();
            const requestId = crypto.randomUUID();
            
            try {
                this.stats.totalRequests++;
                
                // Create inspection context
                const context = this.createInspectionContext(req, requestId);
                
                // Perform inspections
                const inspectionResult = await this.performInspections(context);
                
                // Calculate processing time
                const processingTime = performance.now() - startTime;
                this.updateProcessingTime(processingTime);
                
                // Handle inspection result
                await this.handleInspectionResult(inspectionResult, req, res, next);
                
            } catch (error) {
                this.logger.error('WAF inspection failed', {
                    error: error.message,
                    requestId,
                    url: req.url
                });
                
                // In case of WAF error, allow request but log it
                next();
            }
        };
    }

    createInspectionContext(req, requestId) {
        return {
            requestId,
            method: req.method,
            url: req.url,
            path: req.path,
            query: req.query,
            headers: req.headers,
            body: req.body,
            params: req.params,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            timestamp: new Date().toISOString(),
            size: this.getRequestSize(req),
            geo: this.getGeoInfo(req.ip)
        };
    }

    async performInspections(context) {
        const violations = [];
        const warnings = [];
        
        try {
            // 1. Basic request validation
            const basicCheck = this.performBasicValidation(context);
            if (basicCheck.violations.length > 0) {
                violations.push(...basicCheck.violations);
            }
            
            // 2. Rate limiting check
            const rateLimitCheck = await this.performRateLimitCheck(context);
            if (rateLimitCheck.violated) {
                violations.push(rateLimitCheck);
            }
            
            // 3. Geo-filtering
            const geoCheck = this.performGeoFiltering(context);
            if (geoCheck.violated) {
                violations.push(geoCheck);
            }
            
            // 4. IP reputation check
            const ipCheck = await this.performIPReputationCheck(context);
            if (ipCheck.violated) {
                violations.push(ipCheck);
            }
            
            // 5. Bot detection
            const botCheck = this.performBotDetection(context);
            if (botCheck.detected) {
                if (botCheck.malicious) {
                    violations.push(botCheck);
                } else {
                    warnings.push(botCheck);
                }
            }
            
            // 6. OWASP Top 10 protection
            const owaspCheck = this.performOWASPInspection(context);
            violations.push(...owaspCheck.violations);
            warnings.push(...owaspCheck.warnings);
            
            // 7. Custom rules
            const customCheck = this.performCustomRulesInspection(context);
            violations.push(...customCheck.violations);
            warnings.push(...customCheck.warnings);
            
            // 8. Anomaly detection
            const anomalyCheck = this.performAnomalyDetection(context);
            if (anomalyCheck.detected) {
                warnings.push(anomalyCheck);
            }
            
            return {
                requestId: context.requestId,
                timestamp: context.timestamp,
                violations,
                warnings,
                riskScore: this.calculateRiskScore(violations, warnings),
                action: this.determineAction(violations, warnings)
            };
            
        } catch (error) {
            this.logger.error('Inspection failed', {
                error: error.message,
                requestId: context.requestId
            });
            
            return {
                requestId: context.requestId,
                violations: [],
                warnings: [],
                riskScore: 0,
                action: 'allow',
                error: error.message
            };
        }
    }

    performBasicValidation(context) {
        const violations = [];
        
        // Check HTTP method
        if (!this.options.allowedMethods.includes(context.method)) {
            violations.push({
                type: 'method_not_allowed',
                severity: 'medium',
                message: `HTTP method ${context.method} not allowed`,
                details: { method: context.method }
            });
        }
        
        // Check request size
        if (context.size > this.options.maxRequestSize) {
            violations.push({
                type: 'request_too_large',
                severity: 'medium',
                message: 'Request size exceeds limit',
                details: { size: context.size, limit: this.options.maxRequestSize }
            });
        }
        
        // Check for missing required headers
        if (!context.headers['user-agent']) {
            violations.push({
                type: 'missing_user_agent',
                severity: 'low',
                message: 'Missing User-Agent header',
                details: {}
            });
        }
        
        // Check for suspicious headers
        const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
        for (const header of suspiciousHeaders) {
            if (context.headers[header] && this.containsMaliciousPayload(context.headers[header])) {
                violations.push({
                    type: 'malicious_header',
                    severity: 'high',
                    message: `Malicious payload in ${header} header`,
                    details: { header, value: context.headers[header] }
                });
            }
        }
        
        return { violations };
    }

    async performRateLimitCheck(context) {
        try {
            // Check general rate limit
            await this.rateLimiter.consume(context.ip);
            
            // Check DDoS protection
            await this.ddosProtection.consume(context.ip);
            
            return { violated: false };
            
        } catch (rateLimiterRes) {
            const resetTime = new Date(Date.now() + rateLimiterRes.msBeforeNext);
            
            return {
                violated: true,
                type: 'rate_limit_exceeded',
                severity: 'high',
                message: 'Rate limit exceeded',
                details: {
                    ip: context.ip,
                    remainingPoints: rateLimiterRes.remainingPoints,
                    resetTime: resetTime.toISOString()
                }
            };
        }
    }

    performGeoFiltering(context) {
        if (!context.geo || !context.geo.country) {
            return { violated: false };
        }
        
        const country = context.geo.country;
        
        // Check blocked countries
        if (this.options.blockedCountries.includes(country)) {
            return {
                violated: true,
                type: 'geo_blocked',
                severity: 'medium',
                message: `Request from blocked country: ${country}`,
                details: { country, ip: context.ip }
            };
        }
        
        // Check allowed countries (if specified)
        if (this.options.allowedCountries.length > 0 && 
            !this.options.allowedCountries.includes(country)) {
            return {
                violated: true,
                type: 'geo_restricted',
                severity: 'medium',
                message: `Request from restricted country: ${country}`,
                details: { country, ip: context.ip }
            };
        }
        
        return { violated: false };
    }

    async performIPReputationCheck(context) {
        // Check IP whitelist
        if (this.options.ipWhitelist.includes(context.ip)) {
            return { violated: false, whitelisted: true };
        }
        
        // Check IP blacklist
        if (this.options.ipBlacklist.includes(context.ip)) {
            return {
                violated: true,
                type: 'ip_blacklisted',
                severity: 'high',
                message: 'IP address is blacklisted',
                details: { ip: context.ip }
            };
        }
        
        // Check threat intelligence
        const threatInfo = this.threatIntelligence.get(context.ip);
        if (threatInfo && threatInfo.malicious) {
            return {
                violated: true,
                type: 'ip_threat_intelligence',
                severity: 'high',
                message: 'IP flagged by threat intelligence',
                details: { ip: context.ip, threatInfo }
            };
        }
        
        return { violated: false };
    }

    performBotDetection(context) {
        const userAgent = context.userAgent || '';
        let botScore = 0;
        let detectedBots = [];
        
        // Check for bot patterns in User-Agent
        for (const pattern of this.botPatterns) {
            if (pattern.test(userAgent)) {
                botScore += 20;
                detectedBots.push(pattern.toString());
            }
        }
        
        // Check for missing typical browser headers
        const browserHeaders = ['accept', 'accept-language', 'accept-encoding'];
        const missingHeaders = browserHeaders.filter(header => !context.headers[header]);
        botScore += missingHeaders.length * 10;
        
        // Check for suspicious request patterns
        if (context.method === 'HEAD' || context.path.includes('/robots.txt')) {
            botScore += 5;
        }
        
        const detected = botScore > 20;
        const malicious = botScore > 50;
        
        if (detected) {
            return {
                detected: true,
                malicious,
                type: 'bot_detected',
                severity: malicious ? 'high' : 'low',
                message: `Bot activity detected (score: ${botScore})`,
                details: {
                    botScore,
                    detectedPatterns: detectedBots,
                    missingHeaders,
                    userAgent
                }
            };
        }
        
        return { detected: false };
    }

    performOWASPInspection(context) {
        const violations = [];
        const warnings = [];
        
        // Combine all request data for inspection
        const requestData = this.combineRequestData(context);
        
        for (const [ruleName, rule] of Object.entries(this.protectionRules)) {
            if (!rule.enabled) continue;
            
            for (const pattern of rule.patterns) {
                if (pattern.test(requestData)) {
                    const violation = {
                        type: `owasp_${ruleName}`,
                        severity: rule.severity,
                        message: `${ruleName.toUpperCase()} pattern detected`,
                        details: {
                            pattern: pattern.toString(),
                            matchedContent: this.extractMatchedContent(requestData, pattern)
                        }
                    };
                    
                    if (rule.severity === 'critical' || rule.severity === 'high') {
                        violations.push(violation);
                    } else {
                        warnings.push(violation);
                    }
                    
                    // Track threat types
                    this.stats.threatTypes[ruleName] = (this.stats.threatTypes[ruleName] || 0) + 1;
                }
            }
        }
        
        return { violations, warnings };
    }

    performCustomRulesInspection(context) {
        const violations = [];
        const warnings = [];
        
        for (const rule of this.options.customRules) {
            try {
                const result = rule.execute(context);
                if (result.matched) {
                    const violation = {
                        type: `custom_${rule.name}`,
                        severity: rule.severity || 'medium',
                        message: result.message || `Custom rule ${rule.name} triggered`,
                        details: result.details || {}
                    };
                    
                    if (rule.severity === 'critical' || rule.severity === 'high') {
                        violations.push(violation);
                    } else {
                        warnings.push(violation);
                    }
                }
            } catch (error) {
                this.logger.error('Custom rule execution failed', {
                    rule: rule.name,
                    error: error.message
                });
            }
        }
        
        return { violations, warnings };
    }

    performAnomalyDetection(context) {
        let anomalyScore = 0;
        const anomalies = [];
        
        // Check for unusual request patterns
        if (context.path.length > 1000) {
            anomalyScore += 20;
            anomalies.push('long_path');
        }
        
        if (Object.keys(context.query).length > 50) {
            anomalyScore += 15;
            anomalies.push('many_parameters');
        }
        
        if (context.headers['content-length'] && 
            parseInt(context.headers['content-length']) > 1000000) {
            anomalyScore += 25;
            anomalies.push('large_payload');
        }
        
        // Check for suspicious file extensions
        const suspiciousExtensions = ['.php', '.asp', '.jsp', '.cgi'];
        if (suspiciousExtensions.some(ext => context.path.includes(ext))) {
            anomalyScore += 30;
            anomalies.push('suspicious_extension');
        }
        
        // Check for encoded content
        if (/%[0-9a-f]{2}/gi.test(context.url)) {
            const encodedChars = (context.url.match(/%[0-9a-f]{2}/gi) || []).length;
            if (encodedChars > 10) {
                anomalyScore += encodedChars;
                anomalies.push('excessive_encoding');
            }
        }
        
        const detected = anomalyScore > 30;
        
        if (detected) {
            return {
                detected: true,
                type: 'anomaly_detected',
                severity: 'medium',
                message: `Request anomaly detected (score: ${anomalyScore})`,
                details: {
                    anomalyScore,
                    anomalies
                }
            };
        }
        
        return { detected: false };
    }

    calculateRiskScore(violations, warnings) {
        let score = 0;
        
        for (const violation of violations) {
            switch (violation.severity) {
                case 'critical':
                    score += 100;
                    break;
                case 'high':
                    score += 50;
                    break;
                case 'medium':
                    score += 25;
                    break;
                case 'low':
                    score += 10;
                    break;
            }
        }
        
        for (const warning of warnings) {
            score += 5;
        }
        
        return Math.min(score, 1000); // Cap at 1000
    }

    determineAction(violations, warnings) {
        const criticalViolations = violations.filter(v => v.severity === 'critical');
        const highViolations = violations.filter(v => v.severity === 'high');
        
        if (criticalViolations.length > 0) {
            return 'block';
        }
        
        if (this.options.paranoidMode && highViolations.length > 0) {
            return 'block';
        }
        
        if (highViolations.length >= 2) {
            return 'block';
        }
        
        if (violations.length >= 5) {
            return 'block';
        }
        
        return 'allow';
    }

    async handleInspectionResult(result, req, res, next) {
        const { violations, warnings, riskScore, action } = result;
        
        // Log the inspection result
        if (violations.length > 0 || warnings.length > 0) {
            this.logger.warn('WAF inspection result', {
                requestId: result.requestId,
                url: req.url,
                ip: req.ip,
                riskScore,
                action,
                violations: violations.length,
                warnings: warnings.length,
                details: { violations, warnings }
            });
        }
        
        // Update statistics
        if (action === 'block') {
            this.stats.blockedRequests++;
        } else {
            this.stats.allowedRequests++;
        }
        
        if (violations.length > 0 || warnings.length > 0) {
            this.stats.suspiciousRequests++;
        }
        
        // Emit events
        if (violations.length > 0) {
            this.emit('threatDetected', {
                requestId: result.requestId,
                ip: req.ip,
                url: req.url,
                violations,
                riskScore
            });
        }
        
        // Take action based on mode and result
        if (this.options.mode === 'blocking' && action === 'block') {
            // Apply strict rate limiting to this IP
            try {
                await this.strictRateLimiter.consume(req.ip);
            } catch {
                // Already rate limited
            }
            
            res.status(403).json({
                error: 'Request blocked by Web Application Firewall',
                requestId: result.requestId,
                timestamp: result.timestamp
            });
            
            return;
        }
        
        // Add WAF headers to response
        res.set({
            'X-WAF-Status': action,
            'X-WAF-Request-ID': result.requestId,
            'X-WAF-Risk-Score': riskScore.toString()
        });
        
        next();
    }

    // Helper methods
    getRequestSize(req) {
        let size = 0;
        
        // Headers size (approximate)
        for (const [key, value] of Object.entries(req.headers)) {
            size += key.length + (Array.isArray(value) ? value.join('').length : value.length);
        }
        
        // URL size
        size += req.url.length;
        
        // Body size
        if (req.body) {
            size += JSON.stringify(req.body).length;
        }
        
        return size;
    }

    getGeoInfo(ip) {
        try {
            return geoip.lookup(ip);
        } catch {
            return null;
        }
    }

    combineRequestData(context) {
        const data = [];
        
        data.push(context.url);
        data.push(JSON.stringify(context.query));
        data.push(JSON.stringify(context.headers));
        
        if (context.body) {
            data.push(JSON.stringify(context.body));
        }
        
        if (context.params) {
            data.push(JSON.stringify(context.params));
        }
        
        return data.join(' ');
    }

    containsMaliciousPayload(data) {
        const maliciousPatterns = [
            /<script/gi,
            /javascript:/gi,
            /\bUNION\b.*\bSELECT\b/gi,
            /\.\.[\/\\]/g
        ];
        
        return maliciousPatterns.some(pattern => pattern.test(data));
    }

    extractMatchedContent(data, pattern) {
        const matches = data.match(pattern);
        return matches ? matches.slice(0, 3) : []; // Return first 3 matches
    }

    updateProcessingTime(time) {
        this.stats.avgProcessingTime = 
            (this.stats.avgProcessingTime + time) / 2;
    }

    async loadCustomRules() {
        // Load custom rules from configuration
        // This would typically load from a database or file
        this.logger.debug('Loading custom WAF rules');
    }

    async updateThreatIntelligence() {
        // Update threat intelligence feeds
        // This would typically fetch from external threat intel sources
        this.logger.debug('Updating threat intelligence');
    }

    scheduleUpdates() {
        // Update threat intelligence every hour
        setInterval(async () => {
            try {
                await this.updateThreatIntelligence();
            } catch (error) {
                this.logger.error('Failed to update threat intelligence', {
                    error: error.message
                });
            }
        }, 60 * 60 * 1000);
    }

    // Management methods
    getStats() {
        return {
            ...this.stats,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    }

    addCustomRule(rule) {
        this.options.customRules.push(rule);
        this.logger.info('Custom rule added', { ruleName: rule.name });
    }

    updateIPWhitelist(ips) {
        this.options.ipWhitelist = ips;
        this.logger.info('IP whitelist updated', { count: ips.length });
    }

    updateIPBlacklist(ips) {
        this.options.ipBlacklist = ips;
        this.logger.info('IP blacklist updated', { count: ips.length });
    }

    setMode(mode) {
        if (['monitor', 'blocking'].includes(mode)) {
            this.options.mode = mode;
            this.logger.info('WAF mode changed', { mode });
        }
    }

    async healthCheck() {
        return {
            status: 'healthy',
            mode: this.options.mode,
            rulesEnabled: Object.keys(this.protectionRules).filter(
                rule => this.protectionRules[rule].enabled
            ).length,
            stats: this.getStats()
        };
    }
}

module.exports = WAFService;