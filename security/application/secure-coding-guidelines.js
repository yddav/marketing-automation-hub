/**
 * Secure Coding Guidelines Enforcer
 * Automated enforcement of secure coding practices
 * 
 * Features:
 * - Real-time code quality enforcement
 * - Secure coding pattern validation
 * - ESLint security rules integration
 * - Code review automation
 * - Security training recommendations
 * - Compliance checking
 * - Performance impact assessment
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const winston = require('winston');
const { ESLint } = require('eslint');

class SecureCodingEnforcer {
    constructor(options = {}) {
        this.options = {
            projectPath: options.projectPath || process.cwd(),
            enforceLevel: options.enforceLevel || 'warn', // error, warn, info
            autoFix: options.autoFix || false,
            realTimeValidation: options.realTimeValidation || false,
            generateReports: options.generateReports !== false,
            integrateCICD: options.integrateCICD !== false,
            ...options
        };

        this.logger = options.logger || this.createLogger();
        
        // Initialize secure coding patterns
        this.securityPatterns = this.initializeSecurityPatterns();
        
        // Initialize ESLint with security rules
        this.eslint = new ESLint({
            baseConfig: this.getSecurityESLintConfig(),
            useEslintrc: false,
            fix: this.options.autoFix
        });
        
        // Violations tracking
        this.violations = new Map();
        this.metrics = {
            totalChecks: 0,
            violations: 0,
            autoFixed: 0,
            trainingRecommendations: 0
        };
        
        this.initializeEnforcer();
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
                    filename: 'logs/secure-coding-enforcer.log',
                    maxsize: 50 * 1024 * 1024,
                    maxFiles: 10
                }),
                new winston.transports.Console()
            ]
        });
    }

    initializeSecurityPatterns() {
        return {
            // Input Validation Patterns
            inputValidation: {
                name: 'Input Validation',
                rules: [
                    {
                        id: 'missing-input-validation',
                        pattern: /req\.(body|params|query)\.[a-zA-Z_$][a-zA-Z0-9_$]*(?!\s*\.\s*(?:validate|check|sanitize|escape))/g,
                        severity: 'high',
                        message: 'User input should be validated before use',
                        fix: 'Add input validation using joi, express-validator, or similar library',
                        example: `
// Bad
const email = req.body.email;

// Good
const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.details });
const email = value.email;`
                    },
                    {
                        id: 'unsafe-regex',
                        pattern: /new\s+RegExp\s*\(\s*req\.(body|params|query)/g,
                        severity: 'critical',
                        message: 'Dynamic regex construction can lead to ReDoS attacks',
                        fix: 'Use predefined, tested regex patterns',
                        example: `
// Bad
const regex = new RegExp(req.body.pattern);

// Good
const allowedPatterns = { email: /^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/ };
const regex = allowedPatterns[req.body.patternType];`
                    }
                ]
            },

            // Output Encoding Patterns
            outputEncoding: {
                name: 'Output Encoding',
                rules: [
                    {
                        id: 'unescaped-output',
                        pattern: /res\.(send|json)\s*\([^)]*req\.(body|params|query)[^)]*(?!.*(?:escape|sanitize|encode))/g,
                        severity: 'high',
                        message: 'User input in response should be properly encoded',
                        fix: 'Use output encoding libraries like he, DOMPurify, or built-in escaping',
                        example: `
// Bad
res.send(\`Hello \${req.body.name}\`);

// Good
const he = require('he');
res.send(\`Hello \${he.encode(req.body.name)}\`);`
                    },
                    {
                        id: 'dangerous-html-output',
                        pattern: /innerHTML\s*=\s*.*req\.(body|params|query)/g,
                        severity: 'critical',
                        message: 'Setting innerHTML with user input can lead to XSS',
                        fix: 'Use textContent or properly sanitize HTML',
                        example: `
// Bad
element.innerHTML = req.body.content;

// Good
element.textContent = req.body.content;
// Or with sanitization
element.innerHTML = DOMPurify.sanitize(req.body.content);`
                    }
                ]
            },

            // Authentication Patterns
            authentication: {
                name: 'Authentication & Authorization',
                rules: [
                    {
                        id: 'missing-auth-middleware',
                        pattern: /app\.(get|post|put|delete|patch)\s*\(\s*['"][^'"]*admin[^'"]*['"]\s*,\s*(?!.*(?:auth|authenticate|requireAuth))/g,
                        severity: 'critical',
                        message: 'Admin routes must have authentication middleware',
                        fix: 'Add authentication middleware before route handler',
                        example: `
// Bad
app.get('/admin/users', (req, res) => { ... });

// Good
app.get('/admin/users', requireAuth, requireRole('admin'), (req, res) => { ... });`
                    },
                    {
                        id: 'weak-password-hash',
                        pattern: /password\s*=\s*(?:md5|sha1|sha256)\s*\(/g,
                        severity: 'critical',
                        message: 'Use secure password hashing algorithms like bcrypt',
                        fix: 'Replace with bcrypt, scrypt, or Argon2',
                        example: `
// Bad
const password = sha256(plainPassword);

// Good
const bcrypt = require('bcryptjs');
const password = await bcrypt.hash(plainPassword, 12);`
                    }
                ]
            },

            // Cryptography Patterns
            cryptography: {
                name: 'Cryptography',
                rules: [
                    {
                        id: 'weak-crypto-algorithm',
                        pattern: /(MD5|SHA1|DES|3DES|RC4)\s*\(/gi,
                        severity: 'high',
                        message: 'Weak cryptographic algorithm detected',
                        fix: 'Use strong algorithms like AES-256, SHA-256, or better',
                        example: `
// Bad
const hash = crypto.createHash('md5');

// Good
const hash = crypto.createHash('sha256');`
                    },
                    {
                        id: 'hardcoded-crypto-key',
                        pattern: /(key|secret|password|token)\s*[:=]\s*['"][a-zA-Z0-9+/]{16,}['"](?!\s*\+\s*process\.env)/g,
                        severity: 'critical',
                        message: 'Hardcoded cryptographic key or secret',
                        fix: 'Use environment variables or secure key management',
                        example: `
// Bad
const secret = 'myHardcodedSecret123';

// Good
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET not configured');`
                    }
                ]
            },

            // Database Security Patterns
            database: {
                name: 'Database Security',
                rules: [
                    {
                        id: 'sql-injection-risk',
                        pattern: /\.(query|execute)\s*\(\s*['"`]\s*SELECT\s+.*\+.*['"`]/gi,
                        severity: 'critical',
                        message: 'Potential SQL injection vulnerability',
                        fix: 'Use parameterized queries or prepared statements',
                        example: `
// Bad
db.query(\`SELECT * FROM users WHERE id = \${userId}\`);

// Good
db.query('SELECT * FROM users WHERE id = ?', [userId]);`
                    },
                    {
                        id: 'nosql-injection-risk',
                        pattern: /\.(find|findOne|update|remove)\s*\(\s*req\.(body|params|query)/g,
                        severity: 'high',
                        message: 'Potential NoSQL injection vulnerability',
                        fix: 'Validate and sanitize input before database operations',
                        example: `
// Bad
User.find(req.body.query);

// Good
const { error, value } = querySchema.validate(req.body.query);
if (error) return res.status(400).json({ error });
User.find(value);`
                    }
                ]
            },

            // Error Handling Patterns
            errorHandling: {
                name: 'Error Handling',
                rules: [
                    {
                        id: 'information-disclosure',
                        pattern: /res\.(status\(500\)|json)\s*\([^)]*error\.(stack|message)[^)]*\)/g,
                        severity: 'medium',
                        message: 'Error details should not be exposed to clients',
                        fix: 'Return generic error messages in production',
                        example: `
// Bad
res.status(500).json({ error: error.stack });

// Good
const message = process.env.NODE_ENV === 'production' 
  ? 'Internal server error' 
  : error.message;
res.status(500).json({ error: message });`
                    },
                    {
                        id: 'missing-error-handling',
                        pattern: /\.(query|execute|async|await).*(?!\s*\.catch\s*\(|\s*try\s*\{)/g,
                        severity: 'medium',
                        message: 'Async operations should have proper error handling',
                        fix: 'Add try-catch blocks or .catch() handlers',
                        example: `
// Bad
await db.query(sql);

// Good
try {
  await db.query(sql);
} catch (error) {
  logger.error('Database query failed', error);
  throw new Error('Database operation failed');
}`
                    }
                ]
            },

            // Session Management Patterns
            sessionManagement: {
                name: 'Session Management',
                rules: [
                    {
                        id: 'insecure-session-config',
                        pattern: /session\s*\(\s*\{[^}]*(?:secure\s*:\s*false|httpOnly\s*:\s*false)[^}]*\}/g,
                        severity: 'high',
                        message: 'Insecure session configuration',
                        fix: 'Enable secure and httpOnly flags for session cookies',
                        example: `
// Bad
app.use(session({
  secret: 'secret',
  secure: false,
  httpOnly: false
}));

// Good
app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict'
}));`
                    }
                ]
            },

            // File Handling Patterns
            fileHandling: {
                name: 'File Handling',
                rules: [
                    {
                        id: 'path-traversal-risk',
                        pattern: /fs\.(readFile|writeFile|stat|unlink)\s*\([^,]*req\.(body|params|query)[^,]*(?!.*(?:path\.join|path\.resolve|sanitize))/g,
                        severity: 'high',
                        message: 'Potential path traversal vulnerability',
                        fix: 'Validate and sanitize file paths',
                        example: `
// Bad
fs.readFile(req.body.filename);

// Good
const sanitizedPath = path.join(__dirname, 'uploads', path.basename(req.body.filename));
if (!sanitizedPath.startsWith(path.join(__dirname, 'uploads'))) {
  throw new Error('Invalid file path');
}
fs.readFile(sanitizedPath);`
                    }
                ]
            },

            // Logging Patterns
            logging: {
                name: 'Security Logging',
                rules: [
                    {
                        id: 'sensitive-data-logging',
                        pattern: /console\.log.*(?:password|token|secret|key|ssn|credit|card)/gi,
                        severity: 'medium',
                        message: 'Sensitive data should not be logged',
                        fix: 'Remove sensitive data from logs or sanitize before logging',
                        example: `
// Bad
console.log('User login:', { email, password });

// Good
console.log('User login:', { email, password: '[REDACTED]' });`
                    }
                ]
            }
        };
    }

    getSecurityESLintConfig() {
        return {
            env: {
                node: true,
                es2021: true
            },
            extends: [
                'eslint:recommended'
            ],
            plugins: [
                'security'
            ],
            rules: {
                // Security-specific rules
                'security/detect-object-injection': this.options.enforceLevel,
                'security/detect-non-literal-regexp': this.options.enforceLevel,
                'security/detect-unsafe-regex': this.options.enforceLevel,
                'security/detect-buffer-noassert': this.options.enforceLevel,
                'security/detect-child-process': this.options.enforceLevel,
                'security/detect-disable-mustache-escape': this.options.enforceLevel,
                'security/detect-eval-with-expression': this.options.enforceLevel,
                'security/detect-no-csrf-before-method-override': this.options.enforceLevel,
                'security/detect-non-literal-fs-filename': this.options.enforceLevel,
                'security/detect-non-literal-require': this.options.enforceLevel,
                'security/detect-possible-timing-attacks': this.options.enforceLevel,
                'security/detect-pseudoRandomBytes': this.options.enforceLevel,
                
                // General security best practices
                'no-eval': 'error',
                'no-implied-eval': 'error',
                'no-new-func': 'error',
                'no-script-url': 'error',
                'strict': ['error', 'global']
            }
        };
    }

    async initializeEnforcer() {
        try {
            this.logger.info('Initializing Secure Coding Enforcer', {
                projectPath: this.options.projectPath,
                enforceLevel: this.options.enforceLevel,
                autoFix: this.options.autoFix
            });

            // Setup file watchers if real-time validation is enabled
            if (this.options.realTimeValidation) {
                await this.setupFileWatchers();
            }

            this.logger.info('Secure Coding Enforcer initialized successfully');

        } catch (error) {
            this.logger.error('Failed to initialize Secure Coding Enforcer', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Validate code against security patterns
     */
    async validateCode(filePath, content = null) {
        try {
            const fileContent = content || await fs.readFile(filePath, 'utf8');
            const violations = [];

            this.metrics.totalChecks++;

            // Run ESLint security checks
            const eslintResults = await this.runESLintSecurityChecks(filePath, fileContent);
            violations.push(...eslintResults);

            // Run custom security pattern checks
            const patternResults = await this.runSecurityPatternChecks(filePath, fileContent);
            violations.push(...patternResults);

            // Store violations for tracking
            if (violations.length > 0) {
                this.violations.set(filePath, violations);
                this.metrics.violations += violations.length;
            }

            // Generate training recommendations
            const trainingRecs = this.generateTrainingRecommendations(violations);
            if (trainingRecs.length > 0) {
                this.metrics.trainingRecommendations += trainingRecs.length;
            }

            return {
                filePath,
                violations,
                trainingRecommendations: trainingRecs,
                metrics: {
                    totalViolations: violations.length,
                    criticalViolations: violations.filter(v => v.severity === 'critical').length,
                    highViolations: violations.filter(v => v.severity === 'high').length
                }
            };

        } catch (error) {
            this.logger.error('Code validation failed', {
                filePath,
                error: error.message
            });
            throw error;
        }
    }

    async runESLintSecurityChecks(filePath, content) {
        try {
            // Create temporary file for ESLint if content is provided
            let targetPath = filePath;
            if (content) {
                const tempPath = path.join(require('os').tmpdir(), `eslint-${Date.now()}.js`);
                await fs.writeFile(tempPath, content);
                targetPath = tempPath;
            }

            const results = await this.eslint.lintText(content, { filePath: targetPath });
            const violations = [];

            for (const result of results) {
                for (const message of result.messages) {
                    if (message.ruleId && message.ruleId.startsWith('security/')) {
                        violations.push({
                            id: crypto.randomUUID(),
                            type: 'eslint-security',
                            ruleId: message.ruleId,
                            severity: message.severity === 2 ? 'high' : 'medium',
                            message: message.message,
                            line: message.line,
                            column: message.column,
                            fix: this.getESLintSecurityFix(message.ruleId),
                            source: 'eslint-security-plugin'
                        });
                    }
                }
            }

            // Clean up temporary file
            if (content && targetPath !== filePath) {
                await fs.unlink(targetPath).catch(() => {});
            }

            return violations;

        } catch (error) {
            this.logger.warn('ESLint security check failed', {
                filePath,
                error: error.message
            });
            return [];
        }
    }

    async runSecurityPatternChecks(filePath, content) {
        const violations = [];

        for (const [categoryName, category] of Object.entries(this.securityPatterns)) {
            for (const rule of category.rules) {
                let match;
                rule.pattern.lastIndex = 0; // Reset regex state
                
                while ((match = rule.pattern.exec(content)) !== null) {
                    const line = this.getLineNumber(content, match.index);
                    const column = this.getColumnNumber(content, match.index);

                    violations.push({
                        id: crypto.randomUUID(),
                        type: 'security-pattern',
                        ruleId: rule.id,
                        category: categoryName,
                        severity: rule.severity,
                        message: rule.message,
                        line,
                        column,
                        match: match[0],
                        fix: rule.fix,
                        example: rule.example,
                        source: 'secure-coding-enforcer'
                    });
                }
            }
        }

        return violations;
    }

    generateTrainingRecommendations(violations) {
        const recommendations = [];
        const topicCounts = {};

        // Count violations by category/topic
        for (const violation of violations) {
            const topic = violation.category || violation.ruleId || 'general';
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }

        // Generate recommendations for topics with multiple violations
        for (const [topic, count] of Object.entries(topicCounts)) {
            if (count >= 2) {
                recommendations.push({
                    id: crypto.randomUUID(),
                    topic,
                    priority: count >= 5 ? 'high' : 'medium',
                    violationCount: count,
                    recommendation: this.getTrainingRecommendation(topic),
                    resources: this.getTrainingResources(topic)
                });
            }
        }

        return recommendations;
    }

    getTrainingRecommendation(topic) {
        const recommendations = {
            'inputValidation': 'Complete training on input validation and sanitization techniques',
            'outputEncoding': 'Learn about XSS prevention and output encoding best practices',
            'authentication': 'Study secure authentication and authorization patterns',
            'cryptography': 'Understand cryptographic best practices and secure algorithms',
            'database': 'Review SQL/NoSQL injection prevention techniques',
            'errorHandling': 'Learn secure error handling and information disclosure prevention',
            'sessionManagement': 'Study secure session management practices',
            'fileHandling': 'Understand path traversal prevention and secure file operations',
            'logging': 'Learn about secure logging practices and data sanitization'
        };

        return recommendations[topic] || 'Review secure coding practices for this area';
    }

    getTrainingResources(topic) {
        const resources = {
            'inputValidation': [
                'OWASP Input Validation Cheat Sheet',
                'Node.js Input Validation Libraries (Joi, express-validator)',
                'Sanitization vs Validation Best Practices'
            ],
            'outputEncoding': [
                'OWASP XSS Prevention Cheat Sheet',
                'Output Encoding Libraries (he, DOMPurify)',
                'Content Security Policy Implementation'
            ],
            'authentication': [
                'OWASP Authentication Cheat Sheet',
                'JWT Security Best Practices',
                'Multi-Factor Authentication Implementation'
            ],
            'cryptography': [
                'OWASP Cryptographic Storage Cheat Sheet',
                'Node.js Crypto Module Best Practices',
                'Key Management and Rotation Strategies'
            ]
        };

        return resources[topic] || ['OWASP Secure Coding Practices', 'Security Code Review Guidelines'];
    }

    getESLintSecurityFix(ruleId) {
        const fixes = {
            'security/detect-object-injection': 'Validate object keys before dynamic access',
            'security/detect-non-literal-regexp': 'Use predefined regex patterns instead of dynamic construction',
            'security/detect-unsafe-regex': 'Review regex for ReDoS vulnerabilities',
            'security/detect-buffer-noassert': 'Use safe buffer methods with proper validation',
            'security/detect-child-process': 'Validate and sanitize input to child processes',
            'security/detect-eval-with-expression': 'Avoid eval() and use safer alternatives',
            'security/detect-non-literal-fs-filename': 'Validate and sanitize file paths',
            'security/detect-possible-timing-attacks': 'Use constant-time comparison for sensitive operations'
        };

        return fixes[ruleId] || 'Review code for security implications';
    }

    /**
     * Auto-fix security violations where possible
     */
    async autoFixViolations(filePath) {
        if (!this.options.autoFix) {
            return { fixed: 0, unfixed: 0 };
        }

        try {
            const violations = this.violations.get(filePath) || [];
            let content = await fs.readFile(filePath, 'utf8');
            let fixedCount = 0;

            // Sort violations by line number (descending) to avoid offset issues
            const sortedViolations = violations.sort((a, b) => b.line - a.line);

            for (const violation of sortedViolations) {
                const fix = this.getAutoFix(violation);
                if (fix) {
                    content = this.applyFix(content, violation, fix);
                    fixedCount++;
                }
            }

            if (fixedCount > 0) {
                await fs.writeFile(filePath, content);
                this.metrics.autoFixed += fixedCount;
                
                this.logger.info('Auto-fixed security violations', {
                    filePath,
                    fixedCount
                });
            }

            return {
                fixed: fixedCount,
                unfixed: violations.length - fixedCount
            };

        } catch (error) {
            this.logger.error('Auto-fix failed', {
                filePath,
                error: error.message
            });
            return { fixed: 0, unfixed: violations.length };
        }
    }

    getAutoFix(violation) {
        const autoFixes = {
            'hardcoded-crypto-key': {
                pattern: /(const|let|var)\s+(\w+)\s*=\s*['"][^'"]+['"]/,
                replacement: '$1 $2 = process.env.$2_SECRET || (() => { throw new Error("$2_SECRET not configured"); })()'
            },
            'sensitive-data-logging': {
                pattern: /console\.log\s*\(\s*([^)]*(?:password|token|secret|key)[^)]*)\s*\)/gi,
                replacement: '// console.log($1); // Removed sensitive data logging'
            }
        };

        return autoFixes[violation.ruleId];
    }

    applyFix(content, violation, fix) {
        const lines = content.split('\n');
        const lineIndex = violation.line - 1;
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
            const line = lines[lineIndex];
            const fixedLine = line.replace(fix.pattern, fix.replacement);
            lines[lineIndex] = fixedLine;
        }

        return lines.join('\n');
    }

    /**
     * Generate comprehensive security report
     */
    async generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            project: this.options.projectPath,
            summary: {
                totalFiles: this.violations.size,
                totalViolations: Array.from(this.violations.values()).flat().length,
                criticalViolations: 0,
                highViolations: 0,
                mediumViolations: 0,
                lowViolations: 0
            },
            violationsByCategory: {},
            topViolations: [],
            trainingRecommendations: [],
            metrics: this.metrics,
            complianceScore: 0
        };

        // Process all violations
        const allViolations = Array.from(this.violations.values()).flat();
        
        for (const violation of allViolations) {
            // Count by severity
            report.summary[`${violation.severity}Violations`]++;
            
            // Group by category
            const category = violation.category || violation.ruleId || 'other';
            report.violationsByCategory[category] = (report.violationsByCategory[category] || 0) + 1;
        }

        // Get top violations
        report.topViolations = Object.entries(report.violationsByCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([category, count]) => ({ category, count }));

        // Calculate compliance score
        report.complianceScore = this.calculateComplianceScore(report.summary);

        // Generate training recommendations
        report.trainingRecommendations = this.generateProjectTrainingRecommendations(report.violationsByCategory);

        return report;
    }

    calculateComplianceScore(summary) {
        const totalViolations = summary.totalViolations;
        const weightedScore = 
            (summary.criticalViolations * 10) +
            (summary.highViolations * 5) +
            (summary.mediumViolations * 2) +
            (summary.lowViolations * 1);

        // Score out of 100, where lower violations = higher score
        const maxExpectedScore = totalViolations * 2; // Assuming average weight of 2
        const score = Math.max(0, 100 - (weightedScore / Math.max(maxExpectedScore, 1)) * 100);

        return Math.round(score);
    }

    generateProjectTrainingRecommendations(violationsByCategory) {
        return Object.entries(violationsByCategory)
            .filter(([_, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => ({
                category,
                violationCount: count,
                priority: count >= 10 ? 'high' : count >= 5 ? 'medium' : 'low',
                recommendation: this.getTrainingRecommendation(category),
                resources: this.getTrainingResources(category)
            }));
    }

    /**
     * CI/CD Integration
     */
    async generateCICDReport() {
        const report = await this.generateSecurityReport();
        
        const cicdReport = {
            success: report.summary.criticalViolations === 0,
            exitCode: report.summary.criticalViolations > 0 ? 1 : 0,
            summary: `Found ${report.summary.totalViolations} security violations (${report.summary.criticalViolations} critical)`,
            details: {
                complianceScore: report.complianceScore,
                criticalViolations: report.summary.criticalViolations,
                highViolations: report.summary.highViolations,
                recommendedActions: report.trainingRecommendations.slice(0, 3)
            }
        };

        // Save CI/CD report
        if (this.options.generateReports) {
            const reportPath = path.join(this.options.projectPath, 'security-cicd-report.json');
            await fs.writeFile(reportPath, JSON.stringify(cicdReport, null, 2));
        }

        return cicdReport;
    }

    /**
     * Real-time validation setup
     */
    async setupFileWatchers() {
        const chokidar = require('chokidar');
        
        const watcher = chokidar.watch('**/*.{js,ts,jsx,tsx}', {
            cwd: this.options.projectPath,
            ignored: ['node_modules/**', 'dist/**', 'build/**'],
            persistent: true
        });

        watcher.on('change', async (filePath) => {
            try {
                const fullPath = path.join(this.options.projectPath, filePath);
                const result = await this.validateCode(fullPath);
                
                if (result.violations.length > 0) {
                    this.logger.warn('Security violations detected in real-time', {
                        file: filePath,
                        violations: result.violations.length
                    });
                    
                    // Auto-fix if enabled
                    if (this.options.autoFix) {
                        await this.autoFixViolations(fullPath);
                    }
                }
                
            } catch (error) {
                this.logger.error('Real-time validation failed', {
                    file: filePath,
                    error: error.message
                });
            }
        });

        this.logger.info('File watchers setup for real-time validation');
    }

    // Utility methods
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    getColumnNumber(content, index) {
        const lines = content.substring(0, index).split('\n');
        return lines[lines.length - 1].length + 1;
    }

    /**
     * Public API methods
     */
    async validateProject() {
        const results = [];
        const files = await this.getJavaScriptFiles();
        
        for (const file of files) {
            const result = await this.validateCode(file);
            results.push(result);
        }
        
        return results;
    }

    async getJavaScriptFiles() {
        const files = [];
        
        async function walkDir(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                        await walkDir(fullPath);
                    }
                } else if (entry.isFile()) {
                    if (/\.(js|ts|jsx|tsx)$/.test(entry.name) && 
                        !/\.(test|spec|min)\./.test(entry.name)) {
                        files.push(fullPath);
                    }
                }
            }
        }
        
        await walkDir(this.options.projectPath);
        return files;
    }

    getMetrics() {
        return {
            ...this.metrics,
            violationsByFile: this.violations.size,
            timestamp: new Date().toISOString()
        };
    }

    async healthCheck() {
        return {
            status: 'healthy',
            patterns: Object.keys(this.securityPatterns).length,
            rules: Object.values(this.securityPatterns).reduce((acc, cat) => acc + cat.rules.length, 0),
            eslintConfigured: !!this.eslint,
            realTimeValidation: this.options.realTimeValidation,
            autoFix: this.options.autoFix
        };
    }
}

module.exports = SecureCodingEnforcer;