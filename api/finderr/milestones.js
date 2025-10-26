/**
 * FINDERR Milestone Tracking API
 *
 * Purpose: Track subscriber milestones and trigger celebration automation
 * Used by: Social media automation, celebration campaigns, achievement tracking
 *
 * Environment Variables Required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Your Supabase service role key
 * - NODE_ENV: 'production' or 'development'
 *
 * Response Schema:
 * {
 *   currentSubscribers: number,
 *   currentMilestone: number,
 *   nextMilestone: number,
 *   progressPercentage: number,
 *   milestonesReached: number[],
 *   celebrationMessage: string,
 *   socialMediaReady: boolean
 * }
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

// Milestone definitions
const MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

const CELEBRATION_MESSAGES = {
  100: "🎉 FINDERR just hit 100 subscribers! Thank you for trusting us with your phone security!",
  500: "🚀 500 users protecting their phones with FINDERR! The community is growing!",
  1000: "💪 1,000 subscribers strong! FINDERR is becoming the Android security standard!",
  2500: "🔥 2,500 users secured! Your trust drives our mission to protect every Android device!",
  5000: "⭐ 5K milestone reached! FINDERR is officially a movement in phone security!",
  10000: "🎯 10,000 subscribers! A massive thank you to our incredible community!",
  25000: "🌟 25K users protected! FINDERR is reshaping Android security at scale!",
  50000: "💎 50,000 subscribers! This is just the beginning of mobile security revolution!",
  100000: "🏆 100K MILESTONE! FINDERR is now the premier Android security solution!"
};

// Mock data for development
const MOCK_CURRENT_SUBSCRIBERS = 847;

/**
 * Get current subscriber count from Supabase
 */
async function getCurrentSubscriberCount() {
  try {
    const { count, error } = await supabase
      .from('finderr_subscriptions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['active', 'trial']);

    if (error) throw error;

    return count || 0;

  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    throw error;
  }
}

/**
 * Get reached milestones from database
 */
async function getReachedMilestones() {
  try {
    const { data, error } = await supabase
      .from('finderr_milestones')
      .select('milestone, reached_at')
      .order('milestone', { ascending: true });

    if (error) {
      // Table might not exist yet, return empty array
      console.warn('Milestones table not found, returning empty array');
      return [];
    }

    return data.map(m => m.milestone);

  } catch (error) {
    console.error('Error fetching reached milestones:', error);
    return [];
  }
}

/**
 * Record a new milestone in the database
 */
async function recordMilestone(milestone, subscriberCount) {
  try {
    const { error } = await supabase
      .from('finderr_milestones')
      .insert({
        milestone,
        subscriber_count: subscriberCount,
        reached_at: new Date().toISOString()
      });

    if (error) throw error;

    console.log(`✅ Milestone ${milestone} recorded!`);
    return true;

  } catch (error) {
    console.error('Error recording milestone:', error);
    return false;
  }
}

/**
 * Calculate milestone progress and status
 */
function calculateMilestoneProgress(currentSubscribers, reachedMilestones = []) {
  // Find current milestone (last reached)
  const currentMilestone = reachedMilestones.length > 0
    ? Math.max(...reachedMilestones)
    : 0;

  // Find next milestone
  const nextMilestone = MILESTONES.find(m => m > currentSubscribers) || MILESTONES[MILESTONES.length - 1];

  // Calculate progress percentage
  const previousMilestone = currentMilestone || 0;
  const range = nextMilestone - previousMilestone;
  const progress = currentSubscribers - previousMilestone;
  const progressPercentage = range > 0 ? ((progress / range) * 100).toFixed(2) : 100;

  // Check if we just reached a new milestone
  const justReached = MILESTONES.find(m =>
    m === currentSubscribers && !reachedMilestones.includes(m)
  );

  return {
    currentSubscribers,
    currentMilestone,
    nextMilestone,
    progressPercentage: parseFloat(progressPercentage),
    milestonesReached: reachedMilestones,
    justReached: justReached || null,
    celebrationMessage: justReached
      ? CELEBRATION_MESSAGES[justReached]
      : `On track to ${nextMilestone} subscribers!`,
    socialMediaReady: !!justReached
  };
}

/**
 * Netlify Function Handler
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    let currentSubscribers;
    let reachedMilestones = [];

    // Get data from Supabase or use mock
    if (supabase && process.env.NODE_ENV === 'production') {
      currentSubscribers = await getCurrentSubscriberCount();
      reachedMilestones = await getReachedMilestones();
    } else {
      currentSubscribers = MOCK_CURRENT_SUBSCRIBERS;
      // Mock reached milestones based on current count
      reachedMilestones = MILESTONES.filter(m => m < currentSubscribers);
      console.log('⚠️  Using mock data. Configure SUPABASE_URL and SUPABASE_KEY for production.');
    }

    // Calculate milestone progress
    const milestoneData = calculateMilestoneProgress(currentSubscribers, reachedMilestones);

    // If we just reached a new milestone, record it
    if (milestoneData.justReached && supabase && process.env.NODE_ENV === 'production') {
      await recordMilestone(milestoneData.justReached, currentSubscribers);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: milestoneData,
        mode: supabase && process.env.NODE_ENV === 'production' ? 'production' : 'development'
      })
    };

  } catch (error) {
    console.error('Milestones API Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch milestone data',
        message: error.message
      })
    };
  }
};

/**
 * Integration Instructions:
 *
 * 1. Create Supabase milestones table:
 *    CREATE TABLE finderr_milestones (
 *      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *      milestone INTEGER NOT NULL,
 *      subscriber_count INTEGER NOT NULL,
 *      reached_at TIMESTAMP DEFAULT NOW(),
 *      social_post_sent BOOLEAN DEFAULT FALSE,
 *      UNIQUE(milestone)
 *    );
 *
 * 2. Access endpoint:
 *    GET https://your-site.netlify.app/.netlify/functions/milestones
 *
 * 3. Response example:
 *    {
 *      "success": true,
 *      "data": {
 *        "currentSubscribers": 847,
 *        "currentMilestone": 500,
 *        "nextMilestone": 1000,
 *        "progressPercentage": 69.4,
 *        "milestonesReached": [100, 500],
 *        "justReached": null,
 *        "celebrationMessage": "On track to 1000 subscribers!",
 *        "socialMediaReady": false
 *      },
 *      "mode": "production"
 *    }
 *
 * 4. When milestone is reached (socialMediaReady: true):
 *    {
 *      "currentSubscribers": 1000,
 *      "justReached": 1000,
 *      "celebrationMessage": "💪 1,000 subscribers strong! FINDERR is becoming...",
 *      "socialMediaReady": true
 *    }
 *
 * 5. Integration with social media automation:
 *    - Check this endpoint periodically (every 30 minutes)
 *    - When socialMediaReady is true, trigger social post
 *    - Use celebrationMessage as post content
 *    - Mark social_post_sent = true in database
 */
