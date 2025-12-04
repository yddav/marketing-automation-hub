/**
 * Welcome Sequence Email Templates (HTML)
 * Converted from content_templates/email_marketing/welcome-sequence.json
 * FINDERR-specific customization with steampunk/tech aesthetic
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

const STEAMPUNK_ACCENT = `
  background: linear-gradient(135deg, #8B7355 0%, #D4AF37 50%, #8B7355 100%);
  border: 2px solid #D4AF37;
`;

function replaceVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

const welcomeSequence = {
  email1: {
    subject: (vars) => `Welcome to ${vars.app_name}! Let's get you started 🚀`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${vars.app_name} - Welcome to Beta Testing</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ${vars.app_name} Beta!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>Welcome to the ${vars.app_name} family! 🎉</p>

    <p>I'm ${vars.sender_name}, ${vars.sender_title} at ${vars.company_name}. I wanted to personally thank you for joining ${vars.app_name} Beta and share what makes our community special.</p>

    <p>${vars.app_name} has already helped ${vars.user_count}+ people ${vars.primary_benefit}. You're joining a community that values ${vars.core_value_1}, ${vars.core_value_2}, and ${vars.core_value_3}.</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">🎯 Here's what happens next:</h2>
      <ul style="margin: 15px 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;"><strong>Today:</strong> ${vars.immediate_action}</li>
        <li style="margin-bottom: 10px;"><strong>Tomorrow:</strong> ${vars.day_1_expectation}</li>
        <li style="margin-bottom: 10px;"><strong>This week:</strong> ${vars.week_1_expectation}</li>
      </ul>
    </div>

    <div style="background: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px; margin: 25px 0;">
      <p style="margin: 0;"><strong>💡 Quick Start Tip:</strong></p>
      <p style="margin: 10px 0 0 0;">${vars.quick_start_tip}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">This simple step will ${vars.tip_benefit}.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">${vars.cta_text}</a>
    </div>

    <p>Questions? Just reply to this email - I read every single one.</p>

    <p style="margin-bottom: 0;">Cheering you on,<br><strong>${vars.sender_name}</strong></p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> ${vars.ps_message}
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>${vars.app_name} by ${vars.company_name} - ${vars.tagline}</p>
    <p>
      <a href="${vars.learn_more_url}" style="color: #667eea; text-decoration: none;">Learn More</a> •
      <a href="${vars.privacy_url}" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
      <a href="{{unsubscribe_url}}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

Welcome to the ${vars.app_name} family! 🎉

I'm ${vars.sender_name}, ${vars.sender_title} at ${vars.company_name}. I wanted to personally thank you for joining ${vars.app_name} Beta and share what makes our community special.

${vars.app_name} has already helped ${vars.user_count}+ people ${vars.primary_benefit}. You're joining a community that values ${vars.core_value_1}, ${vars.core_value_2}, and ${vars.core_value_3}.

🎯 HERE'S WHAT HAPPENS NEXT:

• Today: ${vars.immediate_action}
• Tomorrow: ${vars.day_1_expectation}
• This week: ${vars.week_1_expectation}

💡 QUICK START TIP:
${vars.quick_start_tip}

This simple step will ${vars.tip_benefit}.

${vars.cta_text}: ${vars.cta_url}

Questions? Just reply to this email - I read every single one.

Cheering you on,
${vars.sender_name}

P.S. ${vars.ps_message}

---
${vars.app_name} by ${vars.company_name} - ${vars.tagline}
Learn More: ${vars.learn_more_url}
Privacy: ${vars.privacy_url}
Unsubscribe: {{unsubscribe_url}}
    `.trim(),
    delay_hours: 0 // Immediate
  },

  email2: {
    subject: (vars) => `Your first day with ${vars.app_name} - here's what to focus on`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Day 1: Focus on This</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Day 1: Focus on This</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>How did your first experience with ${vars.app_name} go yesterday?</p>

    <p>If you haven't had a chance to ${vars.core_action} yet, no worries! Life gets busy.</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #667eea;">🎯 Today's Focus: ${vars.day_1_goal}</h2>
      <p>Here's exactly how to do it:</p>
      <ol>
        <li style="margin-bottom: 10px;">${vars.step_1}</li>
        <li style="margin-bottom: 10px;">${vars.step_2}</li>
        <li style="margin-bottom: 10px;">${vars.step_3}</li>
      </ol>
      <p style="margin-bottom: 0;"><small>⏰ This takes about ${vars.time_estimate} and will ${vars.expected_result}.</small></p>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #856404;"><strong>💡 Pro Tip from our community:</strong></p>
      <p style="margin: 10px 0 0 0; font-style: italic; color: #856404;">"${vars.user_tip}"</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #856404;">— ${vars.user_name}, ${vars.user_title}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.cta_text}</a>
    </div>

    <p><strong>Stuck on something?</strong> Here are the most common questions from new users:</p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0;"><strong>Q:</strong> ${vars.faq_1_question}</p>
      <p style="margin: 10px 0 0 20px; color: #666;"><strong>A:</strong> ${vars.faq_1_answer}</p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0;"><strong>Q:</strong> ${vars.faq_2_question}</p>
      <p style="margin: 10px 0 0 20px; color: #666;"><strong>A:</strong> ${vars.faq_2_answer}</p>
    </div>

    <p>Tomorrow, I'll show you ${vars.tomorrow_preview}.</p>

    <p>Talk soon,<br><strong>${vars.sender_name}</strong></p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>${vars.app_name} by ${vars.company_name} - ${vars.tagline}</p>
    <p>
      <a href="${vars.learn_more_url}" style="color: #667eea; text-decoration: none;">Learn More</a> •
      <a href="${vars.privacy_url}" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
      <a href="{{unsubscribe_url}}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

How did your first experience with ${vars.app_name} go yesterday?

If you haven't had a chance to ${vars.core_action} yet, no worries! Life gets busy.

🎯 TODAY'S FOCUS: ${vars.day_1_goal}

Here's exactly how to do it:
1. ${vars.step_1}
2. ${vars.step_2}
3. ${vars.step_3}

⏰ This takes about ${vars.time_estimate} and will ${vars.expected_result}.

💡 PRO TIP FROM OUR COMMUNITY:
"${vars.user_tip}"
— ${vars.user_name}, ${vars.user_title}

${vars.cta_text}: ${vars.cta_url}

STUCK ON SOMETHING?

Q: ${vars.faq_1_question}
A: ${vars.faq_1_answer}

Q: ${vars.faq_2_question}
A: ${vars.faq_2_answer}

Tomorrow, I'll show you ${vars.tomorrow_preview}.

Talk soon,
${vars.sender_name}

---
${vars.app_name} by ${vars.company_name} - ${vars.tagline}
Learn More: ${vars.learn_more_url}
Privacy: ${vars.privacy_url}
Unsubscribe: {{unsubscribe_url}}
    `.trim(),
    delay_hours: 24 // 1 day after email 1
  },

  email3: {
    subject: (vars) => `The #1 mistake new ${vars.app_name} users make (and how to avoid it)`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Common Mistake to Avoid</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Avoid This Common Mistake</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>I've been watching how new ${vars.app_name} users get started, and I've noticed a pattern.</p>

    <p>The people who get the most value do one thing differently: <strong>${vars.key_success_behavior}</strong>.</p>

    <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #c62828;"><strong>❌ Most people make this mistake:</strong></p>
      <p style="margin: 10px 0 0 0; color: #c62828;">${vars.common_mistake}</p>
    </div>

    <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #2e7d32;"><strong>✅ Instead, try this:</strong></p>
      <p style="margin: 10px 0 0 0; color: #2e7d32;">${vars.better_approach}</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #667eea;">📊 Real Example:</h3>
      <p>${vars.case_study_brief}</p>
      <p><strong>The difference?</strong> ${vars.result_comparison}</p>
    </div>

    <div style="${STEAMPUNK_ACCENT} color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0;">🎯 Your Action for Today:</h3>
      <p style="margin: 10px 0; font-size: 18px;"><strong>${vars.specific_action}</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">This will ${vars.action_benefit} and takes just ${vars.time_required}.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.cta_text}</a>
    </div>

    <p><strong>💬 What our users say about this approach:</strong></p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-style: italic;">"${vars.testimonial_1}"</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">— ${vars.user_1_name}</p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-style: italic;">"${vars.testimonial_2}"</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">— ${vars.user_2_name}</p>
    </div>

    <p>Next up: I'll share ${vars.next_email_preview}.</p>

    <p>Your productivity partner,<br><strong>${vars.sender_name}</strong></p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> ${vars.ps_tip}
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>${vars.app_name} by ${vars.company_name} - ${vars.tagline}</p>
    <p>
      <a href="${vars.learn_more_url}" style="color: #667eea; text-decoration: none;">Learn More</a> •
      <a href="${vars.privacy_url}" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
      <a href="{{unsubscribe_url}}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

I've been watching how new ${vars.app_name} users get started, and I've noticed a pattern.

The people who get the most value do one thing differently: ${vars.key_success_behavior}.

❌ MOST PEOPLE MAKE THIS MISTAKE:
${vars.common_mistake}

✅ INSTEAD, TRY THIS:
${vars.better_approach}

📊 REAL EXAMPLE:
${vars.case_study_brief}

The difference? ${vars.result_comparison}

🎯 YOUR ACTION FOR TODAY:
${vars.specific_action}

This will ${vars.action_benefit} and takes just ${vars.time_required}.

${vars.cta_text}: ${vars.cta_url}

💬 WHAT OUR USERS SAY:

"${vars.testimonial_1}" — ${vars.user_1_name}

"${vars.testimonial_2}" — ${vars.user_2_name}

Next up: I'll share ${vars.next_email_preview}.

Your productivity partner,
${vars.sender_name}

P.S. ${vars.ps_tip}

---
${vars.app_name} by ${vars.company_name} - ${vars.tagline}
Learn More: ${vars.learn_more_url}
Privacy: ${vars.privacy_url}
Unsubscribe: {{unsubscribe_url}}
    `.trim(),
    delay_hours: 72 // 3 days after email 1
  },

  email4: {
    subject: (vars) => `Your first week with ${vars.app_name} - let's celebrate! 🎉`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>First Week Celebration</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 First Week Milestone!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>It's been a week since you joined ${vars.app_name}!</p>

    <p>${vars.celebration_message}</p>

    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h2 style="margin-top: 0; color: #4caf50;">📊 Here's what you've accomplished:</h2>
      <div style="margin: 15px 0;">
        ${vars.user_achievements}
      </div>
    </div>

    <h2 style="color: #667eea;">🚀 Ready for the next level?</h2>

    <p>Now that you've mastered the basics, here are 3 advanced features that will ${vars.advanced_benefit}:</p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #667eea;">1. ${vars.advanced_feature_1}</h3>
      <p style="margin: 10px 0;">${vars.feature_1_description}</p>
      <p style="margin: 10px 0 0 0;"><strong>→ Result:</strong> ${vars.feature_1_benefit}</p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #667eea;">2. ${vars.advanced_feature_2}</h3>
      <p style="margin: 10px 0;">${vars.feature_2_description}</p>
      <p style="margin: 10px 0 0 0;"><strong>→ Result:</strong> ${vars.feature_2_benefit}</p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #667eea;">3. ${vars.advanced_feature_3}</h3>
      <p style="margin: 10px 0;">${vars.feature_3_description}</p>
      <p style="margin: 10px 0 0 0;"><strong>→ Result:</strong> ${vars.feature_3_benefit}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.cta_text}</a>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #856404;"><strong>💡 Community Spotlight:</strong></p>
      <p style="margin: 10px 0 0 0; color: #856404;">${vars.community_member_story}</p>
    </div>

    <div style="${STEAMPUNK_ACCENT} color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0;">🎁 Special Bonus:</h3>
      <p style="margin: 10px 0 0 0;">${vars.bonus_offer_or_content}</p>
    </div>

    <p>Keep up the great work!</p>

    <p><strong>${vars.sender_name}</strong></p>

    <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
      <strong>P.S.</strong> Got a success story to share? Just reply - I love hearing from our community!
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>${vars.app_name} by ${vars.company_name} - ${vars.tagline}</p>
    <p>
      <a href="${vars.learn_more_url}" style="color: #667eea; text-decoration: none;">Learn More</a> •
      <a href="${vars.privacy_url}" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
      <a href="{{unsubscribe_url}}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

It's been a week since you joined ${vars.app_name}!

${vars.celebration_message}

📊 HERE'S WHAT YOU'VE ACCOMPLISHED:
${vars.user_achievements}

🚀 READY FOR THE NEXT LEVEL?

Now that you've mastered the basics, here are 3 advanced features that will ${vars.advanced_benefit}:

1. ${vars.advanced_feature_1}
   ${vars.feature_1_description}
   → Result: ${vars.feature_1_benefit}

2. ${vars.advanced_feature_2}
   ${vars.feature_2_description}
   → Result: ${vars.feature_2_benefit}

3. ${vars.advanced_feature_3}
   ${vars.feature_3_description}
   → Result: ${vars.feature_3_benefit}

${vars.cta_text}: ${vars.cta_url}

💡 COMMUNITY SPOTLIGHT:
${vars.community_member_story}

🎁 SPECIAL BONUS:
${vars.bonus_offer_or_content}

Keep up the great work!
${vars.sender_name}

P.S. Got a success story to share? Just reply - I love hearing from our community!

---
${vars.app_name} by ${vars.company_name} - ${vars.tagline}
Learn More: ${vars.learn_more_url}
Privacy: ${vars.privacy_url}
Unsubscribe: {{unsubscribe_url}}
    `.trim(),
    delay_hours: 168 // 7 days after email 1
  },

  email5: {
    subject: (vars) => `Two weeks in - are you getting the most from ${vars.app_name}?`,
    html: (vars) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Two Week Check-In</title>
</head>
<body style="${BASE_STYLES}">
  <div style="${HEADER_GRADIENT} padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🤔 Two Week Check-In</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${vars.first_name},</p>

    <p>${vars.personal_check_in}</p>

    <p>After two weeks with ${vars.app_name}, you're either:</p>

    <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0;">
      <p style="margin: 0; color: #2e7d32;"><strong>✅ Loving the results</strong> and seeing ${vars.positive_outcome}</p>
    </div>

    <div style="background: #e7f3ff; border-left: 4px solid #2196f3; padding: 15px; margin: 15px 0;">
      <p style="margin: 0; color: #1565c0;"><strong>❓ Still figuring out</strong> how to make it work for your specific needs</p>
    </div>

    <p><em>Both are totally normal!</em></p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #667eea;">📈 If you're in the first group:</h3>
      <p>You're ready for ${vars.next_level_content}. Here's what to focus on next:</p>
      <p>${vars.advanced_guidance}</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #667eea;">🤔 If you're in the second group:</h3>
      <p>No worries! Here are the 3 most effective ways to ${vars.overcome_common_challenge}:</p>
      <ol>
        <li style="margin-bottom: 10px;">${vars.solution_1}</li>
        <li style="margin-bottom: 10px;">${vars.solution_2}</li>
        <li style="margin-bottom: 10px;">${vars.solution_3}</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${vars.cta_url}" style="display: inline-block; ${HEADER_GRADIENT} color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">${vars.cta_text}</a>
    </div>

    <div style="${STEAMPUNK_ACCENT} color: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0;">💬 I'm here to help</h3>
      <p style="margin: 10px 0;">What's your biggest question about ${vars.app_name} right now?</p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Just reply to this email and I'll get back to you personally.</p>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #856404;"><strong>🎭 Behind the scenes:</strong></p>
      <p style="margin: 10px 0 0 0; color: #856404;">${vars.behind_scenes_insight}</p>
    </div>

    <p>Thanks for being part of our community,</p>

    <p><strong>${vars.sender_name}</strong></p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>${vars.app_name} by ${vars.company_name} - ${vars.tagline}</p>
    <p>
      <a href="${vars.learn_more_url}" style="color: #667eea; text-decoration: none;">Learn More</a> •
      <a href="${vars.privacy_url}" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
      <a href="{{unsubscribe_url}}" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
    `,
    text: (vars) => `
Hi ${vars.first_name},

${vars.personal_check_in}

After two weeks with ${vars.app_name}, you're either:

✅ Loving the results and seeing ${vars.positive_outcome}
❓ Still figuring out how to make it work for your specific needs

Both are totally normal!

📈 IF YOU'RE IN THE FIRST GROUP:
You're ready for ${vars.next_level_content}. Here's what to focus on next:
${vars.advanced_guidance}

🤔 IF YOU'RE IN THE SECOND GROUP:
No worries! Here are the 3 most effective ways to ${vars.overcome_common_challenge}:

1. ${vars.solution_1}
2. ${vars.solution_2}
3. ${vars.solution_3}

${vars.cta_text}: ${vars.cta_url}

💬 I'M HERE TO HELP
What's your biggest question about ${vars.app_name} right now?

Just reply to this email and I'll get back to you personally.

🎭 BEHIND THE SCENES:
${vars.behind_scenes_insight}

Thanks for being part of our community,
${vars.sender_name}

---
${vars.app_name} by ${vars.company_name} - ${vars.tagline}
Learn More: ${vars.learn_more_url}
Privacy: ${vars.privacy_url}
Unsubscribe: {{unsubscribe_url}}
    `.trim(),
    delay_hours: 336 // 14 days after email 1
  }
};

// FINDERR-specific template variables
const findrrDefaults = {
  app_name: 'FINDERR',
  company_name: 'UNTRAPD',
  tagline: "World's First System Lockscreen Modification App",
  sender_name: 'The FINDERR Team',
  sender_title: 'Support Team',
  user_count: '5,000',
  primary_benefit: 'secure their lost or stolen Android phones',
  core_value_1: 'privacy',
  core_value_2: 'security',
  core_value_3: 'reliability',
  learn_more_url: 'https://hub.untrapd.com/apps/finderr',
  privacy_url: 'https://hub.untrapd.com/privacy',
  cta_url: 'https://play.google.com/apps/testing/com.finderr.app',
  cta_text: 'Open FINDERR Beta',

  // Email 1 variables
  immediate_action: 'Download FINDERR and set up emergency contacts',
  day_1_expectation: 'Test emergency activation via SMS',
  week_1_expectation: 'Master all emergency features',
  quick_start_tip: 'Test emergency mode in a safe environment first',
  tip_benefit: 'ensure you know exactly how it works when you need it',
  ps_message: 'Early beta testers get 50% lifetime discount when we launch!',

  // Email 2 variables
  core_action: 'test emergency activation',
  day_1_goal: 'Activate Emergency Mode',
  step_1: 'Send SMS "FINDERR_ON" to your phone',
  step_2: 'Check lockscreen for emergency wallpaper',
  step_3: 'Send "FINDERR_OFF" to restore',
  time_estimate: '5 minutes',
  expected_result: 'confirm emergency system works perfectly',
  user_tip: 'Test with airplane mode on first to avoid accidental emergency alerts!',
  user_name: 'Sarah M.',
  user_title: 'Beta Tester',
  faq_1_question: 'How do I activate emergency mode?',
  faq_1_answer: 'Send SMS "FINDERR_ON" or use web dashboard',
  faq_2_question: 'Will my wallpaper be saved?',
  faq_2_answer: 'Yes! FINDERR automatically backs up and restores your original wallpaper',
  tomorrow_preview: 'how to customize your emergency wallpaper',

  // Email 3 variables
  key_success_behavior: 'test emergency mode before they need it',
  common_mistake: 'waiting until phone is lost to test emergency features',
  better_approach: 'test activation and restoration in a controlled environment',
  case_study_brief: 'Beta tester John tested emergency mode at home, then lost his phone at a coffee shop. Because he knew the system worked, he activated it immediately and got his phone back within 2 hours.',
  result_comparison: 'He recovered his phone 10x faster because he was confident in the system',
  specific_action: 'Complete a full emergency cycle test today',
  action_benefit: 'give you complete confidence in FINDERR',
  time_required: '10 minutes',
  testimonial_1: 'Testing first saved me hours of stress when I actually lost my phone!',
  user_1_name: 'Mike T., Beta Tester',
  testimonial_2: 'The emergency wallpaper worked perfectly because I knew exactly what to expect.',
  user_2_name: 'Lisa K., Beta Tester',
  next_email_preview: 'advanced customization options',
  ps_tip: 'Test SMS activation even if you plan to use the web dashboard - it\'s your backup option!',

  // Email 4 variables
  celebration_message: 'You\'ve been testing FINDERR for a full week now. That\'s amazing!',
  user_achievements: '<ul><li>✅ Emergency activation tested</li><li>✅ Wallpaper backup verified</li><li>✅ SMS triggers mastered</li></ul>',
  advanced_benefit: 'make FINDERR even more powerful',
  advanced_feature_1: 'Custom Emergency Wallpaper',
  feature_1_description: 'Upload your own branded emergency wallpaper with QR codes or custom designs',
  feature_1_benefit: 'More professional and recognizable emergency contact display',
  advanced_feature_2: 'Web Dashboard Emergency Control',
  feature_2_description: 'Activate emergency mode remotely from any computer or tablet',
  feature_2_benefit: 'Control your phone even if you can\'t send SMS',
  advanced_feature_3: 'Post-Reboot Persistence',
  feature_3_description: 'Emergency mode survives phone restarts and reboots',
  feature_3_benefit: 'Protection continues even if phone is restarted',
  community_member_story: 'Beta tester David activated emergency mode remotely from his laptop after losing his phone on a train. The finder saw the emergency wallpaper and called immediately!',
  bonus_offer_or_content: '50% lifetime discount reserved for you as an early beta tester!',

  // Email 5 variables
  personal_check_in: 'I wanted to check in and see how your FINDERR experience has been so far.',
  positive_outcome: 'how powerful emergency protection can be',
  next_level_content: 'advanced security features',
  advanced_guidance: 'Explore custom wallpaper designs, emergency contact variations, and web dashboard remote control',
  overcome_common_challenge: 'maximize emergency protection',
  solution_1: 'Set up multiple emergency contacts for redundancy',
  solution_2: 'Test emergency mode in different scenarios (home, work, public)',
  solution_3: 'Customize emergency wallpaper for better recognition',
  behind_scenes_insight: 'We\'re working on Premium+ features including QR code detection and network intelligence. Beta testers will get early access and exclusive pricing!'
};

module.exports = {
  welcomeSequence,
  findrrDefaults,
  replaceVariables
};
