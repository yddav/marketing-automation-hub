// Enhanced Analytics API
// Custom analytics endpoints for marketing automation integration

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const endpoint = path.split('/').pop();

    switch (endpoint) {
      case 'track-event':
        return await trackCustomEvent(JSON.parse(body || '{}'), headers);
        
      case 'conversion-data':
        return await getConversionData(event.queryStringParameters, headers);
        
      case 'user-journey':
        return await trackUserJourney(JSON.parse(body || '{}'), headers);
        
      case 'ab-test-result':
        return await recordABTestResult(JSON.parse(body || '{}'), headers);
        
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: process.env.ENVIRONMENT === 'production' ? 
          'Something went wrong' : error.message
      })
    };
  }
};

// Track custom events for marketing automation
async function trackCustomEvent(eventData, headers) {
  const {
    event_name,
    user_id,
    session_id,
    source,
    parameters = {}
  } = eventData;

  // Enhanced event data
  const enrichedEvent = {
    ...eventData,
    timestamp: new Date().toISOString(),
    user_agent: parameters.user_agent,
    referrer: parameters.referrer,
    page_url: parameters.page_url,
    session_duration: parameters.session_duration
  };

  // Send to marketing automation system (staging mock)
  if (process.env.ENVIRONMENT === 'staging') {
    console.log('Staging Analytics Event:', enrichedEvent);
  } else if (process.env.MARKETING_AUTOMATION_ANALYTICS_ENDPOINT) {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      await fetch(process.env.MARKETING_AUTOMATION_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom_event',
          data: enrichedEvent
        })
      });
    } catch (err) {
      console.log('Marketing automation analytics failed:', err);
    }
  }

  // Send to Google Analytics 4 (staging mock)
  if (process.env.ENVIRONMENT === 'staging') {
    console.log('Staging GA4 Event:', { client_id: user_id || session_id, events: [enrichedEvent] });
  } else if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: user_id || session_id,
          events: [{
            name: event_name,
            parameters: {
              ...parameters,
              custom_source: source,
              event_timestamp: Date.now()
            }
          }]
        })
      });
    } catch (err) {
      console.log('GA4 tracking failed:', err);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      event_tracked: event_name,
      timestamp: enrichedEvent.timestamp
    })
  };
}

// Get conversion data for optimization
async function getConversionData(queryParams = {}, headers) {
  const { timeframe = '7d', source, page } = queryParams;
  
  // This would typically query your analytics database
  // For now, return mock data structure that marketing automation can use
  const conversionData = {
    timeframe: timeframe,
    source: source,
    page: page,
    metrics: {
      total_visitors: 1250,
      email_signups: 89,
      conversion_rate: 0.071,
      bounce_rate: 0.42,
      avg_session_duration: 145,
      top_sources: [
        { source: 'organic_search', visitors: 680, conversions: 52 },
        { source: 'direct', visitors: 320, conversions: 24 },
        { source: 'social_media', visitors: 180, conversions: 10 },
        { source: 'referral', visitors: 70, conversions: 3 }
      ],
      conversion_funnel: {
        page_views: 1250,
        engaged_sessions: 890,
        newsletter_views: 450,
        email_signups: 89,
        contact_form_starts: 65,
        contact_form_completes: 42
      }
    },
    recommendations: [
      {
        type: 'content_optimization',
        priority: 'high',
        suggestion: 'Improve newsletter signup placement - 64% of engaged users never see signup form'
      },
      {
        type: 'traffic_source',
        priority: 'medium', 
        suggestion: 'Social media has low conversion rate - consider audience targeting adjustment'
      }
    ],
    timestamp: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(conversionData)
  };
}

// Track detailed user journey for personalization
async function trackUserJourney(journeyData, headers) {
  const {
    user_id,
    session_id,
    journey_step,
    page_section,
    interaction_type,
    value,
    metadata = {}
  } = journeyData;

  const journeyEvent = {
    user_id,
    session_id,
    journey_step,
    page_section,
    interaction_type,
    value,
    metadata,
    timestamp: new Date().toISOString(),
    server_timestamp: Date.now()
  };

  // Store journey data for marketing automation personalization
  // This would typically go to a database or analytics service

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      journey_tracked: true,
      next_recommendations: generateNextStepRecommendations(journeyEvent)
    })
  };
}

// Record A/B test results for automated optimization
async function recordABTestResult(testData, headers) {
  const {
    test_name,
    variant,
    user_id,
    conversion_event,
    test_start_time,
    metadata = {}
  } = testData;

  const testResult = {
    test_name,
    variant,
    user_id,
    conversion_event,
    test_duration: Date.now() - test_start_time,
    metadata,
    timestamp: new Date().toISOString()
  };

  // Send to marketing automation for analysis
  if (process.env.MARKETING_AUTOMATION_AB_TEST_ENDPOINT) {
    try {
      await fetch(process.env.MARKETING_AUTOMATION_AB_TEST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ab_test_result',
          data: testResult
        })
      });
    } catch (err) {
      console.log('A/B test tracking failed:', err);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      test_result_recorded: true,
      continue_test: true // Marketing automation will determine when to stop
    })
  };
}

// Generate personalized next step recommendations
function generateNextStepRecommendations(journeyEvent) {
  const { journey_step, page_section, interaction_type } = journeyEvent;
  
  // Simple recommendation logic (marketing automation would have more sophisticated logic)
  const recommendations = [];
  
  if (page_section === 'app' && interaction_type === 'view') {
    recommendations.push({
      type: 'cta_optimization',
      message: 'Show AppFinder signup form',
      priority: 'high'
    });
  }
  
  if (page_section === 'shop' && interaction_type === 'click') {
    recommendations.push({
      type: 'cross_promotion',
      message: 'Suggest newsletter signup for exclusive designs',
      priority: 'medium'
    });
  }
  
  return recommendations;
}