/**
 * FINDERR Real-Time Statistics API
 *
 * Purpose: Provides real-time subscriber metrics for FINDERR phone security app
 * Used by: Analytics dashboards, social media automation, milestone tracking
 *
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Your Supabase service role key
 * - NODE_ENV: 'production' or 'development'
 *
 * Response Schema:
 * {
 *   totalSubscribers: number,
 *   monthlySubscribers: number,
 *   annualSubscribers: number,
 *   mrr: number (Monthly Recurring Revenue),
 *   arr: number (Annual Recurring Revenue),
 *   freeTrials: number,
 *   activeUsers: number,
 *   churnRate: number (percentage),
 *   lastUpdated: ISO timestamp
 * }
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (production mode)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

// Mock data for development/testing
const MOCK_DATA = {
  totalSubscribers: 847,
  monthlySubscribers: 623,
  annualSubscribers: 224,
  mrr: 4356.77, // $6.99 * 623
  arr: 52281.24, // MRR * 12
  freeTrials: 142,
  activeUsers: 989,
  churnRate: 4.2,
  lastUpdated: new Date().toISOString()
};

/**
 * Calculate metrics from Supabase subscriber data
 *
 * Database Schema Expected:
 * Table: finderr_subscriptions
 * - id: uuid
 * - user_id: uuid
 * - subscription_type: 'monthly' | 'annual' | 'trial'
 * - status: 'active' | 'cancelled' | 'trial' | 'expired'
 * - amount: decimal
 * - created_at: timestamp
 * - cancelled_at: timestamp
 */
async function getProductionStats() {
  try {
    // Query active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('finderr_subscriptions')
      .select('subscription_type, status, amount')
      .eq('status', 'active');

    if (subError) throw subError;

    // Query trial users
    const { data: trials, error: trialError } = await supabase
      .from('finderr_subscriptions')
      .select('id')
      .eq('status', 'trial');

    if (trialError) throw trialError;

    // Query total active users (including trials)
    const { data: users, error: userError } = await supabase
      .from('finderr_subscriptions')
      .select('id')
      .in('status', ['active', 'trial']);

    if (userError) throw userError;

    // Calculate churn rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: cancelled, error: churnError } = await supabase
      .from('finderr_subscriptions')
      .select('id')
      .eq('status', 'cancelled')
      .gte('cancelled_at', thirtyDaysAgo.toISOString());

    if (churnError) throw churnError;

    // Calculate metrics
    const monthlySubscribers = subscriptions.filter(s => s.subscription_type === 'monthly').length;
    const annualSubscribers = subscriptions.filter(s => s.subscription_type === 'annual').length;
    const totalSubscribers = monthlySubscribers + annualSubscribers;

    const mrr = monthlySubscribers * 6.99;
    const arr = (mrr * 12) + (annualSubscribers * 69.99);

    const churnRate = totalSubscribers > 0
      ? ((cancelled.length / totalSubscribers) * 100).toFixed(2)
      : 0;

    return {
      totalSubscribers,
      monthlySubscribers,
      annualSubscribers,
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat(arr.toFixed(2)),
      freeTrials: trials.length,
      activeUsers: users.length,
      churnRate: parseFloat(churnRate),
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching production stats:', error);
    throw error;
  }
}

/**
 * Netlify Function Handler
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let stats;

    // Use production data if Supabase is configured
    if (supabase && process.env.NODE_ENV === 'production') {
      stats = await getProductionStats();
    } else {
      // Use mock data for development
      stats = MOCK_DATA;
      stats.lastUpdated = new Date().toISOString();

      console.log('⚠️  Using mock data. Configure SUPABASE_URL and SUPABASE_KEY for production.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: stats,
        mode: supabase && process.env.NODE_ENV === 'production' ? 'production' : 'development'
      })
    };

  } catch (error) {
    console.error('Stats API Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch statistics',
        message: error.message
      })
    };
  }
};

/**
 * Integration Instructions:
 *
 * 1. Install Supabase client:
 *    npm install @supabase/supabase-js
 *
 * 2. Set environment variables in Netlify:
 *    SUPABASE_URL=https://your-project.supabase.co
 *    SUPABASE_KEY=your-service-role-key
 *    NODE_ENV=production
 *
 * 3. Create Supabase table:
 *    CREATE TABLE finderr_subscriptions (
 *      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *      user_id UUID NOT NULL,
 *      subscription_type TEXT CHECK (subscription_type IN ('monthly', 'annual', 'trial')),
 *      status TEXT CHECK (status IN ('active', 'cancelled', 'trial', 'expired')),
 *      amount DECIMAL(10,2),
 *      created_at TIMESTAMP DEFAULT NOW(),
 *      cancelled_at TIMESTAMP
 *    );
 *
 * 4. Access endpoint:
 *    GET https://your-site.netlify.app/.netlify/functions/stats
 *
 * 5. Response example:
 *    {
 *      "success": true,
 *      "data": {
 *        "totalSubscribers": 847,
 *        "monthlySubscribers": 623,
 *        "annualSubscribers": 224,
 *        "mrr": 4356.77,
 *        "arr": 52281.24,
 *        "freeTrials": 142,
 *        "activeUsers": 989,
 *        "churnRate": 4.2,
 *        "lastUpdated": "2025-01-14T10:30:00.000Z"
 *      },
 *      "mode": "production"
 *    }
 */
