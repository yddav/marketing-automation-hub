# 📱 Instagram Bot Creation Guide

**UNTRAPD Hub (@untrapd.hub) - Axiom.ai Automation Setup**

## 🎯 Objective

Create automated Instagram posting bot that pulls content from Google Sheets and posts to @untrapd.hub account.

## 📋 Pre-Requirements Verified

✅ Instagram @untrapd.hub account logged in  
✅ Business account access confirmed  
✅ Posting interface accessible via "+" button  
✅ Axiom.ai extension installed and ready

## 🤖 Bot Creation Steps

### **Step 1: Start Bot Builder**
1. **Click Axiom Extension** in Chrome toolbar
2. **Select "Build a bot"** or "Record new bot"
3. **Bot Name**: `untrapd_hub_instagram_post`
4. **Description**: "Post daily themes and milestones to @untrapd.hub"

### **Step 2: Record Instagram Workflow**
**Important**: We'll record the actions, then connect data later

1. **Navigate to Instagram**: Make sure you're on instagram.com
2. **Click "Start Recording"** in Axiom interface
3. **Create Post Process**:
   - Click "+" (Create) button
   - Select "Post" (not Story/Reel)
   - **DON'T upload image yet** - click "Skip" or select text-only
   - Click in caption area
   - Type sample text: "Test post from FINDERR automation #test"
   - **DON'T click Share yet** - we'll set this up later

4. **Stop Recording**: Click "Stop" in Axiom

### **Step 3: Configure Data Source**
After recording the basic workflow:

1. **Add Data Source**: Click "Add data source"
2. **Choose "Google Sheets"**
3. **Spreadsheet URL**: We'll provide this after sheets setup
4. **Sheet Name**: "Content"
5. **Map Fields**:
   - Caption Text → Column C (Content)
   - Hashtags → Column D (Hashtags)  
   - Schedule → Column F (Schedule)

### **Step 4: Add Conditional Logic**
1. **Filter Rows**: Only process rows where:
   - Platform = "All" OR Platform = "Instagram"
   - Status = "Pending"
   - Date = Today OR Schedule = "IMMEDIATE"

2. **Update Status**: After posting, change Status to "Posted"

### **Step 5: Test Run**
1. **Load Test Data**: Use our prepared content templates
2. **Dry Run**: Test without actually posting
3. **Live Test**: Post one test message
4. **Verify**: Check Instagram for successful post

## 📊 Google Sheets Integration

### **Content Sheet Structure**
```
Column A: Date (2025-01-06)
Column B: Platform (All/Instagram)  
Column C: Content (Full post text)
Column D: Hashtags (#FINDERR #UNTRAPDHub)
Column E: Media URL (optional)
Column F: Schedule (09:00 or IMMEDIATE)
Column G: Status (Pending/Posted/Failed)
Column H: Notes (Daily Theme - Monday)
```

### **Sample Data Row**
```
2025-01-06 | All | 🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again. | #MotivationMonday #FINDERR #PhoneSecurity #UNTRAPDHub | | 09:00 | Pending | Daily Theme - Monday
```

## ⚙️ Bot Configuration

### **Scheduling Settings**
- **Run Frequency**: Every 2 hours (to check for new content)
- **Active Hours**: 8 AM - 8 PM (avoid late night posts)
- **Weekend Mode**: Reduced frequency

### **Error Handling**
- **Login Issues**: Stop and send alert
- **Content Errors**: Skip row, log error
- **Rate Limiting**: Wait and retry

### **Success Criteria**
- ✅ Bot connects to Google Sheets
- ✅ Filters content correctly  
- ✅ Posts formatted content
- ✅ Updates status after posting
- ✅ Handles errors gracefully

## 🚨 Testing Protocol

### **Phase 1: Dry Run**
1. Load test data
2. Run bot without posting
3. Verify content formatting
4. Check filtering logic

### **Phase 2: Single Test Post**
1. Create test content row
2. Run bot for one post
3. Verify Instagram post
4. Check status update

### **Phase 3: Daily Theme Test**
1. Add today's theme to sheets
2. Run automated posting
3. Verify timing and content
4. Monitor for 24 hours

## 📈 Success Metrics

### **Technical Performance**
- **Posting Success Rate**: >95%
- **Content Accuracy**: 100% correct formatting
- **Scheduling Accuracy**: ±5 minutes of target time
- **Error Recovery**: <1 minute downtime

### **Content Quality**
- **Hashtag Compliance**: All required tags included
- **Brand Consistency**: Voice and tone maintained
- **Engagement Ready**: Questions, CTAs included

## 🔄 Next Steps After Instagram Success

1. **Facebook Bot**: Adapt workflow for Facebook page posting
2. **Pinterest Bot**: Pin creation with image support
3. **Cross-Platform Coordination**: Avoid duplicate timing
4. **FINDERR Integration**: Milestone automation
5. **Reddit Addition**: After core platforms validated

---

**🎯 Current Focus**: Get Instagram automation working perfectly before expanding to other platforms. This ensures we have a solid foundation for the entire system.

**Ready to record your Instagram bot?** Let me know when you're ready to start the recording process!