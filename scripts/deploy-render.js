#!/usr/bin/env node

/**
 * Automated Render Deployment Script
 * Deploys Marketing Automation Hub to Render using their API
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const RENDER_API_BASE = 'https://api.render.com/v1';
const GITHUB_REPO = process.env.GITHUB_REPO || 'yddav/marketing-automation-hub';
const SERVICE_NAME = 'marketing-automation-hub';
const DB_NAME = 'marketing-automation-db';

class RenderDeployer {
  constructor(apiKey) {
    if (!apiKey) {
      console.error('❌ RENDER_API_KEY environment variable required');
      console.log('Get your API key from: https://dashboard.render.com/account/api-keys');
      process.exit(1);
    }
    
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    
    this.deploymentConfig = {
      database: null,
      webService: null,
      databaseUrl: null
    };
  }

  async makeRequest(method, endpoint, data = null) {
    try {
      const url = `${RENDER_API_BASE}${endpoint}`;
      console.log(`🔄 ${method.toUpperCase()} ${url}`);
      
      const response = await axios({
        method,
        url,
        headers: this.headers,
        data
      });
      
      return response.data;
    } catch (error) {
      console.error(`❌ Request failed: ${error.response?.data?.message || error.message}`);
      if (error.response?.data) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async createDatabase() {
    console.log('\n📊 Creating PostgreSQL database...');
    
    const dbConfig = {
      type: 'pserv',
      name: DB_NAME,
      plan: 'free',
      databaseName: 'marketing_automation_hub',
      databaseUser: 'marketing_user',
      region: 'oregon'
    };

    try {
      const database = await this.makeRequest('POST', '/services', dbConfig);
      console.log(`✅ Database created: ${database.service.id}`);
      
      this.deploymentConfig.database = database.service;
      
      // Wait for database to initialize
      console.log('⏳ Waiting for database initialization...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      return database.service;
    } catch (error) {
      console.error('❌ Failed to create database');
      throw error;
    }
  }

  async createWebService() {
    console.log('\n🌐 Creating web service...');
    
    const serviceConfig = {
      type: 'web_service',
      name: SERVICE_NAME,
      repo: `https://github.com/${GITHUB_REPO}`,
      branch: 'clean-deployment',
      plan: 'free',
      buildCommand: 'npm install',
      startCommand: 'npm start',
      healthCheckPath: '/health',
      region: 'oregon',
      envVars: this.generateEnvVars()
    };

    try {
      const webService = await this.makeRequest('POST', '/services', serviceConfig);
      console.log(`✅ Web service created: ${webService.service.id}`);
      console.log(`🌐 Service URL: ${webService.service.serviceDetails.url}`);
      
      this.deploymentConfig.webService = webService.service;
      return webService.service;
    } catch (error) {
      console.error('❌ Failed to create web service');
      throw error;
    }
  }

  generateEnvVars() {
    const envVars = [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'PORT', value: '10000' },
      { key: 'APP_NAME', value: 'Marketing Automation Hub' },
      { key: 'JWT_SECRET', value: this.generateSecureSecret() },
      { key: 'JWT_EXPIRES_IN', value: '7d' }
    ];

    // Add database URL placeholder
    envVars.push({ key: 'DATABASE_URL', value: 'postgres://placeholder' });

    // Add placeholder API keys
    envVars.push(
      { key: 'STRIPE_PUBLISHABLE_KEY', value: 'pk_test_REPLACE_WITH_YOUR_KEY' },
      { key: 'STRIPE_SECRET_KEY', value: 'sk_test_REPLACE_WITH_YOUR_KEY' },
      { key: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_REPLACE_WITH_YOUR_SECRET' },
      { key: 'SENDGRID_API_KEY', value: 'SG.REPLACE_WITH_YOUR_KEY' },
      { key: 'SENDGRID_FROM_EMAIL', value: 'noreply@yourdomain.com' }
    );

    return envVars;
  }

  generateSecureSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async waitForDeployment(serviceId) {
    console.log('\n⏳ Waiting for deployment to complete...');
    
    const maxAttempts = 30; // 15 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const service = await this.makeRequest('GET', `/services/${serviceId}`);
        const status = service.service.serviceDetails?.deployStatus;
        
        console.log(`📊 Deployment status: ${status}`);
        
        if (status === 'live') {
          console.log('✅ Deployment completed successfully!');
          return service.service;
        } else if (status === 'build_failed' || status === 'update_failed') {
          throw new Error(`Deployment failed with status: ${status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 30000));
        attempts++;
      } catch (error) {
        console.error(`❌ Error checking deployment status: ${error.message}`);
        attempts++;
      }
    }
    
    throw new Error('Deployment timeout - check Render dashboard for details');
  }

  async verifyDeployment(serviceUrl) {
    console.log('\n🧪 Verifying deployment...');
    
    const maxRetries = 10;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        console.log(`🔍 Testing health endpoint (attempt ${retries + 1}/${maxRetries})`);
        const response = await axios.get(`${serviceUrl}/health`, { timeout: 10000 });
        
        if (response.status === 200) {
          console.log('✅ Health check passed!');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Service not ready yet, waiting... (${error.message})`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 15000));
      retries++;
    }
    
    console.log('⚠️ Verification incomplete, but deployment may still be successful');
    return false;
  }

  async deploy() {
    console.log('🚀 Starting automated Render deployment...');
    console.log(`📦 Repository: ${GITHUB_REPO}`);
    console.log(`🎯 Service: ${SERVICE_NAME}`);
    
    try {
      // Create database
      const database = await this.createDatabase();
      
      // Create web service
      const webService = await this.createWebService();
      
      // Wait for deployment
      const deployedService = await this.waitForDeployment(webService.id);
      const serviceUrl = deployedService.serviceDetails.url;
      
      // Verify deployment
      const verified = await this.verifyDeployment(serviceUrl);
      
      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('🎉 DEPLOYMENT COMPLETE!');
      console.log('='.repeat(60));
      console.log(`🌐 Service URL: ${serviceUrl}`);
      console.log(`🗄️ Database: ${database.name}`);
      console.log(`✅ Status: ${verified ? 'Verified' : 'Deployed (verification pending)'}`);
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Update API keys in Render dashboard');
      console.log('2. Test the deployment:');
      console.log(`   curl ${serviceUrl}/health`);
      
      return {
        serviceUrl,
        databaseId: database.id,
        webServiceId: webService.id,
        verified
      };
      
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const apiKey = process.env.RENDER_API_KEY;
  
  if (!apiKey) {
    console.log('\n🔑 RENDER API KEY REQUIRED');
    console.log('Go to: https://dashboard.render.com/account/api-keys');
    process.exit(1);
  }
  
  const deployer = new RenderDeployer(apiKey);
  
  try {
    await deployer.deploy();
    console.log('\n🎯 Deployment successful!');
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = RenderDeployer;