#!/usr/bin/env python3
"""
FINDERR MOBILE MOCKUP IMAGE GENERATOR
Creates branded images with FINDERR mobile app mockup
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def create_phone_mockup():
    """Create a simple phone mockup for FINDERR app"""
    
    # Phone dimensions (realistic ratio)
    phone_width, phone_height = 300, 600
    
    # Create phone shape with rounded corners
    phone = Image.new('RGBA', (phone_width, phone_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(phone)
    
    # Phone body (dark gray)
    draw.rounded_rectangle([0, 0, phone_width, phone_height], radius=40, fill='#2C2C2C')
    
    # Screen area
    screen_margin = 20
    screen = Image.new('RGB', (phone_width - screen_margin*2, phone_height - screen_margin*2), '#000000')
    screen_draw = ImageDraw.Draw(screen)
    
    # FINDERR app interface
    screen_w, screen_h = screen.size
    
    # Status bar
    screen_draw.rectangle([0, 0, screen_w, 40], fill='#FF69B4')
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # App header
    screen_draw.text((20, 60), "FINDERR", font=font, fill='#FF69B4')
    screen_draw.text((20, 90), "Phone Security", font=small_font, fill='#FFFFFF')
    
    # Main feature highlight
    screen_draw.rectangle([20, 130, screen_w-20, 250], fill='#4169E1', outline='#FF69B4', width=2)
    screen_draw.text((30, 150), "🔒 Device Secured", font=font, fill='#FFFFFF')
    screen_draw.text((30, 180), "✅ Recovery Ready", font=small_font, fill='#FFFFFF')
    screen_draw.text((30, 200), "📱 Always Protected", font=small_font, fill='#FFFFFF')
    
    # Feature list
    features = [
        "🎯 Instant Device ID",
        "⚡ Smart Recovery", 
        "🛡️ Security First",
        "🔄 Always Active"
    ]
    
    y_pos = 280
    for feature in features:
        screen_draw.text((30, y_pos), feature, font=small_font, fill='#FFFFFF')
        y_pos += 30
    
    # Bottom CTA
    screen_draw.rectangle([20, screen_h-80, screen_w-20, screen_h-40], fill='#FF69B4')
    screen_draw.text((60, screen_h-70), "Never Lose Your Phone", font=small_font, fill='#FFFFFF')
    
    # Paste screen onto phone
    phone.paste(screen, (screen_margin, screen_margin))
    
    return phone

def create_mockup_brand_image(text, filename, theme_color="#FF69B4"):
    """Create branded image with phone mockup"""
    
    # Instagram square format
    width, height = 1080, 1080
    
    # Create gradient background
    img = Image.new('RGB', (width, height), color='#000000')
    draw = ImageDraw.Draw(img)
    
    # Gradient effect
    for y in range(height):
        alpha = int(255 * (y / height) * 0.3)
        color = (alpha, alpha//2, alpha//4)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Fonts
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Brand colors
    pink = "#FF69B4"
    blue = "#4169E1"
    white = "#FFFFFF"
    
    # Layout: Left side text, Right side phone
    left_width = width // 2
    
    # Left side - Text content
    draw.text((50, 80), "UNTRAPD", font=title_font, fill=pink)
    draw.text((50, 150), "HUB", font=title_font, fill=blue)
    draw.text((50, 220), "🧠", font=title_font)
    
    # Main content text (wrapped for left side)
    text_lines = wrap_text(text, 20)  # Shorter lines for left side
    y_offset = 320
    
    for line in text_lines[:6]:  # Max 6 lines on left
        draw.text((50, y_offset), line, font=text_font, fill=white)
        y_offset += 45
    
    # Create and add phone mockup on right side
    phone_mockup = create_phone_mockup()
    
    # Scale phone to fit nicely
    phone_scale = 0.8
    phone_w = int(phone_mockup.width * phone_scale)
    phone_h = int(phone_mockup.height * phone_scale)
    phone_mockup = phone_mockup.resize((phone_w, phone_h), Image.Resampling.LANCZOS)
    
    # Position phone on right side, centered vertically
    phone_x = left_width + (left_width - phone_w) // 2
    phone_y = (height - phone_h) // 2
    
    # Add subtle shadow behind phone
    shadow = Image.new('RGBA', (phone_w + 20, phone_h + 20), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle([10, 10, phone_w + 10, phone_h + 10], radius=45, fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
    
    # Paste shadow and phone
    img.paste(shadow, (phone_x - 10, phone_y - 10), shadow)
    img.paste(phone_mockup, (phone_x, phone_y), phone_mockup)
    
    # Bottom branding
    draw.text((50, height-120), "FINDERR", font=title_font, fill=pink)
    draw.text((50, height-60), "hub.untrapd.com", font=small_font, fill=blue)
    
    # Save image
    img.save(filename, 'JPEG', quality=95)
    print(f"✅ Created mockup: {filename}")

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

def create_all_mockup_images():
    """Create mockup images for all daily themes"""
    
    themes = {
        "motivation_monday_mockup": "🎯 Motivation Monday: Start your week knowing your phone is secure with FINDERR! Never lose your device permanently again.",
        "tech_tuesday_mockup": "🔧 Tech Tuesday: FINDERR's device identification system works instantly to help recover your lost phone!",
        "widget_wednesday_mockup": "⚡ Widget Wednesday: FINDERR's smart widget keeps your phone findable 24/7 with zero battery drain!",
        "throwback_thursday_mockup": "📸 Throwback Thursday: Remember when losing your phone meant losing all your photos, contacts, and memories? FINDERR changed everything!",
        "feature_friday_mockup": "🚀 Feature Friday: FINDERR's core device identification features keep getting better! Family sharing coming in future updates!",
        "weekend_wins_mockup": "🌟 Weekend Wins: This week, FINDERR helped 47 users recover their lost phones! Share your success story!",
        "sunday_success_mockup": "💪 Sunday Success: Join 2,000+ users who never worry about losing their phones thanks to FINDERR!"
    }
    
    # Create mockup images directory
    os.makedirs("brand_images_mockup", exist_ok=True)
    
    # Create themed images with mockups
    colors = {
        "motivation_monday_mockup": "#FF6B35",
        "tech_tuesday_mockup": "#4ECDC4",
        "widget_wednesday_mockup": "#45B7D1",
        "throwback_thursday_mockup": "#96CEB4",
        "feature_friday_mockup": "#FFEAA7",
        "weekend_wins_mockup": "#DDA0DD",
        "sunday_success_mockup": "#FF69B4"
    }
    
    for theme, text in themes.items():
        filename = f"brand_images_mockup/{theme}.jpg"
        color = colors.get(theme, "#FF69B4")
        create_mockup_brand_image(text, filename, color)
    
    print(f"\n🎉 Created {len(themes)} mockup images with FINDERR phone!")
    print("📁 Images saved in: brand_images_mockup/")
    print("📱 Each image includes FINDERR mobile app mockup")

if __name__ == "__main__":
    print("📱 Creating FINDERR mockup images with mobile app...")
    create_all_mockup_images()