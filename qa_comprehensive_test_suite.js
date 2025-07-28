/**
 * AGENT FOXTROT - COMPREHENSIVE QA TEST SUITE
 * Critical testing mission to identify all broken links and UI issues
 * 
 * Test Categories:
 * 1. Link Validation Testing
 * 2. UI/UX Professional Standards Testing  
 * 3. Performance & Accessibility Testing
 * 4. Mobile Responsiveness Testing
 * 5. Cross-Browser Compatibility Testing
 */

const { chromium, firefox, webkit } = require('playwright');

class ComprehensiveQATestSuite {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.testResults = {
            linkValidation: {
                passed: [],
                failed: [],
                warnings: []
            },
            uiIssues: {
                visibility: [],
                contrast: [],
                typography: [],
                layout: [],
                professional: []
            },
            performance: {
                loadTimes: {},
                resourceErrors: [],
                scriptErrors: []
            },
            accessibility: {
                violations: [],
                warnings: []
            },
            mobile: {
                layoutIssues: [],
                touchTargets: [],
                responsiveness: []
            },
            crossBrowser: {
                chromium: { issues: [] },
                firefox: { issues: [] },
                webkit: { issues: [] }
            }
        };
        this.screenshots = [];
    }

    async runFullTestSuite() {
        console.log('🚀 AGENT FOXTROT - STARTING COMPREHENSIVE QA TEST SUITE');
        console.log('=' .repeat(60));

        try {
            // Test 1: Link Validation
            await this.testLinkValidation();
            
            // Test 2: UI/UX Professional Standards
            await this.testUIUXStandards();
            
            // Test 3: Performance Testing
            await this.testPerformance();
            
            // Test 4: Mobile Responsiveness
            await this.testMobileResponsiveness();
            
            // Test 5: Cross-Browser Testing
            await this.testCrossBrowserCompatibility();
            
            // Generate comprehensive report
            await this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR in test suite:', error);
            throw error;
        }
    }

    async testLinkValidation() {
        console.log('\n🔗 Testing Link Validation...');
        
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        try {
            // Navigate to homepage
            const response = await page.goto(this.baseUrl);
            if (!response.ok()) {
                this.testResults.linkValidation.failed.push({
                    url: this.baseUrl,
                    status: response.status(),
                    error: 'Homepage failed to load'
                });
            }

            // Extract all links from the page
            const links = await page.$$eval('a', anchors => 
                anchors.map(a => ({
                    href: a.href,
                    text: a.textContent.trim(),
                    target: a.target
                }))
            );

            console.log(`Found ${links.length} links to test`);

            // Test each link
            for (const link of links) {
                await this.testSingleLink(page, link);
            }

            // Test specific critical pages
            const criticalPages = [
                '/templates.html',
                '/dashboard/index.html',
                '/pages/community.html',
                '/pages/designs.html', 
                '/pages/security.html'
            ];

            for (const pagePath of criticalPages) {
                await this.testCriticalPage(page, pagePath);
            }

        } catch (error) {
            console.error('Link validation error:', error);
            this.testResults.linkValidation.failed.push({
                url: 'Link validation process',
                error: error.message
            });
        } finally {
            await browser.close();
        }
    }

    async testSingleLink(page, link) {
        try {
            // Skip external links for now
            if (link.href.startsWith('http') && !link.href.includes('localhost')) {
                this.testResults.linkValidation.warnings.push({
                    url: link.href,
                    text: link.text,
                    issue: 'External link - not tested'
                });
                return;
            }

            // Skip mailto and tel links
            if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
                return;
            }

            // Skip anchor links for now
            if (link.href.includes('#')) {
                return;
            }

            const response = await page.goto(link.href);
            
            if (response.ok()) {
                this.testResults.linkValidation.passed.push({
                    url: link.href,
                    text: link.text,
                    status: response.status()
                });
            } else {
                this.testResults.linkValidation.failed.push({
                    url: link.href,
                    text: link.text,
                    status: response.status(),
                    error: 'Page not found or server error'
                });
            }
        } catch (error) {
            this.testResults.linkValidation.failed.push({
                url: link.href,
                text: link.text,
                error: error.message
            });
        }
    }

    async testCriticalPage(page, pagePath) {
        try {
            const fullUrl = this.baseUrl + pagePath;
            const response = await page.goto(fullUrl);
            
            if (response.ok()) {
                this.testResults.linkValidation.passed.push({
                    url: fullUrl,
                    text: `Critical page: ${pagePath}`,
                    status: response.status()
                });
            } else {
                this.testResults.linkValidation.failed.push({
                    url: fullUrl,
                    text: `Critical page: ${pagePath}`,
                    status: response.status(),
                    error: 'Critical page not accessible'
                });
            }
        } catch (error) {
            this.testResults.linkValidation.failed.push({
                url: this.baseUrl + pagePath,
                text: `Critical page: ${pagePath}`,
                error: error.message
            });
        }
    }

    async testUIUXStandards() {
        console.log('\n🎨 Testing UI/UX Professional Standards...');
        
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        try {
            await page.goto(this.baseUrl);
            
            // Test text visibility and contrast
            await this.testTextVisibility(page);
            
            // Test typography consistency
            await this.testTypography(page);
            
            // Test layout and spacing
            await this.testLayout(page);
            
            // Test professional design elements
            await this.testProfessionalDesign(page);
            
            // Take screenshot for evidence
            const screenshot = await page.screenshot({ 
                path: `/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/qa_homepage_desktop.png`,
                fullPage: true 
            });
            this.screenshots.push('qa_homepage_desktop.png');
            
        } catch (error) {
            console.error('UI/UX testing error:', error);
        } finally {
            await browser.close();
        }
    }

    async testTextVisibility(page) {
        // Test text contrast and visibility
        const textElements = await page.$$eval('p, h1, h2, h3, h4, h5, h6, span, a', elements =>
            elements.map(el => {
                const styles = window.getComputedStyle(el);
                return {
                    text: el.textContent.trim().substring(0, 50),
                    color: styles.color,
                    backgroundColor: styles.backgroundColor,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    visibility: styles.visibility,
                    display: styles.display,
                    opacity: styles.opacity
                };
            })
        );

        textElements.forEach((element, index) => {
            // Check for very light text that might be invisible
            if (element.color === 'rgb(255, 255, 255)' && element.backgroundColor === 'rgba(0, 0, 0, 0)') {
                this.testResults.uiIssues.visibility.push({
                    issue: 'Potentially invisible white text on white background',
                    element: element.text,
                    color: element.color,
                    backgroundColor: element.backgroundColor
                });
            }
            
            // Check for very small text
            const fontSize = parseInt(element.fontSize);
            if (fontSize < 12) {
                this.testResults.uiIssues.typography.push({
                    issue: 'Text too small (< 12px)',
                    element: element.text,
                    fontSize: element.fontSize
                });
            }
            
            // Check for hidden elements that should be visible
            if (element.visibility === 'hidden' || element.display === 'none') {
                this.testResults.uiIssues.visibility.push({
                    issue: 'Hidden text element',
                    element: element.text,
                    visibility: element.visibility,
                    display: element.display
                });
            }
        });
    }

    async testTypography(page) {
        // Test typography consistency
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
            elements.map(el => {
                const styles = window.getComputedStyle(el);
                return {
                    tagName: el.tagName,
                    text: el.textContent.trim(),
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    lineHeight: styles.lineHeight
                };
            })
        );

        // Check for inconsistent heading sizes
        const h1Elements = headings.filter(h => h.tagName === 'H1');
        if (h1Elements.length > 1) {
            const uniqueSizes = [...new Set(h1Elements.map(h => h.fontSize))];
            if (uniqueSizes.length > 1) {
                this.testResults.uiIssues.typography.push({
                    issue: 'Inconsistent H1 font sizes',
                    sizes: uniqueSizes
                });
            }
        }
    }

    async testLayout(page) {
        // Test layout and spacing issues
        const viewport = page.viewportSize();
        
        // Check for horizontal scrolling
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
        });
        
        if (hasHorizontalScroll) {
            this.testResults.uiIssues.layout.push({
                issue: 'Horizontal scrolling detected',
                viewportWidth: viewport.width,
                bodyWidth: await page.evaluate(() => document.body.scrollWidth)
            });
        }
    }

    async testProfessionalDesign(page) {
        // Test for unprofessional design elements
        
        // Check for broken images
        const brokenImages = await page.$$eval('img', images =>
            images.filter(img => !img.complete || img.naturalWidth === 0)
                  .map(img => ({ src: img.src, alt: img.alt }))
        );
        
        brokenImages.forEach(img => {
            this.testResults.uiIssues.professional.push({
                issue: 'Broken image',
                src: img.src,
                alt: img.alt
            });
        });
        
        // Check for missing alt attributes
        const imagesWithoutAlt = await page.$$eval('img', images =>
            images.filter(img => !img.alt || img.alt.trim() === '')
                  .map(img => ({ src: img.src }))
        );
        
        imagesWithoutAlt.forEach(img => {
            this.testResults.uiIssues.professional.push({
                issue: 'Image missing alt attribute',
                src: img.src
            });
        });
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        try {
            // Track resource loading
            page.on('response', response => {
                if (!response.ok()) {
                    this.testResults.performance.resourceErrors.push({
                        url: response.url(),
                        status: response.status(),
                        statusText: response.statusText()
                    });
                }
            });
            
            // Track console errors
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    this.testResults.performance.scriptErrors.push({
                        text: msg.text(),
                        location: msg.location()
                    });
                }
            });
            
            // Measure load time
            const startTime = Date.now();
            await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
            const loadTime = Date.now() - startTime;
            
            this.testResults.performance.loadTimes.homepage = loadTime;
            
            if (loadTime > 3000) {
                this.testResults.uiIssues.professional.push({
                    issue: 'Slow page load time',
                    loadTime: `${loadTime}ms`,
                    threshold: '3000ms'
                });
            }
            
        } catch (error) {
            console.error('Performance testing error:', error);
        } finally {
            await browser.close();
        }
    }

    async testMobileResponsiveness() {
        console.log('\n📱 Testing Mobile Responsiveness...');
        
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        try {
            // Test different viewport sizes
            const viewports = [
                { width: 375, height: 667, name: 'iPhone SE' },
                { width: 414, height: 896, name: 'iPhone 11' },
                { width: 768, height: 1024, name: 'iPad' },
                { width: 1024, height: 768, name: 'iPad Landscape' }
            ];
            
            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto(this.baseUrl);
                
                // Take screenshot
                await page.screenshot({ 
                    path: `/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/qa_${viewport.name.replace(' ', '_')}.png`,
                    fullPage: true 
                });
                this.screenshots.push(`qa_${viewport.name.replace(' ', '_')}.png`);
                
                // Check for horizontal scrolling
                const hasHorizontalScroll = await page.evaluate(() => {
                    return document.body.scrollWidth > window.innerWidth;
                });
                
                if (hasHorizontalScroll) {
                    this.testResults.mobile.responsiveness.push({
                        issue: 'Horizontal scrolling on mobile',
                        viewport: viewport.name,
                        viewportWidth: viewport.width,
                        contentWidth: await page.evaluate(() => document.body.scrollWidth)
                    });
                }
                
                // Check touch target sizes
                const smallTouchTargets = await page.$$eval('a, button', elements =>
                    elements.filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width < 44 || rect.height < 44;
                    }).map(el => ({
                        text: el.textContent.trim(),
                        width: el.getBoundingClientRect().width,
                        height: el.getBoundingClientRect().height
                    }))
                );
                
                smallTouchTargets.forEach(target => {
                    this.testResults.mobile.touchTargets.push({
                        issue: 'Touch target too small (< 44px)',
                        viewport: viewport.name,
                        text: target.text,
                        size: `${target.width}x${target.height}`
                    });
                });
            }
            
        } catch (error) {
            console.error('Mobile testing error:', error);
        } finally {
            await browser.close();
        }
    }

    async testCrossBrowserCompatibility() {
        console.log('\n🌐 Testing Cross-Browser Compatibility...');
        
        const browsers = [
            { type: chromium, name: 'chromium' },
            { type: firefox, name: 'firefox' },
            { type: webkit, name: 'webkit' }
        ];
        
        for (const browserInfo of browsers) {
            try {
                const browser = await browserInfo.type.launch();
                const page = await browser.newPage();
                
                // Track console errors
                page.on('console', msg => {
                    if (msg.type() === 'error') {
                        this.testResults.crossBrowser[browserInfo.name].issues.push({
                            type: 'JavaScript Error',
                            message: msg.text()
                        });
                    }
                });
                
                // Navigate and test
                await page.goto(this.baseUrl);
                
                // Take screenshot
                await page.screenshot({ 
                    path: `/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/qa_${browserInfo.name}.png` 
                });
                this.screenshots.push(`qa_${browserInfo.name}.png`);
                
                await browser.close();
                
            } catch (error) {
                this.testResults.crossBrowser[browserInfo.name].issues.push({
                    type: 'Browser Launch Error',
                    message: error.message
                });
            }
        }
    }

    async generateComprehensiveReport() {
        console.log('\n📊 Generating Comprehensive QA Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            testSummary: {
                totalTests: this.calculateTotalTests(),
                criticalIssues: this.calculateCriticalIssues(),
                warnings: this.calculateWarnings(),
                passed: this.calculatePassedTests()
            },
            linkValidation: this.testResults.linkValidation,
            uiIssues: this.testResults.uiIssues,
            performance: this.testResults.performance,
            mobile: this.testResults.mobile,
            crossBrowser: this.testResults.crossBrowser,
            screenshots: this.screenshots,
            recommendations: this.generateRecommendations()
        };
        
        // Save detailed report
        const fs = require('fs');
        fs.writeFileSync(
            '/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/QA_COMPREHENSIVE_REPORT.json',
            JSON.stringify(report, null, 2)
        );
        
        // Generate summary for console
        this.printReportSummary(report);
        
        return report;
    }

    calculateTotalTests() {
        return this.testResults.linkValidation.passed.length + 
               this.testResults.linkValidation.failed.length +
               Object.values(this.testResults.uiIssues).flat().length +
               this.testResults.performance.resourceErrors.length +
               this.testResults.mobile.responsiveness.length;
    }

    calculateCriticalIssues() {
        return this.testResults.linkValidation.failed.length +
               this.testResults.uiIssues.visibility.length +
               this.testResults.performance.resourceErrors.length;
    }

    calculateWarnings() {
        return this.testResults.linkValidation.warnings.length +
               this.testResults.uiIssues.typography.length +
               this.testResults.mobile.touchTargets.length;
    }

    calculatePassedTests() {
        return this.testResults.linkValidation.passed.length;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.testResults.linkValidation.failed.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Link Validation',
                issue: 'Broken links detected',
                action: 'Fix all broken links immediately - these create poor user experience',
                count: this.testResults.linkValidation.failed.length
            });
        }
        
        if (this.testResults.uiIssues.visibility.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'UI Visibility',
                issue: 'Text visibility problems',
                action: 'Fix contrast ratios and ensure all text is readable',
                count: this.testResults.uiIssues.visibility.length
            });
        }
        
        if (this.testResults.mobile.responsiveness.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Mobile Responsiveness',
                issue: 'Mobile layout problems',
                action: 'Fix responsive design for mobile devices',
                count: this.testResults.mobile.responsiveness.length
            });
        }
        
        if (this.testResults.performance.loadTimes.homepage > 3000) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Performance',
                issue: 'Slow page load time',
                action: 'Optimize images, CSS, and JavaScript for faster loading',
                loadTime: this.testResults.performance.loadTimes.homepage
            });
        }
        
        return recommendations;
    }

    printReportSummary(report) {
        console.log('\n' + '=' .repeat(60));
        console.log('🎯 AGENT FOXTROT QA TEST RESULTS SUMMARY');
        console.log('=' .repeat(60));
        
        console.log(`\n📊 TEST SUMMARY:`);
        console.log(`   Total Tests Run: ${report.testSummary.totalTests}`);
        console.log(`   🔴 Critical Issues: ${report.testSummary.criticalIssues}`);
        console.log(`   🟡 Warnings: ${report.testSummary.warnings}`);
        console.log(`   ✅ Passed: ${report.testSummary.passed}`);
        
        console.log(`\n🔗 LINK VALIDATION:`);
        console.log(`   ✅ Working Links: ${report.linkValidation.passed.length}`);
        console.log(`   ❌ Broken Links: ${report.linkValidation.failed.length}`);
        console.log(`   ⚠️  Warnings: ${report.linkValidation.warnings.length}`);
        
        if (report.linkValidation.failed.length > 0) {
            console.log(`\n   🚨 BROKEN LINKS FOUND:`);
            report.linkValidation.failed.forEach(link => {
                console.log(`      - ${link.url} (${link.status || 'Error'}) - ${link.text}`);
            });
        }
        
        console.log(`\n🎨 UI/UX ISSUES:`);
        console.log(`   👁️  Visibility Issues: ${report.uiIssues.visibility.length}`);
        console.log(`   🔤 Typography Issues: ${report.uiIssues.typography.length}`);
        console.log(`   📐 Layout Issues: ${report.uiIssues.layout.length}`);
        console.log(`   💼 Professional Issues: ${report.uiIssues.professional.length}`);
        
        console.log(`\n📱 MOBILE RESPONSIVENESS:`);
        console.log(`   📐 Layout Issues: ${report.mobile.responsiveness.length}`);
        console.log(`   👆 Touch Target Issues: ${report.mobile.touchTargets.length}`);
        
        console.log(`\n⚡ PERFORMANCE:`);
        if (report.performance.loadTimes.homepage) {
            console.log(`   🏠 Homepage Load Time: ${report.performance.loadTimes.homepage}ms`);
        }
        console.log(`   🚫 Resource Errors: ${report.performance.resourceErrors.length}`);
        console.log(`   💥 Script Errors: ${report.performance.scriptErrors.length}`);
        
        console.log(`\n📸 SCREENSHOTS CAPTURED:`);
        report.screenshots.forEach(screenshot => {
            console.log(`   - ${screenshot}`);
        });
        
        console.log(`\n🎯 TOP PRIORITY RECOMMENDATIONS:`);
        report.recommendations
            .filter(rec => rec.priority === 'HIGH')
            .forEach(rec => {
                console.log(`   🔴 ${rec.category}: ${rec.issue}`);
                console.log(`      Action: ${rec.action}`);
                if (rec.count) console.log(`      Count: ${rec.count} issues`);
            });
        
        console.log(`\n📋 FULL REPORT SAVED TO: QA_COMPREHENSIVE_REPORT.json`);
        console.log('=' .repeat(60));
    }
}

// Run the test suite
async function main() {
    const testSuite = new ComprehensiveQATestSuite();
    try {
        await testSuite.runFullTestSuite();
        console.log('\n✅ QA TEST SUITE COMPLETED SUCCESSFULLY');
    } catch (error) {
        console.error('\n❌ QA TEST SUITE FAILED:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { ComprehensiveQATestSuite };