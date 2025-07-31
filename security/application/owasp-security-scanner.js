/**
 * OWASP Security Scanner
 * Automated vulnerability scanner for OWASP Top 10 and beyond
 * 
 * Features:
 * - OWASP Top 10 vulnerability detection
 * - Static Application Security Testing (SAST)
 * - Dynamic Application Security Testing (DAST)
 * - Dependency vulnerability scanning
 * - Code quality and security metrics
 * - CI/CD pipeline integration
 * - Detailed vulnerability reporting
 * - Remediation guidance
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const winston = require('winston');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class OWASPSecurityScanner {
    constructor(options = {}) {
        this.options = {
            projectPath: options.projectPath || process.cwd(),
            includePatterns: options.includePatterns || ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
            excludePatterns: options.excludePatterns || ['**/node_modules/**', '**/dist/**', '**/build/**'],
            severity: options.severity || 'medium', // low, medium, high, critical
            outputFormat: options.outputFormat || 'json',
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            enableSAST: options.enableSAST !== false,
            enableDAST: options.enableDAST !== false,
            enableDependencyCheck: options.enableDependencyCheck !== false,
            ...options
        };

        this.logger = options.logger || this.createLogger();
        
        // Vulnerability patterns for OWASP Top 10
        this.vulnerabilityPatterns = this.initializeVulnerabilityPatterns();
        
        // Scan results
        this.scanResults = {
            scanId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            projectPath: this.options.projectPath,
            vulnerabilities: [],
            summary: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            },
            metrics: {
                filesScanned: 0,
                linesOfCode: 0,
                scanDuration: 0,
                coverage: 0
            }
        };
        
        // Security rules configuration
        this.securityRules = this.loadSecurityRules();
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
                    filename: 'logs/security-scanner.log',
                    maxsize: 50 * 1024 * 1024,
                    maxFiles: 10
                }),
                new winston.transports.Console()
            ]
        });
    }

    initializeVulnerabilityPatterns() {
        return {
            // A01:2021 – Broken Access Control
            brokenAccessControl: {
                patterns: [
                    // Missing authorization checks
                    /app\.(get|post|put|delete|patch)\s*\([^,]+,\s*(?:async\s*)?\([^)]*\)\s*=>\s*{[^}]*res\.(json|send)/gm,
                    // Insecure direct object references
                    /req\.(params|query|body)\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?:===|==|\!=|!==)?\s*req\.user/gm,
                    // Missing access control on sensitive operations
                    /\.(delete|update|destroy|remove)\s*\([^)]*\)\s*(?!.*(?:auth|permission|role|access))/gm,
                    // Elevation of privilege
                    /req\.user\.(role|permission|isAdmin)\s*=\s*['"](admin|root|superuser)/gm
                ],
                severity: 'high',
                category: 'Access Control',
                cwe: 'CWE-284'
            },

            // A02:2021 – Cryptographic Failures
            cryptographicFailures: {
                patterns: [
                    // Weak encryption algorithms
                    /(MD5|SHA1|DES|3DES|RC4)\s*\(/gi,
                    // Hardcoded cryptographic keys
                    /(key|secret|password|token)\s*[:=]\s*['"]\w{16,}['"]/gi,
                    // Insecure random number generation
                    /Math\.random\(\)/g,
                    // Weak SSL/TLS configuration
                    /rejectUnauthorized\s*:\s*false/g,
                    // Unencrypted sensitive data storage
                    /localStorage\.(setItem|set)\([^)]*(?:password|token|secret|key)/gi
                ],
                severity: 'high',
                category: 'Cryptography',
                cwe: 'CWE-327'
            },

            // A03:2021 – Injection
            injection: {
                patterns: [
                    // SQL Injection
                    /\.(query|execute|exec)\s*\(\s*['"]\s*SELECT\s+.*\+.*['"]/gi,
                    /\.(query|execute|exec)\s*\(\s*["`'].*\$\{.*\}.*["`']/g,
                    // NoSQL Injection
                    /\.(find|findOne|update|remove)\s*\(\s*req\.(body|params|query)/g,
                    // Command Injection
                    /(exec|spawn|system)\s*\([^)]*req\.(body|params|query)/g,
                    // LDAP Injection
                    /new\s+ActiveDirectory\([^)]*req\.(body|params|query)/g,
                    // Template Injection
                    /\.(render|compile)\s*\([^)]*req\.(body|params|query)/g
                ],
                severity: 'critical',
                category: 'Injection',
                cwe: 'CWE-89'
            },

            // A04:2021 – Insecure Design
            insecureDesign: {
                patterns: [
                    // Missing rate limiting
                    /app\.(post|put|patch)\s*\([^,]+,\s*(?!.*rateLimit).*\=>/g,
                    // Business logic flaws
                    /if\s*\(\s*req\.user\.balance\s*>=\s*amount\s*\)/g,
                    // Missing input validation
                    /req\.(body|params|query)\.[a-zA-Z_$][a-zA-Z0-9_$]*\s*(?!.*(?:validate|sanitize|check))/g,
                    // Insecure defaults
                    /debug\s*:\s*true/g
                ],
                severity: 'medium',
                category: 'Design',
                cwe: 'CWE-209'
            },

            // A05:2021 – Security Misconfiguration
            securityMisconfiguration: {
                patterns: [
                    // Debug mode enabled
                    /(DEBUG|NODE_ENV)\s*=\s*['"](?:true|development)['"]/g,
                    // Default credentials
                    /(password|pass|pwd)\s*[:=]\s*['"](?:admin|password|123456|default)['"]/gi,
                    // Insecure CORS configuration
                    /cors\s*\(\s*\{\s*origin\s*:\s*['"]\*['"]/g,
                    // Missing security headers
                    /app\.use\s*\(\s*helmet\s*\(\s*\)\s*\)/g,
                    // Verbose error messages
                    /res\.(status\(500\)|json)\s*\([^)]*error\.(message|stack)/g
                ],
                severity: 'medium',
                category: 'Configuration',
                cwe: 'CWE-16'
            },

            // A06:2021 – Vulnerable and Outdated Components
            vulnerableComponents: {
                patterns: [
                    // Outdated dependencies (would need package.json analysis)
                    /require\s*\(\s*['"](?:express|lodash|moment|request)['"]\s*\)/g,
                    // Known vulnerable packages
                    /require\s*\(\s*['"](?:node-serialize|serialize-javascript)['"]\s*\)/g
                ],
                severity: 'high',
                category: 'Dependencies',
                cwe: 'CWE-1104'
            },

            // A07:2021 – Identification and Authentication Failures
            authFailures: {
                patterns: [
                    // Weak password requirements
                    /password\.length\s*>=?\s*[1-5]/g,
                    // Missing password hashing
                    /password\s*[:=]\s*req\.(body|params)\.password/g,
                    // Insecure session management
                    /express-session.*secret\s*:\s*['"](?:secret|password|123456)['"]/g,
                    // Missing multi-factor authentication
                    /\/login.*(?!.*(?:mfa|2fa|totp))/g,
                    // Predictable session IDs
                    /sessionID\s*=\s*Math\.random/g
                ],
                severity: 'high',
                category: 'Authentication',
                cwe: 'CWE-287'
            },

            // A08:2021 – Software and Data Integrity Failures
            integrityFailures: {
                patterns: [
                    // Insecure deserialization
                    /JSON\.parse\s*\(\s*req\.(body|params|query)/g,
                    // Unsafe eval usage
                    /eval\s*\(/g,
                    // Insecure file uploads
                    /multer\s*\(\s*\{[^}]*(?!.*fileFilter)/g,
                    // Missing integrity checks
                    /require\s*\(\s*['"]https?:\/\/[^'"]+['"]\s*\)/g
                ],
                severity: 'high',
                category: 'Integrity',
                cwe: 'CWE-502'
            },

            // A09:2021 – Security Logging and Monitoring Failures
            loggingFailures: {
                patterns: [
                    // Missing security logging
                    /\.(login|logout|delete|update).*(?!.*(?:log|audit))/g,
                    // Logging sensitive data
                    /console\.log.*(?:password|token|secret|key)/gi,
                    // Missing error handling
                    /\.(catch|on\s*\(\s*['"]error['"])\s*\(\s*\)\s*=>\s*\{\s*\}/g
                ],
                severity: 'medium',
                category: 'Logging',
                cwe: 'CWE-778'
            },

            // A10:2021 – Server-Side Request Forgery (SSRF)
            ssrf: {
                patterns: [
                    // Unvalidated URL requests
                    /(axios|fetch|request)\s*\(\s*req\.(body|params|query)/g,
                    // HTTP client with user input
                    /http\.(get|request)\s*\([^)]*req\.(body|params|query)/g,
                    // File system operations with user input
                    /fs\.(readFile|writeFile|stat)\s*\([^)]*req\.(body|params|query)/g
                ],
                severity: 'high',
                category: 'SSRF',
                cwe: 'CWE-918'
            },

            // Additional security patterns
            informationDisclosure: {
                patterns: [
                    // Exposed configuration
                    /\.env|config\.js|settings\.json/g,
                    // Stack traces in responses
                    /res\.(json|send)\s*\([^)]*error\.stack/g,
                    // Version disclosure
                    /X-Powered-By|Server:/gi
                ],
                severity: 'low',
                category: 'Information Disclosure',
                cwe: 'CWE-200'
            },

            // Cross-Site Scripting (XSS)
            xss: {
                patterns: [
                    // Unescaped output
                    /res\.(send|json)\s*\([^)]*req\.(body|params|query)(?!.*(?:escape|sanitize))/g,
                    // Dangerous DOM manipulation
                    /innerHTML\s*=\s*.*req\.(body|params|query)/g,
                    // Missing CSP headers
                    /helmet\(\)(?!.*contentSecurityPolicy)/g
                ],
                severity: 'high',
                category: 'XSS',
                cwe: 'CWE-79'
            }
        };
    }

    loadSecurityRules() {
        return {
            // File-based security rules
            fileRules: [
                {
                    name: 'sensitive_files',
                    pattern: /\.(key|pem|p12|pfx|crt|cer|der)$/i,
                    severity: 'high',
                    message: 'Sensitive file detected in repository'
                },
                {
                    name: 'config_files',
                    pattern: /\.(env|config|conf|ini|yaml|yml)$/i,
                    severity: 'medium',
                    message: 'Configuration file should be reviewed for sensitive data'
                }
            ],

            // Content-based security rules
            contentRules: [
                {
                    name: 'hardcoded_secrets',
                    pattern: /(password|passwd|pwd|secret|key|token|api_key|auth_token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
                    severity: 'critical',
                    message: 'Hardcoded secret detected'
                },
                {
                    name: 'ip_addresses',
                    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
                    severity: 'low',
                    message: 'Hardcoded IP address detected'
                },
                {
                    name: 'private_keys',
                    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
                    severity: 'critical',
                    message: 'Private key detected in code'
                }
            ]
        };
    }

    /**
     * Perform comprehensive security scan
     */
    async performSecurityScan() {
        const startTime = Date.now();
        
        try {
            this.logger.info('Starting security scan', {
                scanId: this.scanResults.scanId,
                projectPath: this.options.projectPath
            });

            // Reset scan results
            this.resetScanResults();

            // Perform different types of scans
            if (this.options.enableSAST) {
                await this.performSASTScan();
            }

            if (this.options.enableDependencyCheck) {
                await this.performDependencyCheck();
            }

            if (this.options.enableDAST) {
                await this.performDASTScan();
            }

            // Calculate scan duration
            this.scanResults.metrics.scanDuration = Date.now() - startTime;

            // Generate final report
            const report = await this.generateSecurityReport();

            this.logger.info('Security scan completed', {
                scanId: this.scanResults.scanId,
                duration: this.scanResults.metrics.scanDuration,
                vulnerabilities: this.scanResults.summary.total
            });

            return report;

        } catch (error) {
            this.logger.error('Security scan failed', {
                error: error.message,
                scanId: this.scanResults.scanId
            });
            throw error;
        }
    }

    resetScanResults() {
        this.scanResults = {
            scanId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            projectPath: this.options.projectPath,
            vulnerabilities: [],
            summary: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            },
            metrics: {
                filesScanned: 0,
                linesOfCode: 0,
                scanDuration: 0,
                coverage: 0
            }
        };
    }

    /**
     * Static Application Security Testing (SAST)
     */
    async performSASTScan() {
        this.logger.info('Performing SAST scan');

        try {
            // Get all files to scan
            const filesToScan = await this.getFilesToScan();
            
            this.scanResults.metrics.filesScanned = filesToScan.length;

            // Scan each file
            for (const filePath of filesToScan) {
                await this.scanFile(filePath);
            }

            this.logger.info('SAST scan completed', {
                filesScanned: filesToScan.length,
                vulnerabilities: this.scanResults.vulnerabilities.length
            });

        } catch (error) {
            this.logger.error('SAST scan failed', { error: error.message });
            throw error;
        }
    }

    async getFilesToScan() {
        const files = [];
        
        async function walkDirectory(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip excluded directories
                    if (!this.shouldExcludeDirectory(entry.name)) {
                        await walkDirectory.call(this, fullPath);
                    }
                } else if (entry.isFile()) {
                    if (this.shouldIncludeFile(entry.name)) {
                        files.push(fullPath);
                    }
                }
            }
        }

        await walkDirectory.call(this, this.options.projectPath);
        return files;
    }

    shouldExcludeDirectory(dirname) {
        const excludePatterns = [
            'node_modules',
            '.git',
            'dist',
            'build',
            'coverage',
            '.nyc_output'
        ];
        
        return excludePatterns.some(pattern => dirname.includes(pattern));
    }

    shouldIncludeFile(filename) {
        const includeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json'];
        const excludePatterns = ['.min.js', '.bundle.js', '.test.js', '.spec.js'];
        
        const hasIncludedExtension = includeExtensions.some(ext => filename.endsWith(ext));
        const hasExcludedPattern = excludePatterns.some(pattern => filename.includes(pattern));
        
        return hasIncludedExtension && !hasExcludedPattern;
    }

    async scanFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            
            // Skip large files
            if (stats.size > this.options.maxFileSize) {
                this.logger.warn('Skipping large file', { 
                    file: filePath,
                    size: stats.size
                });
                return;
            }

            const content = await fs.readFile(filePath, 'utf8');
            this.scanResults.metrics.linesOfCode += content.split('\n').length;

            // Scan for OWASP vulnerabilities
            await this.scanForOWASPVulnerabilities(filePath, content);

            // Scan for general security issues
            await this.scanForGeneralSecurityIssues(filePath, content);

            // Scan file-based rules
            await this.scanFileBasedRules(filePath);

        } catch (error) {
            this.logger.error('Failed to scan file', {
                file: filePath,
                error: error.message
            });
        }
    }

    async scanForOWASPVulnerabilities(filePath, content) {
        for (const [vulnerabilityType, config] of Object.entries(this.vulnerabilityPatterns)) {
            for (const pattern of config.patterns) {
                let match;
                
                while ((match = pattern.exec(content)) !== null) {
                    const vulnerability = {
                        id: crypto.randomUUID(),
                        type: vulnerabilityType,
                        category: config.category,
                        severity: config.severity,
                        cwe: config.cwe,
                        file: path.relative(this.options.projectPath, filePath),
                        line: this.getLineNumber(content, match.index),
                        column: this.getColumnNumber(content, match.index),
                        match: match[0],
                        description: this.getVulnerabilityDescription(vulnerabilityType),
                        recommendation: this.getVulnerabilityRecommendation(vulnerabilityType),
                        confidence: this.calculateConfidence(vulnerabilityType, match[0]),
                        timestamp: new Date().toISOString()
                    };

                    this.addVulnerability(vulnerability);
                }
                
                // Reset regex lastIndex to avoid issues with global patterns
                pattern.lastIndex = 0;
            }
        }
    }

    async scanForGeneralSecurityIssues(filePath, content) {
        for (const rule of this.securityRules.contentRules) {
            let match;
            
            while ((match = rule.pattern.exec(content)) !== null) {
                const vulnerability = {
                    id: crypto.randomUUID(),
                    type: rule.name,
                    category: 'General Security',
                    severity: rule.severity,
                    file: path.relative(this.options.projectPath, filePath),
                    line: this.getLineNumber(content, match.index),
                    column: this.getColumnNumber(content, match.index),
                    match: match[0],
                    description: rule.message,
                    recommendation: this.getGeneralRecommendation(rule.name),
                    confidence: 0.8,
                    timestamp: new Date().toISOString()
                };

                this.addVulnerability(vulnerability);
            }
            
            rule.pattern.lastIndex = 0;
        }
    }

    async scanFileBasedRules(filePath) {
        const filename = path.basename(filePath);
        
        for (const rule of this.securityRules.fileRules) {
            if (rule.pattern.test(filename)) {
                const vulnerability = {
                    id: crypto.randomUUID(),
                    type: rule.name,
                    category: 'File Security',
                    severity: rule.severity,
                    file: path.relative(this.options.projectPath, filePath),
                    line: 1,
                    column: 1,
                    match: filename,
                    description: rule.message,
                    recommendation: this.getFileBasedRecommendation(rule.name),
                    confidence: 0.9,
                    timestamp: new Date().toISOString()
                };

                this.addVulnerability(vulnerability);
            }
        }
    }

    /**
     * Dependency vulnerability check
     */
    async performDependencyCheck() {
        this.logger.info('Performing dependency vulnerability check');

        try {
            // Check package.json for known vulnerabilities
            await this.checkPackageVulnerabilities();
            
            // Run npm audit if available
            await this.runNpmAudit();
            
            this.logger.info('Dependency check completed');

        } catch (error) {
            this.logger.error('Dependency check failed', { error: error.message });
        }
    }

    async checkPackageVulnerabilities() {
        const packageJsonPath = path.join(this.options.projectPath, 'package.json');
        
        try {
            const packageContent = await fs.readFile(packageJsonPath, 'utf8');
            const packageData = JSON.parse(packageContent);
            
            const dependencies = {
                ...packageData.dependencies,
                ...packageData.devDependencies
            };

            // Check against known vulnerable packages
            const vulnerablePackages = this.getKnownVulnerablePackages();
            
            for (const [packageName, version] of Object.entries(dependencies)) {
                if (vulnerablePackages[packageName]) {
                    const vulnInfo = vulnerablePackages[packageName];
                    
                    const vulnerability = {
                        id: crypto.randomUUID(),
                        type: 'vulnerable_dependency',
                        category: 'Dependencies',
                        severity: vulnInfo.severity,
                        cve: vulnInfo.cve,
                        file: 'package.json',
                        line: 1,
                        column: 1,
                        match: `${packageName}@${version}`,
                        description: `Vulnerable dependency: ${packageName}`,
                        recommendation: vulnInfo.recommendation,
                        confidence: 0.95,
                        timestamp: new Date().toISOString()
                    };

                    this.addVulnerability(vulnerability);
                }
            }

        } catch (error) {
            this.logger.warn('Could not check package.json', { error: error.message });
        }
    }

    async runNpmAudit() {
        try {
            const { stdout } = await execAsync('npm audit --json', {
                cwd: this.options.projectPath,
                timeout: 30000
            });

            const auditResult = JSON.parse(stdout);
            
            if (auditResult.vulnerabilities) {
                for (const [packageName, vulnData] of Object.entries(auditResult.vulnerabilities)) {
                    const vulnerability = {
                        id: crypto.randomUUID(),
                        type: 'npm_audit_vulnerability',
                        category: 'Dependencies',
                        severity: vulnData.severity,
                        cve: vulnData.cve,
                        file: 'package.json',
                        line: 1,
                        column: 1,
                        match: packageName,
                        description: vulnData.title || `Vulnerability in ${packageName}`,
                        recommendation: vulnData.recommendation || 'Update to a secure version',
                        confidence: 0.9,
                        timestamp: new Date().toISOString()
                    };

                    this.addVulnerability(vulnerability);
                }
            }

        } catch (error) {
            this.logger.warn('npm audit failed', { error: error.message });
        }
    }

    /**
     * Dynamic Application Security Testing (DAST)
     */
    async performDASTScan() {
        this.logger.info('Performing DAST scan');
        
        try {
            // This would typically involve running the application
            // and performing automated penetration testing
            
            // For now, we'll simulate basic endpoint security checks
            await this.scanEndpointSecurity();
            
            this.logger.info('DAST scan completed');

        } catch (error) {
            this.logger.error('DAST scan failed', { error: error.message });
        }
    }

    async scanEndpointSecurity() {
        // This is a simplified implementation
        // In a real scenario, this would involve starting the application
        // and performing actual HTTP requests to test security
        
        const commonEndpoints = [
            '/api/users',
            '/api/admin',
            '/api/login',
            '/api/register',
            '/admin',
            '/.env',
            '/config.json'
        ];

        for (const endpoint of commonEndpoints) {
            // Simulate endpoint security check
            const vulnerability = this.simulateEndpointVulnerability(endpoint);
            if (vulnerability) {
                this.addVulnerability(vulnerability);
            }
        }
    }

    simulateEndpointVulnerability(endpoint) {
        // This is a mock implementation for demonstration
        if (endpoint === '/.env' || endpoint === '/config.json') {
            return {
                id: crypto.randomUUID(),
                type: 'information_disclosure',
                category: 'Configuration',
                severity: 'high',
                file: 'endpoint',
                line: 1,
                column: 1,
                match: endpoint,
                description: `Sensitive configuration file accessible via web: ${endpoint}`,
                recommendation: 'Ensure sensitive files are not accessible via web server',
                confidence: 0.7,
                timestamp: new Date().toISOString()
            };
        }
        
        return null;
    }

    /**
     * Utility methods
     */
    addVulnerability(vulnerability) {
        // Filter by severity threshold
        const severityLevels = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        const thresholdLevel = severityLevels[this.options.severity] || 2;
        const vulnLevel = severityLevels[vulnerability.severity] || 0;
        
        if (vulnLevel >= thresholdLevel) {
            this.scanResults.vulnerabilities.push(vulnerability);
            this.scanResults.summary.total++;
            this.scanResults.summary[vulnerability.severity]++;
        }
    }

    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    getColumnNumber(content, index) {
        const lines = content.substring(0, index).split('\n');
        return lines[lines.length - 1].length + 1;
    }

    calculateConfidence(vulnerabilityType, match) {
        // Calculate confidence based on pattern specificity
        const specificPatterns = ['injection', 'cryptographicFailures', 'brokenAccessControl'];
        
        if (specificPatterns.includes(vulnerabilityType)) {
            return 0.9;
        }
        
        if (match.length > 50) {
            return 0.8;
        }
        
        return 0.7;
    }

    getVulnerabilityDescription(vulnerabilityType) {
        const descriptions = {
            brokenAccessControl: 'Potential broken access control vulnerability detected',
            cryptographicFailures: 'Cryptographic implementation issue detected',
            injection: 'Potential injection vulnerability detected',
            insecureDesign: 'Insecure design pattern detected',
            securityMisconfiguration: 'Security misconfiguration detected',
            vulnerableComponents: 'Potentially vulnerable component detected',
            authFailures: 'Authentication or session management issue detected',
            integrityFailures: 'Software and data integrity issue detected',
            loggingFailures: 'Security logging and monitoring issue detected',
            ssrf: 'Potential Server-Side Request Forgery vulnerability detected',
            informationDisclosure: 'Information disclosure vulnerability detected',
            xss: 'Potential Cross-Site Scripting vulnerability detected'
        };
        
        return descriptions[vulnerabilityType] || 'Security vulnerability detected';
    }

    getVulnerabilityRecommendation(vulnerabilityType) {
        const recommendations = {
            brokenAccessControl: 'Implement proper authorization checks and access controls',
            cryptographicFailures: 'Use strong, up-to-date cryptographic algorithms and secure key management',
            injection: 'Use parameterized queries and input validation to prevent injection attacks',
            insecureDesign: 'Implement secure design patterns and threat modeling',
            securityMisconfiguration: 'Review and harden security configurations',
            vulnerableComponents: 'Update to secure versions of dependencies',
            authFailures: 'Implement secure authentication and session management',
            integrityFailures: 'Implement integrity checks and secure deserialization',
            loggingFailures: 'Implement comprehensive security logging and monitoring',
            ssrf: 'Validate and sanitize URLs, implement allowlists for external requests',
            informationDisclosure: 'Remove sensitive information from public access',
            xss: 'Implement proper output encoding and input validation'
        };
        
        return recommendations[vulnerabilityType] || 'Review and remediate the security issue';
    }

    getGeneralRecommendation(ruleName) {
        const recommendations = {
            hardcoded_secrets: 'Use environment variables or secure configuration management',
            ip_addresses: 'Use configuration files or environment variables for IP addresses',
            private_keys: 'Store private keys securely, never commit to version control'
        };
        
        return recommendations[ruleName] || 'Review and remediate the security issue';
    }

    getFileBasedRecommendation(ruleName) {
        const recommendations = {
            sensitive_files: 'Remove sensitive files from version control and public access',
            config_files: 'Review configuration files for sensitive data exposure'
        };
        
        return recommendations[ruleName] || 'Review file for security implications';
    }

    getKnownVulnerablePackages() {
        // This would typically be loaded from a vulnerability database
        return {
            'express': {
                severity: 'medium',
                cve: 'CVE-2022-24999',
                recommendation: 'Update to express@4.18.2 or later'
            },
            'lodash': {
                severity: 'high',
                cve: 'CVE-2021-23337',
                recommendation: 'Update to lodash@4.17.21 or later'
            }
        };
    }

    /**
     * Report generation
     */
    async generateSecurityReport() {
        const report = {
            ...this.scanResults,
            recommendations: this.generateRecommendations(),
            riskScore: this.calculateRiskScore(),
            compliance: this.checkCompliance()
        };

        // Save report to file
        await this.saveReport(report);
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        const vulnerabilityTypes = {};
        
        // Group vulnerabilities by type
        for (const vuln of this.scanResults.vulnerabilities) {
            vulnerabilityTypes[vuln.type] = (vulnerabilityTypes[vuln.type] || 0) + 1;
        }
        
        // Generate prioritized recommendations
        const sortedTypes = Object.entries(vulnerabilityTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        for (const [type, count] of sortedTypes) {
            recommendations.push({
                priority: 'high',
                type,
                count,
                recommendation: this.getVulnerabilityRecommendation(type)
            });
        }
        
        return recommendations;
    }

    calculateRiskScore() {
        let score = 0;
        const weights = { critical: 10, high: 7, medium: 4, low: 2, info: 1 };
        
        for (const [severity, count] of Object.entries(this.scanResults.summary)) {
            if (weights[severity]) {
                score += weights[severity] * count;
            }
        }
        
        // Normalize to 0-100 scale
        return Math.min(score, 100);
    }

    checkCompliance() {
        const compliance = {
            owasp: this.checkOWASPCompliance(),
            pci: this.checkPCICompliance(),
            gdpr: this.checkGDPRCompliance()
        };
        
        return compliance;
    }

    checkOWASPCompliance() {
        const owaspVulns = this.scanResults.vulnerabilities.filter(v => 
            v.category && ['Access Control', 'Cryptography', 'Injection'].includes(v.category)
        );
        
        return {
            compliant: owaspVulns.length === 0,
            issues: owaspVulns.length,
            score: Math.max(0, 100 - owaspVulns.length * 10)
        };
    }

    checkPCICompliance() {
        const pciVulns = this.scanResults.vulnerabilities.filter(v => 
            v.type === 'cryptographicFailures' || v.type === 'hardcoded_secrets'
        );
        
        return {
            compliant: pciVulns.length === 0,
            issues: pciVulns.length,
            score: Math.max(0, 100 - pciVulns.length * 15)
        };
    }

    checkGDPRCompliance() {
        const gdprVulns = this.scanResults.vulnerabilities.filter(v => 
            v.type === 'informationDisclosure' || v.type === 'loggingFailures'
        );
        
        return {
            compliant: gdprVulns.length === 0,
            issues: gdprVulns.length,
            score: Math.max(0, 100 - gdprVulns.length * 12)
        };
    }

    async saveReport(report) {
        const reportPath = path.join(
            this.options.projectPath,
            'security-report.json'
        );
        
        try {
            await fs.writeFile(
                reportPath,
                JSON.stringify(report, null, 2),
                'utf8'
            );
            
            this.logger.info('Security report saved', { path: reportPath });
            
        } catch (error) {
            this.logger.error('Failed to save security report', {
                error: error.message,
                path: reportPath
            });
        }
    }

    /**
     * Public API methods
     */
    async quickScan() {
        const originalOptions = { ...this.options };
        
        // Quick scan with reduced scope
        this.options.enableDAST = false;
        this.options.severity = 'high';
        
        try {
            const result = await this.performSecurityScan();
            return result;
        } finally {
            // Restore original options
            this.options = originalOptions;
        }
    }

    async generateSARIFReport() {
        // Generate SARIF format report for CI/CD integration
        const sarif = {
            version: '2.1.0',
            runs: [{
                tool: {
                    driver: {
                        name: 'OWASP Security Scanner',
                        version: '1.0.0'
                    }
                },
                results: this.scanResults.vulnerabilities.map(vuln => ({
                    ruleId: vuln.type,
                    level: this.mapSeverityToSARIF(vuln.severity),
                    message: { text: vuln.description },
                    locations: [{
                        physicalLocation: {
                            artifactLocation: { uri: vuln.file },
                            region: {
                                startLine: vuln.line,
                                startColumn: vuln.column
                            }
                        }
                    }]
                }))
            }]
        };
        
        return sarif;
    }

    mapSeverityToSARIF(severity) {
        const mapping = {
            critical: 'error',
            high: 'error', 
            medium: 'warning',
            low: 'note',
            info: 'note'
        };
        
        return mapping[severity] || 'warning';
    }

    getHealthCheck() {
        return {
            status: 'healthy',
            version: '1.0.0',
            patterns: Object.keys(this.vulnerabilityPatterns).length,
            rules: this.securityRules.contentRules.length + this.securityRules.fileRules.length
        };
    }
}

module.exports = OWASPSecurityScanner;