/**
 * User Experience Monitor
 * Tracks page load times, error rates, user satisfaction, and experience metrics
 * Implements Real User Monitoring (RUM) and synthetic monitoring
 */

const { chromium } = require('playwright');
const Redis = require('redis');
const winston = require('winston');

class UserExperienceMonitor {
    constructor() {
        this.redis = Redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/user-experience.log' }),
                new winston.transports.Console()
            ]
        });

        this.browser = null;
        this.performanceThresholds = {
            pageLoadTime: { good: 2500, poor: 4000 }, // Core Web Vitals LCP
            firstContentfulPaint: { good: 1800, poor: 3000 },
            firstInputDelay: { good: 100, poor: 300 }, // Core Web Vitals FID
            cumulativeLayoutShift: { good: 0.1, poor: 0.25 }, // Core Web Vitals CLS
            timeToInteractive: { good: 3800, poor: 7300 },
            errorRate: { good: 0.1, poor: 1.0 }, // percentage
            userSatisfaction: { good: 4.0, poor: 2.5 } // 1-5 scale
        };

        this.monitoringUrls = [
            { url: 'http://localhost:3000', name: 'home_page', critical: true },
            { url: 'http://localhost:3000/dashboard', name: 'dashboard', critical: true },
            { url: 'http://localhost:3000/analytics', name: 'analytics', critical: true },
            { url: 'http://localhost:3000/campaigns', name: 'campaigns', critical: false },
            { url: 'http://localhost:3000/settings', name: 'settings', critical: false }
        ];

        this.userJourneys = [
            {
                name: 'campaign_creation',
                steps: [
                    { action: 'navigate', url: 'http://localhost:3000/dashboard' },
                    { action: 'click', selector: '[data-testid="create-campaign"]' },
                    { action: 'fill', selector: '#campaign-name', value: 'Test Campaign' },
                    { action: 'click', selector: '[data-testid="save-campaign"]' },
                    { action: 'waitForSelector', selector: '[data-testid="campaign-success"]' }
                ],
                timeout: 30000,
                critical: true
            },
            {
                name: 'analytics_view',
                steps: [
                    { action: 'navigate', url: 'http://localhost:3000/analytics' },
                    { action: 'waitForSelector', selector: '[data-testid="analytics-dashboard"]' },
                    { action: 'click', selector: '[data-testid="date-filter"]' },
                    { action: 'click', selector: '[data-value="7days"]' }
                ],
                timeout: 15000,
                critical: true
            },
            {
                name: 'settings_update',
                steps: [
                    { action: 'navigate', url: 'http://localhost:3000/settings' },
                    { action: 'fill', selector: '#notification-email', value: 'test@example.com' },
                    { action: 'click', selector: '[data-testid="save-settings"]' },
                    { action: 'waitForSelector', selector: '[data-testid="settings-saved"]' }
                ],
                timeout: 20000,
                critical: false
            }
        ];

        this.deviceProfiles = [
            { name: 'desktop', viewport: { width: 1920, height: 1080 }, userAgent: 'desktop' },
            { name: 'tablet', viewport: { width: 768, height: 1024 }, userAgent: 'tablet' },
            { name: 'mobile', viewport: { width: 375, height: 667 }, userAgent: 'mobile' }
        ];

        this.networkConditions = [
            { name: 'fast_3g', downloadThroughput: 1.5 * 1024, uploadThroughput: 0.75 * 1024, latency: 40 },
            { name: 'slow_3g', downloadThroughput: 0.5 * 1024, uploadThroughput: 0.5 * 1024, latency: 400 },
            { name: 'wifi', downloadThroughput: 10 * 1024, uploadThroughput: 5 * 1024, latency: 5 }
        ];

        this.userFeedback = new Map();
        this.syntheticResults = new Map();
        this.rumData = new Map();

        this.initialize();
    }

    async initialize() {
        await this.redis.connect();
        this.logger.info('User Experience Monitor initialized');

        // Initialize browser for synthetic monitoring
        await this.initializeBrowser();

        // Start monitoring processes
        this.startSyntheticMonitoring();
        this.startRealUserMonitoring();
        this.startUserSatisfactionTracking();
        this.startPerformanceBudgetMonitoring();

        // Set up error tracking
        this.setupErrorTracking();
    }

    async initializeBrowser() {
        try {
            this.browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.logger.info('Browser initialized for synthetic monitoring');
        } catch (error) {
            this.logger.error('Failed to initialize browser:', error);
        }
    }

    startSyntheticMonitoring() {
        // Run synthetic tests every 5 minutes
        setInterval(async () => {
            await this.performSyntheticTests();
        }, 300000);

        // Run user journey tests every 15 minutes
        setInterval(async () => {
            await this.performUserJourneyTests();
        }, 900000);

        // Run cross-device tests every 30 minutes
        setInterval(async () => {
            await this.performCrossDeviceTests();
        }, 1800000);
    }

    async performSyntheticTests() {
        const timestamp = Date.now();
        const results = [];

        try {
            for (const urlConfig of this.monitoringUrls) {
                const result = await this.testPagePerformance(urlConfig);
                results.push(result);
            }

            // Store synthetic test results
            const syntheticData = {
                timestamp,
                results,
                summary: this.calculateSyntheticSummary(results)
            };

            await this.redis.hSet('monitoring:synthetic', JSON.stringify(syntheticData));
            await this.redis.lPush('monitoring:synthetic_history', JSON.stringify(syntheticData));
            await this.redis.lTrim('monitoring:synthetic_history', 0, 288); // Keep 24 hours

            // Trigger alerts for critical issues
            await this.evaluateSyntheticResults(results);

            this.logger.info('Synthetic monitoring completed', {
                urlsTested: results.length,
                averageLoadTime: syntheticData.summary.averageLoadTime,
                errorCount: syntheticData.summary.errorCount
            });

        } catch (error) {
            this.logger.error('Synthetic monitoring failed:', error);
        }
    }

    async testPagePerformance(urlConfig) {
        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        const startTime = Date.now();
        
        try {
            // Collect performance metrics
            const performanceMetrics = {
                url: urlConfig.url,
                name: urlConfig.name,
                critical: urlConfig.critical,
                timestamp: startTime
            };

            // Navigate and measure core metrics
            const response = await page.goto(urlConfig.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });

            const loadTime = Date.now() - startTime;
            performanceMetrics.loadTime = loadTime;
            performanceMetrics.status = response.status();
            performanceMetrics.success = response.ok();

            // Collect Core Web Vitals
            const webVitals = await this.collectWebVitals(page);
            performanceMetrics.webVitals = webVitals;

            // Collect resource metrics
            const resourceMetrics = await this.collectResourceMetrics(page);
            performanceMetrics.resources = resourceMetrics;

            // Test accessibility
            const accessibilityScore = await this.testAccessibility(page);
            performanceMetrics.accessibility = accessibilityScore;

            // Test functionality
            const functionalityResults = await this.testBasicFunctionality(page, urlConfig.name);
            performanceMetrics.functionality = functionalityResults;

            // Calculate performance score
            performanceMetrics.performanceScore = this.calculatePerformanceScore(performanceMetrics);

            await context.close();
            return performanceMetrics;

        } catch (error) {
            await context.close();
            return {
                url: urlConfig.url,
                name: urlConfig.name,
                critical: urlConfig.critical,
                timestamp: startTime,
                error: error.message,
                success: false,
                performanceScore: 0
            };
        }
    }

    async collectWebVitals(page) {
        try {
            const webVitals = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const vitals = {};
                    
                    // Largest Contentful Paint (LCP)
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        if (entries.length > 0) {
                            vitals.lcp = entries[entries.length - 1].startTime;
                        }
                    }).observe({ type: 'largest-contentful-paint', buffered: true });
                    
                    // First Input Delay (FID) - simulated
                    vitals.fid = Math.random() * 100; // Simulated since it requires real user interaction
                    
                    // Cumulative Layout Shift (CLS)
                    let clsScore = 0;
                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) {
                                clsScore += entry.value;
                            }
                        }
                        vitals.cls = clsScore;
                    }).observe({ type: 'layout-shift', buffered: true });
                    
                    // First Contentful Paint (FCP)
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        if (entries.length > 0) {
                            vitals.fcp = entries[0].startTime;
                        }
                    }).observe({ type: 'paint', buffered: true });
                    
                    // Time to Interactive (TTI) - approximated
                    setTimeout(() => {
                        vitals.tti = performance.now();
                        resolve(vitals);
                    }, 1000);
                });
            });

            return webVitals;
        } catch (error) {
            return {
                lcp: null,
                fid: null,
                cls: null,
                fcp: null,
                tti: null,
                error: error.message
            };
        }
    }

    async collectResourceMetrics(page) {
        try {
            const resourceData = await page.evaluate(() => {
                const resources = performance.getEntriesByType('resource');
                const navigation = performance.getEntriesByType('navigation')[0];
                
                return {
                    totalResources: resources.length,
                    totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadEvent: navigation.loadEventEnd - navigation.loadEventStart,
                    imageResources: resources.filter(r => r.initiatorType === 'img').length,
                    scriptResources: resources.filter(r => r.initiatorType === 'script').length,
                    stylesheetResources: resources.filter(r => r.initiatorType === 'link').length,
                    slowResources: resources.filter(r => r.duration > 1000).length
                };
            });

            return resourceData;
        } catch (error) {
            return { error: error.message };
        }
    }

    async testAccessibility(page) {
        try {
            // Basic accessibility checks
            const accessibilityResults = await page.evaluate(() => {
                const score = { total: 100, deductions: 0, issues: [] };
                
                // Check for alt text on images
                const images = document.querySelectorAll('img');
                const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
                if (imagesWithoutAlt.length > 0) {
                    score.deductions += imagesWithoutAlt.length * 5;
                    score.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
                }
                
                // Check for form labels
                const inputs = document.querySelectorAll('input, select, textarea');
                const inputsWithoutLabels = Array.from(inputs).filter(input => {
                    const id = input.id;
                    return !id || !document.querySelector(`label[for="${id}"]`);
                });
                if (inputsWithoutLabels.length > 0) {
                    score.deductions += inputsWithoutLabels.length * 10;
                    score.issues.push(`${inputsWithoutLabels.length} form inputs missing labels`);
                }
                
                // Check for heading hierarchy
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                if (headings.length === 0) {
                    score.deductions += 20;
                    score.issues.push('No heading structure found');
                }
                
                return {
                    score: Math.max(0, score.total - score.deductions),
                    issues: score.issues
                };
            });

            return accessibilityResults;
        } catch (error) {
            return { score: 0, error: error.message };
        }
    }

    async testBasicFunctionality(page, pageName) {
        try {
            const functionalityTests = [];

            switch (pageName) {
                case 'home_page':
                    functionalityTests.push(
                        this.testElementExists(page, 'nav', 'Navigation menu'),
                        this.testElementExists(page, 'main', 'Main content area'),
                        this.testElementExists(page, 'footer', 'Footer')
                    );
                    break;

                case 'dashboard':
                    functionalityTests.push(
                        this.testElementExists(page, '[data-testid="dashboard-header"]', 'Dashboard header'),
                        this.testElementExists(page, '[data-testid="stats-overview"]', 'Statistics overview'),
                        this.testElementExists(page, '[data-testid="recent-campaigns"]', 'Recent campaigns')
                    );
                    break;

                case 'analytics':
                    functionalityTests.push(
                        this.testElementExists(page, '[data-testid="analytics-dashboard"]', 'Analytics dashboard'),
                        this.testElementExists(page, '[data-testid="chart-container"]', 'Chart container'),
                        this.testElementExists(page, '[data-testid="metrics-summary"]', 'Metrics summary')
                    );
                    break;

                default:
                    functionalityTests.push(
                        this.testElementExists(page, 'body', 'Page body')
                    );
            }

            const results = await Promise.all(functionalityTests);
            const passedTests = results.filter(r => r.passed).length;
            const totalTests = results.length;

            return {
                tests: results,
                passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
                passed: passedTests,
                total: totalTests
            };
        } catch (error) {
            return {
                error: error.message,
                passRate: 0
            };
        }
    }

    async testElementExists(page, selector, description) {
        try {
            const element = await page.waitForSelector(selector, { timeout: 5000 });
            return {
                test: description,
                selector,
                passed: !!element,
                message: element ? 'Element found' : 'Element not found'
            };
        } catch (error) {
            return {
                test: description,
                selector,
                passed: false,
                message: `Element not found: ${error.message}`
            };
        }
    }

    calculatePerformanceScore(metrics) {
        let score = 100;

        // Load time scoring
        if (metrics.loadTime > this.performanceThresholds.pageLoadTime.poor) {
            score -= 30;
        } else if (metrics.loadTime > this.performanceThresholds.pageLoadTime.good) {
            score -= 15;
        }

        // Web Vitals scoring
        if (metrics.webVitals) {
            if (metrics.webVitals.lcp > this.performanceThresholds.pageLoadTime.poor) {
                score -= 20;
            } else if (metrics.webVitals.lcp > this.performanceThresholds.pageLoadTime.good) {
                score -= 10;
            }

            if (metrics.webVitals.cls > this.performanceThresholds.cumulativeLayoutShift.poor) {
                score -= 15;
            } else if (metrics.webVitals.cls > this.performanceThresholds.cumulativeLayoutShift.good) {
                score -= 8;
            }

            if (metrics.webVitals.fid > this.performanceThresholds.firstInputDelay.poor) {
                score -= 15;
            } else if (metrics.webVitals.fid > this.performanceThresholds.firstInputDelay.good) {
                score -= 8;
            }
        }

        // HTTP status scoring
        if (!metrics.success) {
            score -= 50;
        }

        // Accessibility scoring
        if (metrics.accessibility && metrics.accessibility.score < 80) {
            score -= 10;
        }

        // Functionality scoring
        if (metrics.functionality && metrics.functionality.passRate < 100) {
            score -= (100 - metrics.functionality.passRate) * 0.2;
        }

        return Math.max(0, Math.round(score));
    }

    calculateSyntheticSummary(results) {
        const summary = {
            totalTests: results.length,
            successfulTests: results.filter(r => r.success).length,
            failedTests: results.filter(r => !r.success).length,
            averageLoadTime: 0,
            averagePerformanceScore: 0,
            criticalIssues: 0,
            errorCount: 0
        };

        const successfulResults = results.filter(r => r.success);
        if (successfulResults.length > 0) {
            summary.averageLoadTime = Math.round(
                successfulResults.reduce((sum, r) => sum + r.loadTime, 0) / successfulResults.length
            );
            summary.averagePerformanceScore = Math.round(
                successfulResults.reduce((sum, r) => sum + r.performanceScore, 0) / successfulResults.length
            );
        }

        summary.criticalIssues = results.filter(r => r.critical && (!r.success || r.performanceScore < 50)).length;
        summary.errorCount = results.filter(r => r.error).length;

        return summary;
    }

    async evaluateSyntheticResults(results) {
        const alerts = [];

        // Check for critical page failures
        const criticalFailures = results.filter(r => r.critical && !r.success);
        if (criticalFailures.length > 0) {
            alerts.push({
                type: 'critical_page_failure',
                severity: 'critical',
                message: `${criticalFailures.length} critical pages are failing`,
                pages: criticalFailures.map(f => f.name)
            });
        }

        // Check for performance degradation
        const slowPages = results.filter(r => r.success && r.loadTime > this.performanceThresholds.pageLoadTime.poor);
        if (slowPages.length > 0) {
            alerts.push({
                type: 'performance_degradation',
                severity: 'warning',
                message: `${slowPages.length} pages have poor load times`,
                pages: slowPages.map(p => ({ name: p.name, loadTime: p.loadTime }))
            });
        }

        // Check for accessibility issues
        const accessibilityIssues = results.filter(r => r.accessibility && r.accessibility.score < 70);
        if (accessibilityIssues.length > 0) {
            alerts.push({
                type: 'accessibility_issues',
                severity: 'warning',
                message: `${accessibilityIssues.length} pages have accessibility issues`,
                pages: accessibilityIssues.map(p => p.name)
            });
        }

        // Send alerts
        for (const alert of alerts) {
            await this.sendUXAlert(alert);
        }
    }

    async performUserJourneyTests() {
        const timestamp = Date.now();
        const results = [];

        try {
            for (const journey of this.userJourneys) {
                const result = await this.testUserJourney(journey);
                results.push(result);
            }

            // Store user journey results
            const journeyData = {
                timestamp,
                results,
                summary: this.calculateJourneySummary(results)
            };

            await this.redis.hSet('monitoring:user_journeys', JSON.stringify(journeyData));
            await this.redis.lPush('monitoring:journey_history', JSON.stringify(journeyData));
            await this.redis.lTrim('monitoring:journey_history', 0, 96); // Keep 24 hours

            // Trigger alerts for failed critical journeys
            await this.evaluateJourneyResults(results);

            this.logger.info('User journey testing completed', {
                journeysTested: results.length,
                successful: journeyData.summary.successful,
                failed: journeyData.summary.failed
            });

        } catch (error) {
            this.logger.error('User journey testing failed:', error);
        }
    }

    async testUserJourney(journey) {
        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        const startTime = Date.now();
        
        try {
            const stepResults = [];
            
            for (const step of journey.steps) {
                const stepStart = Date.now();
                const stepResult = await this.executeJourneyStep(page, step);
                stepResult.duration = Date.now() - stepStart;
                stepResults.push(stepResult);
                
                if (!stepResult.success) {
                    break; // Stop on first failure
                }
            }

            const totalDuration = Date.now() - startTime;
            const success = stepResults.every(step => step.success);

            await context.close();

            return {
                name: journey.name,
                critical: journey.critical,
                timestamp: startTime,
                duration: totalDuration,
                success,
                steps: stepResults,
                completedSteps: stepResults.filter(s => s.success).length,
                totalSteps: journey.steps.length
            };

        } catch (error) {
            await context.close();
            return {
                name: journey.name,
                critical: journey.critical,
                timestamp: startTime,
                duration: Date.now() - startTime,
                success: false,
                error: error.message,
                steps: [],
                completedSteps: 0,
                totalSteps: journey.steps.length
            };
        }
    }

    async executeJourneyStep(page, step) {
        try {
            switch (step.action) {
                case 'navigate':
                    await page.goto(step.url, { waitUntil: 'networkidle', timeout: 15000 });
                    return { action: step.action, success: true, url: step.url };

                case 'click':
                    await page.click(step.selector, { timeout: 10000 });
                    return { action: step.action, success: true, selector: step.selector };

                case 'fill':
                    await page.fill(step.selector, step.value, { timeout: 10000 });
                    return { action: step.action, success: true, selector: step.selector };

                case 'waitForSelector':
                    await page.waitForSelector(step.selector, { timeout: 15000 });
                    return { action: step.action, success: true, selector: step.selector };

                case 'waitForNavigation':
                    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
                    return { action: step.action, success: true };

                default:
                    return { action: step.action, success: false, error: 'Unknown action' };
            }
        } catch (error) {
            return {
                action: step.action,
                success: false,
                error: error.message,
                selector: step.selector,
                url: step.url
            };
        }
    }

    calculateJourneySummary(results) {
        return {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            criticalFailed: results.filter(r => r.critical && !r.success).length,
            averageDuration: results.length > 0 ? 
                Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length) : 0,
            successRate: results.length > 0 ? 
                Math.round((results.filter(r => r.success).length / results.length) * 100) : 0
        };
    }

    async evaluateJourneyResults(results) {
        const alerts = [];

        // Check for critical journey failures
        const criticalFailures = results.filter(r => r.critical && !r.success);
        if (criticalFailures.length > 0) {
            alerts.push({
                type: 'critical_journey_failure',
                severity: 'critical',
                message: `${criticalFailures.length} critical user journeys are failing`,
                journeys: criticalFailures.map(f => f.name)
            });
        }

        // Check for journey performance degradation
        const slowJourneys = results.filter(r => r.success && r.duration > 30000);
        if (slowJourneys.length > 0) {
            alerts.push({
                type: 'journey_performance_degradation',
                severity: 'warning',
                message: `${slowJourneys.length} user journeys are taking too long`,
                journeys: slowJourneys.map(j => ({ name: j.name, duration: j.duration }))
            });
        }

        // Send alerts
        for (const alert of alerts) {
            await this.sendUXAlert(alert);
        }
    }

    async performCrossDeviceTests() {
        const timestamp = Date.now();
        const results = [];

        try {
            for (const device of this.deviceProfiles) {
                for (const network of this.networkConditions) {
                    const testResult = await this.testDeviceNetworkCombination(device, network);
                    results.push(testResult);
                }
            }

            // Store cross-device results
            const crossDeviceData = {
                timestamp,
                results,
                summary: this.calculateCrossDeviceSummary(results)
            };

            await this.redis.hSet('monitoring:cross_device', JSON.stringify(crossDeviceData));
            await this.redis.lPush('monitoring:cross_device_history', JSON.stringify(crossDeviceData));
            await this.redis.lTrim('monitoring:cross_device_history', 0, 48); // Keep 24 hours

            this.logger.info('Cross-device testing completed', {
                combinations: results.length,
                averageScore: crossDeviceData.summary.averageScore
            });

        } catch (error) {
            this.logger.error('Cross-device testing failed:', error);
        }
    }

    async testDeviceNetworkCombination(device, network) {
        const context = await this.browser.newContext({
            viewport: device.viewport,
            userAgent: device.userAgent
        });
        
        const page = await context.newPage();
        
        try {
            // Simulate network conditions
            await context.route('**/*', (route) => {
                setTimeout(() => {
                    route.continue();
                }, network.latency);
            });

            const startTime = Date.now();
            const response = await page.goto('http://localhost:3000', { 
                waitUntil: 'networkidle',
                timeout: 45000 
            });

            const loadTime = Date.now() - startTime;
            const webVitals = await this.collectWebVitals(page);

            await context.close();

            return {
                device: device.name,
                network: network.name,
                timestamp: startTime,
                loadTime,
                webVitals,
                success: response.ok(),
                performanceScore: this.calculateDevicePerformanceScore(loadTime, webVitals, device, network)
            };

        } catch (error) {
            await context.close();
            return {
                device: device.name,
                network: network.name,
                timestamp: Date.now(),
                success: false,
                error: error.message,
                performanceScore: 0
            };
        }
    }

    calculateDevicePerformanceScore(loadTime, webVitals, device, network) {
        let score = 100;

        // Adjust thresholds based on device and network
        const adjustedThresholds = {
            mobile: {
                slow_3g: { loadTime: 8000, lcp: 6000 },
                fast_3g: { loadTime: 5000, lcp: 4000 },
                wifi: { loadTime: 3000, lcp: 2500 }
            },
            tablet: {
                slow_3g: { loadTime: 6000, lcp: 5000 },
                fast_3g: { loadTime: 4000, lcp: 3500 },
                wifi: { loadTime: 2500, lcp: 2000 }
            },
            desktop: {
                slow_3g: { loadTime: 5000, lcp: 4000 },
                fast_3g: { loadTime: 3000, lcp: 2500 },
                wifi: { loadTime: 2000, lcp: 1800 }
            }
        };

        const threshold = adjustedThresholds[device.name][network.name];

        if (loadTime > threshold.loadTime * 1.5) {
            score -= 40;
        } else if (loadTime > threshold.loadTime) {
            score -= 20;
        }

        if (webVitals.lcp > threshold.lcp * 1.5) {
            score -= 30;
        } else if (webVitals.lcp > threshold.lcp) {
            score -= 15;
        }

        return Math.max(0, score);
    }

    calculateCrossDeviceSummary(results) {
        const successful = results.filter(r => r.success);
        
        return {
            total: results.length,
            successful: successful.length,
            failed: results.filter(r => !r.success).length,
            averageScore: successful.length > 0 ? 
                Math.round(successful.reduce((sum, r) => sum + r.performanceScore, 0) / successful.length) : 0,
            deviceBreakdown: this.groupResultsByDevice(results),
            networkBreakdown: this.groupResultsByNetwork(results)
        };
    }

    groupResultsByDevice(results) {
        const breakdown = {};
        for (const result of results) {
            if (!breakdown[result.device]) {
                breakdown[result.device] = { total: 0, successful: 0, averageScore: 0 };
            }
            breakdown[result.device].total++;
            if (result.success) {
                breakdown[result.device].successful++;
            }
        }

        // Calculate average scores
        for (const device in breakdown) {
            const deviceResults = results.filter(r => r.device === device && r.success);
            breakdown[device].averageScore = deviceResults.length > 0 ?
                Math.round(deviceResults.reduce((sum, r) => sum + r.performanceScore, 0) / deviceResults.length) : 0;
        }

        return breakdown;
    }

    groupResultsByNetwork(results) {
        const breakdown = {};
        for (const result of results) {
            if (!breakdown[result.network]) {
                breakdown[result.network] = { total: 0, successful: 0, averageScore: 0 };
            }
            breakdown[result.network].total++;
            if (result.success) {
                breakdown[result.network].successful++;
            }
        }

        // Calculate average scores
        for (const network in breakdown) {
            const networkResults = results.filter(r => r.network === network && r.success);
            breakdown[network].averageScore = networkResults.length > 0 ?
                Math.round(networkResults.reduce((sum, r) => sum + r.performanceScore, 0) / networkResults.length) : 0;
        }

        return breakdown;
    }

    startRealUserMonitoring() {
        // Set up RUM data collection endpoint simulation
        setInterval(async () => {
            await this.collectRUMData();
        }, 60000); // Every minute

        // Process RUM data every 5 minutes
        setInterval(async () => {
            await this.processRUMData();
        }, 300000);
    }

    async collectRUMData() {
        // Simulate real user monitoring data collection
        const rumSample = {
            timestamp: Date.now(),
            sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
            userId: `user_${Math.floor(Math.random() * 10000)}`,
            page: this.getRandomPage(),
            metrics: {
                loadTime: Math.random() * 3000 + 500,
                fcp: Math.random() * 2000 + 300,
                lcp: Math.random() * 4000 + 1000,
                fid: Math.random() * 200 + 10,
                cls: Math.random() * 0.3,
                tti: Math.random() * 5000 + 1500
            },
            device: {
                type: this.getRandomDeviceType(),
                connection: this.getRandomConnectionType()
            },
            userAgent: this.getRandomUserAgent(),
            errors: Math.random() > 0.95 ? [{ message: 'Sample error', stack: 'Error stack trace' }] : []
        };

        await this.redis.lPush('rum:raw_data', JSON.stringify(rumSample));
        await this.redis.lTrim('rum:raw_data', 0, 10000); // Keep latest 10k samples
    }

    async processRUMData() {
        try {
            const rawData = await this.redis.lRange('rum:raw_data', 0, -1);
            const samples = rawData.map(data => JSON.parse(data));

            if (samples.length === 0) return;

            const processedData = {
                timestamp: Date.now(),
                totalSamples: samples.length,
                timeRange: {
                    start: Math.min(...samples.map(s => s.timestamp)),
                    end: Math.max(...samples.map(s => s.timestamp))
                },
                performance: this.analyzeRUMPerformance(samples),
                devices: this.analyzeRUMDevices(samples),
                pages: this.analyzeRUMPages(samples),
                errors: this.analyzeRUMErrors(samples),
                userSatisfaction: this.calculateUserSatisfactionFromRUM(samples)
            };

            await this.redis.hSet('monitoring:rum_analysis', JSON.stringify(processedData));
            await this.redis.lPush('monitoring:rum_history', JSON.stringify(processedData));
            await this.redis.lTrim('monitoring:rum_history', 0, 288); // Keep 24 hours

            // Clear processed raw data
            await this.redis.del('rum:raw_data');

            this.logger.info('RUM data processed', {
                samples: processedData.totalSamples,
                averageLoadTime: processedData.performance.averageLoadTime,
                userSatisfaction: processedData.userSatisfaction.score
            });

        } catch (error) {
            this.logger.error('RUM data processing failed:', error);
        }
    }

    analyzeRUMPerformance(samples) {
        const loadTimes = samples.map(s => s.metrics.loadTime);
        const fcpTimes = samples.map(s => s.metrics.fcp);
        const lcpTimes = samples.map(s => s.metrics.lcp);
        const fidTimes = samples.map(s => s.metrics.fid);
        const clsValues = samples.map(s => s.metrics.cls);

        return {
            averageLoadTime: Math.round(loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length),
            medianLoadTime: this.calculateMedian(loadTimes),
            p95LoadTime: this.calculatePercentile(loadTimes, 95),
            averageFCP: Math.round(fcpTimes.reduce((sum, t) => sum + t, 0) / fcpTimes.length),
            averageLCP: Math.round(lcpTimes.reduce((sum, t) => sum + t, 0) / lcpTimes.length),
            averageFID: Math.round(fidTimes.reduce((sum, t) => sum + t, 0) / fidTimes.length),
            averageCLS: Math.round((clsValues.reduce((sum, v) => sum + v, 0) / clsValues.length) * 1000) / 1000,
            coreWebVitalsScore: this.calculateCoreWebVitalsScore(samples)
        };
    }

    analyzeRUMDevices(samples) {
        const deviceGroups = samples.reduce((groups, sample) => {
            const device = sample.device.type;
            if (!groups[device]) groups[device] = [];
            groups[device].push(sample);
            return groups;
        }, {});

        const deviceAnalysis = {};
        for (const [device, deviceSamples] of Object.entries(deviceGroups)) {
            const loadTimes = deviceSamples.map(s => s.metrics.loadTime);
            deviceAnalysis[device] = {
                count: deviceSamples.length,
                percentage: Math.round((deviceSamples.length / samples.length) * 100),
                averageLoadTime: Math.round(loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length),
                errorRate: (deviceSamples.filter(s => s.errors.length > 0).length / deviceSamples.length) * 100
            };
        }

        return deviceAnalysis;
    }

    analyzeRUMPages(samples) {
        const pageGroups = samples.reduce((groups, sample) => {
            const page = sample.page;
            if (!groups[page]) groups[page] = [];
            groups[page].push(sample);
            return groups;
        }, {});

        const pageAnalysis = {};
        for (const [page, pageSamples] of Object.entries(pageGroups)) {
            const loadTimes = pageSamples.map(s => s.metrics.loadTime);
            pageAnalysis[page] = {
                views: pageSamples.length,
                uniqueUsers: new Set(pageSamples.map(s => s.userId)).size,
                averageLoadTime: Math.round(loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length),
                bounceRate: this.calculateBounceRate(pageSamples),
                errorRate: (pageSamples.filter(s => s.errors.length > 0).length / pageSamples.length) * 100
            };
        }

        return pageAnalysis;
    }

    analyzeRUMErrors(samples) {
        const errors = samples.filter(s => s.errors.length > 0);
        const errorMessages = errors.flatMap(s => s.errors.map(e => e.message));
        const errorCounts = errorMessages.reduce((counts, message) => {
            counts[message] = (counts[message] || 0) + 1;
            return counts;
        }, {});

        return {
            totalErrors: errors.length,
            errorRate: (errors.length / samples.length) * 100,
            topErrors: Object.entries(errorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([message, count]) => ({ message, count })),
            errorsByPage: this.groupErrorsByPage(errors)
        };
    }

    groupErrorsByPage(errorSamples) {
        const pageErrors = errorSamples.reduce((groups, sample) => {
            if (!groups[sample.page]) groups[sample.page] = 0;
            groups[sample.page] += sample.errors.length;
            return groups;
        }, {});

        return Object.entries(pageErrors)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([page, count]) => ({ page, count }));
    }

    calculateUserSatisfactionFromRUM(samples) {
        // Calculate user satisfaction based on performance metrics
        let satisfactionScore = 0;
        const totalSamples = samples.length;

        for (const sample of samples) {
            let sampleScore = 5; // Start with perfect score

            // Deduct based on load time
            if (sample.metrics.loadTime > this.performanceThresholds.pageLoadTime.poor) {
                sampleScore -= 2;
            } else if (sample.metrics.loadTime > this.performanceThresholds.pageLoadTime.good) {
                sampleScore -= 1;
            }

            // Deduct based on FID
            if (sample.metrics.fid > this.performanceThresholds.firstInputDelay.poor) {
                sampleScore -= 1.5;
            } else if (sample.metrics.fid > this.performanceThresholds.firstInputDelay.good) {
                sampleScore -= 0.5;
            }

            // Deduct based on CLS
            if (sample.metrics.cls > this.performanceThresholds.cumulativeLayoutShift.poor) {
                sampleScore -= 1;
            } else if (sample.metrics.cls > this.performanceThresholds.cumulativeLayoutShift.good) {
                sampleScore -= 0.3;
            }

            // Deduct for errors
            if (sample.errors.length > 0) {
                sampleScore -= 1.5;
            }

            satisfactionScore += Math.max(1, sampleScore);
        }

        const averageScore = satisfactionScore / totalSamples;
        
        return {
            score: Math.round(averageScore * 10) / 10,
            category: this.categorizeUserSatisfaction(averageScore),
            distribution: this.calculateSatisfactionDistribution(samples)
        };
    }

    categorizeUserSatisfaction(score) {
        if (score >= 4.5) return 'excellent';
        if (score >= 4.0) return 'good';
        if (score >= 3.0) return 'fair';
        if (score >= 2.0) return 'poor';
        return 'very_poor';
    }

    calculateSatisfactionDistribution(samples) {
        const distribution = { excellent: 0, good: 0, fair: 0, poor: 0, very_poor: 0 };
        
        for (const sample of samples) {
            let score = 5;
            
            if (sample.metrics.loadTime > this.performanceThresholds.pageLoadTime.poor) score -= 2;
            else if (sample.metrics.loadTime > this.performanceThresholds.pageLoadTime.good) score -= 1;
            
            if (sample.errors.length > 0) score -= 1.5;
            
            const category = this.categorizeUserSatisfaction(Math.max(1, score));
            distribution[category]++;
        }

        // Convert to percentages
        const total = samples.length;
        for (const category in distribution) {
            distribution[category] = Math.round((distribution[category] / total) * 100);
        }

        return distribution;
    }

    calculateBounceRate(pageSamples) {
        // Simplified bounce rate calculation
        // In real implementation, this would track user sessions and navigation
        return Math.random() * 30 + 10; // 10-40% bounce rate
    }

    calculateCoreWebVitalsScore(samples) {
        let score = 0;
        const totalSamples = samples.length;

        for (const sample of samples) {
            let sampleScore = 100;

            // LCP scoring
            if (sample.metrics.lcp <= this.performanceThresholds.pageLoadTime.good) {
                sampleScore += 0; // Good
            } else if (sample.metrics.lcp <= this.performanceThresholds.pageLoadTime.poor) {
                sampleScore -= 25; // Needs improvement
            } else {
                sampleScore -= 50; // Poor
            }

            // FID scoring
            if (sample.metrics.fid <= this.performanceThresholds.firstInputDelay.good) {
                sampleScore += 0; // Good
            } else if (sample.metrics.fid <= this.performanceThresholds.firstInputDelay.poor) {
                sampleScore -= 25; // Needs improvement
            } else {
                sampleScore -= 50; // Poor
            }

            // CLS scoring
            if (sample.metrics.cls <= this.performanceThresholds.cumulativeLayoutShift.good) {
                sampleScore += 0; // Good
            } else if (sample.metrics.cls <= this.performanceThresholds.cumulativeLayoutShift.poor) {
                sampleScore -= 25; // Needs improvement
            } else {
                sampleScore -= 50; // Poor
            }

            score += Math.max(0, sampleScore);
        }

        return Math.round(score / totalSamples);
    }

    startUserSatisfactionTracking() {
        // Simulate user feedback collection
        setInterval(async () => {
            await this.collectUserFeedback();
        }, 300000); // Every 5 minutes

        // Process user satisfaction data every hour
        setInterval(async () => {
            await this.processUserSatisfactionData();
        }, 3600000);
    }

    async collectUserFeedback() {
        // Simulate various types of user feedback
        const feedbackTypes = ['rating', 'nps', 'satisfaction_survey', 'bug_report', 'feature_request'];
        const feedbackType = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];

        const feedback = {
            timestamp: Date.now(),
            type: feedbackType,
            userId: `user_${Math.floor(Math.random() * 1000)}`,
            sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
            page: this.getRandomPage(),
            data: this.generateFeedbackData(feedbackType)
        };

        await this.redis.lPush('feedback:raw', JSON.stringify(feedback));
        await this.redis.lTrim('feedback:raw', 0, 1000); // Keep latest 1000 feedback items
    }

    generateFeedbackData(type) {
        switch (type) {
            case 'rating':
                return {
                    rating: Math.floor(Math.random() * 5) + 1,
                    category: 'overall_experience'
                };
            case 'nps':
                return {
                    score: Math.floor(Math.random() * 11), // 0-10
                    category: 'likelihood_to_recommend'
                };
            case 'satisfaction_survey':
                return {
                    overallSatisfaction: Math.floor(Math.random() * 5) + 1,
                    easeOfUse: Math.floor(Math.random() * 5) + 1,
                    performance: Math.floor(Math.random() * 5) + 1,
                    design: Math.floor(Math.random() * 5) + 1
                };
            case 'bug_report':
                return {
                    severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    category: 'bug_report',
                    description: 'Sample bug report'
                };
            case 'feature_request':
                return {
                    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    category: 'feature_request',
                    description: 'Sample feature request'
                };
            default:
                return {};
        }
    }

    async processUserSatisfactionData() {
        try {
            const rawFeedback = await this.redis.lRange('feedback:raw', 0, -1);
            const feedback = rawFeedback.map(f => JSON.parse(f));

            if (feedback.length === 0) return;

            const satisfactionData = {
                timestamp: Date.now(),
                totalFeedback: feedback.length,
                ratings: this.analyzeRatings(feedback.filter(f => f.type === 'rating')),
                nps: this.analyzeNPS(feedback.filter(f => f.type === 'nps')),
                satisfaction: this.analyzeSatisfactionSurveys(feedback.filter(f => f.type === 'satisfaction_survey')),
                issues: this.analyzeIssues(feedback.filter(f => ['bug_report', 'feature_request'].includes(f.type))),
                trends: await this.analyzeSatisfactionTrends(),
                overallScore: 0
            };

            // Calculate overall satisfaction score
            satisfactionData.overallScore = this.calculateOverallSatisfactionScore(satisfactionData);

            await this.redis.hSet('monitoring:user_satisfaction', JSON.stringify(satisfactionData));
            await this.redis.lPush('monitoring:satisfaction_history', JSON.stringify(satisfactionData));
            await this.redis.lTrim('monitoring:satisfaction_history', 0, 168); // Keep 7 days

            // Clear processed feedback
            await this.redis.del('feedback:raw');

            this.logger.info('User satisfaction data processed', {
                feedback: satisfactionData.totalFeedback,
                overallScore: satisfactionData.overallScore,
                npsScore: satisfactionData.nps.score
            });

        } catch (error) {
            this.logger.error('User satisfaction processing failed:', error);
        }
    }

    analyzeRatings(ratings) {
        if (ratings.length === 0) return { averageRating: 0, distribution: {} };

        const scores = ratings.map(r => r.data.rating);
        const averageRating = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        scores.forEach(score => distribution[score]++);

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            distribution,
            totalRatings: ratings.length
        };
    }

    analyzeNPS(npsResponses) {
        if (npsResponses.length === 0) return { score: 0, category: 'neutral' };

        const scores = npsResponses.map(r => r.data.score);
        const promoters = scores.filter(s => s >= 9).length;
        const passives = scores.filter(s => s >= 7 && s <= 8).length;
        const detractors = scores.filter(s => s <= 6).length;

        const npsScore = ((promoters - detractors) / scores.length) * 100;

        return {
            score: Math.round(npsScore),
            category: this.categorizeNPS(npsScore),
            promoters,
            passives,
            detractors,
            totalResponses: npsResponses.length
        };
    }

    categorizeNPS(score) {
        if (score >= 50) return 'excellent';
        if (score >= 20) return 'good';
        if (score >= 0) return 'acceptable';
        if (score >= -20) return 'poor';
        return 'critical';
    }

    analyzeSatisfactionSurveys(surveys) {
        if (surveys.length === 0) return {};

        const metrics = ['overallSatisfaction', 'easeOfUse', 'performance', 'design'];
        const analysis = {};

        for (const metric of metrics) {
            const scores = surveys.map(s => s.data[metric]).filter(s => s !== undefined);
            if (scores.length > 0) {
                analysis[metric] = {
                    average: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10,
                    responses: scores.length
                };
            }
        }

        return analysis;
    }

    analyzeIssues(issues) {
        const bugReports = issues.filter(i => i.type === 'bug_report');
        const featureRequests = issues.filter(i => i.type === 'feature_request');

        return {
            bugReports: {
                total: bugReports.length,
                bySeverity: this.groupBy(bugReports, 'data.severity')
            },
            featureRequests: {
                total: featureRequests.length,
                byPriority: this.groupBy(featureRequests, 'data.priority')
            }
        };
    }

    groupBy(items, path) {
        return items.reduce((groups, item) => {
            const key = this.getNestedValue(item, path) || 'unknown';
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    async analyzeSatisfactionTrends() {
        try {
            const history = await this.redis.lRange('monitoring:satisfaction_history', 0, 23); // Last 24 hours
            const data = history.map(h => JSON.parse(h));

            if (data.length < 2) return { trend: 'insufficient_data' };

            const recentScores = data.slice(0, 12).map(d => d.overallScore);
            const olderScores = data.slice(12).map(d => d.overallScore);

            const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
            const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

            const trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;

            return {
                trend: trendPercentage > 5 ? 'improving' : trendPercentage < -5 ? 'declining' : 'stable',
                changePercentage: Math.round(trendPercentage * 10) / 10,
                recentAverage: Math.round(recentAvg * 10) / 10,
                previousAverage: Math.round(olderAvg * 10) / 10
            };
        } catch (error) {
            return { trend: 'error', error: error.message };
        }
    }

    calculateOverallSatisfactionScore(data) {
        let score = 0;
        let components = 0;

        // Weight ratings (40%)
        if (data.ratings.averageRating > 0) {
            score += (data.ratings.averageRating / 5) * 40;
            components++;
        }

        // Weight NPS (30%)
        if (data.nps.score !== undefined) {
            score += ((data.nps.score + 100) / 200) * 30; // Normalize -100 to 100 range
            components++;
        }

        // Weight satisfaction surveys (30%)
        if (data.satisfaction.overallSatisfaction) {
            score += (data.satisfaction.overallSatisfaction.average / 5) * 30;
            components++;
        }

        return components > 0 ? Math.round(score) : 0;
    }

    startPerformanceBudgetMonitoring() {
        // Monitor performance budgets every hour
        setInterval(async () => {
            await this.checkPerformanceBudgets();
        }, 3600000);
    }

    async checkPerformanceBudgets() {
        try {
            const budgets = [
                { metric: 'loadTime', budget: 3000, weight: 0.3 },
                { metric: 'lcp', budget: 2500, weight: 0.25 },
                { metric: 'fid', budget: 100, weight: 0.2 },
                { metric: 'cls', budget: 0.1, weight: 0.15 },
                { metric: 'tti', budget: 3800, weight: 0.1 }
            ];

            const currentData = await this.getCurrentPerformanceData();
            const budgetResults = [];

            for (const budget of budgets) {
                const currentValue = currentData[budget.metric];
                const budgetStatus = currentValue <= budget.budget ? 'pass' : 'fail';
                const utilizationPercentage = (currentValue / budget.budget) * 100;

                budgetResults.push({
                    metric: budget.metric,
                    budget: budget.budget,
                    current: currentValue,
                    status: budgetStatus,
                    utilization: Math.round(utilizationPercentage),
                    weight: budget.weight
                });
            }

            const budgetData = {
                timestamp: Date.now(),
                results: budgetResults,
                overallStatus: budgetResults.every(r => r.status === 'pass') ? 'pass' : 'fail',
                budgetScore: this.calculateBudgetScore(budgetResults)
            };

            await this.redis.hSet('monitoring:performance_budgets', JSON.stringify(budgetData));

            // Alert on budget violations
            const violations = budgetResults.filter(r => r.status === 'fail');
            if (violations.length > 0) {
                await this.sendBudgetViolationAlert(violations);
            }

            this.logger.info('Performance budget check completed', {
                budgetScore: budgetData.budgetScore,
                violations: violations.length
            });

        } catch (error) {
            this.logger.error('Performance budget monitoring failed:', error);
        }
    }

    async getCurrentPerformanceData() {
        // Get current performance data from RUM or synthetic monitoring
        const rumData = await this.redis.hGet('monitoring:rum_analysis');
        if (rumData) {
            const data = JSON.parse(rumData);
            return {
                loadTime: data.performance.averageLoadTime,
                lcp: data.performance.averageLCP,
                fid: data.performance.averageFID,
                cls: data.performance.averageCLS,
                tti: data.performance.averageLoadTime * 1.2 // Approximation
            };
        }

        // Fallback to synthetic data
        const syntheticData = await this.redis.hGet('monitoring:synthetic');
        if (syntheticData) {
            const data = JSON.parse(syntheticData);
            return {
                loadTime: data.summary.averageLoadTime,
                lcp: data.summary.averageLoadTime * 0.8, // Approximation
                fid: 50, // Default approximation
                cls: 0.05, // Default approximation
                tti: data.summary.averageLoadTime * 1.1 // Approximation
            };
        }

        // Default values if no data available
        return {
            loadTime: 2000,
            lcp: 1800,
            fid: 50,
            cls: 0.05,
            tti: 2200
        };
    }

    calculateBudgetScore(budgetResults) {
        let weightedScore = 0;
        let totalWeight = 0;

        for (const result of budgetResults) {
            const score = result.status === 'pass' ? 100 : Math.max(0, 100 - (result.utilization - 100));
            weightedScore += score * result.weight;
            totalWeight += result.weight;
        }

        return Math.round(weightedScore / totalWeight);
    }

    async sendBudgetViolationAlert(violations) {
        const alert = {
            type: 'performance_budget_violation',
            severity: 'warning',
            message: `${violations.length} performance budget(s) exceeded`,
            violations: violations.map(v => ({
                metric: v.metric,
                budget: v.budget,
                current: v.current,
                utilization: v.utilization
            }))
        };

        await this.sendUXAlert(alert);
    }

    setupErrorTracking() {
        // Set up centralized error tracking
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception:', error);
            this.trackError(error, 'uncaught_exception');
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection:', reason);
            this.trackError(reason, 'unhandled_rejection');
        });
    }

    async trackError(error, type) {
        const errorData = {
            timestamp: Date.now(),
            type,
            message: error.message,
            stack: error.stack,
            name: error.name
        };

        await this.redis.lPush('errors:application', JSON.stringify(errorData));
        await this.redis.lTrim('errors:application', 0, 1000); // Keep latest 1000 errors

        // Send critical error alert
        if (type === 'uncaught_exception') {
            await this.sendUXAlert({
                type: 'critical_application_error',
                severity: 'critical',
                message: `Critical application error: ${error.message}`,
                error: errorData
            });
        }
    }

    async sendUXAlert(alert) {
        const alertData = {
            ...alert,
            timestamp: Date.now(),
            id: `ux_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: 'user_experience'
        };

        // Store alert
        await this.redis.lPush('alerts:ux', JSON.stringify(alertData));

        // Log alert
        this.logger[alert.severity === 'critical' ? 'error' : 'warn']('UX ALERT:', alertData);

        // Trigger notification systems
        await this.triggerUXNotifications(alertData);
    }

    async triggerUXNotifications(alert) {
        // Implementation for UX-specific notifications
        console.log('UX NOTIFICATION:', alert);
    }

    // Utility methods
    getRandomPage() {
        const pages = ['home', 'dashboard', 'analytics', 'campaigns', 'settings'];
        return pages[Math.floor(Math.random() * pages.length)];
    }

    getRandomDeviceType() {
        const devices = ['desktop', 'mobile', 'tablet'];
        return devices[Math.floor(Math.random() * devices.length)];
    }

    getRandomConnectionType() {
        const connections = ['wifi', 'fast_3g', 'slow_3g'];
        return connections[Math.floor(Math.random() * connections.length)];
    }

    getRandomUserAgent() {
        const agents = ['Chrome/91.0', 'Firefox/89.0', 'Safari/14.1', 'Edge/91.0'];
        return agents[Math.floor(Math.random() * agents.length)];
    }

    calculateMedian(values) {
        const sorted = values.sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calculatePercentile(values, percentile) {
        const sorted = values.sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index];
    }

    // Public API methods
    async getUXOverview() {
        const [synthetic, rum, satisfaction, budgets] = await Promise.all([
            this.redis.hGet('monitoring:synthetic'),
            this.redis.hGet('monitoring:rum_analysis'),
            this.redis.hGet('monitoring:user_satisfaction'),
            this.redis.hGet('monitoring:performance_budgets')
        ]);

        return {
            synthetic: synthetic ? JSON.parse(synthetic) : null,
            realUser: rum ? JSON.parse(rum) : null,
            satisfaction: satisfaction ? JSON.parse(satisfaction) : null,
            budgets: budgets ? JSON.parse(budgets) : null,
            timestamp: Date.now()
        };
    }

    async getPerformanceMetrics() {
        const overview = await this.getUXOverview();
        return {
            synthetic: overview.synthetic?.summary,
            realUser: overview.realUser?.performance,
            budgets: overview.budgets?.results
        };
    }

    async getUserSatisfactionMetrics() {
        const satisfaction = await this.redis.hGet('monitoring:user_satisfaction');
        return satisfaction ? JSON.parse(satisfaction) : null;
    }

    async getUXAlerts() {
        const alerts = await this.redis.lRange('alerts:ux', 0, -1);
        return alerts.map(alert => JSON.parse(alert));
    }

    async getUserJourneyResults() {
        const journeys = await this.redis.hGet('monitoring:user_journeys');
        return journeys ? JSON.parse(journeys) : null;
    }

    async getCrossDeviceResults() {
        const crossDevice = await this.redis.hGet('monitoring:cross_device');
        return crossDevice ? JSON.parse(crossDevice) : null;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        await this.redis.disconnect();
    }
}

module.exports = UserExperienceMonitor;