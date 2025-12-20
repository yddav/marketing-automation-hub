-- =====================================================================
-- Email Scheduler Helper Functions
-- =====================================================================
-- Purpose: SQL functions for email sequence automation
-- Functions: get_users_needing_email (sequence logic)
-- Use Case: Called by email-sequence-scheduler.js Netlify function
-- Frequency: Daily cron job at 10 AM
-- =====================================================================

-- =====================================================================
-- FUNCTION: get_users_needing_email
-- =====================================================================
-- Purpose: Get users who need a specific email in a sequence
-- Logic:
--   1. User signed up at least delay_hours ago
--   2. User hasn't already received this email
--   3. If not first email, previous email must have been sent
--   4. User status is 'subscribed'
-- Returns: User details for email sending

CREATE OR REPLACE FUNCTION get_users_needing_email(
  p_sequence_type TEXT,
  p_email_number INTEGER,
  p_delay_hours INTEGER
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  first_name TEXT,
  signup_date TIMESTAMPTZ,
  last_email_sent TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.id,
    bu.email,
    bu.first_name,
    bu.signup_date,
    bu.last_email_sent
  FROM beta_users bu
  WHERE bu.status = 'subscribed'

    -- User signed up at least delay_hours ago
    AND bu.signup_date <= NOW() - INTERVAL '1 hour' * p_delay_hours

    -- User hasn't already received this email in this sequence
    AND NOT EXISTS (
      SELECT 1
      FROM email_sends es
      WHERE es.user_id = bu.id
        AND es.metadata->>'sequence' = p_sequence_type
        AND (es.metadata->>'number')::integer = p_email_number
    )

    -- If not first email (number > 1), check previous email was sent
    AND (
      p_email_number = 1
      OR EXISTS (
        SELECT 1
        FROM email_sends es
        WHERE es.user_id = bu.id
          AND es.metadata->>'sequence' = p_sequence_type
          AND (es.metadata->>'number')::integer = p_email_number - 1
          AND es.status IN ('sent', 'delivered', 'opened', 'clicked')
      )
    )
  ORDER BY bu.signup_date ASC
  LIMIT 100; -- Process 100 users per batch for safety
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_users_needing_email IS 'Get users needing specific email in sequence (for scheduler automation)';

-- =====================================================================
-- ALTERNATIVE FUNCTION: get_users_needing_email_with_campaign
-- =====================================================================
-- Purpose: Get users needing email using email_campaigns table reference
-- Note: This version requires email_campaigns table to be populated first
-- Use: For more complex sequence logic with campaign-specific conditions

CREATE OR REPLACE FUNCTION get_users_needing_email_with_campaign(
  p_sequence_type TEXT,
  p_email_number INTEGER,
  p_delay_hours INTEGER
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  first_name TEXT,
  signup_date TIMESTAMPTZ,
  last_email_sent TIMESTAMPTZ,
  campaign_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.id,
    bu.email,
    bu.first_name,
    bu.signup_date,
    bu.last_email_sent,
    ec.id AS campaign_id
  FROM beta_users bu
  CROSS JOIN email_campaigns ec
  WHERE bu.status = 'subscribed'
    AND ec.sequence_type = p_sequence_type
    AND ec.email_number = p_email_number

    -- User signed up at least delay_hours ago
    AND bu.signup_date <= NOW() - INTERVAL '1 hour' * p_delay_hours

    -- User hasn't already received this specific campaign email
    AND NOT EXISTS (
      SELECT 1
      FROM email_sends es
      WHERE es.user_id = bu.id
        AND es.campaign_id = ec.id
    )

    -- If not first email, check previous email was sent
    AND (
      p_email_number = 1
      OR EXISTS (
        SELECT 1
        FROM email_sends es
        JOIN email_campaigns prev_ec ON es.campaign_id = prev_ec.id
        WHERE es.user_id = bu.id
          AND prev_ec.sequence_type = p_sequence_type
          AND prev_ec.email_number = p_email_number - 1
          AND es.status IN ('sent', 'delivered', 'opened', 'clicked')
      )
    )
  ORDER BY bu.signup_date ASC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_users_needing_email_with_campaign IS 'Get users needing email using email_campaigns table (advanced)';

-- =====================================================================
-- HELPER FUNCTION: get_sequence_stats
-- =====================================================================
-- Purpose: Get statistics for a specific email sequence
-- Returns: Count of users at each stage of sequence
-- Use: Dashboard analytics and monitoring

CREATE OR REPLACE FUNCTION get_sequence_stats(
  p_sequence_type TEXT
)
RETURNS TABLE(
  email_number INTEGER,
  users_sent INTEGER,
  users_opened INTEGER,
  users_clicked INTEGER,
  open_rate NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (es.metadata->>'number')::integer AS email_number,
    COUNT(*)::integer AS users_sent,
    COUNT(es.opened_at)::integer AS users_opened,
    COUNT(es.clicked_at)::integer AS users_clicked,
    ROUND(
      (COUNT(es.opened_at)::numeric / NULLIF(COUNT(*), 0) * 100),
      2
    ) AS open_rate,
    ROUND(
      (COUNT(es.clicked_at)::numeric / NULLIF(COUNT(*), 0) * 100),
      2
    ) AS click_rate
  FROM email_sends es
  WHERE es.metadata->>'sequence' = p_sequence_type
  GROUP BY email_number
  ORDER BY email_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_sequence_stats IS 'Get email sequence statistics (sent, opened, clicked, rates)';

-- =====================================================================
-- HELPER FUNCTION: get_user_engagement_score
-- =====================================================================
-- Purpose: Calculate engagement score for a user (0-100)
-- Formula: (open_count * 2 + click_count * 5) capped at 100
-- Use: Segmentation and targeting

CREATE OR REPLACE FUNCTION get_user_engagement_score(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  SELECT
    LEAST(
      (bu.email_open_count * 2 + bu.email_click_count * 5),
      100
    )
  INTO v_score
  FROM beta_users bu
  WHERE bu.id = p_user_id;

  RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_engagement_score IS 'Calculate user engagement score 0-100 based on opens/clicks';

-- =====================================================================
-- HELPER FUNCTION: mark_users_bounced
-- =====================================================================
-- Purpose: Mark users with bounced emails as bounced status
-- Trigger: Called after email bounce webhook
-- Updates: beta_users.status to 'bounced'

CREATE OR REPLACE FUNCTION mark_users_bounced(
  p_provider_message_ids TEXT[]
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Update email_sends
  UPDATE email_sends
  SET
    status = 'bounced',
    bounced_at = NOW()
  WHERE provider_message_id = ANY(p_provider_message_ids)
    AND status != 'bounced';

  -- Update beta_users status
  UPDATE beta_users bu
  SET status = 'bounced'
  FROM email_sends es
  WHERE es.user_id = bu.id
    AND es.provider_message_id = ANY(p_provider_message_ids)
    AND bu.status != 'bounced';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_users_bounced IS 'Mark users with bounced emails as bounced status';

-- =====================================================================
-- HELPER FUNCTION: unsubscribe_user
-- =====================================================================
-- Purpose: Handle user unsubscribe requests
-- Updates: beta_users.status to 'unsubscribed'
-- Returns: Boolean success

CREATE OR REPLACE FUNCTION unsubscribe_user(
  p_email TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE beta_users
  SET status = 'unsubscribed'
  WHERE email = p_email
    AND status = 'subscribed';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION unsubscribe_user IS 'Handle user unsubscribe requests (update status)';

-- =====================================================================
-- VALIDATION QUERIES
-- =====================================================================

-- Verify all functions exist
-- SELECT proname, prosrc FROM pg_proc
-- WHERE proname IN (
--   'get_users_needing_email',
--   'get_users_needing_email_with_campaign',
--   'get_sequence_stats',
--   'get_user_engagement_score',
--   'mark_users_bounced',
--   'unsubscribe_user'
-- );

-- Test get_users_needing_email (welcome sequence, email 1, immediate)
-- SELECT * FROM get_users_needing_email('welcome', 1, 0);

-- Test get_sequence_stats (welcome sequence)
-- SELECT * FROM get_sequence_stats('welcome');

-- Test get_user_engagement_score (example user)
-- SELECT get_user_engagement_score('user-uuid-here');

-- =====================================================================
-- SCHEDULER FUNCTIONS COMPLETE
-- =====================================================================
-- Functions created: 6
--   1. get_users_needing_email (primary scheduler logic)
--   2. get_users_needing_email_with_campaign (advanced with campaigns)
--   3. get_sequence_stats (analytics)
--   4. get_user_engagement_score (segmentation)
--   5. mark_users_bounced (bounce handling)
--   6. unsubscribe_user (unsubscribe handling)
-- =====================================================================
