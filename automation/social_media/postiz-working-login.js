#!/usr/bin/env node

const axios = require('axios');

async function loginToPostiz() {
    console.log('🔐 Testing Postiz Login with Working API Method');
    console.log('===============================================\n');

    const baseUrl = 'http://localhost:3000';
    
    // Test accounts to try
    const accounts = [
        { email: 'admin@untrapd.hub', password: 'UNTRAPDHub2025!', name: 'GUI Account' },
        { email: 'untrapd77@gmail.com', password: 'UNTRAPDHub2025!', name: 'Manual DB Account' }
    ];

    for (const account of accounts) {
        console.log(`\n🔍 Testing ${account.name}: ${account.email}`);
        
        try {
            const response = await axios.post(`${baseUrl}/auth/login`, {
                email: account.email,
                password: account.password,
                provider: 'LOCAL'
            }, {
                withCredentials: true,
                timeout: 5000
            });

            console.log('✅ LOGIN SUCCESS!');
            console.log('Response:', response.data);
            console.log('Auth Cookie:', response.headers['set-cookie']?.[0]?.substring(0, 100) + '...');
            
            // Test a protected endpoint
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                try {
                    const protectedTest = await axios.get(`${baseUrl}/`, {
                        headers: {
                            'Cookie': cookies.join('; ')
                        }
                    });
                    console.log('✅ Authenticated request successful');
                } catch (protErr) {
                    console.log('⚠️ Authenticated request failed, but login worked');
                }
            }
            
            console.log('\n🎉 WORKING ACCOUNT FOUND:', account.email);
            console.log('Password:', account.password);
            console.log('Provider: LOCAL');
            return; // Exit on first success
            
        } catch (error) {
            const status = error.response?.status || 'TIMEOUT/NETWORK';
            const message = error.response?.data?.message || error.message;
            console.log(`❌ Login failed [${status}]: ${message}`);
        }
    }
    
    console.log('\n🔧 No working accounts found. Try:');
    console.log('1. Check database users with: sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c "SELECT email, name, \\"providerName\\" FROM \\"User\\";"');
    console.log('2. Create account via GUI at http://localhost:4200');
    console.log('3. Reset containers and try fresh setup');
}

loginToPostiz().catch(console.error);