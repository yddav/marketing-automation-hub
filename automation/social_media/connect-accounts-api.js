#!/usr/bin/env node

/**
 * Connect social media accounts to Postiz via API
 * Bypasses the broken frontend login form
 */

const https = require('https');
const http = require('http');

// Session cookie from environment variable (never commit secrets!)
const AUTH_COOKIE = process.env.POSTIZ_AUTH_COOKIE || '';
if (!AUTH_COOKIE) {
    console.error('Error: POSTIZ_AUTH_COOKIE environment variable is required');
    process.exit(1);
}

const BASE_URL = 'http://localhost:3000';

async function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': AUTH_COOKIE
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log('\n🔐 Testing authentication...');

    // Test if we're authenticated
    const userTest = await makeRequest('GET', '/user/self');
    console.log('User check:', userTest.status, JSON.stringify(userTest.data, null, 2));

    if (userTest.status !== 200) {
        console.error('❌ Authentication failed. Cookie may be invalid.');
        process.exit(1);
    }

    console.log('✅ Authenticated as:', userTest.data.email);

    // Get available integrations
    console.log('\n📋 Fetching available integrations...');
    const integrations = await makeRequest('GET', '/integrations');
    console.log('Integrations response:', integrations.status);

    if (integrations.data) {
        console.log('Available integrations:', JSON.stringify(integrations.data, null, 2));
    }

    // Try to get OAuth URL for Instagram
    console.log('\n🔗 Getting Instagram OAuth URL...');
    const instagramOAuth = await makeRequest('GET', '/auth/oauth/instagram');
    console.log('Instagram OAuth:', instagramOAuth.status);
    console.log('Response:', JSON.stringify(instagramOAuth, null, 2));
}

main().catch(console.error);
