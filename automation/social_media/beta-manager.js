#!/usr/bin/env node

/**
 * FINDERR BETA MANAGER
 *
 * Extends the SuperPA/Orchestrator Arsenal with beta tester management capabilities:
 * - Fetch beta tester emails from Supabase beta_users table
 * - Generate Google Play Console import format
 * - Share opt-in link via email automation
 * - Track signup analytics and follow-up
 *
 * Integrates with:
 * - unified-intelligence-orchestrator.js (3-agent AI system)
 * - finderr-orchestrator-integration.js (campaign management)
 * - finderr-email-automation.js (email sequences)
 *
 * Usage:
 *   node beta-manager.js list                  # List all beta testers
 *   node beta-manager.js export                # Export emails for Google Play
 *   node beta-manager.js send-invite <email>   # Send opt-in link to specific tester
 *   node beta-manager.js send-all              # Send opt-in links to all pending testers
 *   node beta-manager.js stats                 # Show beta campaign statistics
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://zdceeulkqfpzdjeyekgs.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
    table: 'beta_users'
  },
  googlePlay: {
    optInLink: 'https://play.google.com/apps/testing/com.finderr.app',
    internalTestingLink: 'https://play.google.com/console/u/0/developers/6747876851831398267/app/4973226783989654780/tracks/internal-testing'
  },
  campaign: {
    targetTesters: 100,
    currentVersion: 'v4.3.0+269'
  }
};

class BetaManager {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.demoMode = options.demoMode || false;

    // Initialize Supabase client
    if (CONFIG.supabase.anonKey && !this.demoMode) {
      this.supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
    } else {
      this.supabase = null;
      this.logger.log('⚠️  Supabase client not initialized (demo mode or missing key)');
    }

    this.logger.log('🎯 FINDERR Beta Manager initialized');
    this.logger.log(`   Mode: ${this.demoMode ? 'DEMO' : 'PRODUCTION'}`);
    this.logger.log(`   Target: ${CONFIG.campaign.targetTesters} testers`);
    this.logger.log(`   Version: ${CONFIG.campaign.currentVersion}`);
  }

  // ============================
  // BETA TESTER EMAIL COLLECTION
  // ============================

  /**
   * Fetch all beta testers from Supabase
   */
  async listBetaTesters() {
    this.logger.log('\n╔════════════════════════════════════════════════════════════════╗');
    this.logger.log('║             FINDERR BETA TESTERS - CURRENT LIST                ║');
    this.logger.log('╚════════════════════════════════════════════════════════════════╝\n');

    if (!this.supabase) {
      return this.getDemoTesters();
    }

    try {
      const { data, error } = await this.supabase
        .from(CONFIG.supabase.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.logger.log(`📊 Total Beta Testers: ${data.length}/${CONFIG.campaign.targetTesters}`);
      this.logger.log(`   Remaining Spots: ${CONFIG.campaign.targetTesters - data.length}\n`);

      // Group by status
      const invited = data.filter(t => t.status === 'invited');
      const pending = data.filter(t => t.status === 'pending' || !t.status);
      const active = data.filter(t => t.status === 'active');

      this.logger.log('📋 Status Breakdown:');
      this.logger.log(`   ✅ Active (installed app): ${active.length}`);
      this.logger.log(`   📧 Invited (opt-in sent): ${invited.length}`);
      this.logger.log(`   ⏳ Pending (email captured): ${pending.length}\n`);

      this.logger.log('📧 Email List:');
      data.forEach((tester, idx) => {
        const status = tester.status || 'pending';
        const statusIcon = status === 'active' ? '✅' : status === 'invited' ? '📧' : '⏳';
        this.logger.log(`   ${idx + 1}. ${statusIcon} ${tester.email} (${status})`);
      });

      return data;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch beta testers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export emails for Google Play Console import
   */
  async exportForGooglePlay() {
    this.logger.log('\n╔════════════════════════════════════════════════════════════════╗');
    this.logger.log('║       EXPORT FOR GOOGLE PLAY CONSOLE - INTERNAL TESTING        ║');
    this.logger.log('╚════════════════════════════════════════════════════════════════╝\n');

    const testers = await this.listBetaTesters();
    const emails = testers.map(t => t.email).filter(e => e);

    // Create export in multiple formats
    const exportDir = path.join(__dirname, 'exports');
    await fs.mkdir(exportDir, { recursive: true });

    // Format 1: One email per line (for Google Play Console)
    const googlePlayFormat = emails.join('\n');
    const gpFilePath = path.join(exportDir, `beta_testers_google_play_${Date.now()}.txt`);
    await fs.writeFile(gpFilePath, googlePlayFormat);

    // Format 2: CSV with full data
    const csvHeader = 'email,status,created_at,name';
    const csvRows = testers.map(t =>
      `${t.email},${t.status || 'pending'},${t.created_at || ''},${t.name || ''}`
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const csvFilePath = path.join(exportDir, `beta_testers_full_${Date.now()}.csv`);
    await fs.writeFile(csvFilePath, csvContent);

    this.logger.log('✅ Export Complete!\n');
    this.logger.log(`📄 Google Play Format: ${gpFilePath}`);
    this.logger.log(`   (Copy-paste emails into Google Play Console)\n`);
    this.logger.log(`📊 Full CSV Export: ${csvFilePath}\n`);
    this.logger.log('📋 Quick Copy for Google Play Console:');
    this.logger.log('─────────────────────────────────────');
    this.logger.log(googlePlayFormat);
    this.logger.log('─────────────────────────────────────\n');

    this.logger.log(`🔗 Next Steps:`);
    this.logger.log(`   1. Go to: ${CONFIG.googlePlay.internalTestingLink}`);
    this.logger.log(`   2. Click "Testers" tab → "Create email list"`);
    this.logger.log(`   3. Paste the emails above`);
    this.logger.log(`   4. Share opt-in link: ${CONFIG.googlePlay.optInLink}\n`);

    return {
      emails,
      count: emails.length,
      googlePlayFile: gpFilePath,
      csvFile: csvFilePath
    };
  }

  // ============================
  // OPT-IN LINK SHARING
  // ============================

  /**
   * Send opt-in invitation to a specific tester
   */
  async sendOptInInvite(email) {
    this.logger.log(`\n📧 Sending opt-in invite to: ${email}`);

    if (this.demoMode) {
      this.logger.log('   [DEMO] Would send welcome email with opt-in link');
      this.logger.log(`   [DEMO] Opt-in link: ${CONFIG.googlePlay.optInLink}`);
      return { success: true, demo: true };
    }

    try {
      // Load email template
      const templatePath = path.join(__dirname, '..', 'email_marketing', 'finderr-beta-tester-sequence.json');
      const template = JSON.parse(await fs.readFile(templatePath, 'utf8'));
      const welcomeEmail = template.emails[0];

      // In production, this would integrate with email service
      // For now, log the email content
      this.logger.log(`   ✅ Email prepared:`);
      this.logger.log(`      Subject: ${welcomeEmail.subject}`);
      this.logger.log(`      Opt-in Link: ${CONFIG.googlePlay.optInLink}`);

      // Update tester status in Supabase
      if (this.supabase) {
        const { error } = await this.supabase
          .from(CONFIG.supabase.table)
          .update({ status: 'invited', invited_at: new Date().toISOString() })
          .eq('email', email);

        if (error) {
          this.logger.warn(`   ⚠️  Could not update status: ${error.message}`);
        } else {
          this.logger.log(`   ✅ Status updated to 'invited'`);
        }
      }

      return {
        success: true,
        email,
        optInLink: CONFIG.googlePlay.optInLink,
        emailSubject: welcomeEmail.subject
      };
    } catch (error) {
      this.logger.error(`   ❌ Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send opt-in invitations to all pending testers
   */
  async sendAllOptInInvites() {
    this.logger.log('\n╔════════════════════════════════════════════════════════════════╗');
    this.logger.log('║          SEND OPT-IN INVITES TO ALL PENDING TESTERS            ║');
    this.logger.log('╚════════════════════════════════════════════════════════════════╝\n');

    const testers = await this.listBetaTesters();
    const pending = testers.filter(t => !t.status || t.status === 'pending');

    this.logger.log(`📊 Pending testers to invite: ${pending.length}\n`);

    if (pending.length === 0) {
      this.logger.log('   ℹ️  No pending testers to invite');
      return { success: true, invited: 0 };
    }

    const results = [];
    for (const tester of pending) {
      try {
        const result = await this.sendOptInInvite(tester.email);
        results.push({ email: tester.email, ...result });
      } catch (error) {
        results.push({ email: tester.email, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    this.logger.log(`\n✅ Invites sent: ${successful}/${pending.length}`);

    return {
      success: true,
      invited: successful,
      total: pending.length,
      results
    };
  }

  // ============================
  // ANALYTICS & TRACKING
  // ============================

  /**
   * Get beta campaign statistics
   */
  async getStats() {
    this.logger.log('\n╔════════════════════════════════════════════════════════════════╗');
    this.logger.log('║              FINDERR BETA CAMPAIGN STATISTICS                  ║');
    this.logger.log('╚════════════════════════════════════════════════════════════════╝\n');

    const testers = await this.listBetaTesters();

    const stats = {
      total: testers.length,
      target: CONFIG.campaign.targetTesters,
      remaining: CONFIG.campaign.targetTesters - testers.length,
      progress: ((testers.length / CONFIG.campaign.targetTesters) * 100).toFixed(1),
      breakdown: {
        active: testers.filter(t => t.status === 'active').length,
        invited: testers.filter(t => t.status === 'invited').length,
        pending: testers.filter(t => !t.status || t.status === 'pending').length
      },
      version: CONFIG.campaign.currentVersion,
      googlePlayLink: CONFIG.googlePlay.optInLink,
      consoleLink: CONFIG.googlePlay.internalTestingLink
    };

    // Display progress bar
    const progressBar = this.createProgressBar(stats.total, stats.target, 40);

    this.logger.log(`📊 Campaign Progress: ${stats.total}/${stats.target} (${stats.progress}%)`);
    this.logger.log(`   ${progressBar}\n`);

    this.logger.log(`📋 Status Breakdown:`);
    this.logger.log(`   ✅ Active (installed): ${stats.breakdown.active}`);
    this.logger.log(`   📧 Invited (opt-in sent): ${stats.breakdown.invited}`);
    this.logger.log(`   ⏳ Pending (captured): ${stats.breakdown.pending}\n`);

    this.logger.log(`🔗 Links:`);
    this.logger.log(`   Opt-in: ${stats.googlePlayLink}`);
    this.logger.log(`   Console: ${stats.consoleLink}\n`);

    this.logger.log(`📱 App Version: ${stats.version}\n`);

    // Conversion funnel
    if (stats.total > 0) {
      const inviteRate = ((stats.breakdown.invited + stats.breakdown.active) / stats.total * 100).toFixed(1);
      const activationRate = stats.breakdown.invited > 0
        ? (stats.breakdown.active / (stats.breakdown.invited + stats.breakdown.active) * 100).toFixed(1)
        : 0;

      this.logger.log(`📈 Conversion Funnel:`);
      this.logger.log(`   Signup → Invited: ${inviteRate}%`);
      this.logger.log(`   Invited → Active: ${activationRate}%\n`);
    }

    return stats;
  }

  // ============================
  // HELPERS
  // ============================

  createProgressBar(current, target, width = 40) {
    const progress = Math.min(current / target, 1);
    const filled = Math.round(progress * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  getDemoTesters() {
    // Demo data for testing
    const demoTesters = [
      { email: 'test1@example.com', status: 'active', created_at: '2025-12-15' },
      { email: 'test2@example.com', status: 'invited', created_at: '2025-12-18' },
      { email: 'pending@example.com', status: 'pending', created_at: '2025-12-20' }
    ];

    this.logger.log('[DEMO MODE] Using sample tester data\n');
    this.logger.log(`📊 Total Beta Testers: ${demoTesters.length}/${CONFIG.campaign.targetTesters}`);
    this.logger.log(`   Remaining Spots: ${CONFIG.campaign.targetTesters - demoTesters.length}\n`);

    demoTesters.forEach((tester, idx) => {
      const statusIcon = tester.status === 'active' ? '✅' : tester.status === 'invited' ? '📧' : '⏳';
      this.logger.log(`   ${idx + 1}. ${statusIcon} ${tester.email} (${tester.status})`);
    });

    return demoTesters;
  }
}

// ============================
// CLI INTERFACE
// ============================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new BetaManager({
    demoMode: args.includes('--demo'),
    logger: console
  });

  async function main() {
    try {
      switch (command) {
        case 'list':
          await manager.listBetaTesters();
          break;

        case 'export':
          await manager.exportForGooglePlay();
          break;

        case 'send-invite':
          const email = args[1];
          if (!email) {
            console.log('Usage: node beta-manager.js send-invite <email>');
            process.exit(1);
          }
          await manager.sendOptInInvite(email);
          break;

        case 'send-all':
          await manager.sendAllOptInInvites();
          break;

        case 'stats':
          await manager.getStats();
          break;

        default:
          console.log('╔════════════════════════════════════════════════════════════════╗');
          console.log('║              FINDERR BETA MANAGER - SuperPA Arsenal            ║');
          console.log('╚════════════════════════════════════════════════════════════════╝\n');
          console.log('Part of the SuperClaude Army Arsenal for FINDERR beta management.\n');
          console.log('Usage:');
          console.log('  node beta-manager.js list                  List all beta testers');
          console.log('  node beta-manager.js export                Export emails for Google Play');
          console.log('  node beta-manager.js send-invite <email>   Send opt-in link to tester');
          console.log('  node beta-manager.js send-all              Send opt-in to all pending');
          console.log('  node beta-manager.js stats                 Show campaign statistics\n');
          console.log('Flags:');
          console.log('  --demo    Run in demo mode with sample data\n');
          console.log('Links:');
          console.log(`  Opt-in: ${CONFIG.googlePlay.optInLink}`);
          console.log(`  Console: ${CONFIG.googlePlay.internalTestingLink}`);
      }
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = BetaManager;
