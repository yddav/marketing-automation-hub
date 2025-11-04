#!/usr/bin/env python3
"""
Create Facebook Page assets for UNTRAPD
- Profile picture: UNTRAPD text logo
- Cover photo: Nebula background with text overlay
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_profile_picture():
    """Create UNTRAPD profile picture (500x500px, will be displayed at 170x170)"""

    # Create a square image with gradient background
    size = 500
    img = Image.new('RGB', (size, size), color='#1a1a2e')
    draw = ImageDraw.Draw(img)

    # Try to use a bold font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
    except:
        font = ImageFont.load_default()

    # Draw "UNTRAPD" text centered
    text = "UNTRAPD"

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2 - 10

    # Draw text with slight shadow effect
    shadow_offset = 3
    draw.text((x + shadow_offset, y + shadow_offset), text, fill='#000000', font=font)
    draw.text((x, y), text, fill='#ffffff', font=font)

    # Add tagline
    try:
        tagline_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        tagline_font = ImageFont.load_default()

    tagline = "Intelligence Hub"
    bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tagline_width = bbox[2] - bbox[0]
    tagline_x = (size - tagline_width) // 2
    tagline_y = y + text_height + 20

    draw.text((tagline_x, tagline_y), tagline, fill='#00d4ff', font=tagline_font)

    # Save
    output_path = "facebook_profile_picture.png"
    img.save(output_path, 'PNG')
    print(f"✅ Profile picture created: {output_path}")
    print(f"   Size: {size}x{size}px")
    return output_path

def create_cover_photo():
    """Create Facebook cover photo with nebula background + text overlay"""

    # Load nebula background
    nebula_path = "/media/wolfy/D260DD2060DD0BDB/Datas/2025 Projects/AppBuildFlutterVscodiumClaude/Hub_App_Shop_Integ/Homepage/images/nebula_background.jpeg"

    if not os.path.exists(nebula_path):
        print(f"❌ Nebula background not found at: {nebula_path}")
        return None

    # Open and resize to Facebook cover dimensions (820x312px for desktop)
    img = Image.open(nebula_path)
    cover_width = 820
    cover_height = 312

    # Crop/resize to fit cover dimensions (center crop)
    img_ratio = img.width / img.height
    target_ratio = cover_width / cover_height

    if img_ratio > target_ratio:
        # Image is wider, crop width
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        img = img.crop((left, 0, left + new_width, img.height))
    else:
        # Image is taller, crop height
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        img = img.crop((0, top, img.width, top + new_height))

    # Resize to exact dimensions
    img = img.resize((cover_width, cover_height), Image.Resampling.LANCZOS)

    # Add semi-transparent overlay for better text visibility
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 100))
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay)

    # Draw text
    draw = ImageDraw.Draw(img)

    # Try to load fonts
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Draw main title "UNTRAPD"
    title = "UNTRAPD"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    title_height = bbox[3] - bbox[1]

    title_x = (cover_width - title_width) // 2
    title_y = 60

    # Draw with shadow
    shadow_offset = 4
    draw.text((title_x + shadow_offset, title_y + shadow_offset), title, fill='#000000', font=title_font)
    draw.text((title_x, title_y), title, fill='#ffffff', font=title_font)

    # Draw subtitle
    subtitle = "Intelligence Hub Unleashed"
    bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = bbox[2] - bbox[0]
    subtitle_x = (cover_width - subtitle_width) // 2
    subtitle_y = title_y + title_height + 20

    draw.text((subtitle_x + 2, subtitle_y + 2), subtitle, fill='#000000', font=subtitle_font)
    draw.text((subtitle_x, subtitle_y), subtitle, fill='#00d4ff', font=subtitle_font)

    # Save
    output_path = "facebook_cover_photo.png"
    img = img.convert('RGB')
    img.save(output_path, 'PNG')
    print(f"✅ Cover photo created: {output_path}")
    print(f"   Size: {cover_width}x{cover_height}px")
    return output_path

if __name__ == "__main__":
    print("=" * 60)
    print("  CREATING FACEBOOK PAGE ASSETS FOR UNTRAPD")
    print("=" * 60)
    print()

    profile = create_profile_picture()
    print()
    cover = create_cover_photo()

    print()
    print("=" * 60)
    print("  ASSETS READY!")
    print("=" * 60)
    print()
    print("📤 Upload instructions:")
    print("1. Profile Picture: facebook_profile_picture.png")
    print("   → Upload to Facebook Page → Edit Profile Picture")
    print()
    print("2. Cover Photo: facebook_cover_photo.png")
    print("   → Upload to Facebook Page → Edit Cover Photo")
    print()
