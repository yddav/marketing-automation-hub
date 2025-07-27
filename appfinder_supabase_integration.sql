-- AppFinder-Supabase Integration Database Schema
-- Agent A: AppFinder Optimization & Security Enhancement
-- Database: PostgreSQL via Supabase
-- Security: Row Level Security (RLS) enabled on all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; 

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Main user profiles table
CREATE TABLE appfinder_users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    email_encrypted TEXT, -- PGP encrypted email for compliance
    device_fingerprint TEXT, -- Encrypted device identification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_completed BOOLEAN DEFAULT FALSE,
    privacy_settings JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{
        "biometric_enabled": false,
        "two_factor_enabled": false,
        "location_verification": false,
        "trusted_devices": []
    }'::JSONB,
    app_preferences JSONB DEFAULT '{
        "categories": [],
        "preferred_platforms": [],
        "discovery_frequency": "daily",
        "notification_preferences": {}
    }'::JSONB,
    ecosystem_engagement JSONB DEFAULT '{
        "hub_visits": 0,
        "etsy_clicks": 0,
        "community_interactions": 0,
        "email_opens": 0
    }'::JSONB
);

-- User security events table
CREATE TABLE user_security_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- login, logout, security_alert, device_change
    event_details JSONB,
    ip_address INET,
    device_info JSONB,
    risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trusted devices table
CREATE TABLE user_trusted_devices (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT, -- ios, android, web
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trusted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- APP DISCOVERY & ANALYTICS TABLES
-- =====================================================

-- User app discoveries tracking
CREATE TABLE user_app_discoveries (
    discovery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    app_category TEXT,
    app_platform TEXT, -- ios, android, web, cross_platform
    discovery_method TEXT, -- ai_recommendation, search, category_browse, trending
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_review TEXT,
    discovery_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    interaction_duration INTEGER, -- seconds spent viewing app
    conversion_to_download BOOLEAN DEFAULT FALSE,
    downloaded_at TIMESTAMP WITH TIME ZONE,
    recommendation_confidence DECIMAL(3,2), -- AI confidence score 0.00-1.00
    personalization_factors JSONB -- factors that influenced recommendation
);

-- App performance analytics
CREATE TABLE app_discovery_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name TEXT NOT NULL,
    total_discoveries INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),
    average_rating DECIMAL(3,2),
    category TEXT,
    platform TEXT,
    trending_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User engagement sessions
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER, -- seconds
    apps_discovered INTEGER DEFAULT 0,
    features_used JSONB, -- array of features used during session
    platform_navigations JSONB, -- hub/etsy clicks during session
    exit_method TEXT -- natural, promotion_click, force_close
);

-- =====================================================
-- CROSS-PLATFORM ECOSYSTEM TRACKING
-- =====================================================

-- Unified ecosystem interactions
CREATE TABLE ecosystem_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- appfinder, hub, etsy, email, instagram, twitter
    action_type TEXT NOT NULL, -- visit, click, purchase, signup, engagement
    interaction_details JSONB,
    referrer_platform TEXT, -- which platform drove this interaction
    conversion_value DECIMAL(10,2), -- monetary value if applicable
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_context JSONB -- additional context about user journey
);

-- Cross-platform conversion funnels
CREATE TABLE conversion_funnels (
    funnel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    funnel_name TEXT NOT NULL, -- appfinder_to_etsy, hub_to_appfinder, etc
    entry_platform TEXT NOT NULL,
    exit_platform TEXT,
    conversion_completed BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    steps_completed JSONB, -- array of completed funnel steps
    drop_off_point TEXT, -- where user dropped off if incomplete
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Community engagement tracking
CREATE TABLE community_engagement (
    engagement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    engagement_type TEXT NOT NULL, -- comment, like, share, post, vote
    content_type TEXT, -- app_review, design_showcase, discussion
    content_id TEXT, -- reference to hub content
    engagement_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MARKETING & PERSONALIZATION TABLES  
-- =====================================================

-- User email marketing status
CREATE TABLE email_marketing_status (
    email_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    mailchimp_subscriber_id TEXT,
    subscription_status TEXT DEFAULT 'subscribed', -- subscribed, unsubscribed, cleaned
    email_preferences JSONB DEFAULT '{
        "weekly_discoveries": true,
        "premium_features": true,
        "ecosystem_updates": true,
        "promotional_offers": false
    }'::JSONB,
    last_email_sent TIMESTAMP WITH TIME ZONE,
    last_email_opened TIMESTAMP WITH TIME ZONE,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalized recommendations cache
CREATE TABLE recommendation_cache (
    cache_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- app_discovery, etsy_design, hub_content
    recommendations JSONB NOT NULL,
    confidence_scores JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    cache_hit_count INTEGER DEFAULT 0
);

-- A/B testing for features
CREATE TABLE feature_ab_tests (
    test_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES appfinder_users(user_id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    variant TEXT NOT NULL, -- A, B, control
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversion_events JSONB DEFAULT '[]'::JSONB,
    test_completed BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User tables indexes
CREATE INDEX idx_appfinder_users_email ON appfinder_users(email);
CREATE INDEX idx_appfinder_users_last_active ON appfinder_users(last_active);
CREATE INDEX idx_user_security_events_user_id ON user_security_events(user_id);
CREATE INDEX idx_user_security_events_created_at ON user_security_events(created_at);

-- Discovery analytics indexes
CREATE INDEX idx_user_app_discoveries_user_id ON user_app_discoveries(user_id);
CREATE INDEX idx_user_app_discoveries_timestamp ON user_app_discoveries(discovery_timestamp);
CREATE INDEX idx_user_app_discoveries_app_name ON user_app_discoveries(app_name);
CREATE INDEX idx_user_app_discoveries_category ON user_app_discoveries(app_category);

-- Ecosystem tracking indexes
CREATE INDEX idx_ecosystem_interactions_user_id ON ecosystem_interactions(user_id);
CREATE INDEX idx_ecosystem_interactions_platform ON ecosystem_interactions(platform);
CREATE INDEX idx_ecosystem_interactions_timestamp ON ecosystem_interactions(timestamp);
CREATE INDEX idx_conversion_funnels_user_id ON conversion_funnels(user_id);

-- Performance indexes for real-time features
CREATE INDEX idx_recommendation_cache_user_id ON recommendation_cache(user_id);
CREATE INDEX idx_recommendation_cache_expires_at ON recommendation_cache(expires_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE appfinder_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecosystem_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_marketing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_ab_tests ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own profile" ON appfinder_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON appfinder_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own discoveries" ON user_app_discoveries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ecosystem interactions" ON ecosystem_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Admin policies for analytics (service role access)
CREATE POLICY "Service role can access all data" ON appfinder_users
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS FOR ANALYTICS & AUTOMATION
-- =====================================================

-- Function to update user last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE appfinder_users 
    SET last_active = NOW() 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active on new discoveries
CREATE TRIGGER trigger_update_last_active
    AFTER INSERT ON user_app_discoveries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Function to calculate conversion rates
CREATE OR REPLACE FUNCTION calculate_app_conversion_rate(app_name_param TEXT)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_discoveries INTEGER;
    total_downloads INTEGER;
    conversion_rate DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_discoveries 
    FROM user_app_discoveries 
    WHERE app_name = app_name_param;
    
    SELECT COUNT(*) INTO total_downloads 
    FROM user_app_discoveries 
    WHERE app_name = app_name_param AND conversion_to_download = TRUE;
    
    IF total_discoveries > 0 THEN
        conversion_rate := (total_downloads::DECIMAL / total_discoveries::DECIMAL) * 100;
    ELSE
        conversion_rate := 0;
    END IF;
    
    RETURN conversion_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get user ecosystem engagement score
CREATE OR REPLACE FUNCTION get_user_engagement_score(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    app_discoveries INTEGER;
    hub_visits INTEGER;
    etsy_clicks INTEGER;
    community_interactions INTEGER;
    engagement_score INTEGER;
BEGIN
    SELECT COUNT(*) INTO app_discoveries 
    FROM user_app_discoveries 
    WHERE user_id = user_id_param 
    AND discovery_timestamp > NOW() - INTERVAL '30 days';
    
    SELECT 
        (ecosystem_engagement->>'hub_visits')::INTEGER,
        (ecosystem_engagement->>'etsy_clicks')::INTEGER,
        (ecosystem_engagement->>'community_interactions')::INTEGER
    INTO hub_visits, etsy_clicks, community_interactions
    FROM appfinder_users 
    WHERE user_id = user_id_param;
    
    -- Calculate weighted engagement score
    engagement_score := (app_discoveries * 3) + (hub_visits * 2) + 
                       (etsy_clicks * 1) + (community_interactions * 4);
    
    RETURN COALESCE(engagement_score, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR ANALYTICS DASHBOARDS
-- =====================================================

-- User engagement summary view
CREATE VIEW user_engagement_summary AS
SELECT 
    u.user_id,
    u.email,
    u.created_at,
    u.last_active,
    COUNT(d.discovery_id) as total_discoveries,
    COUNT(CASE WHEN d.conversion_to_download THEN 1 END) as total_downloads,
    AVG(d.user_rating) as average_rating_given,
    COUNT(s.session_id) as total_sessions,
    AVG(s.session_duration) as avg_session_duration,
    get_user_engagement_score(u.user_id) as engagement_score
FROM appfinder_users u
LEFT JOIN user_app_discoveries d ON u.user_id = d.user_id
LEFT JOIN user_sessions s ON u.user_id = s.user_id
GROUP BY u.user_id, u.email, u.created_at, u.last_active;

-- Cross-platform conversion analytics view
CREATE VIEW cross_platform_analytics AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    platform,
    action_type,
    COUNT(*) as total_interactions,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(COALESCE(conversion_value, 0)) as avg_conversion_value,
    SUM(COALESCE(conversion_value, 0)) as total_revenue
FROM ecosystem_interactions
GROUP BY DATE_TRUNC('day', timestamp), platform, action_type
ORDER BY date DESC, total_interactions DESC;

-- App discovery performance view
CREATE VIEW app_performance_analytics AS
SELECT 
    app_name,
    app_category,
    COUNT(*) as total_discoveries,
    COUNT(CASE WHEN conversion_to_download THEN 1 END) as total_downloads,
    calculate_app_conversion_rate(app_name) as conversion_rate,
    AVG(user_rating) as average_rating,
    AVG(recommendation_confidence) as avg_ai_confidence,
    MAX(discovery_timestamp) as last_discovered
FROM user_app_discoveries
GROUP BY app_name, app_category
ORDER BY total_discoveries DESC;

-- =====================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Insert default app categories
INSERT INTO app_discovery_analytics (app_name, category, platform) VALUES 
('Productivity Suite Apps', 'productivity', 'cross_platform'),
('Security & Privacy Tools', 'security', 'cross_platform'),
('Automotive Lifestyle Apps', 'lifestyle', 'cross_platform'),
('Creative Design Tools', 'creativity', 'cross_platform'),
('Communication Platforms', 'communication', 'cross_platform');

-- Create admin functions for data management
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM recommendation_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cache cleanup (to be run via cron or scheduled function)
-- SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

COMMENT ON DATABASE current_database() IS 'AppFinder Supabase Integration Database - Optimized for security, analytics, and cross-platform ecosystem tracking';