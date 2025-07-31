/**
 * Comprehensive Security Middleware Suite
 * Enterprise-grade security middleware stack
 * 
 * Features:
 * - Input validation and sanitization
 * - XSS protection with Content Security Policy
 * - CSRF protection with token validation
 * - Rate limiting with adaptive thresholds  
 * - SQL injection prevention
 * - Request size limiting
 * - Security headers enforcement
 * - IP whitelisting/blacklisting
 * - Geo-blocking capabilities
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const RateLimiterRedis = require('rate-limiter-flexible').RateLimiterRedis;
const RateLimiterMemory = require('rate-limiter-flexible').RateLimiterMemory;
const validator = require('validator');
const xss = require('xss');
const crypto = require('crypto');
const winston = require('winston');
const geoip = require('geoip-lite');

class SecurityMiddleware {
    constructor(options = {}) {
        this.options = {
            enableCSP: true,
            enableCSRF: true,
            enableRateLimit: true,
            enableInputValidation: true,
            enableGeoBlocking: false,
            maxRequestSize: '10mb',
            trustedProxies: ['127.0.0.1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
            blockedCountries: [],
            allowedCountries: [],
            ipWhitelist: [],
            ipBlacklist: [],
            ...options
        };

        this.redis = options.redis;
        this.logger = options.logger || this.createLogger();
        
        // Initialize rate limiters
        this.initializeRateLimiters();
        
        // CSRF token store
        this.csrfTokens = new Map();
        
        // Security event counters
        this.securityMetrics = {
            blockedRequests: 0,
            xssAttempts: 0,
            sqlInjectionAttempts: 0,
            csrfAttempts: 0,
            rateLimitHits: 0,
            geoBlocks: 0,
            ipBlocks: 0
        };
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
                    filename: 'logs/security-middleware.log',
                    maxsize: 50 * 1024 * 1024,
                    maxFiles: 10
                }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    initializeRateLimiters() {
        const rateLimiterOptions = {
            storeClient: this.redis,
            points: 100, // Requests allowed
            duration: 60, // Per 60 seconds
            blockDuration: 300, // Block for 5 minutes
        };

        // General API rate limiter
        this.apiLimiter = this.redis 
            ? new RateLimiterRedis({ ...rateLimiterOptions, keyPrefix: 'api_' })
            : new RateLimiterMemory(rateLimiterOptions);

        // Strict rate limiter for authentication endpoints
        this.authLimiter = this.redis
            ? new RateLimiterRedis({
                ...rateLimiterOptions,
                keyPrefix: 'auth_',
                points: 5,
                blockDuration: 900 // Block for 15 minutes
              })
            : new RateLimiterMemory({
                points: 5,
                duration: 60,
                blockDuration: 900
              });

        // Heavy operation limiter
        this.heavyLimiter = this.redis
            ? new RateLimiterRedis({
                ...rateLimiterOptions,
                keyPrefix: 'heavy_',
                points: 10,
                duration: 300 // Per 5 minutes
              })
            : new RateLimiterMemory({
                points: 10,
                duration: 300
              });
    }

    /**
     * Security Headers Middleware
     */
    securityHeaders() {
        return helmet({
            contentSecurityPolicy: this.options.enableCSP ? {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'",
                        "'unsafe-inline'", // Only for development
                        "https://cdn.jsdelivr.net",
                        "https://unpkg.com"
                    ],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        "https://fonts.googleapis.com"
                    ],
                    fontSrc: [
                        "'self'",
                        "https://fonts.gstatic.com"
                    ],
                    imgSrc: [
                        "'self'",
                        "data:",
                        "https://images.unsplash.com",
                        "https://via.placeholder.com"
                    ],
                    connectSrc: [
                        "'self'",
                        "https://api.marketing-hub.com"
                    ],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    manifestSrc: ["'self'"],
                    workerSrc: ["'self'"],
                    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
                }
            } : false,
            
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true,
                preload: true
            },
            
            frameguard: { action: 'deny' },
            noSniff: true,
            xssFilter: true,
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
            
            // Custom security headers
            customHeaders: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
                'X-Permitted-Cross-Domain-Policies': 'none',
                'X-Download-Options': 'noopen',
                'X-DNS-Prefetch-Control': 'off'
            }
        });
    }

    /**
     * Rate Limiting Middleware
     */
    rateLimiting(type = 'api') {
        return async (req, res, next) => {
            if (!this.options.enableRateLimit) {
                return next();
            }

            try {
                let limiter;
                switch (type) {
                    case 'auth':
                        limiter = this.authLimiter;
                        break;
                    case 'heavy':
                        limiter = this.heavyLimiter;
                        break;
                    default:
                        limiter = this.apiLimiter;
                }

                const key = this.getRateLimitKey(req);
                await limiter.consume(key);
                
                next();
            } catch (rateLimiterRes) {
                this.securityMetrics.rateLimitHits++;
                
                this.logger.warn('Rate limit exceeded', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                    userAgent: req.get('User-Agent'),
                    type
                });

                res.set('Retry-After', Math.round(rateLimiterRes.msBeforeNext / 1000));
                res.status(429).json({
                    error: 'Too Many Requests',
                    retryAfter: rateLimiterRes.msBeforeNext
                });
            }
        };
    }

    getRateLimitKey(req) {
        // Use user ID if authenticated, otherwise IP
        const userId = req.user?.id;
        return userId ? `user:${userId}` : `ip:${req.ip}`;
    }

    /**
     * Input Validation and Sanitization Middleware
     */
    inputValidation() {
        return (req, res, next) => {
            if (!this.options.enableInputValidation) {
                return next();
            }

            try {
                // Sanitize request body
                if (req.body && typeof req.body === 'object') {
                    req.body = this.sanitizeObject(req.body);
                }

                // Sanitize query parameters
                if (req.query && typeof req.query === 'object') {
                    req.query = this.sanitizeObject(req.query);
                }

                // Sanitize URL parameters
                if (req.params && typeof req.params === 'object') {
                    req.params = this.sanitizeObject(req.params);
                }

                // Check for SQL injection patterns
                this.detectSQLInjection(req);

                // Check for XSS attempts
                this.detectXSS(req);

                next();
            } catch (error) {
                this.logger.error('Input validation failed', {
                    error: error.message,
                    ip: req.ip,
                    path: req.path,
                    method: req.method
                });
                
                res.status(400).json({
                    error: 'Invalid input detected',
                    message: 'Request contains potentially malicious content'
                });
            }
        };
    }

    sanitizeObject(obj, depth = 0) {
        if (depth > 10) return obj; // Prevent deep recursion

        const sanitized = {};
        
        for (const [key, value] of Object.entries(obj)) {
            const cleanKey = this.sanitizeString(key);
            
            if (typeof value === 'string') {
                sanitized[cleanKey] = this.sanitizeString(value);
            } else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    sanitized[cleanKey] = value.map(item => 
                        typeof item === 'string' ? this.sanitizeString(item) : 
                        typeof item === 'object' ? this.sanitizeObject(item, depth + 1) : item
                    );
                } else {
                    sanitized[cleanKey] = this.sanitizeObject(value, depth + 1);
                }
            } else {
                sanitized[cleanKey] = value;
            }
        }
        
        return sanitized;
    }

    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        // Remove null bytes and control characters
        let cleaned = str.replace(/[\x00-\x1F\x7F]/g, '');
        
        // XSS protection
        cleaned = xss(cleaned, {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
        });
        
        // Additional sanitization
        cleaned = validator.escape(cleaned);
        
        return cleaned;
    }

    detectSQLInjection(req) {
        const sqlInjectionPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
            /('|(\\')|(;|%3B)|(--)|(%2D%2D))/gi,
            /(\b(OR|AND)\b.*?[=<>])/gi,
            /(\/\*|\*\/|@@|@)/gi
        ];

        const requestContent = JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params
        });

        for (const pattern of sqlInjectionPatterns) {
            if (pattern.test(requestContent)) {
                this.securityMetrics.sqlInjectionAttempts++;
                
                this.logger.warn('SQL injection attempt detected', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                    pattern: pattern.toString(),
                    content: requestContent.substring(0, 500)
                });
                
                throw new Error('SQL injection pattern detected');
            }
        }
    }

    detectXSS(req) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^>]*>/gi,
            /<object\b[^>]*>/gi,
            /<embed\b[^>]*>/gi,
            /<link\b[^>]*>/gi
        ];

        const requestContent = JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params
        });

        for (const pattern of xssPatterns) {
            if (pattern.test(requestContent)) {
                this.securityMetrics.xssAttempts++;
                
                this.logger.warn('XSS attempt detected', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                    pattern: pattern.toString(),
                    userAgent: req.get('User-Agent')
                });
                
                throw new Error('XSS pattern detected');
            }
        }
    }

    /**
     * CSRF Protection Middleware
     */
    csrfProtection() {
        return (req, res, next) => {
            if (!this.options.enableCSRF) {
                return next();
            }

            // Skip CSRF for GET requests and API authentication
            if (req.method === 'GET' || req.path.startsWith('/api/auth/login')) {
                return next();
            }

            const token = req.headers['x-csrf-token'] || req.body._csrf;
            const sessionId = req.sessionID || req.headers['x-session-id'];

            if (!token || !sessionId) {
                this.securityMetrics.csrfAttempts++;
                
                this.logger.warn('CSRF token missing', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method
                });
                
                return res.status(403).json({
                    error: 'CSRF token required'
                });
            }

            const storedToken = this.csrfTokens.get(sessionId);
            if (!storedToken || !this.verifyCSRFToken(token, storedToken)) {
                this.securityMetrics.csrfAttempts++;
                
                this.logger.warn('Invalid CSRF token', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                    sessionId
                });
                
                return res.status(403).json({
                    error: 'Invalid CSRF token'
                });
            }

            next();
        };
    }

    generateCSRFToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        this.csrfTokens.set(sessionId, token);
        
        // Clean up old tokens periodically
        setTimeout(() => {
            this.csrfTokens.delete(sessionId);
        }, 24 * 60 * 60 * 1000); // 24 hours
        
        return token;
    }

    verifyCSRFToken(providedToken, storedToken) {
        return crypto.timingSafeEqual(
            Buffer.from(providedToken, 'hex'),
            Buffer.from(storedToken, 'hex')
        );
    }

    /**
     * IP and Geo-blocking Middleware
     */
    accessControl() {
        return (req, res, next) => {
            const clientIP = req.ip;

            // Check IP whitelist
            if (this.options.ipWhitelist.length > 0) {
                if (!this.isIPInList(clientIP, this.options.ipWhitelist)) {
                    this.securityMetrics.ipBlocks++;
                    
                    this.logger.warn('IP not in whitelist', {
                        ip: clientIP,
                        path: req.path
                    });
                    
                    return res.status(403).json({
                        error: 'Access denied'
                    });
                }
            }

            // Check IP blacklist
            if (this.isIPInList(clientIP, this.options.ipBlacklist)) {
                this.securityMetrics.ipBlocks++;
                
                this.logger.warn('IP blacklisted', {
                    ip: clientIP,
                    path: req.path
                });
                
                return res.status(403).json({
                    error: 'Access denied'
                });
            }

            // Geo-blocking
            if (this.options.enableGeoBlocking) {
                const geo = geoip.lookup(clientIP);
                if (geo) {
                    const country = geo.country;
                    
                    // Check blocked countries
                    if (this.options.blockedCountries.includes(country)) {
                        this.securityMetrics.geoBlocks++;
                        
                        this.logger.warn('Geographic access blocked', {
                            ip: clientIP,
                            country,
                            path: req.path
                        });
                        
                        return res.status(403).json({
                            error: 'Access denied from your location'
                        });
                    }
                    
                    // Check allowed countries (if specified)
                    if (this.options.allowedCountries.length > 0 && 
                        !this.options.allowedCountries.includes(country)) {
                        this.securityMetrics.geoBlocks++;
                        
                        this.logger.warn('Geographic access restricted', {
                            ip: clientIP,
                            country,
                            path: req.path
                        });
                        
                        return res.status(403).json({
                            error: 'Access restricted to certain regions'
                        });
                    }
                }
            }

            next();
        };
    }

    isIPInList(ip, ipList) {
        return ipList.some(listItem => {
            if (listItem.includes('/')) {
                // CIDR notation
                return this.isIPInCIDR(ip, listItem);
            } else {
                // Exact match
                return ip === listItem;
            }
        });
    }

    isIPInCIDR(ip, cidr) {
        const [range, bits] = cidr.split('/');
        const mask = ~(2 ** (32 - bits) - 1);
        
        return (this.ip2int(ip) & mask) === (this.ip2int(range) & mask);
    }

    ip2int(ip) {
        return ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    /**
     * Request Size Limiting
     */
    requestSizeLimit() {
        return (req, res, next) => {
            const maxSize = this.parseSize(this.options.maxRequestSize);
            
            req.on('data', (chunk) => {
                req.body = req.body || Buffer.alloc(0);
                req.body = Buffer.concat([req.body, chunk]);
                
                if (req.body.length > maxSize) {
                    this.logger.warn('Request size limit exceeded', {
                        ip: req.ip,
                        size: req.body.length,
                        maxSize,
                        path: req.path
                    });
                    
                    res.status(413).json({
                        error: 'Request entity too large'
                    });
                    return;
                }
            });
            
            next();
        };
    }

    parseSize(sizeStr) {
        const match = sizeStr.match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)$/i);
        if (!match) return 1024 * 1024; // Default 1MB
        
        const size = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        const multipliers = {
            'b': 1,
            'kb': 1024,
            'mb': 1024 * 1024,
            'gb': 1024 * 1024 * 1024
        };
        
        return size * multipliers[unit];
    }

    /**
     * Security Monitoring and Metrics
     */
    getSecurityMetrics() {
        return {
            ...this.securityMetrics,
            timestamp: new Date().toISOString()
        };
    }

    resetSecurityMetrics() {
        Object.keys(this.securityMetrics).forEach(key => {
            this.securityMetrics[key] = 0;
        });
    }
}

module.exports = SecurityMiddleware;