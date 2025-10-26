# FINDERR Google Play Console - Session Handoff

**Date**: 2025-10-17
**From**: Hub Marketing Session
**To**: FINDERR Project Session
**Priority**: HIGH - Blocking beta release

---

## 🎯 **Current Situation**

**Beta Campaign Status**: PAUSED - Need to collect beta tester emails first
**Google Play Status**: 6 errors blocking Closed Testing release
**Strategy**: Launch email collection campaign → Fix errors → Add testers → Launch beta

---

## ❌ **6 Google Play Console Errors (MUST FIX)**

**Location**: Google Play Console → FINDERR → Test and release → Closed testing → Create release
**Screenshot**: `/home/wolfy/Pictures/Screenshots/Screenshot from 2025-10-17 23-32-23.png`

### **Error 1: Permissions Declaration Form**
- **Issue**: Missing permissions declaration form
- **Action**: Go to "Sensitive app permissions" → Fill out declaration form
- **Link**: "Go to Sensitive app permissions"

### **Error 2: Sensitive App Permissions**
- **Issue**: Permissions haven't been declared in Play Console
- **Action**: Update permission declarations for all sensitive permissions
- **Link**: "Go to Sensitive app permissions"

### **Error 3: Foreground Service Permissions**
- **Issue**: Must declare whether app uses foreground services
- **Action**: Go to declaration form, specify if app uses foreground services
- **Link**: "Go to declaration"
- **Note**: Check if FINDERR uses foreground services (location tracking, emergency mode, etc.)

### **Error 4: Full-Screen Intent Permissions**
- **Issue**: Must declare whether app uses full-screen intent permissions
- **Action**: Go to declaration form, specify usage
- **Link**: "Go to declaration"
- **Note**: Emergency wallpaper might use this - need to declare

### **Error 5: Photo and Video Permissions**
- **Issue**: Must explain core functionality requiring photo/video access
- **Action**: Go to declaration form, explain why app needs these permissions
- **Link**: "Go to declaration"
- **Note**: Does FINDERR use camera/photos? If yes, explain; if no, remove permission

### **Error 6: API Level Target**
- **Issue**: App targets API 34, must target at least API 35
- **Action**: Update `build.gradle` targetSdkVersion to 35
- **Files to modify**:
  - `android/app/build.gradle`: Change `targetSdkVersion 34` → `targetSdkVersion 35`
  - Rebuild AAB/APK
  - Upload new build to Google Play Console

---

## 🔧 **Fix Priority Order**

### **Priority 1: Quick Fixes (Console Only)**
1. Fill out Permissions Declaration Form
2. Declare Foreground Service usage (yes/no)
3. Declare Full-screen Intent usage (yes/no)
4. Explain Photo/Video permission usage (or remove if not used)

**Time**: 15-30 minutes
**Location**: Google Play Console forms

### **Priority 2: Code Changes (Requires Rebuild)**
5. Update `targetSdkVersion` to 35 in `build.gradle`
6. Test app with API 35
7. Rebuild AAB
8. Upload to Google Play Console

**Time**: 1-2 hours (including build/test)
**Location**: FINDERR Flutter project

---

## 📝 **Detailed Fix Instructions**

### **Fix 1-5: Google Play Console Forms**

```bash
# In Google Play Console:
1. Go to: Policy → App content → Sensitive permissions
2. Click "Start" on each required declaration
3. Answer questions about permission usage
4. Save each declaration

# For each permission, you'll need to explain:
- Why the app needs this permission
- How users benefit from granting it
- Whether it's optional or required
```

### **Fix 6: Update Target API**

```bash
# File: apps/finderr/android/app/build.gradle

# Find:
android {
    compileSdkVersion 34
    targetSdkVersion 34  # ← Change this
}

# Change to:
android {
    compileSdkVersion 35
    targetSdkVersion 35  # ← New value
}

# Then rebuild:
cd apps/finderr
flutter clean
flutter pub get
flutter build appbundle --release

# Upload new bundle to Google Play Console
```

---

## 🚀 **Beta Campaign Strategy (Updated)**

### **Phase 1: Email Collection (NOW - Week 1)**
**Goal**: Collect 12+ beta tester emails via landing page

**Marketing Campaign**:
- Landing page: `hub.untrapd.com/apps/finderr/beta` (✅ DEPLOYED)
- Form collects: Email, Name, Device, Testing Focus
- CTA: "Join Limited Beta - 100 Spots Available"
- No Google Play link yet (collecting interest first)

**30-Day Twitter Campaign**:
- 3 tweets/day promoting beta signup
- Focus: "Help us launch" + "Limited spots" + "Founder perks"
- Drive traffic to landing page
- Goal: 50-100 email signups in 2 weeks

### **Phase 2: Fix Errors (Week 1-2)**
**While collecting emails**, fix the 6 Google Play errors:
- Console form fixes (1-2 days)
- Code changes + rebuild (2-3 days)
- Upload new build (1 day)

### **Phase 3: Launch Internal Testing (Week 2)**
**Once you have 12+ emails + errors fixed**:
1. Add emails to Internal Testing tester list
2. Publish Internal Testing release
3. Send invites to testers
4. Run for 14 days

### **Phase 4: Apply for Production (Week 4+)**
**After 14 days with 12+ testers**:
- Apply for Production access
- Google reviews (1-7 days)
- Public launch!

---

## 📧 **Beta Landing Page - Email Collection**

**URL**: https://hub.untrapd.com/apps/finderr/beta/

**Current Status**: ✅ DEPLOYED (Netlify deployment in progress)

**Features**:
- Explains beta testing requirements (14 days, Android device)
- Lists beta tester perks (50% lifetime discount, Founder badge)
- Form collects emails WITHOUT needing Google Play link
- Clean, professional design

**Integration Needed**:
The form currently simulates submission. You need to connect it to:
- Mailchimp list
- Google Sheets
- Custom API endpoint
- Or manual email collection

**Form HTML** (in `/apps/finderr/beta/index.html` line 399-465):
```javascript
document.getElementById('finderrBetaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    // TODO: Connect to your email collection service
    // Currently simulates submission
});
```

---

## 🔄 **Version Mismatch Issue (Noted for Next Release)**

**Issue**: Version code in `build.gradle` doesn't match bundle name
**Impact**: Low - doesn't block testing, but should be fixed
**Action for next release**: Ensure version code matches bundle naming convention

---

## 📋 **Current Marketing Assets Ready**

✅ **Beta Landing Page**: `hub.untrapd.com/apps/finderr/beta/`
✅ **Main App Page**: `hub.untrapd.com/apps/finderr/` (has beta signup form)
✅ **30-Day Campaign Calendar**: Ready to rewrite for beta phase
✅ **Twitter Automation**: Daily scheduler ready (currently paused)

❌ **Google Play Internal Testing URL**: Can't use until errors fixed
❌ **Beta Tester Emails**: Need to collect 12+ minimum

---

## 🎯 **Immediate Next Steps**

### **For Hub Marketing Session (Current)**:
1. ✅ Beta landing page deployed
2. ⏳ Check Netlify deployment completion
3. ✅ Rewrite 30-day campaign for email collection phase
4. ⏳ Launch Twitter campaign tomorrow (drives to landing page)

### **For FINDERR Project Session (Handoff)**:
1. ❌ Fix 6 Google Play Console errors (Priority 1: Console forms, Priority 2: Code changes)
2. ❌ Test app with API level 35
3. ❌ Rebuild and upload new AAB
4. ❌ Create Internal Testing release when errors cleared
5. ⏳ Wait for 12+ beta tester emails from marketing campaign

---

## 📊 **Success Metrics**

**Week 1-2 (Email Collection)**:
- 🎯 Target: 50+ email signups
- 🎯 Minimum: 12+ qualified testers (Android users, willing to test 14 days)

**Week 2-3 (Beta Testing)**:
- 🎯 12+ testers actively using app
- 🎯 Feedback collected via beta@untrapd.com
- 🎯 No critical bugs reported

**Week 4+ (Production)**:
- 🎯 Google Play errors resolved
- 🎯 14 days of testing complete
- 🎯 Apply for Production access
- 🎯 Public launch approved

---

## 🔗 **Related Files**

**Marketing**:
- `/Homepage/apps/finderr/beta/index.html` - Beta landing page
- `/Homepage/apps/finderr/index.html` - Main FINDERR page (has beta form)
- `/automation/social_media/daily-twitter-scheduler.js` - Autonomous Twitter campaign
- `/campaign_execution/finderr_v178_launch_calendar.json` - 30-day campaign calendar (needs rewrite)

**FINDERR App** (separate project):
- `apps/finderr/android/app/build.gradle` - Need to update targetSdkVersion 35
- `apps/finderr/android/app/src/main/AndroidManifest.xml` - Check permissions

**Google Play Console**:
- App: FINDERR (com.untrapd.finderr)
- Current build: v4.1.0+178 (has version mismatch)
- Testing: Internal Testing available, Closed Testing blocked by errors

---

## ⚠️ **Important Notes**

1. **Don't rush the fixes** - Better to fix properly than rush and create more issues
2. **Marketing can run in parallel** - Collect emails while fixing errors
3. **12 testers minimum** - This is Google's requirement, not negotiable
4. **14 days required** - Can't skip or speed up this requirement
5. **Version mismatch** - Low priority, but document for next release

---

## 📞 **Contact Points**

**Beta Tester Email**: beta@untrapd.com
**Landing Page**: https://hub.untrapd.com/apps/finderr/beta/
**Google Play Console**: https://play.google.com/console/
**Twitter**: @DavisUntrap (FINDERR campaign account)

---

## 🚀 **Timeline Summary**

```
TODAY (Oct 17):
✅ Beta landing page deployed
✅ Marketing campaign ready
⏳ Netlify deployment completing
→ Start fixing Google Play errors in FINDERR session

TOMORROW (Oct 18):
→ Launch Twitter campaign (3 tweets/day → landing page)
→ Continue fixing Google Play errors
→ Begin collecting beta tester emails

WEEK 1 (Oct 18-24):
→ Email collection ongoing
→ Fix all 6 Google Play errors
→ Rebuild app with API 35
→ Upload new build

WEEK 2 (Oct 25-31):
→ Have 12+ beta tester emails
→ Create Internal Testing release
→ Send invites to testers
→ Beta testing begins

WEEK 3-4 (Nov 1-14):
→ 14 days of active testing
→ Collect feedback
→ Fix any critical bugs

WEEK 5+ (Nov 15+):
→ Apply for Production
→ Google review (1-7 days)
→ PUBLIC LAUNCH! 🎉
```

---

## ✅ **Handoff Checklist**

- [x] Beta landing page created and deployed
- [x] 6 Google Play errors documented with fix instructions
- [x] Phase 1 strategy: Email collection campaign ready
- [x] Timeline and success metrics defined
- [ ] Netlify deployment confirmed (check status)
- [ ] Start fixing Google Play errors in FINDERR project
- [ ] Launch Twitter campaign for email collection
- [ ] Collect 12+ beta tester emails (Week 1-2)
- [ ] Create Internal Testing release when errors fixed

---

**Session handoff complete. Open Claude in FINDERR project directory to fix the 6 Google Play errors.**
