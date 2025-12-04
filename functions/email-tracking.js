/**
 * Email Tracking Handler
 * Tracks opens and clicks for both Resend and Brevo
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  const { event: trackingEvent, id: messageId, url: destinationUrl } = event.queryStringParameters || {};

  if (!messageId) {
    return { statusCode: 400, body: 'Missing message ID' };
  }

  try {
    if (trackingEvent === 'open') {
      // Track email open
      await supabase.rpc('track_email_open', { p_provider_message_id: messageId });

      // Return 1x1 transparent pixel
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'image/gif' },
        body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64').toString('base64'),
        isBase64Encoded: true
      };
    } else if (trackingEvent === 'click') {
      // Track email click
      await supabase.rpc('track_email_click', {
        p_provider_message_id: messageId,
        p_link_url: destinationUrl
      });

      // Redirect to destination
      return {
        statusCode: 302,
        headers: { Location: decodeURIComponent(destinationUrl) },
        body: ''
      };
    }

    return { statusCode: 400, body: 'Invalid tracking event' };
  } catch (error) {
    console.error('Tracking error:', error);
    return { statusCode: 500, body: 'Tracking failed' };
  }
};
