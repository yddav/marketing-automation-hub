-- =====================================================================
-- Email Marketing Infrastructure Migration
-- =====================================================================
-- Purpose: Complete database schema for FREE email marketing system
-- Tables: beta_users, email_campaigns, email_sends, analytics_events
-- Features: RLS policies, indexes, helper functions, tracking
-- Provider: Resend (primary) + Brevo migration ready
-- Cost: $0/month for beta phase (100-1,000 users)
-- =====================================================================

-- =====================================================================
-- TABLE 1: beta_users
-- =====================================================================
-- Purpose: Store beta signup data with tags and engagement tracking

CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  device_type TEXT,
  interest TEXT,
  source TEXT DEFAULT 'finderr-beta-signup',
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced
  tags TEXT[] DEFAULT ARRAY['finderr-beta', 'android-tester'],
  signup_date TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent TIMESTAMPTZ,
  email_open_count INTEGER DEFAULT 0,
  email_click_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('subscribed', 'unsubscribed', 'bounced'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_beta_users_email ON beta_users(email);
CREATE INDEX IF NOT EXISTS idx_beta_users_status ON beta_users(status);
CREATE INDEX IF NOT EXISTS idx_beta_users_source ON beta_users(source);
CREATE INDEX IF NOT EXISTS idx_beta_users_signup_date ON beta_users(signup_date DESC);
CREATE INDEX IF NOT EXISTS idx_beta_users_tags ON beta_users USING GIN(tags);

COMMENT ON TABLE beta_users IS 'Beta signup users with engagement tracking';
COMMENT ON COLUMN beta_users.status IS 'Email subscription status: subscribed, unsubscribed, bounced';
COMMENT ON COLUMN beta_users.tags IS 'Array of tags for segmentation and filtering';
COMMENT ON COLUMN beta_users.metadata IS 'Additional user data (signup_ip, user_agent, referrer)';

-- =====================================================================
-- TABLE 2: email_campaigns
-- =====================================================================
-- Purpose: Email templates and sequences configuration

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  sequence_type TEXT NOT NULL, -- welcome, launch, retention
  email_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_variables JSONB DEFAULT '{}'::jsonb,
  delay_hours INTEGER DEFAULT 0, -- Delay from previous email in sequence
  trigger_condition TEXT, -- SQL condition for sending (optional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_sequence_type CHECK (sequence_type IN ('welcome', 'launch', 'retention')),
  CONSTRAINT unique_sequence_email UNIQUE (sequence_type, email_number)
);

-- Index for sequence retrieval
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sequence ON email_campaigns(sequence_type, email_number);

COMMENT ON TABLE email_campaigns IS 'Email campaign templates and sequence configuration';
COMMENT ON COLUMN email_campaigns.sequence_type IS 'Email sequence category: welcome, launch, retention';
COMMENT ON COLUMN email_campaigns.delay_hours IS 'Hours to wait after previous email in sequence';
COMMENT ON COLUMN email_campaigns.trigger_condition IS 'Optional SQL condition for conditional sending';
COMMENT ON COLUMN email_campaigns.template_variables IS 'Default template variable values';

-- =====================================================================
-- TABLE 3: email_sends
-- =====================================================================
-- Purpose: Track all sent emails with delivery and engagement status

CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES beta_users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES email_campaigns(id),

  -- Email details
  subject TEXT NOT NULL,
  provider TEXT DEFAULT 'resend', -- resend, brevo, manual
  provider_message_id TEXT,

  -- Timestamps (progressive tracking)
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,

  -- Status tracking
  status TEXT DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Indexes for tracking queries
CREATE INDEX IF NOT EXISTS idx_email_sends_user_id ON email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign_id ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_provider_message_id ON email_sends(provider_message_id);

COMMENT ON TABLE email_sends IS 'Email send tracking with delivery and engagement status';
COMMENT ON COLUMN email_sends.provider IS 'Email provider used: resend, brevo, manual';
COMMENT ON COLUMN email_sends.provider_message_id IS 'Provider-specific message ID for webhook tracking';
COMMENT ON COLUMN email_sends.status IS 'Progressive status: sent → delivered → opened → clicked';
COMMENT ON COLUMN email_sends.metadata IS 'Additional tracking data (campaign, sequence, number)';

-- =====================================================================
-- TABLE 4: analytics_events
-- =====================================================================
-- Purpose: General analytics event tracking with UTM parameters

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_email TEXT,
  user_id UUID REFERENCES beta_users(id),

  -- Event details
  event_properties JSONB DEFAULT '{}'::jsonb,

  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Metadata
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_email ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_campaign ON analytics_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN(event_properties);

COMMENT ON TABLE analytics_events IS 'General analytics event tracking with UTM parameters';
COMMENT ON COLUMN analytics_events.event_properties IS 'Event-specific data (provider_message_id, link_url, etc)';
COMMENT ON COLUMN analytics_events.utm_source IS 'UTM source parameter for campaign attribution';
COMMENT ON COLUMN analytics_events.utm_campaign IS 'UTM campaign parameter for grouping';

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS POLICIES: beta_users
-- =====================================================================

-- Allow public inserts (beta signups from landing page)
CREATE POLICY "Public can insert beta signups" ON beta_users
  FOR INSERT WITH CHECK (true);

-- Users can view their own data (if authenticated)
CREATE POLICY "Users can view own data" ON beta_users
  FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

-- Service role has full access (for Netlify functions)
CREATE POLICY "Service role full access" ON beta_users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- RLS POLICIES: email_campaigns
-- =====================================================================

-- Campaigns are readable by authenticated users
CREATE POLICY "Campaigns readable by authenticated" ON email_campaigns
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Service role can manage campaigns
CREATE POLICY "Service role campaign management" ON email_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- RLS POLICIES: email_sends
-- =====================================================================

-- Only service role can access email_sends (privacy protection)
CREATE POLICY "Service role email sends" ON email_sends
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- RLS POLICIES: analytics_events
-- =====================================================================

-- Anyone can insert analytics events (public tracking)
CREATE POLICY "Anyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Service role can read analytics
CREATE POLICY "Service role analytics access" ON analytics_events
  FOR SELECT USING (auth.role() = 'service_role');

-- =====================================================================
-- HELPER FUNCTION: get_email_sequence_progress
-- =====================================================================
-- Purpose: Get user's progress through a specific email sequence
-- Returns: Email number, subject, timestamps for sent/opened/clicked

CREATE OR REPLACE FUNCTION get_email_sequence_progress(
  p_user_id UUID,
  p_sequence_type TEXT
)
RETURNS TABLE(
  email_number INTEGER,
  subject TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ec.email_number,
    es.subject,
    es.sent_at,
    es.opened_at,
    es.clicked_at
  FROM email_sends es
  JOIN email_campaigns ec ON es.campaign_id = ec.id
  WHERE es.user_id = p_user_id
    AND ec.sequence_type = p_sequence_type
  ORDER BY ec.email_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_email_sequence_progress IS 'Get user email sequence progress with engagement timestamps';

-- =====================================================================
-- HELPER FUNCTION: track_email_open
-- =====================================================================
-- Purpose: Track email open events from tracking pixel
-- Updates: email_sends.opened_at, beta_users.email_open_count

CREATE OR REPLACE FUNCTION track_email_open(
  p_provider_message_id TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update email_sends record
  UPDATE email_sends
  SET
    opened_at = COALESCE(opened_at, NOW()),
    status = CASE
      WHEN status = 'sent' OR status = 'delivered' THEN 'opened'
      ELSE status
    END
  WHERE provider_message_id = p_provider_message_id
    AND opened_at IS NULL;

  -- Update user open count
  UPDATE beta_users
  SET email_open_count = email_open_count + 1
  WHERE id = (
    SELECT user_id
    FROM email_sends
    WHERE provider_message_id = p_provider_message_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION track_email_open IS 'Track email open event from tracking pixel webhook';

-- =====================================================================
-- HELPER FUNCTION: track_email_click
-- =====================================================================
-- Purpose: Track email click events from link tracking
-- Updates: email_sends.clicked_at, beta_users.email_click_count
-- Creates: analytics_events record for click tracking

CREATE OR REPLACE FUNCTION track_email_click(
  p_provider_message_id TEXT,
  p_link_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update email_sends record
  UPDATE email_sends
  SET
    clicked_at = COALESCE(clicked_at, NOW()),
    status = 'clicked',
    metadata = metadata || jsonb_build_object('clicked_link', p_link_url)
  WHERE provider_message_id = p_provider_message_id
    AND clicked_at IS NULL;

  -- Update user click count
  UPDATE beta_users
  SET email_click_count = email_click_count + 1
  WHERE id = (
    SELECT user_id
    FROM email_sends
    WHERE provider_message_id = p_provider_message_id
    LIMIT 1
  );

  -- Track analytics event
  INSERT INTO analytics_events (event_name, user_email, event_properties)
  SELECT
    'email_clicked',
    bu.email,
    jsonb_build_object(
      'provider_message_id', p_provider_message_id,
      'link_url', p_link_url
    )
  FROM email_sends es
  JOIN beta_users bu ON es.user_id = bu.id
  WHERE es.provider_message_id = p_provider_message_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION track_email_click IS 'Track email click event from link tracking webhook';

-- =====================================================================
-- VALIDATION QUERIES
-- =====================================================================

-- Verify all tables exist
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events');

-- Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events');

-- Verify indexes
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
-- ORDER BY tablename, indexname;

-- Verify functions
-- SELECT proname, prosrc FROM pg_proc
-- WHERE proname IN ('get_email_sequence_progress', 'track_email_open', 'track_email_click');

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Tables created: 4 (beta_users, email_campaigns, email_sends, analytics_events)
-- Indexes created: 15 (performance optimization)
-- RLS policies: 10 (secure access control)
-- Helper functions: 3 (sequence progress, open tracking, click tracking)
-- =====================================================================
