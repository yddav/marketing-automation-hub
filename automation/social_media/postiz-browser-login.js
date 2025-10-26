#!/usr/bin/env node

const axios = require('axios');

async function getBrowserLoginCookie() {
    console.log('🍪 Getting Fresh Authentication Cookie for Browser');
    console.log('================================================\n');

    const baseUrl = 'http://localhost:3000';
    
    try {
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@untrapd.hub',
            password: 'UNTRAPDHub2025!',
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        const authCookie = loginResponse.headers['set-cookie']?.[0];
        
        if (authCookie) {
            console.log('✅ Fresh authentication cookie generated:');
            console.log('Full cookie:', authCookie);
            
            // Extract just the cookie value for manual browser use
            const cookieValue = authCookie.split(';')[0];
            console.log('\n🔧 For manual browser setup:');
            console.log('1. Open browser developer tools (F12)');
            console.log('2. Go to Application > Cookies > http://localhost:4200');
            console.log('3. Add new cookie:');
            console.log('   Name: auth');
            console.log(`   Value: ${cookieValue.replace('auth=', '')}`);
            console.log('   Domain: localhost');
            console.log('   Path: /');
            console.log('4. Refresh http://localhost:4200');
            
            console.log('\n🎯 Ready for Postiz dashboard access!');
            return cookieValue;
        } else {
            console.log('❌ No cookie received');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getBrowserLoginCookie().catch(console.error);