/**
 * Enterprise-Grade JWT Authentication Service
 * Zero-Trust Security Implementation with Multi-Factor Authentication
 * 
 * Features:
 * - JWT token generation with short TTL and refresh tokens
 * - Role-based access control (RBAC) with principle of least privilege
 * - Multi-factor authentication support
 * - Token rotation and blacklisting
 * - Audit logging for all authentication events
 * - Rate limiting and brute force protection
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const winston = require('winston');
const RateLimiter = require('rate-limiter-flexible').RateLimiterRedis;
const Redis = require('redis');

class JWTAuthService {
    constructor() {
        this.redis = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        // JWT Configuration
        this.accessTokenTTL = 15 * 60; // 15 minutes
        this.refreshTokenTTL = 7 * 24 * 60 * 60; // 7 days
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || this.generateSecureSecret();
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || this.generateSecureSecret();
        
        // Rate limiting configuration
        this.loginLimiter = new RateLimiter({
            storeClient: this.redis,
            keyGenerator: (req) => `login_${req.ip}`,
            points: 5, // Number of attempts
            duration: 900, // Per 15 minutes
            blockDuration: 900, // Block for 15 minutes
        });

        this.mfaLimiter = new RateLimiter({
            storeClient: this.redis,
            keyGenerator: (req) => `mfa_${req.ip}_${req.body.userId}`,
            points: 3, // Number of MFA attempts
            duration: 300, // Per 5 minutes
            blockDuration: 1800, // Block for 30 minutes
        });

        // Security logger
        this.securityLogger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ 
                    filename: 'logs/security-audit.log',
                    maxsize: 50 * 1024 * 1024, // 50MB
                    maxFiles: 10,
                    tailable: true
                }),
                new winston.transports.Console()
            ]
        });

        // User roles and permissions
        this.roles = {
            admin: ['*'], // Full access
            manager: ['read:*', 'write:campaigns', 'write:analytics'],
            analyst: ['read:*', 'write:analytics'],
            editor: ['read:campaigns', 'write:campaigns'],
            viewer: ['read:campaigns', 'read:analytics']
        };

        this.initializeService();
    }

    async initializeService() {
        try {
            await this.redis.connect();
            this.securityLogger.info('JWT Auth Service initialized successfully');
        } catch (error) {
            this.securityLogger.error('Failed to initialize JWT Auth Service', { error: error.message });
            throw error;
        }
    }

    /**
     * Generate cryptographically secure secret
     */
    generateSecureSecret() {
        return crypto.randomBytes(64).toString('hex');
    }

    /**
     * Authenticate user with email/password and optional MFA
     */
    async authenticateUser(email, password, mfaToken = null, clientInfo = {}) {
        const authId = crypto.randomUUID();
        
        try {
            // Apply rate limiting
            await this.loginLimiter.consume(clientInfo.ip);

            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Retrieve user from database (mock implementation)
            const user = await this.getUserByEmail(email);
            if (!user) {
                this.logSecurityEvent('authentication_failed', {
                    authId,
                    email,
                    reason: 'user_not_found',
                    ip: clientInfo.ip,
                    userAgent: clientInfo.userAgent
                });
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                this.logSecurityEvent('authentication_failed', {
                    authId,
                    userId: user.id,
                    email,
                    reason: 'invalid_password',
                    ip: clientInfo.ip,
                    userAgent: clientInfo.userAgent
                });
                throw new Error('Invalid credentials');
            }

            // Check if MFA is required
            if (user.mfaEnabled) {
                if (!mfaToken) {
                    this.logSecurityEvent('mfa_required', {
                        authId,
                        userId: user.id,
                        email,
                        ip: clientInfo.ip
                    });
                    return { requiresMFA: true, authId };
                }

                // Verify MFA token
                await this.mfaLimiter.consume(`${clientInfo.ip}_${user.id}`);
                const isMFAValid = this.verifyMFAToken(user.mfaSecret, mfaToken);
                if (!isMFAValid) {
                    this.logSecurityEvent('mfa_failed', {
                        authId,
                        userId: user.id,
                        email,
                        ip: clientInfo.ip
                    });
                    throw new Error('Invalid MFA token');
                }
            }

            // Generate tokens
            const tokens = await this.generateTokenPair(user, clientInfo);

            this.logSecurityEvent('authentication_success', {
                authId,
                userId: user.id,
                email,
                ip: clientInfo.ip,
                userAgent: clientInfo.userAgent
            });

            return {
                user: this.sanitizeUser(user),
                ...tokens
            };

        } catch (error) {
            if (error.message.includes('Too Many Requests')) {
                this.logSecurityEvent('rate_limit_exceeded', {
                    authId,
                    email,
                    ip: clientInfo.ip,
                    limitType: 'login'
                });
            }
            throw error;
        }
    }

    /**
     * Generate JWT token pair (access + refresh)
     */
    async generateTokenPair(user, clientInfo = {}) {
        const tokenId = crypto.randomUUID();
        const sessionId = crypto.randomUUID();

        // Access token payload
        const accessPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: this.roles[user.role] || [],
            sessionId,
            tokenId,
            type: 'access',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.accessTokenTTL
        };

        // Refresh token payload
        const refreshPayload = {
            sub: user.id,
            sessionId,
            tokenId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.refreshTokenTTL
        };

        // Sign tokens
        const accessToken = jwt.sign(accessPayload, this.accessTokenSecret, {
            algorithm: 'HS512',
            issuer: 'marketing-hub-auth',
            audience: 'marketing-hub-api'
        });

        const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret, {
            algorithm: 'HS512',
            issuer: 'marketing-hub-auth',
            audience: 'marketing-hub-api'
        });

        // Store session information
        await this.storeSession(sessionId, {
            userId: user.id,
            tokenId,
            ip: clientInfo.ip,
            userAgent: clientInfo.userAgent,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            isActive: true
        });

        return {
            accessToken,
            refreshToken,
            accessTokenExpiresIn: this.accessTokenTTL,
            refreshTokenExpiresIn: this.refreshTokenTTL,
            tokenType: 'Bearer'
        };
    }

    /**
     * Verify and decode JWT token
     */
    async verifyToken(token, type = 'access') {
        try {
            const secret = type === 'access' ? this.accessTokenSecret : this.refreshTokenSecret;
            
            const decoded = jwt.verify(token, secret, {
                issuer: 'marketing-hub-auth',
                audience: 'marketing-hub-api',
                algorithms: ['HS512']
            });

            // Check if token is blacklisted
            const isBlacklisted = await this.redis.get(`blacklist:${decoded.tokenId}`);
            if (isBlacklisted) {
                throw new Error('Token has been revoked');
            }

            // Check session validity
            const session = await this.getSession(decoded.sessionId);
            if (!session || !session.isActive) {
                throw new Error('Session is invalid or expired');
            }

            // Update session last used
            await this.updateSessionLastUsed(decoded.sessionId);

            return decoded;

        } catch (error) {
            this.logSecurityEvent('token_verification_failed', {
                error: error.message,
                tokenType: type
            });
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken, clientInfo = {}) {
        try {
            const decoded = await this.verifyToken(refreshToken, 'refresh');
            
            // Get user data
            const user = await this.getUserById(decoded.sub);
            if (!user) {
                throw new Error('User not found');
            }

            // Generate new access token
            const tokenId = crypto.randomUUID();
            const accessPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                permissions: this.roles[user.role] || [],
                sessionId: decoded.sessionId,
                tokenId,
                type: 'access',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + this.accessTokenTTL
            };

            const accessToken = jwt.sign(accessPayload, this.accessTokenSecret, {
                algorithm: 'HS512',
                issuer: 'marketing-hub-auth',
                audience: 'marketing-hub-api'
            });

            this.logSecurityEvent('token_refreshed', {
                userId: user.id,
                sessionId: decoded.sessionId,
                ip: clientInfo.ip
            });

            return {
                accessToken,
                accessTokenExpiresIn: this.accessTokenTTL,
                tokenType: 'Bearer'
            };

        } catch (error) {
            this.logSecurityEvent('token_refresh_failed', {
                error: error.message,
                ip: clientInfo.ip
            });
            throw error;
        }
    }

    /**
     * Revoke token (logout)
     */
    async revokeToken(token, type = 'access') {
        try {
            const decoded = await this.verifyToken(token, type);
            
            // Add token to blacklist
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) {
                await this.redis.setEx(`blacklist:${decoded.tokenId}`, ttl, 'revoked');
            }

            // Deactivate session if revoking refresh token
            if (type === 'refresh') {
                await this.deactivateSession(decoded.sessionId);
            }

            this.logSecurityEvent('token_revoked', {
                userId: decoded.sub,
                tokenId: decoded.tokenId,
                sessionId: decoded.sessionId,
                tokenType: type
            });

            return true;

        } catch (error) {
            this.logSecurityEvent('token_revocation_failed', {
                error: error.message,
                tokenType: type
            });
            throw error;
        }
    }

    /**
     * Setup MFA for user
     */
    setupMFA(userId) {
        const secret = speakeasy.generateSecret({
            name: `Marketing Hub (${userId})`,
            issuer: 'Marketing Automation Hub',
            length: 32
        });

        return {
            secret: secret.base32,
            qrCode: secret.otpauth_url,
            backupCodes: this.generateBackupCodes()
        };
    }

    /**
     * Verify MFA token
     */
    verifyMFAToken(secret, token) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2 // Allow 2 time steps of variance
        });
    }

    /**
     * Generate backup codes for MFA
     */
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return codes;
    }

    /**
     * Check user permissions
     */
    hasPermission(userPermissions, requiredPermission) {
        if (userPermissions.includes('*')) {
            return true;
        }

        return userPermissions.some(permission => {
            if (permission === requiredPermission) return true;
            if (permission.endsWith('*')) {
                const prefix = permission.slice(0, -1);
                return requiredPermission.startsWith(prefix);
            }
            return false;
        });
    }

    /**
     * Session management
     */
    async storeSession(sessionId, sessionData) {
        await this.redis.setEx(`session:${sessionId}`, this.refreshTokenTTL, JSON.stringify(sessionData));
    }

    async getSession(sessionId) {
        const sessionData = await this.redis.get(`session:${sessionId}`);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    async updateSessionLastUsed(sessionId) {
        const session = await this.getSession(sessionId);
        if (session) {
            session.lastUsed = new Date().toISOString();
            await this.storeSession(sessionId, session);
        }
    }

    async deactivateSession(sessionId) {
        const session = await this.getSession(sessionId);
        if (session) {
            session.isActive = false;
            await this.storeSession(sessionId, session);
        }
    }

    /**
     * Security logging
     */
    logSecurityEvent(eventType, eventData) {
        this.securityLogger.info('Security Event', {
            event: eventType,
            timestamp: new Date().toISOString(),
            ...eventData
        });
    }

    /**
     * User data helpers (mock implementation - replace with actual database)
     */
    async getUserByEmail(email) {
        // Mock implementation - replace with actual database query
        const mockUsers = {
            'admin@example.com': {
                id: '1',
                email: 'admin@example.com',
                passwordHash: await bcrypt.hash('admin123', 12),
                role: 'admin',
                mfaEnabled: true,
                mfaSecret: 'JBSWY3DPEHPK3PXP'
            }
        };
        return mockUsers[email] || null;
    }

    async getUserById(id) {
        // Mock implementation - replace with actual database query
        const mockUser = {
            id: '1',
            email: 'admin@example.com',
            role: 'admin',
            mfaEnabled: true,
            mfaSecret: 'JBSWY3DPEHPK3PXP'
        };
        return id === '1' ? mockUser : null;
    }

    sanitizeUser(user) {
        const { passwordHash, mfaSecret, ...sanitized } = user;
        return sanitized;
    }
}

module.exports = JWTAuthService;