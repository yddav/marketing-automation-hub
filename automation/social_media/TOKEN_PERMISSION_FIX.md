# 🔧 Token Permission Fix Required

**Current Status**: Tokens are valid (60 days) but missing posting permissions

---

## ❌ What's Missing:

### Instagram Token Needs:
- ✅ `pages_show_list` (HAS)
- ✅ `pages_read_engagement` (HAS)
- ❌ `instagram_content_publish` (MISSING)
- ❌ `instagram_manage_insights` (MISSING)

### Facebook Token Needs:
- ✅ `pages_show_list` (HAS)
- ✅ `pages_read_engagement` (HAS)
- ❌ `pages_manage_posts` (MISSING - needed for posting!)

---

## 🎯 Quick Fix (5 minutes):

### Option 1: Add Missing Permissions (Recommended)

**In Graph API Explorer:**

1. **Keep your current app selected**: "UNTRAPD Social Automation"

2. **Add the missing permissions:**
   - Click "Add a Permission"
   - Add: `instagram_content_publish`
   - Add: `instagram_manage_insights`
   - Add: `pages_manage_posts`

3. **Click "Generate Access Token"** again

4. **You'll see permission popup** - approve all

5. **Copy the NEW token**

6. **Convert to long-lived** (use the convert scripts)

7. **Update .env**

---

### Option 2: Use What We Have (Test First)

The tokens might actually work for basic posting even without showing all permissions. Let's try a test post first.

---

## 🧪 Let's Test What We Can Do

Even though the permissions look incomplete, let me check if we can actually post. Sometimes the API restrictions are different than what the debugger shows.

**Would you like to:**

**A)** Go back to Graph API Explorer and add the missing permissions (5 min)

**B)** Try a test post with current tokens to see what actually works

**C)** Review your Meta App settings to see if there are restrictions

What would you prefer? I recommend **Option A** - quickly add those 3 missing permissions and regenerate the tokens.

