#!/usr/bin/env node

/**
 * Connect social media accounts to Postiz via API
 * Bypasses the broken frontend login form
 */

const https = require('https');
const http = require('http');

// Session cookie from our successful API login
const AUTH_COOKIE = 'auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM4YmE4ZDUzLTliOWItNGQ0Zi1hMzBmLTZmNmUzYmZjOWJjMyIsImVtYWlsIjoiYWRtaW5AdW50cmFwZC5odWIiLCJwYXNzd29yZCI6IiQyYiQxMCRSRlc0L0JBYVJHcmlWVE85Mnlyek9lMDl3V1pndWgzZFpWNEl0REtqZWFNQWpIMVBBUHA5QyIsInByb3ZpZGVyTmFtZSI6IkxPQ0FMIiwibmFtZSI6bnVsbCwibGFzdE5hbWUiOm51bGwsImlzU3VwZXJBZG1pbiI6ZmFsc2UsImJpbyI6bnVsbCwiYXVkaWVuY2UiOjAsInBpY3R1cmVJZCI6bnVsbCwicHJvdmlkZXJJZCI6IiIsInRpbWV6b25lIjowLCJjcmVhdGVkQXQiOiIyMDI1LTEwLTI3VDIzOjA1OjM4LjkxNVoiLCJ1cGRhdGVkQXQiOiIyMDI1LTEwLTI3VDIzOjA1OjM4LjkxNVoiLCJsYXN0UmVhZE5vdGlmaWNhdGlvbnMiOiIyMDI1LTEwLTI3VDIzOjA1OjM4LjkxNVoiLCJpbnZpdGVJZCI6bnVsbCwiYWN0aXZhdGVkIjp0cnVlLCJtYXJrZXRwbGFjZSI6dHJ1ZSwiYWNjb3VudCI6bnVsbCwiY29ubmVjdGVkQWNjb3VudCI6ZmFsc2UsImxhc3RPbmxpbmUiOiIyMDI1LTEwLTI3VDIzOjA1OjM4LjkxNVoiLCJpcCI6IjE3Mi4xOC4wLjEiLCJhZ2VudCI6Ik1vemlsbGEvNS4wIChYMTE7IFVidW50dTsgTGludXggeDg2XzY0OyBydjoxNDQuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8xNDQuMCIsInBpY3R1cmUiOm51bGwsImlhdCI6MTc2MTYwODM4OX0.qSjYHfgXgwgmLWCdUgi-kpVjUikci-4GELoQKSGu6-Q';

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
