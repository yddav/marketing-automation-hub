#!/usr/bin/env node

const axios = require('axios');

async function testPostizLogin() {
    console.log('🔑 POSTIZ LOGIN TEST');
    console.log('===================\n');

    const baseUrl = 'http://localhost:3000';
    
    try {
        // Successful login with provider
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'untrapd77@gmail.com',
            password: 'UNTRAPDHub2025!',
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        console.log('✅ Login successful!');
        console.log('Response:', loginResponse.data);
        console.log('Headers:', loginResponse.headers);

        // Check if we got any authentication cookies
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
            console.log('🍪 Cookies received:', cookies);
        }

        // Try to make an authenticated request
        const dashboardCheck = await axios.get(`${baseUrl}/dashboard`, {
            withCredentials: true,
            headers: {
                'Cookie': cookies ? cookies.join('; ') : ''
            }
        });

        console.log('✅ Dashboard accessible:', dashboardCheck.status);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testPostizLogin().catch(console.error);