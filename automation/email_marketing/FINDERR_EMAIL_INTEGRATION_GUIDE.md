# FINDERR Email Marketing Integration Guide

## Overview

Complete implementation guide for FINDERR automated email sequences across trial, monthly, and annual subscription lifecycle.

**Created:** 2025-10-15
**Author:** Agent B - API Integration Specialist
**Version:** 1.0.0

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Email Sequence Overview](#email-sequence-overview)
3. [Integration Steps](#integration-steps)
4. [Email Service Provider Setup](#email-service-provider-setup)
5. [A/B Testing Strategy](#ab-testing-strategy)
6. [Personalization & Dynamic Content](#personalization--dynamic-content)
7. [Analytics & Tracking](#analytics--tracking)
8. [Best Practices](#best-practices)

---

## Quick Start

### Prerequisites

- Email Service Provider (ESP) account: Mailchimp, SendGrid, Customer.io, or similar
- FINDERR user database with subscription status tracking
- Webhook/API integration capability
- SMTP/API credentials for transactional email

### Installation

```bash
# Install required dependencies
npm install @mailchimp/mailchimp_marketing dotenv

# Copy environment variables template
cp .env.example .env

# Configure your ESP credentials
vim .env
```

### Basic Setup

```javascript
const finderrSequences = require('./finderr-sequences.js');

// Access email sequences
const trialEmails = finderrSequences.trialWelcomeSequence.emails;
const monthlyEmails = finderrSequences.monthlyRetentionSequence.emails;
const annualEmails = finderrSequences.annualVIPSequence.emails;

// Check integration config
console.log(finderrSequences.integrationConfig);
```

---

## Email Sequence Overview

### 1. Trial Welcome Sequence (14-Day Journey)

**Objective:** Maximize trial-to-paid conversion through education and urgency

| Email | Day | Subject Focus | Primary Goal | Expected Open Rate |
|-------|-----|---------------|--------------|-------------------|
| Day 0 | 0 | Welcome + Setup | Setup completion | 55-65% |
| Day 3 | 3 | Feature highlights | Feature engagement | 45-55% |
| Day 7 | 7 | Mid-trial check-in | Usage validation | 40-50% |
| Day 10 | 10 | Value comparison | Purchase consideration | 48-58% |
| Day 13 | 13 | Final urgency | Conversion | 52-62% |

**Target Metrics:**
- Overall open rate: 50%+
- Click-through rate: 12%+
- Trial-to-paid conversion: 35%+
- Sequence completion: 85%+

### 2. Monthly Retention Sequence

**Objective:** Maintain engagement and encourage annual upgrade

| Email | Week | Subject Focus | Primary Goal | Expected Open Rate |
|-------|------|---------------|--------------|-------------------|
| Week 2 | 2 | Feature updates | Re-engagement | 40-48% |
| Week 4 | 4 | Security tips | Value reinforcement | 38-45% |
| Week 8 | 8 | Annual upgrade offer | Upgrade conversion | 42-50% |
| Week 12 | 12 | Community highlights | Loyalty building | 38-46% |

**Target Metrics:**
- Overall open rate: 40%+
- Click-through rate: 10%+
- Annual upgrade rate: 20%+
- Churn reduction: 15%

### 3. Annual VIP Sequence

**Objective:** Maximize retention and early renewals

| Email | Month | Subject Focus | Primary Goal | Expected Open Rate |
|-------|-------|---------------|--------------|-------------------|
| Month 1 | 1 | VIP welcome | Onboarding | 60-70% |
| Month 3 | 3 | Advanced tutorials | Power user activation | 55-65% |
| Month 6 | 6 | Mid-year check-in | Engagement + feedback | 50-60% |
| Month 10 | 10 | Renewal + early bird | Early renewal | 58-68% |

**Target Metrics:**
- Overall open rate: 60%+
- Click-through rate: 18%+
- Renewal rate: 85%+
- Early renewal rate: 40%+

---

## Integration Steps

### Step 1: Choose Your ESP

**Recommended Options:**

**Mailchimp** (Best for beginners)
- ✅ User-friendly interface
- ✅ Built-in automation workflows
- ✅ A/B testing included
- ❌ Limited API flexibility
- **Cost:** $20-300/month

**SendGrid** (Best for developers)
- ✅ Powerful API
- ✅ High deliverability
- ✅ Detailed analytics
- ❌ Steeper learning curve
- **Cost:** $15-100/month

**Customer.io** (Best for advanced automation)
- ✅ Behavioral triggers
- ✅ Advanced segmentation
- ✅ Multi-channel support
- ❌ Higher cost
- **Cost:** $150-500/month

### Step 2: Configure ESP Connection

#### Mailchimp Integration

```javascript
// mailchimp-integration.js
const mailchimp = require('@mailchimp/mailchimp_marketing');
const sequences = require('./finderr-sequences');

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., "us1"
});

async function createFinderrList() {
  const response = await mailchimp.lists.createList({
    name: "FINDERR Users - Trial",
    permission_reminder: "You signed up for FINDERR trial",
    email_type_option: true,
    contact: {
      company: "UNTRAPD",
      address1: "Your Address",
      city: "Your City",
      state: "State",
      zip: "Zip",
      country: "US",
      phone: "Your Phone"
    },
    campaign_defaults: {
      from_name: sequences.integrationConfig.deliverability.fromName,
      from_email: sequences.integrationConfig.deliverability.fromEmail,
      subject: "Welcome to FINDERR",
      language: "en"
    }
  });

  console.log("List created:", response.id);
  return response.id;
}

module.exports = { createFinderrList };
```

#### SendGrid Integration

```javascript
// sendgrid-integration.js
const sgMail = require('@sendgrid/mail');
const sequences = require('./finderr-sequences');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTrialWelcomeEmail(userData) {
  const email = sequences.trialWelcomeSequence.emails[0]; // Day 0

  const msg = {
    to: userData.email,
    from: sequences.integrationConfig.deliverability.fromEmail,
    subject: email.subject.default.replace('{{first_name}}', userData.firstName),
    html: populateTemplate(email.content.body, userData),
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`Trial welcome email sent to ${userData.email}`);
  } catch (error) {
    console.error('SendGrid error:', error);
  }
}

function populateTemplate(template, userData) {
  return template
    .replace(/\{\{first_name\}\}/g, userData.firstName)
    .replace(/\{\{trial_end_date\}\}/g, userData.trialEndDate)
    .replace(/\{\{app_deep_link\}\}/g, 'finderr://app')
    // Add more replacements as needed
}

module.exports = { sendTrialWelcomeEmail };
```

### Step 3: Set Up Automation Triggers

#### Webhook Integration

```javascript
// webhook-handler.js
const express = require('express');
const app = express();
const { sendTrialWelcomeEmail } = require('./sendgrid-integration');

app.use(express.json());

// Trial started webhook
app.post('/webhooks/trial-started', async (req, res) => {
  const { userId, email, firstName, trialEndDate } = req.body;

  const userData = {
    userId,
    email,
    firstName,
    trialEndDate: new Date(trialEndDate).toLocaleDateString()
  };

  // Send immediate welcome email
  await sendTrialWelcomeEmail(userData);

  // Schedule remaining sequence emails
  await scheduleEmailSequence('trial', userData);

  res.status(200).json({ success: true });
});

// Subscription started webhook
app.post('/webhooks/subscription-started', async (req, res) => {
  const { userId, subscriptionType } = req.body;

  if (subscriptionType === 'monthly') {
    await scheduleEmailSequence('monthly', userData);
  } else if (subscriptionType === 'annual') {
    await scheduleEmailSequence('annual', userData);
  }

  res.status(200).json({ success: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

#### Scheduled Email Queue

```javascript
// email-scheduler.js
const Bull = require('bull');
const sequences = require('./finderr-sequences');

// Create queue
const emailQueue = new Bull('finderr-emails', {
  redis: { host: 'localhost', port: 6379 }
});

// Schedule email sequence
async function scheduleEmailSequence(sequenceType, userData) {
  let emails;

  switch (sequenceType) {
    case 'trial':
      emails = sequences.trialWelcomeSequence.emails;
      break;
    case 'monthly':
      emails = sequences.monthlyRetentionSequence.emails;
      break;
    case 'annual':
      emails = sequences.annualVIPSequence.emails;
      break;
  }

  for (const email of emails) {
    await emailQueue.add(
      {
        emailId: email.emailId,
        userData,
        template: email.content,
        subject: email.subject.default
      },
      {
        delay: email.sendDelay * 60 * 1000, // Convert minutes to milliseconds
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000 // 1 minute
        }
      }
    );

    console.log(`Scheduled ${email.emailId} for ${email.sendDelay} minutes from now`);
  }
}

// Process queue
emailQueue.process(async (job) => {
  const { emailId, userData, template, subject } = job.data;

  // Send email via ESP
  await sendEmail(userData.email, subject, template, userData);

  // Log analytics
  await logEmailSent(emailId, userData.userId);
});

module.exports = { scheduleEmailSequence };
```

### Step 4: Configure Dynamic Content

```javascript
// template-engine.js
const Handlebars = require('handlebars');

// Register custom helpers
Handlebars.registerHelper('if_above_average', function(value, average, options) {
  if (value > average) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

// Populate email template
function populateEmailTemplate(templateString, userData, dynamicStats) {
  const template = Handlebars.compile(templateString);

  const data = {
    first_name: userData.firstName,
    last_name: userData.lastName,
    trial_end_date: formatDate(userData.trialEndDate),
    days_remaining: calculateDaysRemaining(userData.trialEndDate),
    hours_remaining: calculateHoursRemaining(userData.trialEndDate),
    usage_stats_dynamic: generateUsageStats(dynamicStats),
    security_score: calculateSecurityScore(userData),
    user_engagement_score: calculateEngagementScore(userData),
    app_deep_link: 'finderr://app',
    cta_button: generateCTAButton(),
    // Add more dynamic fields
  };

  return template(data);
}

function generateUsageStats(stats) {
  return `
    GPS Checks: ${stats.gpsChecks || 0}
    Alerts Configured: ${stats.alertsConfigured || 0}
    Remote Access: ${stats.remoteAccess || 0} times
    Protection Uptime: ${stats.uptime || 99.9}%
  `;
}

function calculateSecurityScore(userData) {
  let score = 100;

  // Deduct points for missing features
  if (!userData.permissions.location) score -= 20;
  if (!userData.permissions.notifications) score -= 10;
  if (!userData.geofences || userData.geofences.length === 0) score -= 15;
  if (!userData.remoteAccessTested) score -= 10;

  return Math.max(0, score);
}

module.exports = { populateEmailTemplate };
```

---

## Email Service Provider Setup

### Mailchimp Setup (Detailed)

#### 1. Create Audience (List)

```bash
# Navigate to Mailchimp dashboard
# Audience → Create Audience

Name: FINDERR Trial Users
From name: FINDERR by UNTRAPD
From email: support@untrapd.com
```

#### 2. Create Merge Tags (Custom Fields)

```
|FNAME| - First Name
|LNAME| - Last Name
|TRIAL_END| - Trial End Date
|DAYS_LEFT| - Days Remaining
|GPS_COUNT| - GPS Check Count
|SECURITY_SCORE| - Security Score
|SUBSCRIPTION| - Subscription Type (trial/monthly/annual)
```

#### 3. Create Automation Workflows

**Trial Welcome Automation:**

```bash
# Automations → Create → Custom

Workflow name: FINDERR Trial Welcome Sequence
Trigger: API request (tag: trial_started)

# Add emails:
Email 1: Day 0 - Welcome + Setup (send immediately)
Email 2: Day 3 - Feature highlights (delay 3 days)
Email 3: Day 7 - Mid-trial check-in (delay 7 days)
Email 4: Day 10 - Value comparison (delay 10 days)
Email 5: Day 13 - Final urgency (delay 13 days)
```

#### 4. Design Email Templates

```html
<!-- Mailchimp Template Structure -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>*|MC:SUBJECT|*</title>
</head>
<body>
  <table width="600" align="center">
    <tr>
      <td>
        <h1>*|HEADLINE|*</h1>
        <p>Hi *|FNAME|*,</p>
        *|EMAIL_BODY|*
        <a href="*|CTA_LINK|*" style="background-color:#007bff; color:#fff; padding:12px 24px;">
          *|CTA_TEXT|*
        </a>
      </td>
    </tr>
    <tr>
      <td style="font-size:12px; color:#666;">
        <p>FINDERR by UNTRAPD | Android-only Security App</p>
        <p><a href="*|UNSUB|*">Unsubscribe</a> | <a href="*|UPDATE_PROFILE|*">Update Preferences</a></p>
      </td>
    </tr>
  </table>
</body>
</html>
```

#### 5. Configure A/B Testing

```bash
# In each email:
# Settings → A/B Test → Subject Line

Variant A: (default subject line)
Variant B: (alternative from abTest array)

Test 50% of audience
Send winner after 4 hours
```

### SendGrid Setup (Detailed)

#### 1. Create API Key

```bash
# SendGrid Dashboard → Settings → API Keys
# Create API Key with "Full Access"

# Save to .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2. Set Up Dynamic Templates

```bash
# Email API → Dynamic Templates → Create Template

Template Name: FINDERR Trial Day 0
Template ID: d-xxxxxxxxxxxxx

# Add version with Handlebars syntax:
Subject: Welcome to FINDERR - Your Android is Now Protected 🛡️

Body:
<h1>Welcome to FINDERR, {{first_name}}!</h1>
<p>Your 14-day free trial has started...</p>
{{#if setup_completed}}
  <p>✓ Setup completed!</p>
{{else}}
  <p>⚠️ Complete your setup to get protected.</p>
{{/if}}
```

#### 3. Create Automation Workflows (Marketing Campaigns)

```javascript
// sendgrid-automation.js
const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_API_KEY);

async function createAutomation() {
  const data = {
    "name": "FINDERR Trial Welcome",
    "categories": ["trial", "onboarding"],
    "send_at": "now",
    "list_ids": ["list-id-here"],
    "segment_ids": ["segment-id-here"]
  };

  const request = {
    url: `/v3/marketing/singlesends`,
    method: 'POST',
    body: data
  };

  const [response, body] = await client.request(request);
  console.log(response.statusCode);
  console.log(body);
}
```

#### 4. Configure Tracking

```javascript
const msg = {
  to: 'user@example.com',
  from: 'support@untrapd.com',
  subject: 'Welcome to FINDERR',
  html: '<strong>Your trial has started</strong>',
  trackingSettings: {
    clickTracking: {
      enable: true,
      enableText: false
    },
    openTracking: {
      enable: true,
      substitutionTag: '%open-track%'
    },
    subscriptionTracking: {
      enable: true
    }
  },
  customArgs: {
    email_id: 'trial-day-0',
    user_id: '12345',
    sequence: 'trial'
  }
};
```

---

## A/B Testing Strategy

### Test Matrix

#### Trial Sequence A/B Tests

**Email: Day 13 (Highest Priority)**

| Element | Variant A | Variant B | Test Hypothesis |
|---------|-----------|-----------|-----------------|
| Subject | "🚨 Final Day: Your FINDERR Trial Ends Tomorrow" | "Last Chance: Keep Your Phone Protected (Trial Ends Tomorrow)" | Urgency emoji increases open rate |
| CTA | "Keep My Protection Active" | "Continue for $6.99/Month" | Direct pricing in CTA improves conversion |
| Body Length | Long (1200 words) | Short (600 words) | Shorter copy improves mobile readability |

**Email: Day 10 (High Priority)**

| Element | Variant A | Variant B | Test Hypothesis |
|---------|-----------|-----------|-----------------|
| Subject | "FINDERR vs $10/Month Competitors: Here's the Truth" | "Why FINDERR Costs 40% Less (But Works Better)" | Value-focused subject improves open rate |
| Social Proof | 3 testimonials | 1 testimonial + stats | Statistics more persuasive than multiple testimonials |

#### Monthly Retention A/B Tests

**Email: Week 8 Upgrade Offer**

| Element | Variant A | Variant B | Test Hypothesis |
|---------|-----------|-----------|-----------------|
| Subject | "Save $14 Per Year: Upgrade to Annual FINDERR Today" | "Lock in $5.83/Month (vs Your Current $6.99)" | Specific savings number outperforms percentage |
| Offer Duration | "7 days" | "Limited time" | Specific deadline creates more urgency |

### A/B Test Implementation

```javascript
// ab-test-manager.js
const sequences = require('./finderr-sequences');

function selectSubjectVariant(email, userId) {
  // Use user ID for consistent variant assignment
  const hashCode = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const variants = [email.subject.default, ...email.subject.abTest];
  const variantIndex = hashCode % variants.length;

  return {
    subject: variants[variantIndex],
    variant: variantIndex === 0 ? 'A' : String.fromCharCode(65 + variantIndex)
  };
}

function trackEmailEvent(emailId, userId, variant, event) {
  // Log to analytics database
  const analyticsData = {
    email_id: emailId,
    user_id: userId,
    variant: variant,
    event: event, // 'sent', 'opened', 'clicked', 'converted'
    timestamp: new Date()
  };

  // Send to analytics platform
  logToAnalytics(analyticsData);
}

// Example usage
const email = sequences.trialWelcomeSequence.emails[4]; // Day 13
const { subject, variant } = selectSubjectVariant(email, 'user-12345');

console.log(`Sending "${subject}" (Variant ${variant})`);
```

### Winner Determination

```javascript
// ab-test-analyzer.js
async function determineWinner(emailId, minimumSampleSize = 100) {
  const results = await getABTestResults(emailId);

  // Calculate composite score
  const scoreA = calculateScore(results.variantA);
  const scoreB = calculateScore(results.variantB);

  if (results.variantA.sentCount < minimumSampleSize ||
      results.variantB.sentCount < minimumSampleSize) {
    return { winner: null, reason: 'Insufficient sample size' };
  }

  const winner = scoreA > scoreB ? 'A' : 'B';
  const confidence = calculateStatisticalSignificance(results);

  if (confidence < 0.95) {
    return { winner: null, reason: 'Not statistically significant' };
  }

  return {
    winner: winner,
    scoreA: scoreA,
    scoreB: scoreB,
    confidence: confidence
  };
}

function calculateScore(variantResults) {
  // Weighted score based on business goals
  const openWeight = 1;
  const clickWeight = 2;
  const conversionWeight = 5;

  return (
    (variantResults.openRate * openWeight) +
    (variantResults.clickRate * clickWeight) +
    (variantResults.conversionRate * conversionWeight)
  );
}
```

---

## Personalization & Dynamic Content

### User Segmentation

```javascript
// segmentation.js
function segmentUser(userData) {
  const segments = [];

  // Engagement level
  if (userData.gpsChecks > 50) {
    segments.push('power_user');
  } else if (userData.gpsChecks < 5) {
    segments.push('low_engagement');
  } else {
    segments.push('average_user');
  }

  // Security posture
  const securityScore = calculateSecurityScore(userData);
  if (securityScore >= 90) {
    segments.push('security_conscious');
  } else if (securityScore < 70) {
    segments.push('needs_security_improvement');
  }

  // Feature adoption
  if (userData.features.geofencing) {
    segments.push('advanced_features');
  }

  if (userData.features.remoteAccess) {
    segments.push('tested_remote_control');
  }

  return segments;
}

function customizeEmailContent(email, userData) {
  const segments = segmentUser(userData);
  let content = email.content.body;

  // Customize based on segments
  if (segments.includes('power_user')) {
    content = content.replace(
      '{{user_engagement_message}}',
      "You're a power user! 💪 You're getting the most out of FINDERR."
    );
  } else if (segments.includes('low_engagement')) {
    content = content.replace(
      '{{user_engagement_message}}',
      "Let's unlock more of FINDERR's features for you."
    );
  }

  if (segments.includes('needs_security_improvement')) {
    content += '\n\n**⚠️ Security Tip:** Your security score is below 70. Enable all permissions for maximum protection.';
  }

  return content;
}
```

### Dynamic Stats Generation

```javascript
// dynamic-stats.js
async function generateUsageStats(userId) {
  const stats = await getUserStats(userId);
  const communityAverage = await getCommunityAverages();

  return {
    gpsChecks: stats.gpsChecks || 0,
    alertsConfigured: stats.alertsConfigured || 0,
    remoteAccess: stats.remoteAccess || 0,
    geofences: stats.geofences?.length || 0,
    uptime: (stats.uptime || 99.9).toFixed(1),
    comparisons: {
      gpsChecks: stats.gpsChecks > communityAverage.gpsChecks ? 'above' : 'below',
      alertsConfigured: stats.alertsConfigured > communityAverage.alertsConfigured ? 'above' : 'below'
    }
  };
}

function formatStatsForEmail(stats) {
  return `
**Your FINDERR Activity:**
→ GPS tracking: ${stats.gpsChecks} times (Community avg: 40)
→ Alerts configured: ${stats.alertsConfigured} (Community avg: 3)
→ Remote access: ${stats.remoteAccess} times (Community avg: 2)
→ Geofences: ${stats.geofences} zones created
→ Protection uptime: ${stats.uptime}%

${stats.comparisons.gpsChecks === 'above' ?
  '✓ You\'re an active user - great job!' :
  'Consider checking GPS weekly to verify tracking works.'
}
  `.trim();
}
```

---

## Analytics & Tracking

### Key Metrics to Track

```javascript
// analytics-tracking.js
const analytics = {
  emailMetrics: {
    // Deliverability
    sent: 0,
    delivered: 0,
    bounced: 0,
    bounceRate: 0,

    // Engagement
    opened: 0,
    openRate: 0,
    clicked: 0,
    clickRate: 0,
    clickToOpenRate: 0,

    // Conversion
    converted: 0,
    conversionRate: 0,
    revenue: 0,

    // List health
    unsubscribed: 0,
    unsubscribeRate: 0,
    spamReports: 0
  },

  sequenceMetrics: {
    sequenceStarted: 0,
    sequenceCompleted: 0,
    completionRate: 0,
    avgEmailsRead: 0,
    dropoffPoints: []
  },

  revenueMetrics: {
    trialConversions: 0,
    trialConversionRate: 0,
    annualUpgrades: 0,
    upgradeRate: 0,
    churnPrevented: 0,
    totalRevenue: 0,
    revenuePerEmail: 0
  }
};

function trackEmailEvent(eventData) {
  const {
    emailId,
    userId,
    event, // 'sent', 'delivered', 'opened', 'clicked', 'converted', 'unsubscribed'
    timestamp,
    metadata
  } = eventData;

  // Log to database
  database.emailEvents.insert({
    email_id: emailId,
    user_id: userId,
    event_type: event,
    timestamp: timestamp,
    variant: metadata.variant,
    sequence: metadata.sequence,
    metadata: metadata
  });

  // Update real-time analytics
  updateAnalyticsDashboard(eventData);
}

async function generateSequenceReport(sequenceId, dateRange) {
  const events = await database.emailEvents.find({
    sequence: sequenceId,
    timestamp: { $gte: dateRange.start, $lte: dateRange.end }
  });

  const report = {
    overview: {
      totalSent: events.filter(e => e.event_type === 'sent').length,
      totalDelivered: events.filter(e => e.event_type === 'delivered').length,
      uniqueOpens: [...new Set(events.filter(e => e.event_type === 'opened').map(e => e.user_id))].length,
      uniqueClicks: [...new Set(events.filter(e => e.event_type === 'clicked').map(e => e.user_id))].length,
      conversions: events.filter(e => e.event_type === 'converted').length
    },
    emailBreakdown: {},
    cohortAnalysis: {},
    revenueImpact: {}
  };

  // Calculate per-email metrics
  const emailIds = [...new Set(events.map(e => e.email_id))];
  for (const emailId of emailIds) {
    const emailEvents = events.filter(e => e.email_id === emailId);
    report.emailBreakdown[emailId] = calculateEmailMetrics(emailEvents);
  }

  return report;
}
```

### Dashboard Integration

```javascript
// analytics-dashboard.js
const express = require('express');
const app = express();

app.get('/analytics/dashboard', async (req, res) => {
  const trialMetrics = await generateSequenceReport('trial', {
    start: new Date('2025-01-01'),
    end: new Date()
  });

  const monthlyMetrics = await generateSequenceReport('monthly', {
    start: new Date('2025-01-01'),
    end: new Date()
  });

  const annualMetrics = await generateSequenceReport('annual', {
    start: new Date('2025-01-01'),
    end: new Date()
  });

  res.json({
    trial: trialMetrics,
    monthly: monthlyMetrics,
    annual: annualMetrics,
    summary: {
      totalRevenue: calculateTotalRevenue([trialMetrics, monthlyMetrics, annualMetrics]),
      avgConversionRate: calculateAvgConversionRate([trialMetrics, monthlyMetrics, annualMetrics]),
      topPerformingEmails: identifyTopEmails([trialMetrics, monthlyMetrics, annualMetrics])
    }
  });
});

app.listen(4000, () => {
  console.log('Analytics dashboard running on port 4000');
});
```

---

## Best Practices

### Deliverability Optimization

**1. Email Authentication**

```bash
# Set up SPF record
TXT @ "v=spf1 include:sendgrid.net ~all"

# Set up DKIM
# Generate in ESP dashboard, add to DNS

# Set up DMARC
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:postmaster@untrapd.com"
```

**2. List Hygiene**

```javascript
// list-cleaning.js
async function cleanEmailList() {
  // Remove hard bounces
  await removeHardBounces();

  // Remove unengaged users (no opens in 90 days)
  await removeUnengaged(90);

  // Verify email addresses
  await verifyEmailAddresses();

  // Remove spam complaints
  await removeSpamComplaints();

  console.log('Email list cleaned');
}

// Run weekly
setInterval(cleanEmailList, 7 * 24 * 60 * 60 * 1000);
```

**3. Send Time Optimization**

```javascript
// send-time-optimization.js
function optimizeSendTime(userTimezone, userBehavior) {
  // Best email open times based on data
  const optimalHours = {
    'weekday_morning': 9,   // 9 AM local time
    'weekday_lunch': 12,    // 12 PM local time
    'weekday_evening': 18,  // 6 PM local time
    'weekend': 10           // 10 AM local time
  };

  const now = new Date();
  const userLocalTime = convertToTimezone(now, userTimezone);
  const isWeekend = userLocalTime.getDay() === 0 || userLocalTime.getDay() === 6;

  // Use user behavior if available
  if (userBehavior.preferredOpenTime) {
    return userBehavior.preferredOpenTime;
  }

  // Default to weekday morning for trial users
  return optimalHours[isWeekend ? 'weekend' : 'weekday_morning'];
}
```

### Content Optimization

**1. Mobile-First Design**

- Keep subject lines under 50 characters
- Use single-column layouts
- Large, tappable CTA buttons (min 44x44px)
- Optimize images for mobile (max 600px width)
- Test on iOS Mail, Gmail, Outlook mobile

**2. Accessibility**

```html
<!-- Accessible email template -->
<table role="presentation">
  <tr>
    <td>
      <h1 style="font-size:24px; line-height:1.5;">
        Welcome to FINDERR
      </h1>
      <p style="font-size:16px; line-height:1.6; color:#333;">
        Your trial has started...
      </p>
      <a href="https://finderr.untrapd.com"
         style="display:inline-block; background:#007bff; color:#fff; padding:12px 24px; text-decoration:none;"
         role="button"
         aria-label="Complete FINDERR setup">
        Complete Setup
      </a>
    </td>
  </tr>
</table>
```

**3. Spam Filter Avoidance**

- Avoid ALL CAPS in subject lines
- Don't use excessive exclamation marks!!!
- Balance text-to-image ratio (60/40)
- Include plain text version
- Use real sender name and address
- Include physical mailing address
- Provide one-click unsubscribe

### Testing Checklist

```markdown
## Pre-Launch Email Testing Checklist

### Content Review
- [ ] Subject line under 50 characters
- [ ] Preheader text optimized
- [ ] All {{placeholders}} replaced
- [ ] Links working correctly
- [ ] CTA buttons prominent
- [ ] Unsubscribe link present
- [ ] Physical address included

### Technical Testing
- [ ] HTML validates (W3C)
- [ ] Plain text version created
- [ ] Images have alt text
- [ ] Mobile responsive (test on 3+ devices)
- [ ] Load time under 3 seconds
- [ ] Tracking pixels working

### ESP Testing
- [ ] Test send to team
- [ ] Spam score under 5
- [ ] Preview in 10+ email clients
- [ ] Rendering correct in dark mode
- [ ] Dynamic content populating

### Legal Compliance
- [ ] CAN-SPAM compliant
- [ ] GDPR compliant (if EU users)
- [ ] CASL compliant (if Canada users)
- [ ] Privacy policy linked
```

---

## Troubleshooting

### Common Issues

**Issue: Low open rates**

**Possible causes:**
- Subject line not compelling
- From name not recognized
- Bad send time
- List fatigue

**Solutions:**
```javascript
// A/B test subject lines
// Increase sender reputation
// Optimize send times
// Reduce email frequency
```

**Issue: High bounce rate**

**Possible causes:**
- Invalid email addresses
- Poor list hygiene
- Domain blacklisted

**Solutions:**
```javascript
// Verify emails before adding to list
// Implement double opt-in
// Check DMARC/SPF/DKIM records
// Monitor sender reputation
```

**Issue: Low conversion rate**

**Possible causes:**
- Weak CTA
- Too much content
- Mobile experience poor
- Timing wrong

**Solutions:**
```javascript
// Simplify CTA
// Reduce email length
// Optimize for mobile
// Test send times
```

---

## Maintenance & Optimization

### Weekly Tasks
- [ ] Review bounce reports
- [ ] Check spam complaints
- [ ] Monitor open/click rates
- [ ] Review A/B test results

### Monthly Tasks
- [ ] Generate performance reports
- [ ] Clean email list
- [ ] Update email content based on user feedback
- [ ] Review and optimize automation workflows

### Quarterly Tasks
- [ ] Comprehensive A/B testing review
- [ ] Refresh email templates
- [ ] Analyze cohort performance
- [ ] Update revenue attribution model

---

## Support & Resources

### Documentation
- **Sequences file:** `finderr-sequences.js`
- **Integration examples:** See code snippets above
- **API reference:** Your ESP documentation

### Contact
- **Technical issues:** Agent B - API Integration Specialist
- **Content updates:** Agent A - Content Infrastructure
- **Analytics questions:** Agent C - Analytics Dashboard

### External Resources
- [Mailchimp API Docs](https://mailchimp.com/developer/)
- [SendGrid API Docs](https://docs.sendgrid.com/)
- [Email on Acid Testing](https://www.emailonacid.com/)
- [Litmus Email Testing](https://www.litmus.com/)

---

**Last Updated:** 2025-10-15
**Version:** 1.0.0
**Next Review:** 2025-11-15
