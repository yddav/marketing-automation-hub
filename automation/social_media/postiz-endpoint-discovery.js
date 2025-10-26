#!/usr/bin/env node

/**
 * Postiz API Endpoint Discovery
 * Tests common endpoints to find what's available
 */

const axios = require('axios');

async function testEndpoints() {
    console.log('🔍 Discovering Postiz API Endpoints');
    console.log('===================================\n');

    const baseUrl = 'http://localhost:3000';
    
    // First get auth token
    let authToken = null;
    try {
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@untrapd.hub',
            password: 'UNTRAPDHub2025!',
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        const authCookie = loginResponse.headers['set-cookie']?.[0];
        authToken = authCookie?.match(/auth=([^;]+)/)?.[1];
        
        if (authToken) {
            console.log('✅ Authentication successful');
        } else {
            console.log('❌ No auth token received');
            return;
        }
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return;
    }

    // Test common endpoints
    const endpoints = [
        // Auth endpoints
        '/auth/me',
        '/auth/profile',
        '/auth/user',
        '/user',
        '/profile',
        
        // Integration endpoints
        '/integrations',
        '/channels',
        '/providers',
        '/social',
        
        // Post endpoints
        '/posts',
        '/schedule',
        '/content',
        
        // Public API
        '/public/v1/posts',
        '/api/v1/posts',
        
        // Organization
        '/organization',
        '/org',
        
        // Other
        '/dashboard',
        '/health',
        '/status'
    ];

    const headers = {
        'Cookie': `auth=${authToken}`,
        'Content-Type': 'application/json'
    };

    const results = {
        working: [],
        notFound: [],
        errors: []
    };

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${baseUrl}${endpoint}`, { 
                headers,
                timeout: 5000,
                validateStatus: (status) => status < 500 // Don't throw on 4xx
            });
            
            if (response.status === 200) {
                results.working.push({
                    endpoint,
                    status: response.status,
                    data: Array.isArray(response.data) ? `Array(${response.data.length})` : typeof response.data
                });
                console.log(`✅ ${endpoint} - ${response.status} - ${Array.isArray(response.data) ? `Array(${response.data.length})` : typeof response.data}`);
            } else if (response.status === 404) {
                results.notFound.push(endpoint);
                console.log(`❌ ${endpoint} - 404 Not Found`);
            } else {
                results.errors.push({
                    endpoint,
                    status: response.status,
                    message: response.data?.message || 'Unknown error'
                });
                console.log(`⚠️  ${endpoint} - ${response.status} - ${response.data?.message || 'Error'}`);
            }
            
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log(`⏱️  ${endpoint} - Timeout`);
            } else if (error.response?.status === 404) {
                results.notFound.push(endpoint);
                console.log(`❌ ${endpoint} - 404 Not Found`);
            } else {
                results.errors.push({
                    endpoint,
                    error: error.message
                });
                console.log(`💥 ${endpoint} - ${error.message}`);
            }
        }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Working endpoints: ${results.working.length}`);
    console.log(`❌ Not found: ${results.notFound.length}`);
    console.log(`⚠️  Errors: ${results.errors.length}`);

    if (results.working.length > 0) {
        console.log('\n🎯 Working API Endpoints:');
        results.working.forEach(({ endpoint, status, data }) => {
            console.log(`  ${endpoint} (${status}) - Returns: ${data}`);
        });
    }

    return results;
}

async function testWorkingEndpoint(endpoint, authToken) {
    try {
        console.log(`\n🔍 Testing ${endpoint} in detail:`);
        const response = await axios.get(`http://localhost:3000${endpoint}`, {
            headers: {
                'Cookie': `auth=${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return null;
    }
}

if (require.main === module) {
    testEndpoints().then(async (results) => {
        // Test working endpoints in detail
        if (results?.working?.length > 0) {
            console.log('\n🔬 Detailed Testing:');
            
            const authToken = 'dummy'; // Will be replaced with real token
            for (const { endpoint } of results.working.slice(0, 3)) { // Test first 3
                await testWorkingEndpoint(endpoint, authToken);
            }
        }
    }).catch(console.error);
}