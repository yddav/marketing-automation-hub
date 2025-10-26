# FINDERR Campaign Visual Preview System

**Created**: 2025-10-26
**Purpose**: Interactive preview of social media posts across 5 platforms
**Status**: ✅ Ready for review

---

## 📸 What This Is

An interactive HTML-based preview system that shows how your FINDERR beta recruitment campaign posts will appear on each social media platform with authentic platform-specific styling.

---

## 🎯 Features

### Platform Previews (5 Total)

1. **📸 Instagram**
   - Mobile phone mockup
   - Profile header with avatar
   - Post image placeholder
   - Like/comment/share actions
   - Caption with hashtags
   - "...more" truncation simulation

2. **👥 Facebook**
   - Desktop post layout
   - Profile picture and page name
   - Full content display
   - Reaction/comment/share buttons
   - Link preview card (when applicable)

3. **🐦 Twitter**
   - Tweet card mockup
   - Profile handle and name
   - Character count (280 limit)
   - Thread indicators
   - Like/retweet/reply actions

4. **🎵 TikTok**
   - Vertical video mockup (9:16)
   - Video thumbnail placeholder
   - Overlay caption
   - Profile and engagement buttons

5. **📌 Pinterest**
   - Vertical pin card (2:3 ratio)
   - Save button (red, prominent)
   - Title (100 char limit)
   - Description (500 char limit)
   - Profile picture and username

### Interactive Controls

**Day Navigation**:
- ← Prev / Next → buttons
- Day counter (1-30)
- Jump to specific day

**Platform Filters**:
- Toggle individual platforms on/off
- Show/hide specific platform previews
- Compare subset of platforms

**Content Type Selector**:
- Awareness content
- Consideration content
- Conversion content

**Campaign Stats**:
- Campaign duration: 30 days
- Target beta testers: 100
- Total posts: 210+
- Platforms: 5

---

## 🚀 How to Use

### Quick Start

1. **Open the preview**:
   ```bash
   # From Hub project root
   xdg-open automation/social_media/preview/campaign-visual-preview.html
   ```

2. **Navigate through days**:
   - Use ← Prev / Next → buttons
   - Review content for each day

3. **Filter platforms**:
   - Click platform filter buttons to show/hide
   - Focus on specific platforms

4. **Switch content types**:
   - Awareness: Problem/solution introduction
   - Consideration: Features, benefits, comparison
   - Conversion: Urgency, offer, CTA

### Advanced Usage

**Copy Content**:
- Select text directly from preview
- Copy to clipboard for manual posting
- Verify character limits

**Compare Platforms**:
- Enable multiple platform filters
- See side-by-side comparison
- Check brand consistency

**Review Campaign Flow**:
- Navigate day by day
- Verify content progression
- Check hook strength

---

## 📁 File Structure

```
automation/social_media/preview/
├── campaign-visual-preview.html    # Main preview system (single file)
├── README.md                        # This file
└── assets/                          # (Future) Screenshots and images
    ├── screenshots/                 # FINDERR app screenshots
    └── mockups/                     # Platform UI elements
```

---

## 🎨 Current Implementation Status

### ✅ Completed Features

- [x] 5 platform mockup styling
- [x] Platform-specific UI elements
- [x] Day navigation system
- [x] Platform filter toggles
- [x] Content type selector
- [x] Campaign stats dashboard
- [x] Responsive grid layout
- [x] Authentic platform fonts and colors

### ⏳ Sample Content Loaded

- [x] Awareness.problem content
- [ ] Full 30-day template integration
- [ ] Real FINDERR app screenshots
- [ ] Carousel image support (Instagram)
- [ ] Copy-to-clipboard functionality

### 🔮 Future Enhancements

**Phase 1: Content Integration**
- [ ] Load all 30 days from `finderr-prelaunch-templates.js`
- [ ] Map day numbers to content categories
- [ ] Handle missing platform content gracefully

**Phase 2: Visual Assets**
- [ ] Integrate FINDERR app screenshots
- [ ] Add UNTRAPD.COM logo/avatar
- [ ] Create carousel previews for Instagram
- [ ] Optimize images for TikTok (9:16) and Pinterest (2:3)

**Phase 3: Interactive Features**
- [ ] Export functionality (copy text, download image)
- [ ] Character count warnings
- [ ] Hashtag analysis
- [ ] Posting schedule calendar view

---

## 🎯 Platform Styling Details

### Instagram
- **Font**: SF Pro Display (iOS) / Roboto (Android)
- **Colors**: #FFFFFF background, #262626 text, #0095F6 links
- **Layout**: 320px-414px mobile width
- **Profile pic**: 32px circle
- **Image**: Square (1:1) or portrait (4:5)

### Facebook
- **Font**: Segoe UI, Helvetica
- **Colors**: #F0F2F5 background, #1877F2 primary
- **Layout**: 500px post width (desktop)
- **Profile pic**: 40px circle
- **Text**: 14px body, 15px semibold for names

### Twitter
- **Font**: "TwitterChirp", -apple-system
- **Colors**: #15202B background, #1D9BF0 primary
- **Layout**: 598px max width
- **Profile pic**: 48px circle
- **Text**: 15px body, 280 char limit

### TikTok
- **Font**: ProximaNova, Arial
- **Colors**: #000000 background, #FE2C55 primary
- **Layout**: 360px mobile width
- **Profile pic**: 32px circle
- **Video**: 9:16 aspect ratio

### Pinterest
- **Font**: -apple-system, BlinkMacSystemFont, Roboto
- **Colors**: #E60023 primary (red), #FFFFFF background
- **Layout**: 236px pin width (masonry grid)
- **Image**: 2:3 aspect ratio ideal (1000x1500px)
- **Title**: 100 characters max, 20px bold
- **Description**: 500 characters max, 14px
- **Save button**: Rounded red button, prominent

---

## 📋 Content Source Files

### Primary Source
**File**: `automation/social_media/finderr-prelaunch-templates.js`
- Location: `/media/wolfy/.../Hub_App_Shop_Integ/automation/social_media/`
- Size: 768 lines
- Structure: 30-day campaign with awareness/consideration/conversion phases

### Content Validation
**File**: `automation/social_media/CONTENT_VALIDATION_BETA_RECRUITMENT.md`
- Quality ratings
- Hook strength analysis (8.4/10 average)
- Day-by-day content breakdown

### Campaign Tracking
**File**: `automation/social_media/finderr-campaign-tracking.json`
- Platform status (Instagram, Facebook, Twitter ready)
- Token expiry dates (Dec 24, 2025)
- Posting frequency settings

---

## 🚀 Launch Readiness

### Platform Status

✅ **Ready to Launch**:
- Instagram (60-day tokens, 400 posts/day limit)
- Facebook (60-day tokens, 200 posts/day limit)
- Twitter (OAuth configured, 3 tweets/day)

⏳ **Pending**:
- TikTok (API approval pending - optional)
- Pinterest (Not configured yet - optional)

### Launch Options

**Option A: Launch Now (3 platforms)**
- 180 posts over 30 days
- 75% platform coverage
- Time to launch: 30 minutes

**Option B: Wait for Pinterest (4 platforms)**
- 210 posts over 30 days
- 80% platform coverage
- Time to launch: 4-6 hours (Pinterest setup)

**Option C: Full 5-platform launch**
- 240 posts over 30 days
- 100% platform coverage
- Time to launch: TBD (TikTok approval dependent)

---

## 💡 How to Make Launch Decision

### Review Checklist

1. **Content Quality**:
   - [ ] Review posts across all days (1-30)
   - [ ] Check hook strength and engagement
   - [ ] Verify platform-specific formatting
   - [ ] Ensure brand consistency

2. **Visual Assets**:
   - [ ] Preview placeholder images
   - [ ] Determine if real screenshots needed before launch
   - [ ] Check carousel/video concepts

3. **Platform Coverage**:
   - [ ] Decide if 3 platforms sufficient (Instagram, Facebook, Twitter)
   - [ ] Evaluate Pinterest importance (visual platform benefits)
   - [ ] Assess TikTok optional status

4. **Timeline**:
   - [ ] Can launch in 30 minutes (Option A)
   - [ ] Willing to wait 4-6 hours for Pinterest (Option B)
   - [ ] Prefer to wait for all 5 platforms (Option C)

5. **Beta Recruitment Goals**:
   - [ ] 100 beta testers target achievable with 3 platforms?
   - [ ] Additional platforms improve conversion rates?
   - [ ] First-mover advantage vs perfect execution?

---

## 🎬 Next Steps

### User Actions
1. Open `campaign-visual-preview.html` in browser
2. Review content across Days 1-30
3. Evaluate platform previews for quality
4. Make launch decision (Option A/B/C)
5. Provide feedback on content adjustments

### Development Actions (Next Session)
1. Process user feedback
2. Integrate full 30-day templates (if approved)
3. Add real screenshots (if needed)
4. Launch campaign (if approved)
5. Set up monitoring

---

**Status**: ✅ Ready for user review
**Launch Readiness**: 75% (3 platforms ready)
**Time Investment**: 2-3 hours to build this preview system
**Value**: Visual confidence in campaign before $0 → $$$ investment
