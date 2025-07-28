// Email Templates for Payment System
// AGENT BRAVO - PAYMENT SYSTEM DEPLOYMENT

/**
 * Email templates for payment processing, confirmations, and support
 */
class EmailTemplates {
  
  /**
   * Purchase confirmation email template
   */
  static getPurchaseConfirmationTemplate(variables) {
    const {
      customer_name,
      product_tier,
      download_link,
      download_expires,
      support_email,
      purchase_date,
      price_paid,
      sale_id
    } = variables;

    const tierDetails = {
      starter: {
        name: 'Starter Bundle',
        features: [
          '17 core content templates',
          'Brand voice guidelines',
          'Basic social media automation',
          '3 email sequence campaigns',
          'Setup documentation',
          '30-day email support'
        ],
        setupTime: '2-4 hours'
      },
      professional: {
        name: 'Professional Bundle',
        features: [
          'Complete template system (all 17 types)',
          'Analytics dashboard with real-time data',
          'API integration framework',
          'Multi-platform posting automation',
          'A/B testing configuration',
          'Advanced setup tutorials',
          '60-day priority support'
        ],
        setupTime: '1-2 days'
      },
      enterprise: {
        name: 'Enterprise Bundle',
        features: [
          'Full production codebase (8,190+ files)',
          'Multi-agent development framework',
          'Custom brand adaptation templates',
          'White-label customization system',
          'Production deployment guides',
          '1-hour strategy consultation call',
          '90-day premium support with updates'
        ],
        setupTime: '1 week with consultation'
      }
    };

    const details = tierDetails[product_tier] || tierDetails.starter;

    return {
      subject: `🎉 Your ${details.name} is Ready for Download!`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Marketing Automation Bundle is Ready!</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #00d4aa, #4ade80); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .download-box {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 2px solid #00d4aa;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
        }
        .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #00d4aa, #4ade80);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 18px;
            margin: 15px 0;
            transition: transform 0.2s ease;
        }
        .download-btn:hover {
            transform: translateY(-2px);
        }
        .features {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features h3 {
            color: #00d4aa;
            margin-bottom: 15px;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .feature-list li:before {
            content: "✅ ";
            margin-right: 10px;
        }
        .important-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .support-box {
            background: #e8f5e8;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
        }
        .purchase-details {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your ${details.name} is Ready!</h1>
            <p>Thank you for your purchase, ${customer_name}!</p>
        </div>
        
        <div class="content">
            <p>Hi ${customer_name},</p>
            
            <p>🚀 <strong>Your Marketing Automation Hub bundle is ready for download!</strong></p>
            
            <div class="download-box">
                <h3>📦 Download Your Bundle</h3>
                <p>Click the button below to download your complete ${details.name}:</p>
                <a href="${download_link}" class="download-btn">⬇️ Download Now</a>
                <p><small>⏰ <strong>Important:</strong> This download link expires on ${new Date(download_expires).toLocaleDateString()}</small></p>
                <p><small>💾 Maximum 5 downloads allowed</small></p>
            </div>

            <div class="features">
                <h3>📋 What's Included in Your ${details.name}:</h3>
                <ul class="feature-list">
                    ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <p><strong>⏱️ Estimated Setup Time:</strong> ${details.setupTime}</p>
            </div>

            <div class="important-info">
                <h4>⚡ Quick Start Tips:</h4>
                <ol>
                    <li><strong>Extract the ZIP file</strong> to your preferred directory</li>
                    <li><strong>Start with the README.md file</strong> for overview</li>
                    <li><strong>Follow the setup guides</strong> in the setup_guides/ folder</li>
                    <li><strong>Configure your API keys</strong> using the provided templates</li>
                    <li><strong>Test your setup</strong> with the included validation scripts</li>
                </ol>
            </div>

            <div class="support-box">
                <h4>🤝 Need Help?</h4>
                <p>We're here to support your success!</p>
                <ul>
                    <li><strong>Email Support:</strong> <a href="mailto:${support_email}">${support_email}</a></li>
                    <li><strong>Support Duration:</strong> ${product_tier === 'starter' ? '30 days' : product_tier === 'professional' ? '60 days' : '90 days'}</li>
                    <li><strong>Response Time:</strong> ${product_tier === 'professional' || product_tier === 'enterprise' ? 'Priority support (24-48 hours)' : 'Standard support (48-72 hours)'}</li>
                    ${product_tier === 'enterprise' ? '<li><strong>Consultation Call:</strong> Included - we\'ll contact you within 2 business days</li>' : ''}
                </ul>
            </div>

            <div class="purchase-details">
                <h4>📄 Purchase Details:</h4>
                <p><strong>Purchase Date:</strong> ${purchase_date}</p>
                <p><strong>Amount Paid:</strong> ${price_paid}</p>
                <p><strong>Order ID:</strong> ${sale_id}</p>
                <p><strong>Product:</strong> Marketing Automation Hub - ${details.name}</p>
            </div>

            <p>🎯 <strong>Ready to launch your marketing automation?</strong></p>
            <p>Your bundle contains everything you need to automate your app marketing campaigns, from content templates to analytics dashboards. Follow the setup guides to get started in ${details.setupTime}.</p>

            <p>Welcome to the Marketing Automation Hub community!</p>
            
            <p>Best regards,<br>
            <strong>The Marketing Automation Hub Team</strong></p>
        </div>
        
        <div class="footer">
            <p>Marketing Automation Hub - Automating Success</p>
            <p><small>This email was sent regarding your purchase on ${purchase_date}</small></p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
🎉 Your ${details.name} is Ready!

Hi ${customer_name},

Thank you for your purchase! Your Marketing Automation Hub bundle is ready for download.

DOWNLOAD LINK: ${download_link}
⚠️ Expires: ${new Date(download_expires).toLocaleDateString()}
💾 Maximum 5 downloads allowed

WHAT'S INCLUDED:
${details.features.map(feature => `• ${feature}`).join('\n')}

SETUP TIME: ${details.setupTime}

QUICK START:
1. Extract the ZIP file to your preferred directory
2. Start with the README.md file for overview
3. Follow the setup guides in the setup_guides/ folder
4. Configure your API keys using the provided templates
5. Test your setup with the included validation scripts

SUPPORT:
Email: ${support_email}
Duration: ${product_tier === 'starter' ? '30 days' : product_tier === 'professional' ? '60 days' : '90 days'}

PURCHASE DETAILS:
Date: ${purchase_date}
Amount: ${price_paid}
Order ID: ${sale_id}

Welcome to the Marketing Automation Hub community!

Best regards,
The Marketing Automation Hub Team
      `
    };
  }

  /**
   * Payment failure alert template (for admin)
   */
  static getPaymentFailureTemplate(variables) {
    const {
      sale_id,
      customer_email,
      product_name,
      price,
      error_message,
      timestamp
    } = variables;

    return {
      subject: `🚨 URGENT: Payment Processing Failed - Sale ${sale_id}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: monospace; background: #1a1a1a; color: #ff6b6b; padding: 20px; }
        .alert { border: 2px solid #ff6b6b; border-radius: 8px; padding: 20px; background: #2a1a1a; }
        .error { color: #ff6b6b; font-weight: bold; }
        .info { color: #4ecdc4; }
        .warning { color: #ffe66d; }
    </style>
</head>
<body>
    <div class="alert">
        <h1 class="error">🚨 PAYMENT PROCESSING FAILURE</h1>
        
        <h3 class="warning">IMMEDIATE ACTION REQUIRED</h3>
        
        <p><strong class="info">Sale ID:</strong> ${sale_id}</p>
        <p><strong class="info">Customer:</strong> ${customer_email}</p>
        <p><strong class="info">Product:</strong> ${product_name}</p>
        <p><strong class="info">Amount:</strong> $${price}</p>
        <p><strong class="info">Timestamp:</strong> ${timestamp}</p>
        
        <h4 class="error">Error Details:</h4>
        <p class="error">${error_message}</p>
        
        <h4 class="warning">Required Actions:</h4>
        <ol>
            <li>Investigate the error cause immediately</li>
            <li>Contact customer at ${customer_email}</li>
            <li>Manual fulfillment may be required</li>
            <li>Check Gumroad dashboard for payment status</li>
            <li>Monitor system logs for related issues</li>
        </ol>
        
        <p class="warning">⚠️ Customer is expecting their purchase. Handle immediately!</p>
    </div>
</body>
</html>
      `,
      text: `
🚨 URGENT: PAYMENT PROCESSING FAILURE

IMMEDIATE ACTION REQUIRED

Sale ID: ${sale_id}
Customer: ${customer_email} 
Product: ${product_name}
Amount: $${price}
Timestamp: ${timestamp}

ERROR: ${error_message}

REQUIRED ACTIONS:
1. Investigate the error cause immediately
2. Contact customer at ${customer_email}
3. Manual fulfillment may be required
4. Check Gumroad dashboard for payment status
5. Monitor system logs for related issues

⚠️ Customer is expecting their purchase. Handle immediately!
      `
    };
  }

  /**
   * Milestone achievement notification template
   */
  static getMilestoneNotificationTemplate(variables) {
    const {
      milestone_amount,
      milestone_message,
      current_revenue,
      total_sales,
      average_order_value,
      tier_breakdown,
      achievement_date
    } = variables;

    return {
      subject: `🎯 MILESTONE ACHIEVED: $${milestone_amount.toLocaleString()}!`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f1419; color: #00d4aa; padding: 20px; }
        .celebration { border: 3px solid #00d4aa; border-radius: 12px; padding: 30px; background: linear-gradient(135deg, #1a1f2e, #16213e); text-align: center; }
        .milestone { font-size: 3rem; font-weight: bold; margin: 20px 0; }
        .stats { background: rgba(0, 212, 170, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #4ade80; }
        .metric-label { color: #a0a0a0; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="celebration">
        <h1>🎉 MILESTONE ACHIEVED! 🎉</h1>
        
        <div class="milestone">$${milestone_amount.toLocaleString()}</div>
        
        <h2>${milestone_message}</h2>
        
        <div class="stats">
            <h3>📊 Current Performance:</h3>
            
            <div class="metric">
                <div class="metric-value">$${current_revenue.toLocaleString()}</div>
                <div class="metric-label">Total Revenue</div>
            </div>
            
            <div class="metric">
                <div class="metric-value">${total_sales}</div>
                <div class="metric-label">Total Sales</div>
            </div>
            
            <div class="metric">
                <div class="metric-value">$${average_order_value}</div>
                <div class="metric-label">Avg Order Value</div>
            </div>
        </div>
        
        <h4>🎯 Tier Breakdown:</h4>
        <pre style="color: #e6e6e6; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px;">${tier_breakdown}</pre>
        
        <p style="color: #4ade80; font-size: 1.2rem; margin-top: 30px;">
            🚀 Momentum is building! Keep up the excellent work!
        </p>
        
        <p style="color: #a0a0a0;">Achieved on: ${achievement_date}</p>
    </div>
</body>
</html>
      `,
      text: `
🎯 MILESTONE ACHIEVED: $${milestone_amount.toLocaleString()}!

${milestone_message}

CURRENT PERFORMANCE:
- Total Revenue: $${current_revenue.toLocaleString()}
- Total Sales: ${total_sales}
- Average Order Value: $${average_order_value}

TIER BREAKDOWN:
${tier_breakdown}

🚀 Momentum is building! Keep up the excellent work!

Achieved on: ${achievement_date}
      `
    };
  }
}

module.exports = EmailTemplates;