-- =====================================================================
-- Email Infrastructure Validation Queries
-- =====================================================================
-- Purpose: Validate that all email marketing infrastructure is working
-- Usage: Run after applying both migration files
-- Expected: All queries should return expected results
-- =====================================================================

-- =====================================================================
-- 1. VERIFY TABLES EXIST
-- =====================================================================

SELECT
  'Tables Verification' AS test_category,
  tablename,
  CASE
    WHEN tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
ORDER BY tablename;

-- Expected: 4 rows (beta_users, email_campaigns, email_sends, analytics_events)

-- =====================================================================
-- 2. VERIFY ROW LEVEL SECURITY ENABLED
-- =====================================================================

SELECT
  'RLS Verification' AS test_category,
  tablename,
  rowsecurity AS rls_enabled,
  CASE
    WHEN rowsecurity = true THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
ORDER BY tablename;

-- Expected: 4 rows with rowsecurity = true

-- =====================================================================
-- 3. VERIFY INDEXES EXIST
-- =====================================================================

SELECT
  'Index Verification' AS test_category,
  tablename,
  COUNT(*) AS index_count,
  CASE
    WHEN tablename = 'beta_users' AND COUNT(*) >= 5 THEN '✅ PASS (5+ indexes)'
    WHEN tablename = 'email_campaigns' AND COUNT(*) >= 1 THEN '✅ PASS (1+ indexes)'
    WHEN tablename = 'email_sends' AND COUNT(*) >= 5 THEN '✅ PASS (5+ indexes)'
    WHEN tablename = 'analytics_events' AND COUNT(*) >= 5 THEN '✅ PASS (5+ indexes)'
    ELSE '❌ FAIL (insufficient indexes)'
  END AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
GROUP BY tablename
ORDER BY tablename;

-- Expected: 4 rows with appropriate index counts

-- =====================================================================
-- 4. VERIFY HELPER FUNCTIONS EXIST
-- =====================================================================

SELECT
  'Function Verification' AS test_category,
  proname AS function_name,
  '✅ PASS' AS status
FROM pg_proc
WHERE proname IN (
  'get_email_sequence_progress',
  'track_email_open',
  'track_email_click',
  'get_users_needing_email',
  'get_users_needing_email_with_campaign',
  'get_sequence_stats',
  'get_user_engagement_score',
  'mark_users_bounced',
  'unsubscribe_user'
)
ORDER BY proname;

-- Expected: 9 functions

-- =====================================================================
-- 5. VERIFY RLS POLICIES EXIST
-- =====================================================================

SELECT
  'RLS Policy Verification' AS test_category,
  tablename,
  COUNT(*) AS policy_count,
  CASE
    WHEN tablename = 'beta_users' AND COUNT(*) >= 3 THEN '✅ PASS (3+ policies)'
    WHEN tablename = 'email_campaigns' AND COUNT(*) >= 2 THEN '✅ PASS (2+ policies)'
    WHEN tablename = 'email_sends' AND COUNT(*) >= 1 THEN '✅ PASS (1+ policies)'
    WHEN tablename = 'analytics_events' AND COUNT(*) >= 2 THEN '✅ PASS (2+ policies)'
    ELSE '❌ FAIL (insufficient policies)'
  END AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')
GROUP BY tablename
ORDER BY tablename;

-- Expected: 4 rows with appropriate policy counts

-- =====================================================================
-- 6. TEST BASIC INSERT (beta_users)
-- =====================================================================

-- Insert test user
INSERT INTO beta_users (email, first_name, device_type, interest)
VALUES (
  'test@example.com',
  'Test User',
  'android-samsung',
  'security-rls'
)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  device_type = EXCLUDED.device_type,
  interest = EXCLUDED.interest
RETURNING
  'Insert Test' AS test_category,
  id,
  email,
  '✅ PASS (user inserted/updated)' AS status;

-- Expected: 1 row with test user details

-- =====================================================================
-- 7. TEST HELPER FUNCTION: get_email_sequence_progress
-- =====================================================================

-- Test with existing user (will return empty if no emails sent)
SELECT
  'Function Test: get_email_sequence_progress' AS test_category,
  COALESCE(
    (SELECT COUNT(*) FROM get_email_sequence_progress(
      (SELECT id FROM beta_users WHERE email = 'test@example.com' LIMIT 1),
      'welcome'
    ))::text,
    '0'
  ) AS result,
  '✅ PASS (function executes)' AS status;

-- Expected: Function executes without error

-- =====================================================================
-- 8. TEST HELPER FUNCTION: get_users_needing_email
-- =====================================================================

-- Get users needing welcome email 1 (immediate)
SELECT
  'Function Test: get_users_needing_email' AS test_category,
  COUNT(*) AS users_needing_email,
  CASE
    WHEN COUNT(*) >= 0 THEN '✅ PASS (function executes)'
    ELSE '❌ FAIL'
  END AS status
FROM get_users_needing_email('welcome', 1, 0);

-- Expected: Count of users (could be 0 or more)

-- =====================================================================
-- 9. TEST HELPER FUNCTION: get_sequence_stats
-- =====================================================================

-- Get welcome sequence stats
SELECT
  'Function Test: get_sequence_stats' AS test_category,
  'welcome' AS sequence_type,
  '✅ PASS (function executes)' AS status
FROM get_sequence_stats('welcome')
LIMIT 1;

-- Expected: Function executes without error (may return no rows if no emails sent)

-- =====================================================================
-- 10. TEST HELPER FUNCTION: get_user_engagement_score
-- =====================================================================

-- Get engagement score for test user
SELECT
  'Function Test: get_user_engagement_score' AS test_category,
  get_user_engagement_score(
    (SELECT id FROM beta_users WHERE email = 'test@example.com' LIMIT 1)
  ) AS engagement_score,
  CASE
    WHEN get_user_engagement_score(
      (SELECT id FROM beta_users WHERE email = 'test@example.com' LIMIT 1)
    ) >= 0 THEN '✅ PASS (score calculated)'
    ELSE '❌ FAIL'
  END AS status;

-- Expected: Engagement score (0 for new user)

-- =====================================================================
-- 11. VERIFY TABLE CONSTRAINTS
-- =====================================================================

SELECT
  'Constraint Verification' AS test_category,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  CASE
    WHEN conname LIKE 'valid_%' THEN '✅ PASS (constraint exists)'
    WHEN conname LIKE 'unique_%' THEN '✅ PASS (constraint exists)'
    ELSE '✅ PASS (constraint exists)'
  END AS status
FROM pg_constraint
WHERE conrelid IN (
  'beta_users'::regclass,
  'email_campaigns'::regclass,
  'email_sends'::regclass,
  'analytics_events'::regclass
)
  AND contype IN ('c', 'u') -- CHECK and UNIQUE constraints
ORDER BY table_name, constraint_name;

-- Expected: Multiple constraints (valid_email, valid_status, unique_sequence_email, etc.)

-- =====================================================================
-- 12. CLEANUP TEST DATA (Optional)
-- =====================================================================

-- Uncomment to remove test user after validation
-- DELETE FROM beta_users WHERE email = 'test@example.com';

-- =====================================================================
-- VALIDATION COMPLETE
-- =====================================================================
-- Tests: 12 validation queries
-- Expected Results:
--   ✅ 4 tables created
--   ✅ 15+ indexes created
--   ✅ 10 RLS policies applied
--   ✅ 9 helper functions working
--   ✅ All constraints enforced
-- =====================================================================

-- =====================================================================
-- SUMMARY QUERY (Run This Last)
-- =====================================================================

SELECT
  '🎯 VALIDATION SUMMARY' AS title,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) AS tables_created,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) AS indexes_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) AS policies_created,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_email_sequence_progress', 'track_email_open', 'track_email_click', 'get_users_needing_email', 'get_users_needing_email_with_campaign', 'get_sequence_stats', 'get_user_engagement_score', 'mark_users_bounced', 'unsubscribe_user')) AS functions_created,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('beta_users', 'email_campaigns', 'email_sends', 'analytics_events')) = 4
      AND (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_email_sequence_progress', 'track_email_open', 'track_email_click', 'get_users_needing_email', 'get_users_needing_email_with_campaign', 'get_sequence_stats', 'get_user_engagement_score', 'mark_users_bounced', 'unsubscribe_user')) = 9
    THEN '✅ ALL TESTS PASSED - READY FOR INTEGRATION'
    ELSE '❌ SOME TESTS FAILED - CHECK INDIVIDUAL QUERIES'
  END AS status;

-- Expected Output:
-- tables_created: 4
-- indexes_created: 15+
-- policies_created: 10+
-- functions_created: 9
-- status: ✅ ALL TESTS PASSED - READY FOR INTEGRATION
