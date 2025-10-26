#!/usr/bin/env python3
"""
FINDERR BRAND IMAGE GENERATOR
Creates simple branded images for Instagram posts
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_brand_image(text, filename, theme_color="#FF69B4"):
    """Create a simple branded image with text overlay"""
    
    # Instagram square format
    width, height = 1080, 1080
    
    # Create image with gradient background
    img = Image.new('RGB', (width, height), color='#000000')
    draw = ImageDraw.Draw(img)
    
    # Add gradient effect (simple)
    for y in range(height):
        alpha = int(255 * (y / height) * 0.3)
        color = (alpha, alpha//2, alpha//4)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add UNTRAPD Hub branding
    try:
        # Try to load a font (fallback to default if not available)
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Brand colors
    pink = "#FF69B4"
    blue = "#4169E1"
    white = "#FFFFFF"
    
    # Add UNTRAPD Hub logo text
    draw.text((50, 50), "UNTRAPD", font=title_font, fill=pink)
    draw.text((50, 120), "HUB", font=title_font, fill=blue)
    
    # Add brain emoji or symbol
    draw.text((50, 200), "🧠", font=title_font)
    
    # Add main content text (wrapped)
    text_lines = wrap_text(text, 25)  # 25 chars per line
    y_offset = 400
    
    for line in text_lines[:8]:  # Max 8 lines
        draw.text((50, y_offset), line, font=text_font, fill=white)
        y_offset += 50
    
    # Add FINDERR branding
    draw.text((50, height-150), "FINDERR", font=title_font, fill=pink)
    draw.text((50, height-90), "Never lose your phone permanently", font=small_font, fill=white)
    
    # Add website
    draw.text((50, height-50), "hub.untrapd.com", font=small_font, fill=blue)
    
    # Save image
    img.save(filename, 'JPEG', quality=95)
    print(f"✅ Created: {filename}")

def wrap_text(text, width):
    """Simple text wrapping"""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        if len(' '.join(current_line + [word])) <= width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines

def create_all_theme_images():
    """Create images for all daily themes"""
    
    themes = {
        "motivation_monday": "🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again.",
        "tech_tuesday": "🔧 Tech Tuesday: FINDERR's device identification system works instantly to help recover your lost phone!",
        "widget_wednesday": "⚡ Widget Wednesday: FINDERR's smart widget keeps your phone findable 24/7 with zero battery drain!",
        "throwback_thursday": "📸 Throwback Thursday: Remember when losing your phone meant losing all your photos, contacts, and memories? FINDERR changed everything!",
        "feature_friday": "🚀 Feature Friday: FINDERR's core device identification features keep getting better! Family sharing coming in future updates!",
        "weekend_wins": "🌟 Weekend Wins: This week, FINDERR helped 47 users recover their lost phones! Share your success story!",
        "sunday_success": "💪 Sunday Success: Join 2,000+ users who never worry about losing their phones thanks to FINDERR!"
    }
    
    # Create images directory
    os.makedirs("brand_images", exist_ok=True)
    
    # Create themed images
    colors = {
        "motivation_monday": "#FF6B35",    # Orange
        "tech_tuesday": "#4ECDC4",        # Teal  
        "widget_wednesday": "#45B7D1",    # Blue
        "throwback_thursday": "#96CEB4",  # Green
        "feature_friday": "#FFEAA7",      # Yellow
        "weekend_wins": "#DDA0DD",        # Plum
        "sunday_success": "#FF69B4"       # Pink
    }
    
    for theme, text in themes.items():
        filename = f"brand_images/{theme}.jpg"
        color = colors.get(theme, "#FF69B4")
        create_brand_image(text, filename, color)
    
    # Create milestone celebration images
    milestones = {
        "milestone_500": "🎉 MILESTONE ALERT: 500 users have joined the UNTRAPD Hub family! Thank you for trusting FINDERR!",
        "milestone_1000": "🚀 INCREDIBLE: 1,000 FINDERR users can't be wrong! Your phone security matters!",
        "milestone_1500": "⚡ URGENT: Only 500 lifetime access spots remaining! Secure your FINDERR lifetime membership!",
        "milestone_1900": "🔥 FINAL CALL: Last 100 lifetime FINDERR memberships available!",
        "milestone_2000": "✅ ACHIEVEMENT UNLOCKED: 2,000 lifetime members secured! Monthly subscriptions now available!"
    }
    
    for milestone, text in milestones.items():
        filename = f"brand_images/{milestone}.jpg"
        create_brand_image(text, filename, "#FF1493")  # Deep pink for milestones
    
    print(f"\n🎉 Created {len(themes) + len(milestones)} brand images!")
    print("📁 Images saved in: brand_images/")
    print("🔗 Update Google Sheets Column A with these file paths")

if __name__ == "__main__":
    print("🎨 Creating FINDERR brand images for Instagram...")
    create_all_theme_images()