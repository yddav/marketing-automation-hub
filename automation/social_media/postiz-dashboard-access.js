#!/usr/bin/env node

const axios = require('axios');

async function accessPostizDashboard() {
    console.log('🚀 Accessing Postiz Dashboard');
    console.log('=============================\n');

    const baseUrl = 'http://localhost:3000';
    
    try {
        // Login and get authentication cookie
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@untrapd.hub',
            password: 'UNTRAPDHub2025!',
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        console.log('✅ Login successful');
        const authCookie = loginResponse.headers['set-cookie']?.[0];
        
        if (!authCookie) {
            console.log('❌ No authentication cookie received');
            return;
        }

        console.log('🍪 Auth cookie received:', authCookie.substring(0, 50) + '...');
        
        // Try to access different endpoints to find the dashboard
        console.log('\n2️⃣ Testing dashboard endpoints...');
        const endpoints = [
            '/',
            '/dashboard',
            '/app',
            '/home',
            '/posts',
            '/calendar',
            '/analytics'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${baseUrl}${endpoint}`, {
                    headers: {
                        'Cookie': authCookie
                    },
                    timeout: 3000
                });
                
                console.log(`✅ ${endpoint}: ${response.status} - ${response.data.toString().substring(0,100)}...`);
                
                // If we get HTML content, this might be the frontend
                if (response.data.toString().includes('<!DOCTYPE html>') || 
                    response.data.toString().includes('<html')) {
                    console.log(`🎯 ${endpoint} appears to be the frontend`);
                }
                
            } catch (error) {
                const status = error.response?.status || 'ERROR';
                console.log(`⚠️ ${endpoint}: ${status}`);
            }
        }

        // Try to get user info
        console.log('\n3️⃣ Getting user information...');
        try {
            const userResponse = await axios.get(`${baseUrl}/auth/me`, {
                headers: {
                    'Cookie': authCookie
                }
            });
            console.log('👤 User info:', userResponse.data);
        } catch (error) {
            console.log('⚠️ Could not get user info:', error.response?.status);
        }

        // Try to get available API routes
        console.log('\n4️⃣ API exploration...');
        const apiEndpoints = [
            '/api',
            '/api/posts',
            '/api/user',
            '/api/organizations',  
            '/api/integrations',
            '/api/calendar'
        ];

        for (const endpoint of apiEndpoints) {
            try {
                const response = await axios.get(`${baseUrl}${endpoint}`, {
                    headers: {
                        'Cookie': authCookie
                    },
                    timeout: 2000
                });
                console.log(`✅ ${endpoint}: Available`);
            } catch (error) {
                const status = error.response?.status || 'ERROR';
                if (status !== 404) {
                    console.log(`📊 ${endpoint}: ${status}`);
                }
            }
        }

        console.log('\n🎉 Dashboard access information:');
        console.log('- Frontend URL: http://localhost:4200');
        console.log('- Backend API: http://localhost:3000'); 
        console.log('- Working credentials: admin@untrapd.hub / UNTRAPDHub2025!');
        console.log('- Auth cookie available for programmatic access');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

accessPostizDashboard().catch(console.error);