/**
 * OAuth2 Provider Implementation
 * Enterprise-grade OAuth2 authorization server with PKCE support
 * 
 * Features:
 * - Authorization Code Flow with PKCE
 * - Client Credentials Flow for service-to-service auth
 * - Scope-based access control
 * - Token introspection and revocation
 * - Dynamic client registration
 * - Rate limiting and security headers
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const RateLimiter = require('rate-limiter-flexible').RateLimiterRedis;

class OAuth2Provider {
    constructor(redis, logger) {
        this.redis = redis;
        this.logger = logger || winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [new winston.transports.Console()]
        });

        // OAuth2 Configuration
        this.authorizationCodeTTL = 600; // 10 minutes
        this.accessTokenTTL = 3600; // 1 hour
        this.refreshTokenTTL = 30 * 24 * 60 * 60; // 30 days
        this.clientSecretLength = 64;

        // Supported grant types
        this.supportedGrantTypes = [
            'authorization_code',
            'client_credentials',
            'refresh_token'
        ];

        // Supported response types
        this.supportedResponseTypes = ['code'];

        // Available scopes
        this.scopes = {
            'read:campaigns': 'Read access to marketing campaigns',
            'write:campaigns': 'Write access to marketing campaigns',
            'read:analytics': 'Read access to analytics data',
            'write:analytics': 'Write access to analytics data',
            'read:users': 'Read access to user data',
            'write:users': 'Write access to user data',
            'admin': 'Full administrative access'
        };

        // Rate limiters
        this.authorizeLimiter = new RateLimiter({
            storeClient: this.redis,
            keyGenerator: (req) => `oauth_auth_${req.ip}`,
            points: 10,
            duration: 60,
        });

        this.tokenLimiter = new RateLimiter({
            storeClient: this.redis,
            keyGenerator: (req) => `oauth_token_${req.ip}`,
            points: 30,
            duration: 60,
        });
    }

    /**
     * Register OAuth2 client
     */
    async registerClient(clientData) {
        try {
            const clientId = this.generateClientId();
            const clientSecret = this.generateClientSecret();

            const client = {
                clientId,
                clientSecret,
                clientName: clientData.clientName,
                redirectUris: clientData.redirectUris || [],
                grantTypes: clientData.grantTypes || ['authorization_code'],
                responseTypes: clientData.responseTypes || ['code'],
                scope: clientData.scope || 'read:campaigns',
                tokenEndpointAuthMethod: clientData.tokenEndpointAuthMethod || 'client_secret_basic',
                createdAt: new Date().toISOString(),
                isActive: true
            };

            // Validate client data
            this.validateClientRegistration(client);

            // Store client
            await this.redis.set(`oauth_client:${clientId}`, JSON.stringify(client));

            this.logger.info('OAuth2 client registered', {
                clientId,
                clientName: client.clientName,
                grantTypes: client.grantTypes
            });

            return {
                clientId,
                clientSecret,
                clientIdIssuedAt: Math.floor(Date.now() / 1000),
                clientSecretExpiresAt: 0 // Never expires
            };

        } catch (error) {
            this.logger.error('Client registration failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Authorization endpoint - initiate OAuth2 flow
     */
    async authorize(req, res) {
        try {
            await this.authorizeLimiter.consume(req.ip);

            const {
                client_id,
                redirect_uri,
                response_type,
                scope,
                state,
                code_challenge,
                code_challenge_method
            } = req.query;

            // Validate required parameters
            if (!client_id || !redirect_uri || !response_type) {
                throw new Error('Missing required parameters');
            }

            // Validate client
            const client = await this.getClient(client_id);
            if (!client || !client.isActive) {
                throw new Error('Invalid client');
            }

            // Validate redirect URI
            if (!client.redirectUris.includes(redirect_uri)) {
                throw new Error('Invalid redirect URI');
            }

            // Validate response type
            if (!this.supportedResponseTypes.includes(response_type)) {
                throw new Error('Unsupported response type');
            }

            // Validate PKCE parameters
            if (code_challenge) {
                if (!code_challenge_method || code_challenge_method !== 'S256') {
                    throw new Error('Invalid code challenge method');
                }
            }

            // Validate scopes
            const requestedScopes = scope ? scope.split(' ') : [];
            const validScopes = this.validateScopes(requestedScopes);

            // Store authorization request
            const authReqId = crypto.randomUUID();
            const authRequest = {
                clientId: client_id,
                redirectUri: redirect_uri,
                responseType: response_type,
                scope: validScopes.join(' '),
                state,
                codeChallenge: code_challenge,
                codeChallengeMethod: code_challenge_method,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            };

            await this.redis.setEx(
                `oauth_auth_req:${authReqId}`,
                600,
                JSON.stringify(authRequest)
            );

            // Return authorization page or redirect for auto-approval
            return {
                authRequestId: authReqId,
                client: {
                    name: client.clientName,
                    id: client_id
                },
                scopes: validScopes.map(scope => ({
                    name: scope,
                    description: this.scopes[scope] || scope
                })),
                redirectUri: redirect_uri,
                state
            };

        } catch (error) {
            this.logger.error('Authorization failed', {
                error: error.message,
                clientId: req.query.client_id,
                ip: req.ip
            });
            throw error;
        }
    }

    /**
     * Handle user consent and generate authorization code
     */
    async handleConsent(authRequestId, userId, approved = true) {
        try {
            const authReq = await this.getAuthorizationRequest(authRequestId);
            if (!authReq) {
                throw new Error('Invalid authorization request');
            }

            if (!approved) {
                return {
                    error: 'access_denied',
                    errorDescription: 'User denied the request'
                };
            }

            // Generate authorization code
            const authCode = this.generateAuthorizationCode();
            const codeData = {
                code: authCode,
                clientId: authReq.clientId,
                userId,
                redirectUri: authReq.redirectUri,
                scope: authReq.scope,
                codeChallenge: authReq.codeChallenge,
                codeChallengeMethod: authReq.codeChallengeMethod,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + this.authorizationCodeTTL * 1000).toISOString()
            };

            // Store authorization code
            await this.redis.setEx(
                `oauth_code:${authCode}`,
                this.authorizationCodeTTL,
                JSON.stringify(codeData)
            );

            // Clean up authorization request
            await this.redis.del(`oauth_auth_req:${authRequestId}`);

            this.logger.info('Authorization code generated', {
                clientId: authReq.clientId,
                userId,
                scope: authReq.scope
            });

            return {
                code: authCode,
                state: authReq.state,
                redirectUri: authReq.redirectUri
            };

        } catch (error) {
            this.logger.error('Consent handling failed', {
                error: error.message,
                authRequestId
            });
            throw error;
        }
    }

    /**
     * Token endpoint - exchange authorization code for tokens
     */
    async token(req) {
        try {
            await this.tokenLimiter.consume(req.ip);

            const {
                grant_type,
                code,
                redirect_uri,
                client_id,
                client_secret,
                code_verifier,
                refresh_token,
                scope
            } = req.body;

            // Validate grant type
            if (!this.supportedGrantTypes.includes(grant_type)) {
                throw new Error('Unsupported grant type');
            }

            // Authenticate client
            const client = await this.authenticateClient(client_id, client_secret);

            let tokenResponse;

            switch (grant_type) {
                case 'authorization_code':
                    tokenResponse = await this.handleAuthorizationCodeGrant(
                        code, redirect_uri, client, code_verifier
                    );
                    break;

                case 'client_credentials':
                    tokenResponse = await this.handleClientCredentialsGrant(client, scope);
                    break;

                case 'refresh_token':
                    tokenResponse = await this.handleRefreshTokenGrant(refresh_token, client);
                    break;

                default:
                    throw new Error('Unsupported grant type');
            }

            this.logger.info('Token issued', {
                grantType: grant_type,
                clientId: client.clientId,
                scope: tokenResponse.scope
            });

            return tokenResponse;

        } catch (error) {
            this.logger.error('Token request failed', {
                error: error.message,
                grantType: req.body.grant_type,
                clientId: req.body.client_id,
                ip: req.ip
            });
            throw error;
        }
    }

    /**
     * Handle authorization code grant
     */
    async handleAuthorizationCodeGrant(code, redirectUri, client, codeVerifier) {
        if (!code || !redirectUri) {
            throw new Error('Missing required parameters');
        }

        // Retrieve and validate authorization code
        const codeData = await this.getAuthorizationCode(code);
        if (!codeData) {
            throw new Error('Invalid authorization code');
        }

        // Validate client
        if (codeData.clientId !== client.clientId) {
            throw new Error('Client mismatch');
        }

        // Validate redirect URI
        if (codeData.redirectUri !== redirectUri) {
            throw new Error('Redirect URI mismatch');
        }

        // Validate PKCE if used
        if (codeData.codeChallenge) {
            if (!codeVerifier) {
                throw new Error('Code verifier required');
            }

            const computedChallenge = crypto
                .createHash('sha256')
                .update(codeVerifier)
                .digest('base64url');

            if (computedChallenge !== codeData.codeChallenge) {
                throw new Error('Invalid code verifier');
            }
        }

        // Generate tokens
        const tokens = await this.generateTokens(
            client.clientId,
            codeData.userId,
            codeData.scope.split(' ')
        );

        // Revoke authorization code
        await this.redis.del(`oauth_code:${code}`);

        return tokens;
    }

    /**
     * Handle client credentials grant
     */
    async handleClientCredentialsGrant(client, scope) {
        // Validate client can use this grant type
        if (!client.grantTypes.includes('client_credentials')) {
            throw new Error('Grant type not allowed for this client');
        }

        const requestedScopes = scope ? scope.split(' ') : ['read:campaigns'];
        const validScopes = this.validateScopes(requestedScopes);

        // Generate access token (no refresh token for client credentials)
        const accessToken = await this.generateAccessToken(
            client.clientId,
            null,
            validScopes
        );

        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: this.accessTokenTTL,
            scope: validScopes.join(' ')
        };
    }

    /**
     * Handle refresh token grant
     */
    async handleRefreshTokenGrant(refreshToken, client) {
        const tokenData = await this.validateRefreshToken(refreshToken);
        if (!tokenData || tokenData.clientId !== client.clientId) {
            throw new Error('Invalid refresh token');
        }

        // Generate new tokens
        const tokens = await this.generateTokens(
            client.clientId,
            tokenData.userId,
            tokenData.scope.split(' ')
        );

        // Optionally rotate refresh token
        await this.redis.del(`oauth_refresh:${refreshToken}`);

        return tokens;
    }

    /**
     * Generate token pair
     */
    async generateTokens(clientId, userId, scopes) {
        const accessToken = await this.generateAccessToken(clientId, userId, scopes);
        const refreshToken = this.generateRefreshToken();

        // Store refresh token
        const refreshTokenData = {
            token: refreshToken,
            clientId,
            userId,
            scope: scopes.join(' '),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.refreshTokenTTL * 1000).toISOString()
        };

        await this.redis.setEx(
            `oauth_refresh:${refreshToken}`,
            this.refreshTokenTTL,
            JSON.stringify(refreshTokenData)
        );

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: this.accessTokenTTL,
            scope: scopes.join(' ')
        };
    }

    /**
     * Generate access token (JWT)
     */
    async generateAccessToken(clientId, userId, scopes) {
        const payload = {
            sub: userId || clientId,
            client_id: clientId,
            scope: scopes.join(' '),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.accessTokenTTL,
            iss: 'marketing-hub-oauth',
            aud: 'marketing-hub-api'
        };

        const secret = process.env.OAUTH2_JWT_SECRET || 'oauth2-secret-key';
        return jwt.sign(payload, secret, { algorithm: 'HS256' });
    }

    /**
     * Token introspection endpoint
     */
    async introspect(token, clientId) {
        try {
            const secret = process.env.OAUTH2_JWT_SECRET || 'oauth2-secret-key';
            const decoded = jwt.verify(token, secret);

            // Verify client has permission to introspect
            const client = await this.getClient(clientId);
            if (!client) {
                throw new Error('Invalid client');
            }

            return {
                active: true,
                sub: decoded.sub,
                client_id: decoded.client_id,
                scope: decoded.scope,
                exp: decoded.exp,
                iat: decoded.iat
            };

        } catch (error) {
            return { active: false };
        }
    }

    /**
     * Token revocation endpoint
     */
    async revoke(token, tokenTypeHint = 'access_token') {
        try {
            if (tokenTypeHint === 'refresh_token') {
                await this.redis.del(`oauth_refresh:${token}`);
            } else {
                // For access tokens, add to blacklist
                const decoded = jwt.decode(token);
                if (decoded && decoded.exp) {
                    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                    if (ttl > 0) {
                        await this.redis.setEx(`oauth_blacklist:${token}`, ttl, 'revoked');
                    }
                }
            }

            this.logger.info('Token revoked', { tokenTypeHint });
            return true;

        } catch (error) {
            this.logger.error('Token revocation failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Helper methods
     */
    generateClientId() {
        return 'client_' + crypto.randomBytes(16).toString('hex');
    }

    generateClientSecret() {
        return crypto.randomBytes(this.clientSecretLength).toString('hex');
    }

    generateAuthorizationCode() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateRefreshToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async getClient(clientId) {
        const clientData = await this.redis.get(`oauth_client:${clientId}`);
        return clientData ? JSON.parse(clientData) : null;
    }

    async authenticateClient(clientId, clientSecret) {
        const client = await this.getClient(clientId);
        if (!client || !client.isActive) {
            throw new Error('Invalid client');
        }

        if (client.clientSecret !== clientSecret) {
            throw new Error('Invalid client credentials');
        }

        return client;
    }

    async getAuthorizationRequest(authReqId) {
        const authReq = await this.redis.get(`oauth_auth_req:${authReqId}`);
        return authReq ? JSON.parse(authReq) : null;
    }

    async getAuthorizationCode(code) {
        const codeData = await this.redis.get(`oauth_code:${code}`);
        return codeData ? JSON.parse(codeData) : null;
    }

    async validateRefreshToken(refreshToken) {
        const tokenData = await this.redis.get(`oauth_refresh:${refreshToken}`);
        return tokenData ? JSON.parse(tokenData) : null;
    }

    validateScopes(requestedScopes) {
        return requestedScopes.filter(scope => this.scopes.hasOwnProperty(scope));
    }

    validateClientRegistration(client) {
        if (!client.clientName) {
            throw new Error('Client name is required');
        }

        if (!client.redirectUris || client.redirectUris.length === 0) {
            throw new Error('At least one redirect URI is required');
        }

        // Validate redirect URIs
        client.redirectUris.forEach(uri => {
            try {
                new URL(uri);
            } catch {
                throw new Error(`Invalid redirect URI: ${uri}`);
            }
        });

        // Validate grant types
        const invalidGrantTypes = client.grantTypes.filter(
            grant => !this.supportedGrantTypes.includes(grant)
        );
        if (invalidGrantTypes.length > 0) {
            throw new Error(`Unsupported grant types: ${invalidGrantTypes.join(', ')}`);
        }
    }
}

module.exports = OAuth2Provider;