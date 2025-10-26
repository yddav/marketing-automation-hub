// Mailchimp Email Automation Webhook
// Handles email signups and integrates with Mailchimp API

// Debug log environment variables (redacting sensitive info)
const debugLog = (data) => {
  const safeData = {...data};
  if (safeData.MAILCHIMP_API_KEY) {
    safeData.MAILCHIMP_API_KEY = safeData.MAILCHIMP_API_KEY.substring(0, 6) + '...';
  }
  console.log('DEBUG:', JSON.stringify(safeData, null, 2));
};

// Email validation function
const isValidEmail = (email) => {
  if (!email) return false;
  // Simple email regex that matches most valid email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.handler = async (event, context) => {
  try {
    // Log incoming request
    console.log('Incoming request:', {
      method: event.httpMethod,
      path: event.path,
      headers: event.headers,
      body: event.body
    });
    
    // Log environment variables (safely)
    debugLog({
      NODE_ENV: process.env.NODE_ENV,
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
      MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID,
      MAILCHIMP_SERVER: process.env.MAILCHIMP_API_KEY ? 
        process.env.MAILCHIMP_API_KEY.split('-').pop() : undefined
    });

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

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          message: parseError.message
        })
      };
    }

    // Extract email and other fields
    const { email, source = 'unknown', name, tags = [] } = body;

    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required field',
          message: 'Email is required'
        })
      };
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        })
      };
    }

    // Check for required environment variables
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_AUDIENCE_ID) {
      console.error('Missing required environment variables');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Server configuration error',
          message: 'Mailchimp API configuration is missing'
        })
      };
    }

    // Prepare Mailchimp API request
    const mailchimpServer = process.env.MAILCHIMP_API_KEY.split('-').pop();
    const mailchimpUrl = `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`;
    
    const subscriberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: name || '',
        SOURCE: source
      },
      tags: Array.isArray(tags) ? tags : [tags]
    };

    // Call Mailchimp API
    let mailchimpResponse;
    let mailchimpData;
    
    try {
      mailchimpResponse = await fetch(mailchimpUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriberData)
      });

      // Parse response
      mailchimpData = await mailchimpResponse.json();
      
      console.log('Mailchimp API response:', {
        status: mailchimpResponse.status,
        data: mailchimpData
      });

      // Handle non-2xx responses
      if (!mailchimpResponse.ok) {
        console.error('Mailchimp API error:', mailchimpData);
        return {
          statusCode: mailchimpResponse.status,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Mailchimp API error',
            details: mailchimpData
          })
        };
      }

      // Log successful subscription
      console.log('Successfully subscribed user:', {
        email,
        source,
        mailchimpId: mailchimpData.id
      });

      // Return success response
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed to email list',
          subscriber_id: mailchimpData.id,
          status: mailchimpData.status || 'subscribed',
          provider: 'mailchimp'
        })
      };

    } catch (apiError) {
      console.error('Error calling Mailchimp API:', apiError);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Error communicating with Mailchimp',
          message: process.env.NODE_ENV === 'production' 
            ? 'Failed to process subscription' 
            : apiError.message
        })
      };
    }

  } catch (error) {
    console.error('Unexpected error in webhook:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : error.message
      })
    };
  }
};
