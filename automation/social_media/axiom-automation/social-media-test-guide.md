claude# 🧪 Social Media Access Testing Guide

**UNTRAPD Hub - Verify Platform Access for Axiom.ai Automation**

## 🎯 Testing Objective

Verify that all social media accounts are properly logged in and accessible for Axiom.ai browser automation before creating bots.

## 📋 Platform Access Checklist

### ✅ Instagram (@untrapd.hub)
**Test Steps:**
1. **Navigate**: Open `instagram.com` in Chrome
2. **Login Check**: Should auto-login to @untrapd.hub account
3. **Business Account**: Verify "Professional" dashboard access
4. **Posting Access**: Click "+" or "Create" button - should open post creation
5. **Profile Verification**: Check bio matches: "🧠 Your intelligence hub unleashed\n📱 FINDERR - Never lose your phone permanently"

**✅ Success Criteria:**
- Account automatically logged in
- Can access post creation workflow
- Business account features available
- Profile information is correct

### ✅ Facebook ("un trapd" page)
**Test Steps:**
1. **Navigate**: Open `facebook.com` in Chrome
2. **Page Access**: Switch to "un trapd" page (not personal profile)
3. **Admin Rights**: Verify you can post as the page
4. **Posting Access**: Click "What's on your mind?" - should allow page posting
5. **Page Info**: Verify page name is "un trapd" with correct about section

**✅ Success Criteria:**
- Can switch to "un trapd" page view
- Admin/posting permissions active
- Page posting interface accessible
- Correct page information displayed

### ✅ Pinterest (untrapd.hub)
**Test Steps:**
1. **Navigate**: Open `pinterest.com` in Chrome
2. **Business Account**: Should be logged into untrapd.hub business account
3. **Create Access**: Click "Create" button - should show pin creation options
4. **Board Setup**: Create "UNTRAPD Hub" board if not exists
5. **Pin Creation**: Test creating a pin (can delete after test)

**✅ Success Criteria:**
- Business account active
- Can create pins and boards
- "UNTRAPD Hub" board exists or created
- Pin creation workflow functional

### ✅ Reddit
**Test Steps:**
1. **Navigate**: Open `reddit.com` in Chrome
2. **Account Login**: Verify logged into your Reddit account
3. **Subreddit Access**: Join these subreddits if not already:
   - r/apps
   - r/productivity  
   - r/androidapps
   - r/iosgaming
4. **Post Creation**: Test creating a text post (can delete after test)

**✅ Success Criteria:**
- Account logged in and active
- Joined relevant subreddits
- Can create posts in target subreddits
- No posting restrictions or bans

## 🔧 Troubleshooting Common Issues

### Login Problems
**Issue**: Account not logged in automatically
**Solution**: 
1. Login manually
2. Save credentials in browser
3. Enable "Stay logged in" options

### Permission Issues
**Issue**: Can't post to Facebook page
**Solution**:
1. Verify page admin rights
2. Switch from personal to page view
3. Check page posting permissions

### Reddit Restrictions
**Issue**: Can't post in subreddits
**Solution**:
1. Check subreddit rules
2. Verify account age/karma requirements
3. Read posting guidelines

## 🚀 Next Steps After Verification

Once all platforms pass the access test:

1. **✅ All Logged In**: Proceed to Instagram bot creation
2. **❌ Issues Found**: Fix login/permission problems first
3. **⚠️ Partial Access**: Note which platforms work, start with functional ones

## 📝 Test Results Documentation

**Record your results:**

```
Instagram (@untrapd.hub): ✅ / ❌
- Login: ✅ / ❌
- Posting: ✅ / ❌
- Business Features: ✅ / ❌

Facebook (un trapd page): ✅ / ❌  
- Page Access: ✅ / ❌
- Admin Rights: ✅ / ❌
- Posting Interface: ✅ / ❌

Pinterest (untrapd.hub): ✅ / ❌
- Business Account: ✅ / ❌
- Pin Creation: ✅ / ❌
- Board Management: ✅ / ❌

Reddit: ✅ / ❌
- Account Active: ✅ / ❌
- Subreddit Access: ✅ / ❌
- Posting Ability: ✅ / ❌
```

## ⚡ Quick Test Commands

**Instagram**: Navigate → Check @ symbol in top right → Click "+"
**Facebook**: Navigate → Switch to page → Click "What's on your mind?"  
**Pinterest**: Navigate → Click "Create" → Select "Create Pin"
**Reddit**: Navigate → Go to r/apps → Click "Create Post"

---

**🎯 Goal**: 100% platform access verified before moving to bot creation phase. This ensures Axiom.ai bots will work reliably without authentication issues.

**Next Phase**: Once verified, we'll start with the Instagram posting bot as our first automation workflow.