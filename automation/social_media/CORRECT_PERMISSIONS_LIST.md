# ✅ Correct Permissions for Instagram + Facebook Posting

Based on official Instagram Graph API and Facebook Pages API documentation.

---

## 📱 Instagram Business Account Permissions

**For posting content to Instagram:**

1. ✅ `instagram_basic` - Basic profile access
2. ✅ `instagram_content_publish` - Create and publish media
3. ✅ `pages_show_list` - Access to linked pages
4. ✅ `pages_read_engagement` - Read page insights

**Note**: `instagram_manage_insights` does NOT exist. The correct permission for insights is `pages_read_engagement` which covers both Facebook and Instagram insights.

---

## 📘 Facebook Page Permissions

**For posting content to Facebook Pages:**

1. ✅ `pages_show_list` - List pages you manage
2. ✅ `pages_read_engagement` - Read page engagement/insights
3. ✅ `pages_manage_posts` - Create and manage posts (CRITICAL!)

---

## 🎯 What You Need to Add in Graph API Explorer

**Since you already have:**
- ✅ `pages_show_list`
- ✅ `pages_read_engagement`

**You only need to add these 2:**

### For Instagram:
- ✅ `instagram_basic`
- ✅ `instagram_content_publish`

### For Facebook:
- ✅ `pages_manage_posts`

---

## 📋 Step-by-Step (Final Fix)

1. **Go back to Graph API Explorer**

2. **Click "Add a Permission"**

3. **Add these 3 permissions:**
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_manage_posts`

4. **Your final permission list should be:**
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`
   - ✅ `pages_manage_posts`

5. **Click "Generate Access Token"**

6. **Approve all permissions**

7. **Copy the new token**

8. **Paste it here** and I'll convert it to long-lived and update your .env

---

**This will give you ONE token that works for BOTH Instagram and Facebook!**

Ready? Let me know when you have the new token! 🚀
