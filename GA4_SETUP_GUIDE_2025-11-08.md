# Google Analytics 4 Setup Guide - FINDERR Campaign

**Date**: 2025-11-08
**Purpose**: Create dedicated GA4 property for FINDERR marketing campaign tracking
**Time Required**: 5 minutes
**Decision**: User approved dedicated GA4 property (Option A)

---

## 🎯 Why Dedicated GA4 Property?

✅ **Clean Campaign Isolation**: Separate tracking from other properties
✅ **Easier Analysis**: All FINDERR metrics in one place
✅ **Better Attribution**: Track beta signups, email opens, app downloads independently
✅ **Cost**: FREE (Google Analytics 4 is free for standard properties)

---

## 📋 Step-by-Step Setup (5 Minutes)

### Step 1: Create GA4 Property

1. **Go to Google Analytics**: https://analytics.google.com/
2. **Click "Admin"** (bottom left gear icon)
3. **Click "Create Property"**
4. **Property Details**:
   - Property name: `FINDERR Marketing Campaign`
   - Reporting time zone: `Your timezone`
   - Currency: `Your currency`
5. **Click "Next"**

### Step 2: Business Information

1. **Industry category**: Select `Technology` or `Mobile Applications`
2. **Business size**: Select appropriate size
3. **Business objectives**: Check:
   - ✅ Generate leads
   - ✅ Raise brand awareness
4. **Click "Create"**
5. **Accept Terms of Service**

### Step 3: Set Up Data Stream

1. **Choose platform**: Click `Web`
2. **Website URL**: `https://hub.untrapd.com`
3. **Stream name**: `FINDERR Landing Pages`
4. **Click "Create stream"**

### Step 4: Get Measurement ID

After creating the stream, you'll see:

```
Measurement ID: G-XXXXXXXXXX
```

**Copy this ID** - you'll need it for landing pages.

---

## 🔧 Implementation in Landing Pages

Once you have your `G-XXXXXXXXXX` measurement ID, replace the placeholder in both landing pages:

### English Landing Page
**File**: `Homepage/apps/finderr/index.html`

**Lines 27-32**:
```html
<!-- BEFORE (current placeholder) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- AFTER (replace with your real ID) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

### French Landing Page
**File**: `Homepage/fr/apps/finderr/index.html`

**Lines 32-37**:
```html
<!-- Same replacement as above -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## ✅ Verification (After Deployment)

### Real-Time Testing

1. **Go to GA4**: https://analytics.google.com/
2. **Select your new property**: `FINDERR Marketing Campaign`
3. **Click "Reports" → "Realtime"**
4. **Open landing page**: https://hub.untrapd.com/apps/finderr/
5. **Verify**: You should see 1 active user in real-time dashboard

### Event Tracking Verification

The landing pages already have these custom events configured:

**Beta Signup Event** (Homepage/apps/finderr/index.html - line 426):
```javascript
gtag('event', 'finderr_beta_signup', {
    event_category: 'conversion',
    event_label: 'finderr_page_form',
    value: 1
});
```

**CTA Click Event** (Homepage/apps/finderr/index.html - line 362):
```javascript
gtag('event', 'finderr_beta_cta_click', {
    event_category: 'engagement',
    event_label: 'finderr_page_cta',
    value: 1
});
```

**French Page Events** (Homepage/fr/apps/finderr/index.html - line 417):
```javascript
gtag('event', 'finderr_beta_signup', {
    event_category: 'conversion',
    event_label: 'finderr_page_form_fr',
    value: 1
});
```

### Configure Conversion Events (Recommended)

1. **Go to GA4 Admin → Events**
2. **Mark as conversion**:
   - `finderr_beta_signup` (primary conversion)
   - `finderr_beta_cta_click` (engagement conversion)

---

## 📊 What You'll Track

Once GA4 is configured, you'll automatically track:

### Automatic Events
- ✅ Page views (landing page visits)
- ✅ Session duration (time on site)
- ✅ User demographics (if available)
- ✅ Traffic sources (organic, social, direct, referral)
- ✅ Device categories (mobile, desktop, tablet)

### Custom Events (Already Configured)
- ✅ Beta signup conversions (EN + FR)
- ✅ CTA button clicks
- ✅ Form engagement

### Future Integration (Email Tracking)
Once email system is deployed, you can also track:
- Email opens (via `analytics_events` table in Supabase)
- Email clicks (via `analytics_events` table)
- App downloads (via Play Store attribution)

---

## 🎯 Campaign Performance Dashboard

### Key Metrics to Monitor

**Acquisition Metrics**:
- Landing page views (EN vs FR)
- Bounce rate
- Average time on page
- Traffic sources

**Conversion Metrics**:
- Beta signup rate (goal: >5%)
- CTA click rate
- Form abandonment rate

**Engagement Metrics**:
- Scroll depth
- Button clicks
- Section interactions

---

## 🔗 Integration with Supabase Analytics

**Dual Tracking System**:

| Metric | GA4 | Supabase | Use Case |
|--------|-----|----------|----------|
| Landing page views | ✅ Primary | ❌ | Traffic analysis |
| Beta signups | ✅ Secondary | ✅ Primary | Conversion tracking |
| Email opens | ❌ | ✅ Primary | Email performance |
| Email clicks | ❌ | ✅ Primary | Email engagement |
| CTA clicks | ✅ Primary | ❌ | Button optimization |

**Why Both?**:
- GA4: Best for website traffic and acquisition analysis
- Supabase: Best for user-level tracking and email performance

---

## 🚀 Quick Start Checklist

- [ ] Step 1: Create GA4 property at analytics.google.com
- [ ] Step 2: Get measurement ID (G-XXXXXXXXXX)
- [ ] Step 3: Replace placeholder in Homepage/apps/finderr/index.html (lines 27, 32)
- [ ] Step 4: Replace placeholder in Homepage/fr/apps/finderr/index.html (lines 32, 37)
- [ ] Step 5: Deploy updated landing pages to Netlify
- [ ] Step 6: Verify real-time tracking works
- [ ] Step 7: Mark `finderr_beta_signup` as conversion event
- [ ] Step 8: Create custom dashboard for campaign monitoring

---

## 📝 After Setup

**Share GA4 Access** (if needed):
1. Go to Admin → Property Access Management
2. Add team members with appropriate permissions
3. Recommend: `Viewer` for stakeholders, `Editor` for marketing team

**Create Custom Reports**:
1. Go to "Explore" → "Create new exploration"
2. Add segments for EN vs FR traffic
3. Track beta signup funnel
4. Monitor email campaign attribution (after email system launched)

---

## ⏱️ Timeline

- **Setup**: 5 minutes
- **Landing page updates**: 2 minutes
- **Deployment**: Immediate (Netlify auto-deploy)
- **Verification**: 2 minutes
- **Total**: ~10 minutes end-to-end

---

## 🎯 Expected Results

**Within 24 hours of launch**:
- Real-time visitor tracking
- Geographic distribution data
- Traffic source analysis
- Device breakdown

**Within 1 week**:
- Beta signup conversion rate
- Bounce rate trends
- Popular content sections
- Optimal CTA placement data

**Within 1 month**:
- Email attribution data
- User journey mapping
- A/B test results (EN vs FR)
- Campaign ROI metrics

---

## ✅ Next Steps After GA4 Setup

1. **Provide measurement ID** → I'll update both landing pages
2. **Deploy to Netlify** → GA4 tracking goes live
3. **Continue with email infrastructure deployment** → Complete campaign system

**Status**: Ready to implement once you provide GA4 measurement ID (G-XXXXXXXXXX)
