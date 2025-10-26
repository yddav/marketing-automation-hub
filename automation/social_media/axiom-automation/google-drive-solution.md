# 📁 Google Drive Image Solution

**Upload images to Google Drive and use public URLs**

## 🚀 Quick Setup Steps

### Step 1: Upload Images to Google Drive
1. **Go to drive.google.com**
2. **Create folder**: "UNTRAPD Hub Images"
3. **Upload all images** from `brand_images/` folder
4. **Share each image**: Right-click → "Get link" → "Anyone with the link can view"

### Step 2: Get Direct Image URLs
For each image, convert the Google Drive share link to direct URL:

**Google Drive Link Format:**
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

**Convert to Direct URL:**
```
https://drive.google.com/uc?id=FILE_ID
```

### Step 3: Update Google Sheets
Replace Column A with direct URLs:
```
https://drive.google.com/uc?id=1ABC123_motivation_monday
https://drive.google.com/uc?id=1DEF456_tech_tuesday
```

### Step 4: Test in Axiom
The automation should now access images via URLs instead of local paths.

## 🎯 Alternative: Use Simple Web Server
Host images locally via simple HTTP server:

```bash
cd brand_images/
python3 -m http.server 8000
```

Then use URLs like: `http://localhost:8000/motivation_monday.jpg`