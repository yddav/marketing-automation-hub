// Kit Email Automation Webhook - Staging Version
// Mock implementation for staging testing

exports.handler = async (event, context) => {
  // Add OPTIONS method support for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    let requestData = {};
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (e) {
        requestData = { email: 'test@staging.com', source: 'staging-test' };
      }
    }

    const { email, source, inquiry_type, name, custom_fields } = requestData;
    
    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required field: email' 
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Invalid email format' 
        })
      };
    }

    // Staging mock configuration
    const kitConfiguration = {
      'appfinder': {
        tags: ['appfinder-interest', 'mobile-app'],
        form_id: 'staging-appfinder-form',
        follow_up: 'appfinder_welcome_sequence'
      },
      'etsy-shop': {
        tags: ['etsy-customer', 'shop-interest'],
        form_id: 'staging-shop-form',
        follow_up: 'shop_welcome_sequence'
      },
      'newsletter': {
        tags: ['newsletter', 'general-interest'],
        form_id: 'staging-newsletter-form',
        follow_up: 'general_welcome_sequence'
      },
      'contact': {
        tags: ['contact-form', inquiry_type || 'general'],
        form_id: 'staging-contact-form',
        follow_up: 'contact_follow_up'
      }
    };

    const config = kitConfiguration[source] || kitConfiguration['newsletter'];

    // Mock successful response for staging
    const mockSubscriberId = `staging_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mock analytics event
    const analyticsEvent = {
      event_name: 'email_signup',
      parameters: {
        source: source || 'staging-test',
        inquiry_type: inquiry_type || 'test',
        timestamp: new Date().toISOString(),
        kit_subscriber_id: mockSubscriberId,
        environment: 'staging'
      }
    };

    console.log('Staging Kit Webhook:', {
      email,
      source,
      subscriber_id: mockSubscriberId,
      config: config.tags
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Successfully processed staging request',
        subscriber_id: mockSubscriberId,
        follow_up: config.follow_up,
        analytics: analyticsEvent,
        staging: true,
        processed_data: {
          email,
          source: source || 'staging-test',
          name: name || 'Staging User',
          tags: config.tags
        }
      })
    };

  } catch (error) {
    console.error('Kit webhook error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.ENVIRONMENT === 'production' ? 
          'Something went wrong' : error.message
      })
    };
  }
};