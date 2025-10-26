#!/usr/bin/env node

/**
 * POSTIZ CLI ACCOUNT CREATOR
 * 
 * Create admin account via API calls and database inspection
 */

const axios = require('axios');
const { spawn } = require('child_process');

class PostizCLIAccountCreator {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.credentials = {
      email: 'untrapd77@gmail.com',
      password: 'UNTRAPDHub2025!',
      name: 'UNTRAPD Hub Admin',
      organization: 'UNTRAPD Hub'
    };
  }

  async checkBackendHealth() {
    console.log('🔍 Checking Postiz backend health...');
    
    try {
      const response = await axios.get(`${this.baseURL}/`, { timeout: 5000 });
      console.log(`✅ Backend responding: HTTP ${response.status}`);
      return true;
    } catch (error) {
      console.log(`❌ Backend not accessible: ${error.message}`);
      return false;
    }
  }

  async tryDirectRegistration() {
    console.log('🔧 Attempting direct API registration...');
    
    const endpoints = [
      '/api/auth/register',
      '/auth/register', 
      '/register',
      '/api/register',
      '/api/user/register'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`  Testing: ${endpoint}`);
        
        const response = await axios.post(`${this.baseURL}${endpoint}`, this.credentials, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log(`✅ Registration successful at ${endpoint}!`);
        console.log('📧 Account created:', this.credentials.email);
        return { success: true, endpoint, data: response.data };

      } catch (error) {
        const status = error.response?.status || 'Connection Error';
        const message = error.response?.data?.message || error.message;
        console.log(`  ⚠️ ${endpoint}: ${status} - ${message}`);
      }
    }

    return { success: false };
  }

  async tryDirectLogin() {
    console.log('🔐 Testing login with existing credentials...');
    
    const endpoints = [
      '/api/auth/login',
      '/auth/login',
      '/login',
      '/api/login'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`  Testing: ${endpoint}`);
        
        const response = await axios.post(`${this.baseURL}${endpoint}`, {
          email: this.credentials.email,
          password: this.credentials.password
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log(`✅ Login successful at ${endpoint}!`);
        console.log('🎉 Account exists and credentials work');
        return { success: true, endpoint, data: response.data };

      } catch (error) {
        const status = error.response?.status || 'Connection Error';
        const message = error.response?.data?.message || error.message;
        console.log(`  ⚠️ ${endpoint}: ${status} - ${message}`);
      }
    }

    return { success: false };
  }

  async scanAPIRoutes() {
    console.log('🔍 Scanning available API routes...');
    
    const commonRoutes = [
      '/',
      '/api',
      '/health',
      '/api/health',
      '/status',
      '/api/status',
      '/docs',
      '/api/docs',
      '/swagger',
      '/api/swagger'
    ];

    const availableRoutes = [];

    for (const route of commonRoutes) {
      try {
        const response = await axios.get(`${this.baseURL}${route}`, { 
          timeout: 3000,
          validateStatus: () => true 
        });
        
        if (response.status !== 404) {
          availableRoutes.push({
            route,
            status: response.status,
            contentType: response.headers['content-type'],
            hasData: !!response.data
          });
          console.log(`  ✅ ${route}: HTTP ${response.status}`);
        }
      } catch (error) {
        // Ignore connection errors for scanning
      }
    }

    return availableRoutes;
  }

  async provideSudoCommands() {
    console.log('\n🔧 SUDO COMMANDS FOR MANUAL ACCOUNT CREATION:');
    console.log('============================================');
    
    console.log('\n📊 1. Check container status:');
    console.log('sudo docker ps --filter "name=untrapd-postiz"');
    
    console.log('\n📋 2. Access Postiz container directly:');
    console.log('sudo docker exec -it untrapd-postiz sh');
    
    console.log('\n🗄️ 3. Access PostgreSQL database:');
    console.log('sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz');
    
    console.log('\n👤 4. Create admin user via SQL:');
    console.log(`sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c \\
  "INSERT INTO users (email, password, name, role, created_at, updated_at) \\
   VALUES ('${this.credentials.email}', \\
           crypt('${this.credentials.password}', gen_salt('bf')), \\
           '${this.credentials.name}', 'admin', NOW(), NOW());"`);
    
    console.log('\n🔍 5. Verify account creation:');
    console.log(`sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c \\
  "SELECT id, email, name, role, created_at FROM users WHERE email = '${this.credentials.email}';"`);
    
    console.log('\n🌐 6. Test frontend access:');
    console.log('curl -v http://localhost:4200/');
    
    console.log('\n⚙️ 7. Check backend API:');
    console.log('curl -v http://localhost:3000/');
  }

  async runFullDiagnosis() {
    console.log('🚀 POSTIZ CLI ACCOUNT CREATOR');
    console.log('=============================\n');

    // Step 1: Backend health check
    const backendHealthy = await this.checkBackendHealth();
    if (!backendHealthy) {
      console.log('\n❌ Backend not accessible - cannot proceed with API methods');
      this.provideSudoCommands();
      return;
    }

    // Step 2: Scan available routes
    console.log('\n🔍 Step 2: API Route Discovery');
    const routes = await this.scanAPIRoutes();
    
    if (routes.length === 0) {
      console.log('⚠️ No API routes found - backend may not be fully initialized');
    }

    // Step 3: Try registration
    console.log('\n🔧 Step 3: Account Registration Attempt');
    const registerResult = await this.tryDirectRegistration();
    
    if (registerResult.success) {
      console.log('\n🎉 SUCCESS: Account created via API!');
      return { success: true, method: 'api_registration' };
    }

    // Step 4: Try login (maybe account already exists)
    console.log('\n🔐 Step 4: Login Test (Account May Exist)');
    const loginResult = await this.tryDirectLogin();
    
    if (loginResult.success) {
      console.log('\n🎉 SUCCESS: Account exists and credentials work!');
      return { success: true, method: 'api_login' };
    }

    // Step 5: Provide manual options
    console.log('\n⚠️ API methods failed - providing manual options');
    this.provideSudoCommands();
    
    console.log('\n💡 ALTERNATIVE APPROACHES:');
    console.log('1. Try manual GUI signup at http://localhost:4200/auth');
    console.log('2. Use sudo commands above for direct database access');
    console.log('3. Restart containers and retry');
    console.log('4. Check if Postiz requires different initialization');

    return { success: false, method: 'manual_required' };
  }
}

// CLI Usage
if (require.main === module) {
  const creator = new PostizCLIAccountCreator();
  
  creator.runFullDiagnosis()
    .then((result) => {
      console.log('\n📊 FINAL RESULT:');
      console.log(result);
      
      if (result.success) {
        console.log('\n🚀 READY FOR NEXT STEP: Connect social media accounts');
        console.log('Visit: http://localhost:4200');
      } else {
        console.log('\n🔧 MANUAL INTERVENTION REQUIRED');
        console.log('Use sudo commands provided above');
      }
    })
    .catch((error) => {
      console.error(`❌ Diagnosis failed: ${error.message}`);
    });
}

module.exports = PostizCLIAccountCreator;