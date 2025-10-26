#!/usr/bin/env node

const axios = require('axios');

async function testFrontendAccess() {
    console.log('🔍 Testing Postiz Frontend Access with Cookie');
    console.log('=============================================\n');

    const baseUrl = 'http://localhost:3000';
    const frontendUrl = 'http://localhost:4200';
    
    try {
        // Step 1: Login to get fresh cookie
        console.log('1️⃣ Getting fresh authentication cookie...');
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'untrapd77@gmail.com',
            password: 'UNTRAPDHub2025!',
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        const setCookieHeader = loginResponse.headers['set-cookie']?.[0];
        const authToken = setCookieHeader?.match(/auth=([^;]+)/)?.[1];
        
        console.log('✅ Login successful, got auth token');
        
        // Step 2: Test dashboard access with cookie
        console.log('\n2️⃣ Testing dashboard access at /analytics...');
        try {
            const dashboardResponse = await axios.get(`${frontendUrl}/analytics`, {
                headers: {
                    'Cookie': `auth=${authToken}`
                },
                maxRedirects: 0,
                validateStatus: (status) => status < 500
            });
            
            console.log(`Response status: ${dashboardResponse.status}`);
            console.log(`Response headers:`, dashboardResponse.headers);
            
            if (dashboardResponse.status === 302 || dashboardResponse.status === 301) {
                console.log(`Redirect to: ${dashboardResponse.headers.location}`);
            }
            
            // Check if we get HTML back
            if (dashboardResponse.data && typeof dashboardResponse.data === 'string') {
                const hasNextApp = dashboardResponse.data.includes('__next');
                const hasAnalytics = dashboardResponse.data.includes('analytics');
                const hasError = dashboardResponse.data.includes('error');
                
                console.log(`\n📊 Page Analysis:`);
                console.log(`- Next.js app detected: ${hasNextApp ? '✅' : '❌'}`);
                console.log(`- Analytics content: ${hasAnalytics ? '✅' : '❌'}`);
                console.log(`- Error messages: ${hasError ? '⚠️ Yes' : '✅ No'}`);
                
                // Extract any visible text content
                const titleMatch = dashboardResponse.data.match(/<title>(.*?)<\/title>/);
                if (titleMatch) {
                    console.log(`- Page title: "${titleMatch[1]}"`);
                }
            }
            
        } catch (dashboardError) {
            console.error('❌ Dashboard access error:', dashboardError.message);
        }
        
        // Step 3: Test API access to verify backend works
        console.log('\n3️⃣ Testing API access to verify backend...');
        const meResponse = await axios.get(`${baseUrl}/auth/me`, {
            headers: {
                'Cookie': `auth=${authToken}`
            }
        });
        
        console.log('✅ API /auth/me response:', JSON.stringify(meResponse.data, null, 2));
        
        // Step 4: Check what the root page shows
        console.log('\n4️⃣ Checking root page redirect...');
        try {
            const rootResponse = await axios.get(frontendUrl, {
                headers: {
                    'Cookie': `auth=${authToken}`
                },
                maxRedirects: 0,
                validateStatus: (status) => status < 500
            });
            
            console.log(`Root page status: ${rootResponse.status}`);
            if (rootResponse.headers.location) {
                console.log(`Redirects to: ${rootResponse.headers.location}`);
            }
        } catch (rootError) {
            console.log('Root page error:', rootError.message);
        }
        
        console.log('\n📝 Summary:');
        console.log('- Backend API: ✅ Working');
        console.log('- Authentication: ✅ Working');
        console.log('- Frontend rendering: ❓ Needs investigation');
        console.log('\n💡 Next Steps:');
        console.log('1. Check browser console for JavaScript errors');
        console.log('2. Verify all environment variables are set correctly');
        console.log('3. Consider using API-only approach as planned');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFrontendAccess().catch(console.error);