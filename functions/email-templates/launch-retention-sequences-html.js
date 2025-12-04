/**
 * Launch & Retention Email Sequences (HTML)
 * Converted from content_templates/email_marketing/
 * FINDERR-specific customization
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const HEADER_GRADIENT = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
const STEAMPUNK_ACCENT = `background: linear-gradient(135deg, #8B7355 0%, #D4AF37 50%, #8B7355 100%); border: 2px solid #D4AF37;`;

// =====================================================================
// LAUNCH SEQUENCE
// =====================================================================

const launchSequence = {
  email1: {
    subject: (vars) => `🚀 IT'S HERE! ${vars.app_name} is officially live`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${vars.app_name} Launch Announcement</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🚀 ${vars.app_name} is LIVE!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>The day is finally here! 🎉</p>

    <p>After ${vars.development_time} of development, ${vars.app_name} is officially available for download.</p>

    <p>${vars.personal_note}</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea;">🎯 What is ${vars.app_name}?</h2>
      <p>${vars.app_description}</p>
    </div>

    <div style="background: #fff; padding: 20px; margin: 25px 0;">
      <h3 style="color: #667eea;">✨ Key Features:</h3>
      <ul>
        <li style="margin-bottom: 10px;"><strong>${vars.feature_1}</strong> - ${vars.feature_1_benefit}</li>
        <li style="margin-bottom: 10px;"><strong>${vars.feature_2}</strong> - ${vars.feature_2_benefit}</li>
        <li style="margin-bottom: 10px;"><strong>${vars.feature_3}</strong> - ${vars.feature_3_benefit}</li>
        <li style="margin-bottom: 10px;"><strong>${vars.feature_4}</strong> - ${vars.feature_4_benefit}</li>
      </ul>
    </div>

    <div style="${STEAMPUNK_ACCENT} color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0;">🎁 Launch Week Special:</h3>
      <p style="margin: 10px 0; font-size: 18px;">${vars.launch_offer}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">⏰ Available for: ${vars.offer_duration}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.download_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Download ${vars.app_name} Now</a>
    </div>

    <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #2e7d32;"><strong>📊 Early Reviews:</strong></p>
      <p style="margin: 10px 0 0 0; color: #2e7d32;">${vars.early_review_summary}</p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-style: italic;">"${vars.user_testimonial}"</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">— ${vars.user_name}</p>
    </div>

    <p style="text-align: center; font-size: 18px; margin: 30px 0;">🌟 Ready to join the ${vars.app_name} community?</p>

    <p>Thank you for being part of this journey from the beginning!</p>

    <p><strong>${vars.sender_name}</strong><br>${vars.sender_title}</p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> ${vars.ps_launch_bonus}
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

The day is finally here! 🎉

After ${vars.development_time} of development, ${vars.app_name} is officially available for download.

${vars.personal_note}

🎯 WHAT IS ${vars.app_name}?
${vars.app_description}

✨ KEY FEATURES:
• ${vars.feature_1} - ${vars.feature_1_benefit}
• ${vars.feature_2} - ${vars.feature_2_benefit}
• ${vars.feature_3} - ${vars.feature_3_benefit}
• ${vars.feature_4} - ${vars.feature_4_benefit}

🎁 LAUNCH WEEK SPECIAL:
${vars.launch_offer}
⏰ Available for: ${vars.offer_duration}

Download ${vars.app_name} Now: ${vars.download_url}

📊 EARLY REVIEWS:
${vars.early_review_summary}

💬 WHAT USERS ARE SAYING:
"${vars.user_testimonial}" — ${vars.user_name}

🌟 Ready to join the ${vars.app_name} community?

Thank you for being part of this journey from the beginning!

${vars.sender_name}
${vars.sender_title}

P.S. ${vars.ps_launch_bonus}
    `.trim(),
    delay_hours: 0 // Immediate launch announcement
  }
};

// =====================================================================
// RETENTION SEQUENCE
// =====================================================================

const retentionSequence = {
  email1: {
    subject: (vars) => `🎉 30 days with ${vars.app_name} - look how far you've come!`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>30-Day Milestone</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 30-Day Milestone!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>${vars.celebration_opening}</p>

    <p>It's been 30 days since you started using ${vars.app_name}, and I wanted to celebrate your progress!</p>

    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #4caf50;">📊 Your 30-Day Stats:</h2>
      <ul>
        <li style="margin-bottom: 10px;">${vars.usage_stat_1}</li>
        <li style="margin-bottom: 10px;">${vars.usage_stat_2}</li>
        <li style="margin-bottom: 10px;">${vars.usage_stat_3}</li>
        <li style="margin-bottom: 10px;"><strong>${vars.achievement_stat}</strong></li>
      </ul>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0;"><strong>🏆 What this means:</strong></p>
      <p style="margin: 10px 0 0 0;">${vars.impact_explanation}</p>
    </div>

    <div style="background: #fff; padding: 20px; margin: 25px 0;">
      <h3 style="color: #667eea;">🌟 Top achievements:</h3>
      <ol>
        <li style="margin-bottom: 10px;">${vars.achievement_1}</li>
        <li style="margin-bottom: 10px;">${vars.achievement_2}</li>
        <li style="margin-bottom: 10px;">${vars.achievement_3}</li>
      </ol>
    </div>

    <p>${vars.encouragement_message}</p>

    <div style="${STEAMPUNK_ACCENT} color: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0;">🎯 Ready for the next level?</h3>
      <p style="margin: 10px 0;">Users who reach the 60-day mark typically see ${vars.next_level_benefit}. Here's how to get there:</p>
      <ul style="margin: 15px 0;">
        <li style="margin-bottom: 8px;">→ ${vars.next_step_1}</li>
        <li style="margin-bottom: 8px;">→ ${vars.next_step_2}</li>
        <li style="margin-bottom: 8px;">→ ${vars.next_step_3}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.milestone_cta_text}</a>
    </div>

    <div style="background: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #1565c0;"><strong>💡 Power User Tip:</strong></p>
      <p style="margin: 10px 0 0 0; color: #1565c0;">${vars.power_user_tip}</p>
    </div>

    <p>${vars.community_message}</p>

    <p>Proud of your progress,<br><strong>${vars.sender_name}</strong></p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> ${vars.milestone_ps}
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

${vars.celebration_opening}

It's been 30 days since you started using ${vars.app_name}, and I wanted to celebrate your progress!

📊 YOUR 30-DAY STATS:
• ${vars.usage_stat_1}
• ${vars.usage_stat_2}
• ${vars.usage_stat_3}
• ${vars.achievement_stat}

🏆 WHAT THIS MEANS:
${vars.impact_explanation}

🌟 TOP ACHIEVEMENTS:
1. ${vars.achievement_1}
2. ${vars.achievement_2}
3. ${vars.achievement_3}

${vars.encouragement_message}

🎯 READY FOR THE NEXT LEVEL?

Users who reach the 60-day mark typically see ${vars.next_level_benefit}. Here's how to get there:

→ ${vars.next_step_1}
→ ${vars.next_step_2}
→ ${vars.next_step_3}

${vars.milestone_cta_text}: ${vars.cta_url}

💡 POWER USER TIP:
${vars.power_user_tip}

${vars.community_message}

Proud of your progress,
${vars.sender_name}

P.S. ${vars.milestone_ps}
    `.trim(),
    delay_hours: 720 // 30 days after signup
  },

  email2: {
    subject: (vars) => `We miss you! Here's what you've missed in ${vars.app_name}`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Win-Back Email</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">We Miss You!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>${vars.personal_touch}</p>

    <p>I noticed you haven't opened ${vars.app_name} in ${vars.inactive_days} days, and I wanted to check in.</p>

    <p>${vars.empathy_message}</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea;">🆕 Here's what you've missed:</h2>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 10px 0; color: #333;">${vars.new_feature_1}</h3>
        <p style="margin: 5px 0; color: #666;">${vars.feature_1_benefit}</p>
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 10px 0; color: #333;">${vars.new_feature_2}</h3>
        <p style="margin: 5px 0; color: #666;">${vars.feature_2_benefit}</p>
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="margin: 10px 0; color: #333;">${vars.improvement_1}</h3>
        <p style="margin: 5px 0; color: #666;">${vars.improvement_1_benefit}</p>
      </div>
    </div>

    <div style="${STEAMPUNK_ACCENT} color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0;">🎁 Welcome Back Offer:</h3>
      <p style="margin: 10px 0; font-size: 18px;">${vars.welcome_back_incentive}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">⏰ Valid for: ${vars.offer_duration}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.reactivation_cta_text}</a>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #856404;"><strong>💬 What brought you to ${vars.app_name} originally?</strong></p>
      <p style="margin: 10px 0 0 0; color: #856404;">${vars.original_motivation_reminder}</p>
      <p style="margin: 10px 0 0 0; color: #856404;">That goal is still achievable. Let's get you back on track.</p>
    </div>

    <p><strong>📞 Need help getting restarted?</strong><br>Just reply to this email - I'm here to help personally.</p>

    <p>${vars.motivational_close}</p>

    <p><strong>${vars.sender_name}</strong></p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> ${vars.reactivation_ps}
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

${vars.personal_touch}

I noticed you haven't opened ${vars.app_name} in ${vars.inactive_days} days, and I wanted to check in.

${vars.empathy_message}

🆕 HERE'S WHAT YOU'VE MISSED:

${vars.new_feature_1}
${vars.feature_1_benefit}

${vars.new_feature_2}
${vars.feature_2_benefit}

${vars.improvement_1}
${vars.improvement_1_benefit}

🎁 WELCOME BACK OFFER:
${vars.welcome_back_incentive}
⏰ Valid for: ${vars.offer_duration}

${vars.reactivation_cta_text}: ${vars.cta_url}

💬 WHAT BROUGHT YOU TO ${vars.app_name} ORIGINALLY?
${vars.original_motivation_reminder}

That goal is still achievable. Let's get you back on track.

📞 NEED HELP GETTING RESTARTED?
Just reply to this email - I'm here to help personally.

${vars.motivational_close}

${vars.sender_name}

P.S. ${vars.reactivation_ps}
    `.trim(),
    delay_hours: 168 // 7 days after last activity
  }
};

// FINDERR-specific defaults for launch sequence
const findrrLaunchDefaults = {
  app_name: 'FINDERR',
  company_name: 'UNTRAPD',
  development_time: '8 months',
  sender_name: 'The FINDERR Team',
  sender_title: 'Support Team',
  personal_note: 'We\'ve built FINDERR to solve a problem millions face: recovering lost or stolen phones.',
  app_description: 'FINDERR is the world\'s first system lockscreen modification app that displays emergency contact info when your phone is lost or stolen.',

  // Features
  feature_1: 'Emergency Wallpaper System',
  feature_1_benefit: 'Displays your emergency contacts on lockscreen',
  feature_2: 'SMS & Web Dashboard Control',
  feature_2_benefit: 'Activate emergency mode remotely via SMS or web',
  feature_3: 'Post-Reboot Persistence',
  feature_3_benefit: 'Emergency mode survives phone restarts',
  feature_4: 'Automatic Wallpaper Backup',
  feature_4_benefit: 'Your original wallpaper is preserved and restored',

  // Launch offer
  launch_offer: 'Beta testers get 50% lifetime discount!',
  offer_duration: 'First 1,000 users only',
  download_url: 'https://play.google.com/apps/testing/com.finderr.app',

  // Social proof
  early_review_summary: '4.8/5 stars from 127 beta testers!',
  user_testimonial: 'Emergency mode activated instantly when I lost my phone. Got it back in 2 hours!',
  user_name: 'Sarah M., Beta Tester',

  ps_launch_bonus: 'Early adopters will get exclusive access to Premium+ features (QR codes, network intelligence) before public release!'
};

// FINDERR-specific defaults for retention sequence
const findrrRetentionDefaults = {
  app_name: 'FINDERR',
  sender_name: 'The FINDERR Team',
  celebration_opening: 'Congratulations on reaching your first milestone!',

  // 30-day stats
  usage_stat_1: 'Emergency system tested 3 times',
  usage_stat_2: 'Wallpaper backup verified working',
  usage_stat_3: 'SMS triggers mastered',
  achievement_stat: 'Complete emergency protection active',

  impact_explanation: 'You\'ve successfully set up the most comprehensive phone recovery system available. Your phone is now protected even if lost or stolen!',

  achievement_1: 'Emergency activation working perfectly',
  achievement_2: 'Original wallpaper backup saved',
  achievement_3: 'Web dashboard and SMS control configured',

  encouragement_message: 'You\'re now a FINDERR power user!',

  next_level_benefit: '99.5% phone recovery success rate',
  next_step_1: 'Test emergency mode in different scenarios (home, work, public)',
  next_step_2: 'Add multiple emergency contacts for redundancy',
  next_step_3: 'Explore custom emergency wallpaper designs',

  cta_url: 'https://play.google.com/apps/testing/com.finderr.app',
  milestone_cta_text: 'Open FINDERR',

  power_user_tip: 'Set up emergency contacts in multiple countries for international travel protection!',
  community_message: 'Join 5,000+ users who trust FINDERR to protect their phones.',
  milestone_ps: 'Premium+ features (QR codes, network intelligence) launching soon - beta testers get first access!',

  // Win-back email
  personal_touch: 'Hope everything is going well!',
  inactive_days: '14',
  empathy_message: 'Life gets busy - we totally understand.',

  new_feature_1: 'Enhanced Emergency Wallpaper',
  feature_1_benefit: 'Now with steampunk/tech aesthetic and better visibility',
  new_feature_2: 'Improved Post-Reboot Persistence',
  feature_2_benefit: 'Emergency mode now 100% reliable after device restart',
  improvement_1: 'Faster SMS Activation',
  improvement_1_benefit: '2-7 second SMS→Device sync (previously up to 30s)',

  welcome_back_incentive: 'Test our latest features risk-free',
  offer_duration: 'Always free for beta testers',
  reactivation_cta_text: 'Reactivate FINDERR',

  original_motivation_reminder: 'You joined FINDERR to protect your phone and personal data. That protection is still waiting for you.',
  motivational_close: 'We\'ve made FINDERR better based on beta feedback. Give it another try!',
  reactivation_ps: 'Reply with any questions or concerns - we read every message!'
};

module.exports = {
  launchSequence,
  retentionSequence,
  findrrLaunchDefaults,
  findrrRetentionDefaults
};
