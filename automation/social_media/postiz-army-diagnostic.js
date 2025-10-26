#!/usr/bin/env node

/**
 * SUPERCLAUDE ARMY: POSTIZ DIAGNOSTIC TOOL
 * 
 * Comprehensive Postiz debugging without requiring sudo
 */

const axios = require('axios');
const { spawn } = require('child_process');

class PostizArmyDiagnostic {
  constructor() {
    this.ports = [3000, 4200, 5432, 6379];
    this.services = {
      3000: 'Postiz Backend',
      4200: 'Postiz Frontend', 
      5432: 'PostgreSQL Database',
      6379: 'Redis Cache'
    };
    this.results = {};
  }

  async runFullDiagnostic() {
    console.log('🚀 SUPERCLAUDE ARMY: POSTIZ DIAGNOSTIC');
    console.log('=====================================\n');

    await this.checkPortsAndServices();
    await this.checkAPIEndpoints();
    await this.checkFrontendResources();
    await this.checkDatabaseConnection();
    await this.generateDiagnosticReport();
    await this.provideSolutions();
  }

  async checkPortsAndServices() {
    console.log('🔍 Phase 1: Port & Service Analysis');
    console.log('-----------------------------------');

    for (const port of this.ports) {
      const service = this.services[port];
      console.log(`Testing ${service} (port ${port})...`);

      try {
        const response = await axios.get(`http://localhost:${port}`, { 
          timeout: 5000,
          validateStatus: () => true // Accept any status
        });

        this.results[port] = {
          status: 'accessible',
          httpStatus: response.status,
          service: service,
          responseTime: response.headers['x-response-time'] || 'N/A'
        };

        console.log(`  ✅ ${service}: HTTP ${response.status} (${response.statusText})`);

      } catch (error) {
        this.results[port] = {
          status: 'error',
          error: error.code || error.message,
          service: service
        };

        console.log(`  ❌ ${service}: ${error.code || error.message}`);
      }
    }
    console.log('');
  }

  async checkAPIEndpoints() {
    console.log('🔍 Phase 2: API Endpoint Analysis');
    console.log('----------------------------------');

    const endpoints = [
      '/api/auth/register',
      '/api/auth/login',
      '/api/health',
      '/api/user',
      '/api/posts',
      '/health',
      '/'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:3000${endpoint}`, {
          timeout: 3000,
          validateStatus: () => true
        });

        const status = response.status;
        const emoji = status === 200 ? '✅' : status === 404 ? '❌' : '⚠️';
        console.log(`  ${emoji} ${endpoint}: HTTP ${status}`);

        if (status === 200 && endpoint === '/') {
          console.log(`     Response: ${response.data.substring(0, 50)}...`);
        }

      } catch (error) {
        console.log(`  🔌 ${endpoint}: Connection failed`);
      }
    }
    console.log('');
  }

  async checkFrontendResources() {
    console.log('🔍 Phase 3: Frontend Resource Analysis');
    console.log('--------------------------------------');

    const frontendTests = [
      { path: '/auth', name: 'Auth Page' },
      { path: '/_next/static', name: 'Static Assets' },
      { path: '/api', name: 'Frontend API Proxy' }
    ];

    for (const test of frontendTests) {
      try {
        const response = await axios.get(`http://localhost:4200${test.path}`, {
          timeout: 5000,
          validateStatus: () => true
        });

        const status = response.status;
        const emoji = status === 200 ? '✅' : '⚠️';
        console.log(`  ${emoji} ${test.name}: HTTP ${status}`);

      } catch (error) {
        console.log(`  ❌ ${test.name}: ${error.code || 'Failed'}`);
      }
    }
    console.log('');
  }

  async checkDatabaseConnection() {
    console.log('🔍 Phase 4: Database Connection Analysis');
    console.log('----------------------------------------');

    // Try to check if PostgreSQL is responding
    try {
      const response = await axios.get('http://localhost:3000/api/db/health', {
        timeout: 3000,
        validateStatus: () => true
      });

      if (response.status === 404) {
        console.log('  ⚠️ Database health endpoint not available');
      } else {
        console.log(`  ✅ Database health: HTTP ${response.status}`);
      }

    } catch (error) {
      console.log('  🔌 Cannot test database connection via API');
    }

    // Check Redis connection
    try {
      const response = await axios.get('http://localhost:3000/api/redis/ping', {
        timeout: 3000,
        validateStatus: () => true
      });

      if (response.status === 404) {
        console.log('  ⚠️ Redis health endpoint not available');
      } else {
        console.log(`  ✅ Redis health: HTTP ${response.status}`);
      }

    } catch (error) {
      console.log('  🔌 Cannot test Redis connection via API');
    }
    console.log('');
  }

  generateDiagnosticReport() {
    console.log('📊 DIAGNOSTIC REPORT');
    console.log('===================');

    const workingServices = Object.values(this.results).filter(r => r.status === 'accessible').length;
    const totalServices = Object.keys(this.results).length;

    console.log(`\n🎯 Service Status: ${workingServices}/${totalServices} accessible`);

    // Categorize issues
    const criticalIssues = [];
    const warnings = [];

    if (!this.results[3000] || this.results[3000].status !== 'accessible') {
      criticalIssues.push('Postiz Backend (port 3000) not accessible');
    }

    if (!this.results[4200] || this.results[4200].status !== 'accessible') {
      criticalIssues.push('Postiz Frontend (port 4200) not accessible');
    }

    if (!this.results[5432] || this.results[5432].status !== 'accessible') {
      warnings.push('PostgreSQL Database (port 5432) not directly accessible');
    }

    if (!this.results[6379] || this.results[6379].status !== 'accessible') {
      warnings.push('Redis Cache (port 6379) not directly accessible');
    }

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => console.log(`  ❌ ${issue}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
    }

    if (criticalIssues.length === 0) {
      console.log('\n✅ No critical issues detected');
    }

    console.log('');
  }

  async provideSolutions() {
    console.log('💡 SUPERCLAUDE ARMY SOLUTIONS');
    console.log('=============================');

    // Analyze results and provide targeted solutions
    const backendWorking = this.results[3000]?.status === 'accessible';
    const frontendWorking = this.results[4200]?.status === 'accessible';

    if (backendWorking && frontendWorking) {
      console.log('\n🎯 ISSUE: API endpoints missing despite services running');
      console.log('📋 SOLUTIONS:');
      console.log('  1. Check Postiz version/image compatibility');
      console.log('  2. Verify environment variables');
      console.log('  3. Check database migrations');
      console.log('  4. Recreate container with correct configuration');

    } else if (!backendWorking && !frontendWorking) {
      console.log('\n🚨 ISSUE: Both services down');
      console.log('📋 SOLUTIONS:');
      console.log('  1. Restart Docker containers');
      console.log('  2. Check Docker logs for errors');
      console.log('  3. Recreate containers entirely');

    } else if (backendWorking && !frontendWorking) {
      console.log('\n⚠️ ISSUE: Backend working, frontend down');
      console.log('📋 SOLUTIONS:');
      console.log('  1. Frontend container issue');
      console.log('  2. Port mapping problem');
      console.log('  3. Environment variable mismatch');

    } else {
      console.log('\n⚠️ ISSUE: Frontend working, backend down');
      console.log('📋 SOLUTIONS:');
      console.log('  1. Backend container issue');
      console.log('  2. Database connection problem');
      console.log('  3. Environment configuration error');
    }

    console.log('\n🚀 NEXT ARMY ACTIONS:');
    console.log('  1. Run sudo commands for detailed container inspection');
    console.log('  2. Check container logs for specific errors');
    console.log('  3. Implement targeted fixes based on findings');
    console.log('  4. Test and validate complete Postiz functionality');
  }

  async generateSudoCommands() {
    console.log('\n🔧 SUDO COMMANDS FOR DETAILED DIAGNOSIS:');
    console.log('========================================');
    
    console.log('\n📊 Container Status:');
    console.log('sudo docker ps --filter "name=untrapd-postiz"');
    
    console.log('\n📋 Container Logs:');
    console.log('sudo docker logs untrapd-postiz');
    console.log('sudo docker logs untrapd-postiz-db'); 
    console.log('sudo docker logs untrapd-postiz-redis');
    
    console.log('\n🔄 Restart Sequence:');
    console.log('sudo docker restart untrapd-postiz-db');
    console.log('sudo docker restart untrapd-postiz-redis');
    console.log('sudo docker restart untrapd-postiz');
    
    console.log('\n🔍 Environment Check:');
    console.log('sudo docker exec untrapd-postiz env | grep -E "DATABASE|REDIS|JWT"');
  }
}

// CLI Usage
if (require.main === module) {
  const diagnostic = new PostizArmyDiagnostic();
  
  diagnostic.runFullDiagnostic()
    .then(() => {
      diagnostic.generateSudoCommands();
      console.log('\n🎯 SuperClaude Army diagnostic complete!');
      console.log('Ready for Phase 2: Sudo-based container investigation');
    })
    .catch((error) => {
      console.error(`❌ Diagnostic failed: ${error.message}`);
    });
}

module.exports = PostizArmyDiagnostic;