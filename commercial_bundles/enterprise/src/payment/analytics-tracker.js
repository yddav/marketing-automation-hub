// Revenue Analytics and Performance Tracking System
// AGENT BRAVO - PAYMENT SYSTEM DEPLOYMENT

const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');
const moment = require('moment');

/**
 * Sales Analytics and Performance Tracking System
 * Tracks revenue, conversions, customer acquisition, and performance metrics
 */
class AnalyticsTracker {
  constructor() {
    this.analyticsPath = path.join(__dirname, '../../data/analytics');
    this.metricsPath = path.join(this.analyticsPath, 'metrics.json');
    this.salesPath = path.join(this.analyticsPath, 'sales.json');
    this.dailyPath = path.join(this.analyticsPath, 'daily_stats.json');
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/analytics.log' }),
        new winston.transports.Console()
      ]
    });

    // Revenue targets and thresholds
    this.targets = {
      daily: {
        conservative: 447,  // $13,445 / 30 days
        optimistic: 763     // $22,905 / 30 days
      },
      monthly: {
        conservative: 13445,
        optimistic: 22905,
        stretch: 62000      // Including services
      }
    };

    // Product configuration
    this.products = {
      starter: { price: 199, originalPrice: 297, tier: 'starter' },
      professional: { price: 299, originalPrice: 497, tier: 'professional' },
      enterprise: { price: 597, originalPrice: 997, tier: 'enterprise' }
    };

    this.initializeAnalytics();
  }

  /**
   * Initialize analytics directories and files
   */
  async initializeAnalytics() {
    try {
      await fs.ensureDir(this.analyticsPath);
      
      // Initialize metrics file
      if (!(await fs.pathExists(this.metricsPath))) {
        await this.resetMetrics();
      }

      // Initialize sales file
      if (!(await fs.pathExists(this.salesPath))) {
        await fs.writeJson(this.salesPath, { sales: [] }, { spaces: 2 });
      }

      // Initialize daily stats
      if (!(await fs.pathExists(this.dailyPath))) {
        await fs.writeJson(this.dailyPath, { daily: {} }, { spaces: 2 });
      }

      this.logger.info('Analytics system initialized');
    } catch (error) {
      this.logger.error('Analytics initialization failed:', error);
    }
  }

  /**
   * Track successful sale
   */
  async trackSale({
    saleId,
    productTier,
    price,
    customerEmail,
    country,
    timestamp
  }) {
    try {
      const saleData = {
        saleId: saleId,
        productTier: productTier,
        price: price,
        customerEmail: customerEmail,
        country: country,
        timestamp: timestamp.toISOString(),
        date: moment(timestamp).format('YYYY-MM-DD'),
        hour: moment(timestamp).hour(),
        dayOfWeek: moment(timestamp).format('dddd')
      };

      // Add to sales log
      await this.addSaleToLog(saleData);

      // Update metrics
      await this.updateMetrics(saleData);

      // Update daily stats
      await this.updateDailyStats(saleData);

      // Check milestones
      await this.checkMilestones();

      this.logger.info('Sale tracked successfully:', {
        sale_id: saleId,
        product_tier: productTier,
        price: price,
        country: country
      });

    } catch (error) {
      this.logger.error('Sale tracking failed:', error);
      throw error;
    }
  }

  /**
   * Track refund
   */
  async trackRefund({
    saleId,
    refundAmount,
    reason
  }) {
    try {
      const refundData = {
        saleId: saleId,
        amount: refundAmount,
        reason: reason,
        timestamp: new Date().toISOString(),
        date: moment().format('YYYY-MM-DD')
      };

      // Load current metrics
      const metrics = await fs.readJson(this.metricsPath);

      // Update refund metrics
      metrics.refunds = metrics.refunds || [];
      metrics.refunds.push(refundData);

      metrics.totalRefunded = (metrics.totalRefunded || 0) + refundAmount;
      metrics.refundCount = (metrics.refundCount || 0) + 1;
      metrics.refundRate = (metrics.refundCount / metrics.totalSales * 100).toFixed(2);

      await fs.writeJson(this.metricsPath, metrics, { spaces: 2 });

      this.logger.info('Refund tracked:', {
        sale_id: saleId,
        refund_amount: refundAmount,
        reason: reason
      });

    } catch (error) {
      this.logger.error('Refund tracking failed:', error);
    }
  }

  /**
   * Add sale to detailed log
   */
  async addSaleToLog(saleData) {
    const salesData = await fs.readJson(this.salesPath);
    salesData.sales.push(saleData);
    await fs.writeJson(this.salesPath, salesData, { spaces: 2 });
  }

  /**
   * Update main metrics
   */
  async updateMetrics(saleData) {
    const metrics = await fs.readJson(this.metricsPath);

    // Update totals
    metrics.totalRevenue += saleData.price;
    metrics.totalSales += 1;

    // Update tier breakdown
    metrics.tierBreakdown[saleData.productTier] = metrics.tierBreakdown[saleData.productTier] || {
      count: 0,
      revenue: 0
    };
    metrics.tierBreakdown[saleData.productTier].count += 1;
    metrics.tierBreakdown[saleData.productTier].revenue += saleData.price;

    // Update country breakdown
    metrics.countryBreakdown[saleData.country] = (metrics.countryBreakdown[saleData.country] || 0) + 1;

    // Update averages
    metrics.averageOrderValue = metrics.totalRevenue / metrics.totalSales;

    // Update timestamps
    metrics.lastSale = saleData.timestamp;
    metrics.lastUpdated = new Date().toISOString();

    await fs.writeJson(this.metricsPath, metrics, { spaces: 2 });
  }

  /**
   * Update daily statistics
   */
  async updateDailyStats(saleData) {
    const dailyData = await fs.readJson(this.dailyPath);
    const date = saleData.date;

    // Initialize day if doesn't exist
    if (!dailyData.daily[date]) {
      dailyData.daily[date] = {
        date: date,
        revenue: 0,
        sales: 0,
        tierBreakdown: {
          starter: { count: 0, revenue: 0 },
          professional: { count: 0, revenue: 0 },
          enterprise: { count: 0, revenue: 0 }
        },
        hourlyBreakdown: Array(24).fill().map((_, i) => ({ hour: i, sales: 0, revenue: 0 }))
      };
    }

    const dayStats = dailyData.daily[date];

    // Update day totals
    dayStats.revenue += saleData.price;
    dayStats.sales += 1;

    // Update tier breakdown
    dayStats.tierBreakdown[saleData.productTier].count += 1;
    dayStats.tierBreakdown[saleData.productTier].revenue += saleData.price;

    // Update hourly breakdown
    dayStats.hourlyBreakdown[saleData.hour].sales += 1;
    dayStats.hourlyBreakdown[saleData.hour].revenue += saleData.price;

    await fs.writeJson(this.dailyPath, dailyData, { spaces: 2 });
  }

  /**
   * Check and log milestone achievements
   */
  async checkMilestones() {
    try {
      const metrics = await fs.readJson(this.metricsPath);
      const milestones = [
        { amount: 1000, message: 'First $1K milestone reached!' },
        { amount: 5000, message: '$5K milestone - Momentum building!' },
        { amount: 10000, message: '$10K milestone - Conservative target nearly reached!' },
        { amount: 13445, message: '🎯 CONSERVATIVE TARGET ACHIEVED! ($13,445)' },
        { amount: 20000, message: '$20K milestone - Exceeding expectations!' },
        { amount: 22905, message: '🚀 OPTIMISTIC TARGET ACHIEVED! ($22,905)' },
        { amount: 30000, message: '$30K milestone - Outstanding performance!' },
        { amount: 50000, message: '$50K milestone - Exceptional results!' },
        { amount: 62000, message: '💰 STRETCH TARGET ACHIEVED! ($62K with services)' }
      ];

      for (const milestone of milestones) {
        if (metrics.totalRevenue >= milestone.amount && !metrics.milestonesReached.includes(milestone.amount)) {
          metrics.milestonesReached.push(milestone.amount);
          
          this.logger.info('MILESTONE ACHIEVED:', {
            amount: milestone.amount,
            message: milestone.message,
            current_revenue: metrics.totalRevenue,
            total_sales: metrics.totalSales
          });

          // Send milestone notification
          await this.sendMilestoneNotification(milestone, metrics);
        }
      }

      await fs.writeJson(this.metricsPath, metrics, { spaces: 2 });

    } catch (error) {
      this.logger.error('Milestone check failed:', error);
    }
  }

  /**
   * Send milestone notification
   */
  async sendMilestoneNotification(milestone, metrics) {
    try {
      const EmailService = require('../services/email-service');
      const emailService = new EmailService();

      const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL;
      if (!adminEmail) return;

      await emailService.sendEmail({
        to: adminEmail,
        subject: `🎯 MILESTONE ACHIEVED: ${milestone.message}`,
        template: 'milestone-notification',
        variables: {
          milestone_amount: milestone.amount,
          milestone_message: milestone.message,
          current_revenue: metrics.totalRevenue,
          total_sales: metrics.totalSales,
          average_order_value: metrics.averageOrderValue.toFixed(2),
          tier_breakdown: JSON.stringify(metrics.tierBreakdown, null, 2),
          achievement_date: new Date().toLocaleDateString()
        }
      });

    } catch (error) {
      this.logger.error('Milestone notification failed:', error);
    }
  }

  /**
   * Get current analytics dashboard data
   */
  async getDashboardData() {
    try {
      const metrics = await fs.readJson(this.metricsPath);
      const dailyData = await fs.readJson(this.dailyPath);
      
      // Calculate today's stats
      const today = moment().format('YYYY-MM-DD');
      const todayStats = dailyData.daily[today] || {
        revenue: 0,
        sales: 0,
        tierBreakdown: { starter: { count: 0, revenue: 0 }, professional: { count: 0, revenue: 0 }, enterprise: { count: 0, revenue: 0 } }
      };

      // Calculate progress towards targets
      const daysElapsed = moment().diff(moment().startOf('month'), 'days') + 1;
      const monthlyProgress = (metrics.totalRevenue / this.targets.monthly.conservative * 100).toFixed(1);
      const dailyTarget = this.targets.daily.conservative;
      const dailyProgress = (todayStats.revenue / dailyTarget * 100).toFixed(1);

      // Get last 7 days data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        return dailyData.daily[date] || { date, revenue: 0, sales: 0 };
      }).reverse();

      return {
        // Current totals
        totalRevenue: metrics.totalRevenue,
        totalSales: metrics.totalSales,
        averageOrderValue: metrics.averageOrderValue,
        refundRate: metrics.refundRate || 0,
        
        // Today's performance
        today: {
          revenue: todayStats.revenue,
          sales: todayStats.sales,
          progressToDaily: dailyProgress,
          tierBreakdown: todayStats.tierBreakdown
        },

        // Monthly performance
        monthly: {
          revenue: metrics.totalRevenue,
          sales: metrics.totalSales,
          progressToConservative: monthlyProgress,
          daysElapsed: daysElapsed,
          dailyAverage: (metrics.totalRevenue / daysElapsed).toFixed(2)
        },

        // Targets and projections
        targets: this.targets,
        projections: {
          monthlyProjection: (metrics.totalRevenue / daysElapsed * 30).toFixed(0),
          onTrackForConservative: monthlyProgress >= (daysElapsed / 30 * 100),
          onTrackForOptimistic: monthlyProgress >= (daysElapsed / 30 * 100 * this.targets.monthly.optimistic / this.targets.monthly.conservative)
        },

        // Tier performance
        tierBreakdown: metrics.tierBreakdown,
        
        // Geographic breakdown
        countryBreakdown: metrics.countryBreakdown,

        // Recent performance
        last7Days: last7Days,

        // Milestones
        milestonesReached: metrics.milestonesReached,
        nextMilestone: this.getNextMilestone(metrics.totalRevenue),

        // Metadata
        lastUpdated: metrics.lastUpdated,
        startDate: metrics.startDate
      };

    } catch (error) {
      this.logger.error('Dashboard data generation failed:', error);
      throw error;
    }
  }

  /**
   * Get next milestone
   */
  getNextMilestone(currentRevenue) {
    const milestones = [1000, 5000, 10000, 13445, 20000, 22905, 30000, 50000, 62000];
    
    for (const milestone of milestones) {
      if (currentRevenue < milestone) {
        const remaining = milestone - currentRevenue;
        return {
          amount: milestone,
          remaining: remaining,
          progressPercent: ((currentRevenue / milestone) * 100).toFixed(1)
        };
      }
    }

    return {
      amount: 100000,
      remaining: 100000 - currentRevenue,
      progressPercent: ((currentRevenue / 100000) * 100).toFixed(1)
    };
  }

  /**
   * Generate sales report
   */
  async generateSalesReport(timeframe = '30d') {
    try {
      const endDate = moment();
      const startDate = moment().subtract(parseInt(timeframe), 'days');
      
      const salesData = await fs.readJson(this.salesPath);
      const metrics = await fs.readJson(this.metricsPath);

      // Filter sales by timeframe
      const filteredSales = salesData.sales.filter(sale => {
        const saleDate = moment(sale.timestamp);
        return saleDate.isBetween(startDate, endDate, null, '[]');
      });

      // Calculate report metrics
      const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price, 0);
      const totalSales = filteredSales.length;
      const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Tier breakdown
      const tierBreakdown = filteredSales.reduce((acc, sale) => {
        if (!acc[sale.productTier]) {
          acc[sale.productTier] = { count: 0, revenue: 0 };
        }
        acc[sale.productTier].count += 1;
        acc[sale.productTier].revenue += sale.price;
        return acc;
      }, {});

      // Country breakdown
      const countryBreakdown = filteredSales.reduce((acc, sale) => {
        acc[sale.country] = (acc[sale.country] || 0) + 1;
        return acc;
      }, {});

      // Daily breakdown
      const dailyBreakdown = filteredSales.reduce((acc, sale) => {
        if (!acc[sale.date]) {
          acc[sale.date] = { revenue: 0, sales: 0 };
        }
        acc[sale.date].revenue += sale.price;
        acc[sale.date].sales += 1;
        return acc;
      }, {});

      return {
        timeframe: timeframe,
        period: {
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD')
        },
        summary: {
          totalRevenue: totalRevenue,
          totalSales: totalSales,
          averageOrderValue: avgOrderValue.toFixed(2),
          conversionRate: 'N/A', // Would need traffic data
          refundRate: metrics.refundRate || 0
        },
        breakdown: {
          byTier: tierBreakdown,
          byCountry: countryBreakdown,
          byDay: dailyBreakdown
        },
        topProducts: Object.entries(tierBreakdown)
          .sort(([,a], [,b]) => b.revenue - a.revenue)
          .map(([tier, data]) => ({ tier, ...data })),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Sales report generation failed:', error);
      throw error;
    }
  }

  /**
   * Reset analytics (for testing or new launches)
   */
  async resetMetrics() {
    const initialMetrics = {
      totalRevenue: 0,
      totalSales: 0,
      averageOrderValue: 0,
      refundRate: 0,
      totalRefunded: 0,
      refundCount: 0,
      tierBreakdown: {
        starter: { count: 0, revenue: 0 },
        professional: { count: 0, revenue: 0 },
        enterprise: { count: 0, revenue: 0 }
      },
      countryBreakdown: {},
      milestonesReached: [],
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      lastSale: null
    };

    await fs.writeJson(this.metricsPath, initialMetrics, { spaces: 2 });
    this.logger.info('Analytics metrics reset');
  }
}

module.exports = AnalyticsTracker;