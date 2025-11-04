#!/usr/bin/env python3
"""
Create Facebook cover photo with brain image background + UNTRAPD overlay
Since we need to use the user's provided brain image, this script will use a downloaded version
"""

from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import os

def create_brain_cover_photo(brain_image_path=None):
    """Create Facebook cover photo with brain background + UNTRAPD text overlay"""

    if not brain_image_path:
        print("⚠️  No brain image provided. Please provide the path to the brain image.")
        print("   Example: python3 create-brain-cover.py /path/to/brain_image.jpg")
        return None

    if not os.path.exists(brain_image_path):
        print(f"❌ Brain image not found at: {brain_image_path}")
        return None

    print(f"✅ Loading brain image from: {brain_image_path}")

    # Open brain image
    try:
        img = Image.open(brain_image_path)
    except Exception as e:
        print(f"❌ Error loading image: {str(e)}")
        return None

    # Facebook cover dimensions (820x312px for desktop)
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

    # Slightly darken the image for better text visibility
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(0.7)  # 70% brightness

    # Convert to RGBA for overlay
    img = img.convert('RGBA')

    # Draw text
    draw = ImageDraw.Draw(img)

    # Try to load fonts
    try:
        # Use bold font for main title
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except:
        print("⚠️  Could not load custom fonts, using default")
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Draw main title "UNTRAPD" with pink/magenta glow effect (matching the image style)
    title = "UNTRAPD"

    # Get text size for centering
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    title_height = bbox[3] - bbox[1]

    title_x = (cover_width - title_width) // 2
    title_y = 40

    # Draw glow effect (multiple layers)
    glow_color = '#FF1493'  # Deep pink/magenta
    for offset in range(8, 0, -1):
        alpha = int(255 * (offset / 8))
        glow = Image.new('RGBA', img.size, (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        glow_draw.text((title_x, title_y), title, fill=glow_color + f'{alpha:02x}', font=title_font)
        img = Image.alpha_composite(img, glow)

    # Draw main white text with slight shadow
    draw = ImageDraw.Draw(img)
    shadow_offset = 3
    draw.text((title_x + shadow_offset, title_y + shadow_offset), title, fill='#000000', font=title_font)
    draw.text((title_x, title_y), title, fill='#FFFFFF', font=title_font)

    # Draw subtitle "Intelligence Hub" in cyan/blue
    subtitle = "Intelligence Hub"
    bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = bbox[2] - bbox[0]
    subtitle_x = (cover_width - subtitle_width) // 2
    subtitle_y = title_y + title_height + 15

    # Subtle glow for subtitle
    draw.text((subtitle_x + 1, subtitle_y + 1), subtitle, fill='#000000', font=subtitle_font)
    draw.text((subtitle_x, subtitle_y), subtitle, fill='#00D4FF', font=subtitle_font)

    # Save
    output_path = "facebook_cover_brain.png"
    img = img.convert('RGB')
    img.save(output_path, 'PNG', quality=95)
    print(f"✅ Brain cover photo created: {output_path}")
    print(f"   Size: {cover_width}x{cover_height}px")
    return output_path

if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("  CREATING BRAIN-THEMED FACEBOOK COVER")
    print("=" * 60)
    print()

    if len(sys.argv) > 1:
        brain_path = sys.argv[1]
    else:
        # Default path - user can provide via command line
        brain_path = "brain_background.jpg"
        print(f"💡 Tip: Provide brain image path as argument:")
        print(f"   python3 create-brain-cover.py /path/to/brain_image.jpg")
        print()

    result = create_brain_cover_photo(brain_path)

    if result:
        print()
        print("=" * 60)
        print("  BRAIN COVER READY!")
        print("=" * 60)
        print()
        print("📤 Upload facebook_cover_brain.png to your Facebook Page")
        print()
