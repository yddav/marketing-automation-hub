#!/usr/bin/env python3
"""
Generate Social Media Preview Images
Creates professional preview images showing how posts will appear on each platform
"""

from PIL import Image, ImageDraw, ImageFont
import json
import os

class SocialMediaPreviewGenerator:
    """Generate preview images for social media posts"""

    def __init__(self):
        self.images_dir = "images"
        os.makedirs(self.images_dir, exist_ok=True)

        # Platform colors
        self.colors = {
            'instagram': [(240, 148, 51), (230, 104, 60), (220, 39, 67)],  # Instagram gradient
            'facebook': (24, 119, 242),  # Facebook blue
            'twitter': (29, 161, 242),   # Twitter blue
            'tiktok': (0, 0, 0),         # TikTok black
            'finderr': [(102, 126, 234), (118, 75, 162)]  # FINDERR purple-blue
        }

    def create_preview_image(self, post_id, title, platforms):
        """Create a preview image for a post"""
        # Image size: 1200x630 (optimal for social media)
        width, height = 1200, 630

        # Create image with gradient background
        img = Image.new('RGB', (width, height), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Create FINDERR brand gradient background
        for y in range(height):
            ratio = y / height
            r = int(102 + (118 - 102) * ratio)
            g = int(126 + (75 - 126) * ratio)
            b = int(234 + (162 - 234) * ratio)
            draw.rectangle([(0, y), (width, y + 1)], fill=(r, g, b))

        # Add semi-transparent overlay
        overlay = Image.new('RGBA', (width, height), (255, 255, 255, 200))
        img.paste(overlay, (0, 0), overlay)
        img = img.convert('RGB')
        draw = ImageDraw.Draw(img)

        # Add text (using default font since we don't have custom fonts)
        try:
            # Try to use a nice font if available
            title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
            subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
            platform_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
        except:
            # Fallback to default font
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            platform_font = ImageFont.load_default()

        # Add FINDERR logo text at top
        logo_text = "🔐 FINDERR"
        logo_bbox = draw.textbbox((0, 0), logo_text, font=title_font)
        logo_width = logo_bbox[2] - logo_bbox[0]
        draw.text(((width - logo_width) // 2, 80), logo_text, fill=(102, 126, 234), font=title_font)

        # Add post title (wrapped)
        title_y = 200
        wrapped_title = self.wrap_text(title, 40)
        for line in wrapped_title[:3]:  # Max 3 lines
            line_bbox = draw.textbbox((0, 0), line, font=subtitle_font)
            line_width = line_bbox[2] - line_bbox[0]
            draw.text(((width - line_width) // 2, title_y), line, fill=(51, 51, 51), font=subtitle_font)
            title_y += 60

        # Add platform badges at bottom
        platform_icons = {
            'instagram': '📸',
            'facebook': '👥',
            'twitter': '🐦',
            'tiktok': '🎵'
        }

        platform_text = " | ".join([f"{platform_icons.get(p, '📱')} {p.title()}" for p in platforms])
        platform_bbox = draw.textbbox((0, 0), platform_text, font=platform_font)
        platform_width = platform_bbox[2] - platform_bbox[0]
        draw.text(((width - platform_width) // 2, height - 100), platform_text, fill=(102, 126, 234), font=platform_font)

        # Add post number at bottom right
        post_number = f"Post #{post_id}"
        number_bbox = draw.textbbox((0, 0), post_number, font=platform_font)
        draw.text((width - 200, height - 60), post_number, fill=(118, 75, 162), font=platform_font)

        # Save image
        filename = f"post{post_id}.jpg"
        filepath = os.path.join(self.images_dir, filename)
        img.save(filepath, 'JPEG', quality=85, optimize=True)

        return filename

    def wrap_text(self, text, max_chars):
        """Wrap text to max characters per line"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0

        for word in words:
            if current_length + len(word) + 1 <= max_chars:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)

        if current_line:
            lines.append(' '.join(current_line))

        return lines

    def generate_all_previews(self, posts_file='campaign_posts.json'):
        """Generate preview images for all posts"""
        if not os.path.exists(posts_file):
            print(f"❌ Posts file not found: {posts_file}")
            return

        with open(posts_file, 'r') as f:
            posts = json.load(f)

        print(f"\n🎨 Generating {len(posts)} preview images...")
        print("=" * 80)

        for post in posts:
            # Extract title from content (first sentence or 60 chars)
            content = post['content']
            title = content.split('.')[0] if '.' in content else content[:60]
            title = title.replace('#', '').strip()

            filename = self.create_preview_image(
                post['id'],
                title,
                post.get('platforms', [])
            )

            print(f"✅ Generated: {filename} - Post #{post['id']}")

        print("\n" + "=" * 80)
        print(f"✅ Created {len(posts)} preview images in '{self.images_dir}/' directory")
        print(f"📦 Total size: ~{len(posts) * 50}KB (optimized)")
        print("\n💡 Refresh your dashboard to see the images!")


def main():
    generator = SocialMediaPreviewGenerator()
    generator.generate_all_previews()


if __name__ == '__main__':
    main()
