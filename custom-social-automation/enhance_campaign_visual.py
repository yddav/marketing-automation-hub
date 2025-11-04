#!/usr/bin/env python3
"""
Enhance campaign_posts.json with visual content metadata
Adds Dan Koe / Matt Gray style visual design specifications
"""

import json
import sys

# Visual content templates assignment strategy
visual_templates = {
    # Comparison cards (Matt Gray style) - A vs B format
    "comparison": {
        "posts": [1, 7, 13, 19, 25, 31],  # Every 6th post starting from 1
        "bg_color": "dark",
        "gradient": "gradient-dark",
        "font_weight_hook": 900,
        "font_size_hook": "48px",
        "contrast_ratio": "21:1"
    },

    # Bold statement cards (Dan Koe style) - Large hooks + bullets
    "bold_statement": {
        "posts": [3, 9, 15, 21, 27, 33],  # Every 6th post starting from 3
        "bg_color": "dark",
        "gradient": "gradient-brand",
        "font_weight_hook": 900,
        "font_size_hook": "48px",
        "contrast_ratio": "21:1"
    },

    # Data/ROI cards - Pricing and numbers
    "data_roi": {
        "posts": [2, 8, 14, 20, 26, 32],  # Every 6th post starting from 2
        "bg_color": "data_gradient",
        "gradient": "gradient-data",
        "font_weight_data": 900,
        "font_size_data": "56px",
        "contrast_ratio": "21:1"
    },

    # Urgency/countdown cards - Beta spots remaining
    "urgency": {
        "posts": [4, 10, 16, 22, 28],  # Every 6th post starting from 4
        "bg_color": "brand",
        "gradient": "gradient-brand",
        "font_weight_hook": 900,
        "font_size_hook": "56px",
        "contrast_ratio": "21:1"
    },

    # Feature showcase cards - App screenshot backgrounds
    "feature_showcase": {
        "posts": [5, 11, 17, 23, 29],  # Every 6th post starting from 5
        "bg_color": "dark",
        "gradient": "gradient-dark",
        "background_image": "finderr-screenshot.png",
        "background_opacity": 0.3,
        "font_weight_hook": 900,
        "font_size_hook": "48px",
        "contrast_ratio": "21:1"
    }
}

# Reverse mapping: post_id -> template type
post_template_map = {}
for template_type, config in visual_templates.items():
    for post_id in config["posts"]:
        post_template_map[post_id] = {
            "template": template_type,
            **{k: v for k, v in config.items() if k != "posts"}
        }

def enhance_campaign_data(input_file, output_file):
    """Add visual content metadata to campaign posts"""

    with open(input_file, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    enhanced_posts = []

    for post in posts:
        post_id = post["id"]

        # Get visual template for this post (default to bold_statement)
        visual_config = post_template_map.get(
            post_id,
            {
                "template": "bold_statement",
                "bg_color": "dark",
                "gradient": "gradient-brand",
                "font_weight_hook": 900,
                "font_size_hook": "48px",
                "font_weight_data": 900,
                "font_size_data": "56px",
                "contrast_ratio": "21:1"
            }
        )

        # Extract emphasis text (first 50 characters for hook)
        content_text = post["content"]
        hook_text = content_text.split('.')[0][:80] if '.' in content_text else content_text[:80]

        # Determine platform-specific sizes
        platform_sizes = []
        if "instagram" in post["platforms"]:
            platform_sizes.append({"platform": "instagram", "size": "1080x1080"})
        if "twitter" in post["platforms"]:
            platform_sizes.append({"platform": "twitter", "size": "1200x628"})
        if "facebook" in post["platforms"]:
            platform_sizes.append({"platform": "facebook", "size": "1200x630"})
        if "tiktok" in post["platforms"]:
            platform_sizes.append({"platform": "tiktok", "size": "1080x1920"})
        if "pinterest" in post.get("platforms", []):
            platform_sizes.append({"platform": "pinterest", "size": "1000x1500"})

        # Build enhanced post object
        enhanced_post = {
            **post,  # Keep all original fields
            "visual_content": {
                "template_type": visual_config["template"],
                "hook_text": hook_text,
                "design_specs": {
                    "background": {
                        "type": visual_config["bg_color"],
                        "gradient": visual_config["gradient"],
                        "image": visual_config.get("background_image"),
                        "image_opacity": visual_config.get("background_opacity", 1.0)
                    },
                    "typography": {
                        "font_family": "Inter",
                        "hook": {
                            "size": visual_config.get("font_size_hook", "48px"),
                            "weight": visual_config.get("font_weight_hook", 900),
                            "line_height": "1.2",
                            "letter_spacing": "-0.02em"
                        },
                        "body": {
                            "size": "18px",
                            "weight": 500,
                            "line_height": "1.7"
                        }
                    },
                    "colors": {
                        "text_primary": "#FFFFFF" if visual_config["bg_color"] in ["dark", "brand", "data_gradient"] else "#0F172A",
                        "accent": "#667eea",
                        "contrast_ratio": visual_config["contrast_ratio"]
                    }
                },
                "export_sizes": platform_sizes
            }
        }

        enhanced_posts.append(enhanced_post)

    # Write enhanced data
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enhanced_posts, f, indent=2, ensure_ascii=False)

    print(f"✅ Enhanced {len(enhanced_posts)} posts with visual content metadata")
    print(f"📁 Output: {output_file}")

    # Print template distribution
    template_counts = {}
    for post in enhanced_posts:
        template = post["visual_content"]["template_type"]
        template_counts[template] = template_counts.get(template, 0) + 1

    print("\n📊 Template Distribution:")
    for template, count in sorted(template_counts.items()):
        print(f"  {template}: {count} posts")

if __name__ == "__main__":
    input_file = "../automation/social_media/campaign_posts.json"
    output_file = "campaign_posts_visual.json"

    enhance_campaign_data(input_file, output_file)
