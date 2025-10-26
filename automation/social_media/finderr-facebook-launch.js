#!/usr/bin/env node

/**
 * FINDERR FACEBOOK-ONLY LAUNCH
 *
 * Launches Facebook campaign immediately (30 posts over 30 days)
 * Instagram requires media files - will launch separately after assets ready
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class FacebookLauncher {
  constructor() {
    this.ayrshareKey = 'C158E641-E6B341DE-A058943E-A127B0AA';
    this.ayrshareUrl = 'https://app.ayrshare.com/api';
    this.milestoneAPI = 'https://hub.untrapd.com/.netlify/functions/finderr-milestones';
    this.calendarPath = path.join(__dirname, '../../campaign_execution/finderr_v178_launch_calendar.json');
  }

  async loadContentCalendar() {
    const calendarJSON = await fs.readFile(this.calendarPath, 'utf-8');
    return JSON.parse(calendarJSON);
  }

  async fetchMilestoneData() {
    try {
      const response = await axios.get(this.milestoneAPI, { timeout: 10000 });
      return response.data;
    } catch (error) {
      return { totalSubscribers: 150, activeTierName: 'Founder\'s Circle' };
    }
  }

  personalizeContent(content, milestones) {
    let personalized = content;
    personalized = personalized.replace(/\{\{subscriber_count\}\}/g, milestones.totalSubscribers || 150);
    personalized = personalized.replace(/\{\{active_tier\}\}/g, milestones.activeTierName || 'Founder\'s Circle');
    personalized = personalized.replace(/\{\{tier1_remaining\}\}/g, milestones.tiers?.tier1?.remaining || 850);
    return personalized;
  }

  async schedulePost(content, scheduleDate) {
    try {
      const response = await axios.post(`${this.ayrshareUrl}/post`, {
        post: content,
        platforms: ['facebook'],
        scheduleDate: scheduleDate,
        shorten_links: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.ayrshareKey}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async launch() {
    console.log('🚀 FINDERR Facebook Campaign Launch\n');
    console.log('📱 Platform: Facebook only (untrapd hub page)');
    console.log('📅 Duration: 30 days');
    console.log('📝 Posts: ~30 Facebook posts\n');

    const calendar = await this.loadContentCalendar();
    const milestones = await this.fetchMilestoneData();

    console.log(`📊 Current subscribers: ${milestones.totalSubscribers || 150}\n`);

    const results = { scheduled: 0, failed: 0, details: [] };
    const startDate = new Date();

    for (const day of calendar.calendar) {
      const fbPosts = day.posts.filter(p => p.platform === 'facebook');

      if (fbPosts.length === 0) continue;

      console.log(`📅 Day ${day.day}: ${day.theme}`);

      for (const post of fbPosts) {
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(scheduleDate.getDate() + (day.day - 1));

        const [hours, minutes] = post.time.split(':').map(Number);
        scheduleDate.setHours(hours, minutes, 0, 0);

        const personalizedContent = this.personalizeContent(post.content, milestones);

        const result = await this.schedulePost(personalizedContent, scheduleDate.toISOString());

        if (result.success) {
          console.log(`  ✅ Scheduled @ ${scheduleDate.toISOString().split('T')[0]} ${post.time}`);
          results.scheduled++;
        } else {
          console.log(`  ❌ Failed: ${result.error}`);
          results.failed++;
        }

        results.details.push({
          day: day.day,
          scheduleDate: scheduleDate.toISOString(),
          success: result.success
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n📊 LAUNCH SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Scheduled: ${results.scheduled} Facebook posts`);
    console.log(`❌ Failed: ${results.failed} posts`);
    console.log(`📅 Campaign duration: 30 days`);
    console.log(`\n🎯 Facebook campaign is now LIVE!`);
    console.log(`📱 Check: https://www.facebook.com/750014458192598\n`);

    return results;
  }
}

if (require.main === module) {
  const launcher = new FacebookLauncher();
  launcher.launch().catch(console.error);
}

module.exports = FacebookLauncher;
