# 📊 Google Sheets Update Guide

**Update your existing Google Sheet with branded image paths**

## 🎯 Step-by-Step Instructions

### **Step 1: Open Your Google Sheet**
1. Go to the Google Sheet you created earlier for Instagram automation
2. Should be named something like "UNTRAPD Hub Instagram Content" or "instagram-content-sheet"

### **Step 2: Update Column Headers (if needed)**
Make sure Row 1 has:
- **A1**: `Image File Path`
- **B1**: `Message Content`

### **Step 3: Replace All Content Rows**
**Delete existing content rows** (keep headers) and add these:

#### **Row 2: Motivation Monday**
- **A2**: `brand_images/motivation_monday.jpg`
- **B2**: `🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again. #MotivationMonday #FINDERR #PhoneSecurity #UNTRAPDHub`

#### **Row 3: Tech Tuesday**  
- **A3**: `brand_images/tech_tuesday.jpg`
- **B3**: `🔧 Tech Tuesday: FINDERR's device identification system works instantly to help recover your lost phone! #TechTuesday #TechTips #FINDERR #PhoneRecovery`

#### **Row 4: Widget Wednesday**
- **A4**: `brand_images/widget_wednesday.jpg`
- **B4**: `⚡ Widget Wednesday: FINDERR's smart widget keeps your phone findable 24/7 with zero battery drain! #WidgetWednesday #FINDERR #SmartWidget #TechLife`

#### **Row 5: Throwback Thursday**
- **A5**: `brand_images/throwback_thursday.jpg`
- **B5**: `📸 Throwback Thursday: Remember when losing your phone meant losing all your photos, contacts, and memories? FINDERR changed everything! #ThrowbackThursday #PhoneSecurity #LifeSaver #FINDERR`

#### **Row 6: Feature Friday**
- **A6**: `brand_images/feature_friday.jpg`
- **B6**: `🚀 Feature Friday: FINDERR's core device identification features keep getting better! Family sharing coming in future updates! #FeatureFriday #FINDERR #DeviceID #AppUpdate`

#### **Row 7: Weekend Wins**
- **A7**: `brand_images/weekend_wins.jpg`
- **B7**: `🌟 Weekend Wins: This week, FINDERR helped 47 users recover their lost phones! Share your success story in the comments! #WeekendWins #UserStories #FINDERR #Community`

#### **Row 8: Sunday Success**
- **A8**: `brand_images/sunday_success.jpg`
- **B8**: `💪 Sunday Success: Join 2,000+ users who never worry about losing their phones thanks to FINDERR! Download today! #SundaySuccess #JoinTheMovement #FINDERR #PhoneSecurity`

### **Step 4: Add Milestone Rows (Optional)**
Add these for milestone celebrations:

#### **Row 9: 500 Users Milestone**
- **A9**: `brand_images/milestone_500.jpg`
- **B9**: `🎉 MILESTONE ALERT: 500 users have joined the UNTRAPD Hub family! Thank you for trusting FINDERR with your phone security! #Milestone #UNTRAPDHub #FINDERR #Community #500Users`

#### **Row 10: 1000 Users Milestone**
- **A10**: `brand_images/milestone_1000.jpg`
- **B10**: `🚀 INCREDIBLE: 1,000 FINDERR users can't be wrong! Your phone security matters, and we're here to protect it! #1000Users #FINDERR #PhoneSecurity #Community #Grateful`

### **Step 5: Save and Test**
1. **Save the sheet** (Ctrl+S or it auto-saves)
2. **Copy the sheet URL** 
3. **Go back to Axiom** and refresh the data connection
4. **Test the workflow** - should now find image files!

## 🔧 **File Path Notes**

The image paths `brand_images/motivation_monday.jpg` assume:
- **Images are uploaded** to the same directory as your automation
- **Axiom can access** the brand_images folder
- **Relative paths work** in your setup

If you need **absolute paths**, use something like:
`/full/path/to/your/automation/brand_images/motivation_monday.jpg`

## ✅ **Verification Checklist**

After updating:
- [ ] Column A has image file paths
- [ ] Column B has complete message content with hashtags
- [ ] All 7 daily themes included
- [ ] Milestone posts added (optional)
- [ ] Sheet saved and shareable
- [ ] URL copied for Axiom

## 🚀 **Next: Test Axiom Workflow**

Once the sheet is updated:
1. **Refresh data** in Axiom
2. **Run the workflow** 
3. **Should now work** with images + captions!

---

**🎯 Ready to update your Google Sheet with this new structure!**