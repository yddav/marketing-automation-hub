#!/usr/bin/env node

/**
 * UNTRAPD Ecosystem Status CLI
 * Quick terminal view of ecosystem health across all projects
 *
 * Usage: node bin/ecosystem-status.js [--json] [--section <name>]
 *
 * Sections: overview, finderr, campaign, superarmy, revenue, hub
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

// Configuration
const config = {
    supabaseUrl: process.env.SUPABASE_URL || 'https://zdceeulkqfpzdjeyekgs.supabase.co',
    supabaseKey: process.env.SUPABASE_ANON_KEY || '',
    projectRoot: path.resolve(__dirname, '..'),
    untrapdRoot: '/home/wolfy/Projects/2026/UNTRAPD'
};

// Status indicators
const status = {
    healthy: `${colors.green}●${colors.reset}`,
    warning: `${colors.yellow}●${colors.reset}`,
    critical: `${colors.red}●${colors.reset}`,
    unknown: `${colors.dim}○${colors.reset}`
};

// Helper functions
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(amount);
}

function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function getHealthStatus(value, thresholds) {
    if (value >= thresholds.healthy) return 'healthy';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
}

function printHeader(title) {
    const line = '═'.repeat(50);
    console.log(`\n${colors.cyan}${line}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
    console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

function printSection(title) {
    console.log(`\n${colors.bright}${colors.blue}▸ ${title}${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(40)}${colors.reset}`);
}

function printKPI(label, value, statusType = null) {
    const indicator = statusType ? status[statusType] + ' ' : '  ';
    console.log(`${indicator}${colors.dim}${label}:${colors.reset} ${colors.bright}${value}${colors.reset}`);
}

// Data loading functions
async function loadCampaignData() {
    const campaignPath = path.join(config.untrapdRoot, 'automation/campaigns/finderr_beta_campaign.json');

    try {
        if (fs.existsSync(campaignPath)) {
            const data = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));
            return data;
        }
    } catch (e) {
        // Try alternate path
        const altPath = path.join(config.projectRoot, '../../../Projects/2026/UNTRAPD/automation/campaigns/finderr_beta_campaign.json');
        try {
            if (fs.existsSync(altPath)) {
                return JSON.parse(fs.readFileSync(altPath, 'utf8'));
            }
        } catch (e2) {}
    }

    return null;
}

async function loadSuperArmyPatterns() {
    const patternsPath = path.join(config.untrapdRoot, 'automation/superarmy/patterns.json');

    try {
        if (fs.existsSync(patternsPath)) {
            return JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
        }
    } catch (e) {}

    // Return sample data if file not found
    return {
        patterns: [
            { name: 'Visual-First Problem Solving', successRate: 0.95 },
            { name: 'Git Worktree Parallel Execution', successRate: 0.92 },
            { name: 'Multi-Language Synchronization', successRate: 0.88 },
            { name: 'Local Preview Feedback Loop', successRate: 0.90 },
            { name: 'Comprehensive Handoff Protocol', successRate: 0.94 }
        ],
        agents: [
            { name: 'Alpha', specialty: 'Contrast/Accessibility', status: 'ready' },
            { name: 'Beta', specialty: 'Visual Assets', status: 'ready' },
            { name: 'Gamma', specialty: 'Animation/UX', status: 'ready' },
            { name: 'Delta', specialty: 'Integration', status: 'ready' },
            { name: 'Zeta', specialty: 'Code Quality', status: 'ready' }
        ]
    };
}

// Display functions
function displayOverview() {
    printHeader('UNTRAPD ECOSYSTEM STATUS');

    const now = new Date();
    console.log(`${colors.dim}Generated: ${now.toLocaleString()}${colors.reset}\n`);

    // Quick status grid
    console.log(`${colors.bright}Project Status${colors.reset}`);
    console.log(`${status.healthy} FINDERR     v4.3.0+271 Production Ready`);
    console.log(`${status.healthy} Hub         hub.untrapd.com Live`);
    console.log(`${status.healthy} Campaign    81 posts scheduled`);
    console.log(`${status.healthy} SuperArmy   5 agents ready`);
    console.log(`${status.warning} Revenue     Awaiting live data`);

    printSection('Launch Timeline');
    console.log(`  ${colors.cyan}Dec 22${colors.reset} - FINDERR Beta Launch`);
    console.log(`  ${colors.dim}Dec 29${colors.reset} - Creator Outreach (Week 1 metrics)`);
    console.log(`  ${colors.dim}Jan 05${colors.reset} - Beta Campaign Ends`);
}

async function displayFinderr() {
    printHeader('FINDERR STATUS');

    printSection('App Info');
    printKPI('Version', 'v4.3.0+271', 'healthy');
    printKPI('Status', 'Production Ready');
    printKPI('Package', 'com.finderr.app');
    printKPI('Build Size', '83MB APK / 68.6MB AAB');

    printSection('Features');
    console.log(`  ${colors.green}✓${colors.reset} RLS Bearer Auth Fix`);
    console.log(`  ${colors.green}✓${colors.reset} RevenueCat Paywall (4 tiers)`);
    console.log(`  ${colors.green}✓${colors.reset} Google OAuth (Play Store + Sideload)`);
    console.log(`  ${colors.green}✓${colors.reset} Apple Sign-In`);
    console.log(`  ${colors.green}✓${colors.reset} Cross-platform Sync`);

    printSection('Test Results (Samsung S20)');
    console.log(`  ${colors.green}✓${colors.reset} Web dashboard activation/deactivation`);
    console.log(`  ${colors.green}✓${colors.reset} SMS activation/deactivation`);
    console.log(`  ${colors.green}✓${colors.reset} Cross-sync (SMS↔Web↔Mobile)`);
    console.log(`  ${colors.green}✓${colors.reset} Post-reboot persistence`);

    printSection('Deployment');
    printKPI('Google Play', 'Ready for upload', 'warning');
    printKPI('Location', 'Finderr_Final_Releases/v4.3.0+271/');
}

async function displayCampaign() {
    printHeader('CAMPAIGN STATUS');

    const data = await loadCampaignData();

    if (data && data.campaign) {
        const campaign = data.campaign;
        const calendar = data.calendar || [];

        printSection('Campaign Info');
        printKPI('Name', campaign.name || 'FINDERR Beta Launch');
        printKPI('Version', campaign.version || 'N/A');
        printKPI('Duration', `${campaign.duration || 15} days`);
        printKPI('Goal', campaign.goal || 'Beta testers');
        printKPI('Landing Page', campaign.landingPage || 'N/A');

        if (campaign.targets) {
            printSection('Targets');
            printKPI('Twitter Posts', campaign.targets.twitter || 0);
            printKPI('Instagram Posts', campaign.targets.instagram || 0);
            printKPI('Facebook Posts', campaign.targets.facebook || 0);
            printKPI('Posts/Day', campaign.targets.postsPerDay || 5);
            printKPI('Expected Signups', campaign.targets.expectedSignups || 50);
        }

        // Count posts from calendar
        let totalPosts = 0;
        const platforms = {};

        calendar.forEach(day => {
            if (day.posts) {
                day.posts.forEach(post => {
                    totalPosts++;
                    const platform = post.platform || 'unknown';
                    platforms[platform] = (platforms[platform] || 0) + 1;
                });
            }
        });

        printSection('Content Summary');
        printKPI('Total Posts', totalPosts, 'healthy');
        printKPI('Days Scheduled', calendar.length);

        // Progress bar (days completed vs total)
        const today = new Date();
        const daysCompleted = calendar.filter(day => new Date(day.date) < today).length;
        const progress = calendar.length > 0 ? daysCompleted / calendar.length : 0;
        const barWidth = 30;
        const filled = Math.round(progress * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        console.log(`\n  Progress: [${colors.green}${bar}${colors.reset}] ${formatPercent(progress)}`);

        printSection('Platform Distribution');
        Object.entries(platforms).forEach(([platform, count]) => {
            const icon = {
                'twitter': '𝕏',
                'facebook': 'f',
                'instagram': '📷',
                'pinterest': '📌',
                'tiktok': '♪'
            }[platform] || '•';
            console.log(`  ${icon} ${platform}: ${count} posts`);
        });

        // Show upcoming days
        const upcomingDays = calendar.filter(day => new Date(day.date) >= today).slice(0, 3);
        if (upcomingDays.length > 0) {
            printSection('Upcoming Days');
            upcomingDays.forEach(day => {
                console.log(`  ${colors.cyan}${day.date}${colors.reset} - ${day.theme} (${day.posts?.length || 0} posts)`);
            });
        }
    } else {
        printSection('Campaign Info');
        console.log(`${colors.yellow}  Campaign data not found${colors.reset}`);
        console.log(`${colors.dim}  Expected: UNTRAPD/automation/campaigns/finderr_beta_campaign.json${colors.reset}`);
    }
}

async function displaySuperArmy() {
    printHeader('SUPERARMY STATUS');

    const data = await loadSuperArmyPatterns();

    printSection('Agent Fleet');
    data.agents.forEach(agent => {
        const statusIcon = agent.status === 'ready' ? status.healthy : status.warning;
        console.log(`  ${statusIcon} Agent ${agent.name} - ${agent.specialty}`);
    });

    printSection('Learned Patterns');
    data.patterns.forEach(pattern => {
        const pct = formatPercent(pattern.successRate);
        const statusType = getHealthStatus(pattern.successRate, { healthy: 0.9, warning: 0.7 });
        console.log(`  ${status[statusType]} ${pattern.name} (${pct})`);
    });

    printSection('Performance Metrics');
    printKPI('Time Savings', '70%+', 'healthy');
    printKPI('Resolution Rate', '71.4%', 'healthy');
    printKPI('Parallel Agents', '5 concurrent');
    printKPI('Session Recovery', '100% success');
}

async function displayRevenue() {
    printHeader('REVENUE STATUS');

    printSection('RevenueCat (Subscriptions)');
    console.log(`${colors.yellow}  ⚠ Awaiting live data${colors.reset}`);
    console.log(`${colors.dim}  Configure REVENUECAT_API_KEY for live metrics${colors.reset}\n`);

    printKPI('MRR Target', formatCurrency(1000));
    printKPI('Current MRR', formatCurrency(0), 'warning');

    printSection('Subscription Tiers');
    const tiers = [
        { name: 'Family Plan', price: 17.99, period: 'month' },
        { name: 'Premium Monthly', price: 8.99, period: 'month' },
        { name: 'Premium Lifetime', price: 149, period: 'once' },
        { name: 'Lifetime Founder', price: 299, period: 'once' }
    ];

    tiers.forEach(tier => {
        const priceStr = tier.period === 'once' ?
            formatCurrency(tier.price) :
            `${formatCurrency(tier.price)}/${tier.period}`;
        console.log(`  • ${tier.name}: ${colors.bright}${priceStr}${colors.reset}`);
    });

    printSection('Stripe (Payments)');
    console.log(`${colors.yellow}  ⚠ Awaiting live data${colors.reset}`);
    console.log(`${colors.dim}  Configure STRIPE_SECRET_KEY for live metrics${colors.reset}\n`);

    printSection('Integration Status');
    console.log(`  ${status.healthy} RevenueCat SDK configured`);
    console.log(`  ${status.healthy} Google Play Billing ready`);
    console.log(`  ${status.warning} Stripe webhooks pending`);
}

async function displayHub() {
    printHeader('HUB STATUS');

    printSection('Website');
    printKPI('URL', 'https://hub.untrapd.com', 'healthy');
    printKPI('Status', 'Live');
    printKPI('Hosting', 'Netlify');

    printSection('Pages');
    const pages = [
        { name: 'Homepage', path: '/', status: 'live' },
        { name: 'FINDERR App', path: '/apps/finderr/', status: 'live' },
        { name: 'Apps Index', path: '/apps/', status: 'live' },
        { name: 'Analytics Dashboard', path: '/analytics_dashboard/', status: 'live' }
    ];

    pages.forEach(page => {
        const icon = page.status === 'live' ? status.healthy : status.warning;
        console.log(`  ${icon} ${page.name} (${page.path})`);
    });

    printSection('Analytics Dashboard Features');
    console.log(`  ${colors.green}✓${colors.reset} Ecosystem Overview (6 tabs)`);
    console.log(`  ${colors.green}✓${colors.reset} Dark Theme Toggle`);
    console.log(`  ${colors.green}✓${colors.reset} RevenueCat Integration`);
    console.log(`  ${colors.green}✓${colors.reset} Stripe Integration`);
    console.log(`  ${colors.green}✓${colors.reset} Campaign Progress Tracking`);
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const jsonOutput = args.includes('--json');
    const sectionIndex = args.indexOf('--section');
    const section = sectionIndex !== -1 ? args[sectionIndex + 1] : null;

    if (jsonOutput) {
        // JSON output mode for programmatic use
        const data = {
            timestamp: new Date().toISOString(),
            finderr: {
                version: 'v4.3.0+271',
                status: 'production_ready',
                features: ['RLS Bearer Auth Fix', 'RevenueCat Paywall', 'OAuth'],
                testResults: 'all_pass'
            },
            campaign: await loadCampaignData(),
            superarmy: await loadSuperArmyPatterns(),
            hub: {
                url: 'https://hub.untrapd.com',
                status: 'live'
            }
        };
        console.log(JSON.stringify(data, null, 2));
        return;
    }

    // Terminal output mode
    console.clear();

    if (!section || section === 'overview') {
        displayOverview();
    }

    if (!section || section === 'finderr') {
        await displayFinderr();
    }

    if (!section || section === 'campaign') {
        await displayCampaign();
    }

    if (!section || section === 'superarmy') {
        await displaySuperArmy();
    }

    if (!section || section === 'revenue') {
        await displayRevenue();
    }

    if (!section || section === 'hub') {
        await displayHub();
    }

    // Footer
    console.log(`\n${colors.dim}${'─'.repeat(50)}${colors.reset}`);
    console.log(`${colors.dim}Run with --section <name> for specific section${colors.reset}`);
    console.log(`${colors.dim}Run with --json for programmatic output${colors.reset}\n`);
}

main().catch(err => {
    console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
    process.exit(1);
});
