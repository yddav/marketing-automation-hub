#!/usr/bin/env python3
"""
Create final Facebook cover photo matching the user's provided mockup
Blue brain with light rays + UNTRAPD pink text overlay
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def create_final_brain_cover():
    """
    Create cover matching the mockup style:
    - Black background
    - Blue brain center
    - Light ray effects
    - Pink/magenta UNTRAPD text (3D style)
    """

    # Facebook cover dimensions
    cover_width = 1640  # Use 2x for better quality
    cover_height = 624

    # Create black background
    img = Image.new('RGB', (cover_width, cover_height), color='#000000')
    draw = ImageDraw.Draw(img)

    # Create blue radial gradient for brain area
    center_x = cover_width // 2
    center_y = cover_height // 2

    # Draw blue glow effect (simulating brain + rays)
    for radius in range(400, 0, -20):
        alpha = int(255 * (radius / 400) * 0.3)
        color = f'#{alpha:02x}{alpha:02x}ff'  # Blue gradient
        draw.ellipse(
            [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
            fill=color
        )

    # Draw light rays
    for angle in range(0, 360, 30):
        import math
        rad = math.radians(angle)
        x1 = center_x + int(150 * math.cos(rad))
        y1 = center_y + int(150 * math.sin(rad))
        x2 = center_x + int(600 * math.cos(rad))
        y2 = center_y + int(400 * math.sin(rad))

        draw.line([(x1, y1), (x2, y2)], fill='#4488ff', width=4)
        # Add glow dots at end
        draw.ellipse([x2-10, y2-10, x2+10, y2+10], fill='#88ccff')

    # Load font for UNTRAPD text
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 140)
    except:
        title_font = ImageFont.load_default()

    # Draw UNTRAPD with 3D pink effect
    title = "UNTRAPD"
    bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = bbox[2] - bbox[0]
    title_x = (cover_width - title_width) // 2
    title_y = 80

    # Draw 3D layers (pink/magenta)
    for offset in range(10, 0, -1):
        shade = 255 - (offset * 15)
        color = f'#{shade:02x}20{shade:02x}'  # Pink gradient
        draw.text((title_x + offset, title_y + offset), title, fill=color, font=title_font)

    # Main pink text
    draw.text((title_x, title_y), title, fill='#FF1493', font=title_font)

    # Add white outline
    draw.text((title_x - 2, title_y - 2), title, fill='#FFFFFF', font=title_font)

    # Resize to actual Facebook dimensions
    img = img.resize((820, 312), Image.Resampling.LANCZOS)

    # Save
    output_path = "facebook_cover_brain_final.png"
    img.save(output_path, 'PNG', quality=95)
    print(f"✅ Final brain cover created: {output_path}")
    print(f"   Size: 820x312px")
    print(f"   Style: Blue brain + light rays + pink UNTRAPD text")
    return output_path

if __name__ == "__main__":
    print("=" * 60)
    print("  CREATING FINAL BRAIN COVER (MATCHING MOCKUP)")
    print("=" * 60)
    print()

    result = create_final_brain_cover()

    if result:
        print()
        print("=" * 60)
        print("  COVER READY!")
        print("=" * 60)
        print()
        print("📤 Upload to Facebook Page:")
        print("   → facebook_cover_brain_final.png")
        print()
