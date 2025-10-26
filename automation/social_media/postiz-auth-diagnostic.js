#!/usr/bin/env node

const axios = require('axios');

async function diagnosticPostizAuth() {
    console.log('🔍 POSTIZ AUTHENTICATION DIAGNOSTIC');
    console.log('====================================\n');

    const baseUrl = 'http://localhost:3000';
    const email = 'untrapd77@gmail.com';
    const password = 'UNTRAPDHub2025!';

    try {
        // Test 1: Check backend health
        console.log('1️⃣  Testing backend health...');
        const healthCheck = await axios.get(`${baseUrl}/`);
        console.log(`✅ Backend responsive: ${healthCheck.status}`);

        // Test 2: Try all possible login endpoints
        console.log('\n2️⃣  Testing login endpoints...');
        const loginEndpoints = [
            '/auth/login',
            '/api/auth/login', 
            '/login',
            '/api/login',
            '/auth/signin',
            '/signin'
        ];

        const loginPayloads = [
            { email, password },
            { email, password, provider: 'LOCAL' },
            { email, password, providerName: 'LOCAL' },
            { username: email, password },
            { identifier: email, password }
        ];

        for (const endpoint of loginEndpoints) {
            for (const payload of loginPayloads) {
                try {
                    const response = await axios.post(`${baseUrl}${endpoint}`, payload);
                    console.log(`✅ SUCCESS: ${endpoint} with payload:`, payload);
                    console.log('Response:', response.data);
                    return; // Exit on first success
                } catch (error) {
                    const status = error.response?.status || 'NO_RESPONSE';
                    const message = error.response?.data?.message || error.message;
                    console.log(`⚠️  ${endpoint} [${status}]: ${message}`);
                }
            }
        }

        // Test 3: Check if account actually exists and is valid
        console.log('\n3️⃣  Checking account in database...');
        console.log('Run this command to verify account:');
        console.log(`sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c "SELECT id, email, name, \\"isSuperAdmin\\", \\"providerName\\", \\"createdAt\\" FROM \\"User\\" WHERE email = '${email}';"`);

        console.log('\n4️⃣  Check UserOrganization link:');
        console.log(`sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c "SELECT uo.role, u.email, o.name FROM \\"UserOrganization\\" uo JOIN \\"User\\" u ON uo.\\"userId\\" = u.id JOIN \\"Organization\\" o ON uo.\\"organizationId\\" = o.id WHERE u.email = '${email}';"`);

        // Test 4: Check if we need to create account via GUI
        console.log('\n5️⃣  Alternative approaches:');
        console.log('- Try creating account via GUI at http://localhost:4200');
        console.log('- Check if Postiz requires first-time setup');
        console.log('- Verify environment variables are set correctly');

    } catch (error) {
        console.error('❌ Backend not accessible:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if containers are running: docker ps | grep postiz');
        console.log('2. Check container logs: docker logs untrapd-postiz');
        console.log('3. Restart containers if needed');
    }
}

// Run diagnostic
diagnosticPostizAuth().catch(console.error);