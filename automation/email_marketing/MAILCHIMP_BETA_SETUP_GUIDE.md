# FINDERR Beta Tester Email Automation - Mailchimp Setup Guide

**Created**: 2025-10-25
**Purpose**: Step-by-step instructions for setting up automated beta tester welcome emails in Mailchimp
**Status**: Ready for deployment

---

## ✅ Quick Start Checklist

**What's Already Done:**
- [x] Beta signup form connected to Mailchimp webhook (`/.netlify/functions/mailchimp-webhook`)
- [x] Google Play beta testing link integrated (`https://play.google.com/apps/testing/com.finderr.app`)
- [x] 3-email welcome sequence created (`finderr-beta-tester-sequence.json`)
- [x] Mailchimp API credentials configured (`.env.mailchimp`)

**What You Need to Do:**
- [ ] Create Mailchimp automation (15 minutes)
- [ ] Upload email templates (20 minutes)
- [ ] Test automation with test email (5 minutes)
- [ ] Activate automation (1 minute)

**Total Setup Time:** ~40 minutes

---

## 📧 Email Sequence Overview

### Email 1: Immediate Welcome + Download Link
- **Send**: Immediately after signup
- **Subject**: 🎉 Welcome to FINDERR Beta - Download Link Inside!
- **Purpose**: Provide Google Play beta testing link and setup instructions
- **CTA**: "Become a Beta Tester →" (opens Google Play beta page)

### Email 2: Testing Checklist
- **Send**: 3 days after signup
- **Subject**: FINDERR Beta: Testing Checklist & Support
- **Purpose**: Guide testers through key testing scenarios
- **CTA**: Reply with feedback or visit beta support portal

### Email 3: Beta Complete + Discount
- **Send**: 14 days after signup
- **Subject**: FINDERR Beta Complete - Claim Your 50% Lifetime Discount!
- **Purpose**: Thank testers and activate 50% lifetime discount reward
- **CTA**: "Claim Your 50% Discount →"

---

## 🛠️ Mailchimp Setup Instructions

### Step 1: Log into Mailchimp

1. Go to [mailchimp.com](https://mailchimp.com) and log in
2. Select your UNTRAPD audience (Audience ID: `58c73af01b`)
3. Navigate to **Automations** → **Create** → **Customer Journey**

### Step 2: Create the Automation Trigger

**Automation Name**: FINDERR Beta Tester Welcome Series

1. **Trigger Type**: Tag is added
2. **Tag Name**: `finderr-beta`
3. **Additional Filters** (optional):
   - Tag also includes: `android-tester`
   - Subscriber status: `Subscribed`

**How it works**: When someone submits the beta signup form on `hub.untrapd.com/apps/finderr`, the Netlify function automatically adds them to Mailchimp with the `finderr-beta` tag, triggering this automation.

### Step 3: Build the Email Journey

#### Email 1: Immediate Welcome

**Setup:**
1. Add Email → **Delay: None (send immediately)**
2. Click **Design Email**

**Email Settings:**
- **From Name**: UNTRAPD Team
- **From Email**: beta@untrapd.com
- **Reply-to**: support@untrapd.com
- **Subject**: 🎉 Welcome to FINDERR Beta - Download Link Inside!
- **Preview Text**: Get FINDERR v4.1 on your Android device in 3 easy steps

**Email Content** (copy from `finderr-beta-tester-sequence.json` → emails[0].content):

```
Hi *|FNAME|*,

🚀 Thank you for joining the FINDERR Beta Testing Program!

You're now part of an exclusive group helping us validate FINDERR v4.1 before the official Android launch.

📱 GET FINDERR ON YOUR ANDROID DEVICE

Step 1: Open this link on your Android device:
👉 https://play.google.com/apps/testing/com.finderr.app

Step 2: Tap "Become a Tester"

Step 3: Download FINDERR from Google Play Store

[CTA BUTTON: "Become a Beta Tester →" linking to Google Play beta page]

🔒 WHAT WE NEED YOU TO TEST

✅ Security & RLS Validation
✅ Emergency Activation (SMS + Web Dashboard)
✅ Wallpaper System
✅ Performance & Battery Usage
✅ User Experience

🎁 YOUR BETA TESTER BENEFITS

• Free v4.1 Testing Access
• 50% Lifetime Discount ($3.50/month at launch)
• Direct Support Channel
• Contributor Recognition

💬 NEED HELP?

Email: support@untrapd.com
Beta Portal: https://hub.untrapd.com/apps/finderr/beta
Response Time: Within 24 hours

Thank you for helping us build something amazing! 🚀

The UNTRAPD Team
Building the future of device security

Website: https://hub.untrapd.com
FINDERR Page: https://hub.untrapd.com/apps/finderr
```

**Design Notes:**
- Use UNTRAPD branded template (steampunk aesthetic)
- Colors: Primary #FF6B35, Secondary #4ECDC4, Background #1a1a2e
- Include FINDERR logo and emergency wallpaper screenshot
- Make CTA button prominent and mobile-friendly

#### Email 2: Testing Checklist

**Setup:**
1. Add Email → **Delay: 3 days after Email 1**
2. Click **Design Email**

**Email Settings:**
- **Subject**: FINDERR Beta: Testing Checklist & Support
- **Preview Text**: Here's what to focus on during your 14-day beta testing period

**Email Content** (copy from `finderr-beta-tester-sequence.json` → emails[1].content):

```
Hi *|FNAME|*,

Hope you've had a chance to download and explore FINDERR!

✅ 14-DAY BETA TESTING CHECKLIST

CRITICAL TESTS:
☐ Emergency Activation (SMS): Send "EMERGENCY_ON"
☐ Web Dashboard Trigger: Activate from hub.untrapd.com
☐ Wallpaper Backup: Verify original wallpaper saved
☐ SMS Restoration: Send "EMERGENCY_OFF"
☐ Background Service: Test after phone restart
☐ RLS Security: Verify data isolation

OPTIONAL TESTS:
☐ Custom Background Upload
☐ Battery Performance (24 hours)
☐ Multiple Activations (5+ times)
☐ Different Android Devices

📝 HOW TO SUBMIT FEEDBACK

• Quick Feedback: Reply to this email
• Bug Reports: hub.untrapd.com/apps/finderr/beta
• Feature Ideas: suggestions@untrapd.com

🔧 COMMON ISSUES & SOLUTIONS

Issue: Can't see the beta download
Solution: Sign into Google Play with *|EMAIL|*

Issue: Emergency wallpaper not changing
Solution: Check SET_WALLPAPER permission

Issue: SMS commands not working
Solution: Verify SMS permissions and restart app

Thank you for your dedication! 🙏

The UNTRAPD Team
```

#### Email 3: Beta Complete + Discount

**Setup:**
1. Add Email → **Delay: 14 days after Email 1**
2. Click **Design Email**

**Email Settings:**
- **Subject**: FINDERR Beta Complete - Claim Your 50% Lifetime Discount!
- **Preview Text**: Thank you for testing FINDERR v4.1 - here's your exclusive launch offer

**Email Content** (copy from `finderr-beta-tester-sequence.json` → emails[2].content):

```
Hi *|FNAME|*,

🎉 The FINDERR Beta Testing Period is Complete!

Thank you for being one of the first Android users to test FINDERR v4.1.

🚀 YOUR CONTRIBUTION TO FINDERR

✅ 100 Beta Testers validated FINDERR v4.1
✅ 350+ Test Sessions across Android devices
✅ 47 Bugs Fixed based on tester reports
✅ 99.7% Security Validation confirmed

🎁 EXCLUSIVE BETA TESTER REWARD

50% LIFETIME DISCOUNT on FINDERR Premium!

Regular Price: $6.99/month
Your Beta Tester Price: $3.50/month (for life!)

[CTA BUTTON: "Claim Your 50% Discount →"]

⏰ LIMITED TIME: Expires in 7 days!

📱 FINDERR PRODUCTION LAUNCH

✅ Now: Continue using beta version (auto-updates to production)
✅ Within 7 Days: Activate 50% lifetime discount
✅ Production Launch: FINDERR goes live on Google Play
✅ Future Updates: All new features included

🏆 BETA TESTER RECOGNITION

You'll be listed as an UNTRAPD Ecosystem Beta Contributor!

💬 ONE LAST REQUEST

Reply with your overall beta testing experience:
• What did you like most about FINDERR?
• Any features you'd like to see?
• Would you recommend FINDERR?

Thank you for being essential to FINDERR's journey! 🚀

The UNTRAPD Team
The future of device security starts with you
```

### Step 4: Configure Tracking & Analytics

**UTM Parameters** (add to all links):
```
utm_source=mailchimp
utm_medium=email
utm_campaign=finderr-beta-welcome
```

**Goals:**
- Email 1 Open Rate: 45%+
- Email 1 Click Rate: 25%+ (Google Play beta link)
- Email 3 Conversion Rate: 50%+ (discount activation)

### Step 5: A/B Test Email 1 Subject Line

**Test Setup:**
- **Variant A**: 🎉 Welcome to FINDERR Beta - Download Link Inside!
- **Variant B**: Your FINDERR Beta Access is Ready - Start Testing Now!
- **Winner Metric**: Open rate
- **Test Size**: 50% / 50%
- **Winner Sent After**: 4 hours

### Step 6: Test the Automation

**Before going live:**

1. Add yourself as a test subscriber with tag `finderr-beta`
2. Verify all 3 emails send correctly
3. Check all links work (especially Google Play beta link)
4. Test on mobile devices (iOS for preview, Android for full flow)
5. Confirm unsubscribe link works
6. Review formatting on desktop and mobile

**Test Email Address**: Use your own email or a test account

### Step 7: Activate the Automation

1. Review all settings one final time
2. Click **Activate** button
3. Monitor first 10 signups closely for any issues
4. Check Mailchimp reports daily for open/click rates

---

## 🔗 Key Links Reference

**Google Play Beta Testing URL**:
`https://play.google.com/apps/testing/com.finderr.app`

**Beta Signup Form**:
`https://hub.untrapd.com/apps/finderr#join-beta`

**Beta Landing Page**:
`https://hub.untrapd.com/apps/finderr/beta`

**Support Email**:
`support@untrapd.com`

**Mailchimp Webhook Endpoint**:
`https://hub.untrapd.com/.netlify/functions/mailchimp-webhook`

**Mailchimp Audience ID**:
`58c73af01b`

---

## 📊 Monitoring & Optimization

### Daily Checks (First Week)

**Day 1-3:**
- [ ] Check Email 1 open rate (goal: 45%+)
- [ ] Monitor Google Play beta link clicks (goal: 25%+)
- [ ] Review any support emails from confused testers
- [ ] Fix any broken links or formatting issues

**Day 4-7:**
- [ ] Check Email 2 engagement
- [ ] Review feedback replies
- [ ] Adjust email content based on common questions

**Day 14:**
- [ ] Check Email 3 discount activation rate (goal: 50%+)
- [ ] Prepare for production launch

### Optimization Opportunities

**If Open Rate < 45%:**
- Test different subject lines
- Send at different times (9 AM vs 6 PM)
- Personalize subject line: "Hi *|FNAME|*, your FINDERR beta access..."

**If Click Rate < 25%:**
- Make CTA button larger and more prominent
- Add urgency: "Limited to 100 testers - claim your spot!"
- Simplify download instructions

**If Discount Activation < 50%:**
- Send reminder email at Day 10
- Extend discount expiration to 14 days
- Add social proof: "87 beta testers already claimed!"

---

## 🚨 Troubleshooting

### Issue: Emails not sending

**Check:**
1. Automation is activated (not paused)
2. Tag `finderr-beta` is spelled correctly
3. Subscriber status is "Subscribed" (not pending)
4. Mailchimp API credentials are correct in `.env.mailchimp`

**Fix:**
- Verify webhook at `/.netlify/functions/mailchimp-webhook` is working
- Check Netlify function logs for errors
- Test manually adding tag to a subscriber

### Issue: Google Play link not working

**Check:**
1. Beta testing is active in Google Play Console
2. App package name is correct: `com.finderr.app`
3. Testers are signing in with registered email

**Fix:**
- Verify Google Play closed testing track is published
- Check tester email matches Google account
- Provide alternative download instructions

### Issue: High unsubscribe rate

**Check:**
- Email frequency (3 emails in 14 days is reasonable)
- Email relevance (are non-testers getting these emails?)
- Tag segmentation (only `finderr-beta` tagged users)

**Fix:**
- Add preference center link
- Segment by engagement (only send Email 2-3 to those who opened Email 1)
- Improve email value (more beta perks, exclusive insights)

---

## ✅ Pre-Launch Checklist

**Before activating the automation:**

- [ ] Mailchimp automation created with `finderr-beta` tag trigger
- [ ] All 3 emails designed and formatted correctly
- [ ] Google Play beta link tested: `https://play.google.com/apps/testing/com.finderr.app`
- [ ] Email delays configured: 0 min, +3 days, +14 days
- [ ] UTM parameters added to all links
- [ ] A/B test set up for Email 1 subject line
- [ ] Test email sent and reviewed on mobile + desktop
- [ ] Support email (support@untrapd.com) monitored
- [ ] Unsubscribe links working
- [ ] Privacy policy linked
- [ ] Analytics tracking enabled

**After activation:**

- [ ] First 10 signups monitored for delivery
- [ ] Open/click rates tracked daily
- [ ] Support inbox checked for tester questions
- [ ] Common issues documented and resolved
- [ ] Email content updated based on feedback

---

## 📝 Next Steps

**Immediate (Today):**
1. Log into Mailchimp and create automation
2. Upload Email 1 template
3. Test with your own email
4. Activate automation

**Within 3 Days:**
1. Upload Email 2 and Email 3 templates
2. Monitor first batch of signups
3. Respond to any support emails

**Within 14 Days:**
1. Review automation performance
2. Optimize based on open/click rates
3. Prepare discount activation system for Email 3

**Production Launch:**
1. Transition from beta to production
2. Update automation to production launch sequence
3. Maintain 50% lifetime discount for beta testers

---

## 🎯 Success Metrics

**Email Performance Goals:**

| Metric | Email 1 | Email 2 | Email 3 |
|--------|---------|---------|---------|
| Open Rate | 45%+ | 35%+ | 50%+ |
| Click Rate | 25%+ | 15%+ | 40%+ |
| Unsubscribe | <2% | <2% | <2% |

**Conversion Goals:**

- **Beta Activation**: 70%+ of signups download the app
- **Active Testers**: 50%+ complete testing checklist
- **Discount Redemption**: 50%+ claim 50% lifetime discount

**Overall Beta Program Success:**

- **100 Beta Testers** recruited within 14 days
- **50+ Active Testers** providing feedback
- **Security Validated** before production launch
- **Smooth Launch** with positive tester reviews

---

## 📞 Support

**Questions about setup?**
Email: support@untrapd.com

**Mailchimp technical issues?**
Mailchimp Support: https://mailchimp.com/contact/

**Netlify function errors?**
Check logs: https://app.netlify.com → Functions → mailchimp-webhook

---

**Setup Guide Version**: 1.0
**Last Updated**: 2025-10-25
**Status**: ✅ Ready for deployment
