# 📧 Kit/ConvertKit Setup Guide

## Overview
This guide helps you configure your Kit (ConvertKit) account for the enhanced marketing automation system.

## Step 1: Kit Account Preparation

### A. Access Your Kit Dashboard
1. **Login to Kit:** https://app.kit.com (or https://app.convertkit.com)
2. **Navigate to Account Settings** → API Keys
3. **Generate API credentials** if you haven't already

### B. API Credentials Needed
```bash
# You'll need these from Kit:
KIT_API_KEY=your_api_key_here          # From API Settings
KIT_API_SECRET=your_api_secret_here    # From API Settings (if available)
```

## Step 2: Create Forms in Kit

### A. Newsletter Signup Form
1. **Go to:** Forms → Create New Form
2. **Form Type:** Inline/Modal/Landing Page
3. **Form Name:** "Website Newsletter Signup"
4. **Purpose:** General newsletter subscriptions

**Copy Form ID:** (appears in URL: `/forms/12345`)
```bash
KIT_NEWSLETTER_FORM_ID=12345
```

### B. AppFinder Interest Form
1. **Create Form:** "AppFinder Pre-Launch Interest"
2. **Purpose:** Capture mobile app interest
3. **Custom Fields to Add:**
   - `app_interest_level` (text)
   - `mobile_platform` (text)
   - `signup_source` (text)

**Copy Form ID:**
```bash
KIT_APPFINDER_FORM_ID=67890
```

### C. Shop Interest Form
1. **Create Form:** "Etsy Shop Newsletter"
2. **Purpose:** Shop customer engagement
3. **Custom Fields to Add:**
   - `shop_interest_type` (text)
   - `product_preferences` (text)
   - `purchase_intent` (text)

**Copy Form ID:**
```bash
KIT_SHOP_FORM_ID=54321
```

## Step 3: Configure Tags

### A. Create Required Tags
Go to **Subscribers → Tags** and create:

**Core Tags:**
- `newsletter` - General newsletter subscribers
- `website-signup` - All website signups
- `staging-test` - For testing (temporary)

**Interest-Specific Tags:**
- `appfinder-interest` - Mobile app interest
- `mobile-app` - General mobile app users
- `etsy-customer` - Shop customers
- `shop-interest` - Shop newsletter interest

**Source Tags:**
- `contact-form` - Contact form submissions
- `quick-action` - Quick action button clicks
- `newsletter-form` - Newsletter form submissions

### B. Tag Configuration in Code
The system automatically assigns tags based on signup source:

```javascript
// Automatic tag assignment:
'newsletter' → ['newsletter', 'website-signup']
'appfinder' → ['appfinder-interest', 'mobile-app']
'etsy-shop' → ['etsy-customer', 'shop-interest']
'contact' → ['contact-form', 'website-signup']
```

## Step 4: Email Sequences (Optional but Recommended)

### A. Welcome Sequence
1. **Create Sequence:** "Website Welcome Series"
2. **Trigger:** Tag = `newsletter`
3. **Emails:**
   - Welcome & introduction
   - Value proposition
   - Social media follow
   - First product/service highlight

### B. AppFinder Pre-Launch Sequence
1. **Create Sequence:** "AppFinder Pre-Launch"
2. **Trigger:** Tag = `appfinder-interest`
3. **Emails:**
   - Thanks for interest
   - Development updates
   - Beta testing invitation
   - Launch notification

### C. Shop Customer Sequence
1. **Create Sequence:** "Shop Customer Welcome"
2. **Trigger:** Tag = `etsy-customer`
3. **Emails:**
   - Shop introduction
   - Best-sellers showcase
   - Customer stories
   - Exclusive discounts

## Step 5: Environment Variables Setup

### A. Complete Environment Configuration
Copy to your `.env.staging` and Netlify environment variables:

```bash
# Kit Integration
KIT_API_KEY=your_actual_api_key
KIT_API_SECRET=your_actual_secret
KIT_NEWSLETTER_FORM_ID=your_newsletter_form_id
KIT_APPFINDER_FORM_ID=your_appfinder_form_id
KIT_SHOP_FORM_ID=your_shop_form_id

# Default Settings
KIT_DEFAULT_SEQUENCE=website_welcome_series
KIT_RATE_LIMIT=100
KIT_TIMEOUT=5000
```

### B. Netlify Configuration
1. **Go to:** Netlify Site Settings → Environment Variables
2. **Add each variable** from above
3. **Redeploy** the site to pick up new variables

## Step 6: Testing Kit Integration

### A. Test Email Addresses
Use these test emails (Kit won't send real emails):
```
test@example.com
staging-test@example.com
appfinder-test@example.com
shop-test@example.com
```

### B. Verify Integration
```bash
# Test Kit integration
npm run test:kit

# Check specific form
curl -X POST https://your-staging-site.netlify.app/api/kit-webhook \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"newsletter"}'
```

### C. Check Kit Dashboard
1. **Go to:** Subscribers in Kit
2. **Look for:** Test email addresses
3. **Verify:** Correct tags assigned
4. **Check:** Custom fields populated

## Step 7: Production Setup

### A. Production Forms
**Option 1:** Use same forms for production
**Option 2:** Create separate production forms

### B. Production Environment Variables
```bash
# Update for production:
KIT_API_KEY=production_api_key
KIT_NEWSLETTER_FORM_ID=production_form_id
# ... etc
```

## Troubleshooting

### Common Issues

**API Key Not Working:**
- Verify key copied correctly (no extra spaces)
- Check API permissions in Kit
- Try regenerating the API key

**Subscribers Not Appearing:**
- Check form IDs match exactly
- Verify API credentials
- Look for validation errors in logs

**Tags Not Assigned:**
- Ensure tags exist in Kit account
- Check tag names match exactly (case sensitive)
- Verify custom fields are created

### Testing Commands
```bash
# Test specific endpoints
node test/kit-integration-test.js

# Check staging health
npm run monitor:single

# Full test suite
npm run test:full
```

### Support Resources
- **Kit API Documentation:** https://developers.kit.com
- **Kit Support:** help@kit.com
- **Our Test Suite:** `test/kit-integration-test.js`

---

## ✅ Success Criteria

When everything is working correctly:
- ✅ **Test emails appear in Kit dashboard**
- ✅ **Correct tags are automatically assigned**
- ✅ **Custom fields are populated**
- ✅ **Email sequences trigger (if configured)**
- ✅ **All test suites pass**

**Your Kit integration is now ready for production!** 🎉

## Next Steps
1. **Deploy to staging** and test with real data
2. **Configure production forms** and environment variables
3. **Set up email sequences** for better engagement
4. **Monitor subscriber growth** and engagement metrics
5. **A/B test form copy** and placement for optimization