#!/usr/bin/env node

const axios = require('axios');

async function registerAccount(email, password, company = 'UNTRAPD Hub') {
    const baseUrl = 'http://localhost:3000';
    
    console.log(`📝 Registering new account: ${email}`);
    
    try {
        // Step 1: Register the account
        const registerResponse = await axios.post(`${baseUrl}/auth/register`, {
            email,
            password,
            company,
            provider: 'LOCAL'  // Try including provider in registration
        });

        console.log('✅ Registration successful:', registerResponse.data);
        
        // Step 2: Try to login immediately
        console.log('\n🔐 Attempting login...');
        const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
            email,
            password,
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        const authCookie = loginResponse.headers['set-cookie']?.[0];
        if (authCookie) {
            console.log('✅ Login successful!');
            const token = authCookie.match(/auth=([^;]+)/)?.[1];
            
            // Test the auth token
            const meResponse = await axios.get(`${baseUrl}/auth/me`, {
                headers: {
                    'Cookie': `auth=${token}`
                }
            });
            
            console.log('\n👤 Account created and verified:');
            console.log(JSON.stringify(meResponse.data, null, 2));
            
            return token;
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.status, error.response.data);
            
            // If registration fails, try different approach
            if (error.response.status === 400 || error.response.status === 409) {
                console.log('\n🔧 Trying alternative registration format...');
                
                try {
                    // Try without provider field
                    const altResponse = await axios.post(`${baseUrl}/auth/register`, {
                        email,
                        password,
                        company
                    });
                    
                    console.log('✅ Alternative registration successful');
                    
                    // Try login with provider
                    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
                        email,
                        password,
                        provider: 'LOCAL'
                    }, {
                        withCredentials: true
                    });
                    
                    return loginResponse.headers['set-cookie']?.[0];
                } catch (altError) {
                    console.error('❌ Alternative also failed:', altError.response?.data || altError.message);
                }
            }
        } else {
            console.error('❌ Network error:', error.message);
        }
    }
    
    return null;
}

async function checkExistingAccounts() {
    console.log('🔍 Checking for existing accounts...\n');
    
    const accounts = [
        { email: 'admin@untrapd.hub', password: 'UNTRAPDHub2025!' },
        { email: 'untrapd77@gmail.com', password: 'UNTRAPDHub2025!' }
    ];
    
    for (const account of accounts) {
        try {
            console.log(`Testing: ${account.email}`);
            const response = await axios.post('http://localhost:3000/auth/login', {
                ...account,
                provider: 'LOCAL'
            }, {
                withCredentials: true
            });
            
            if (response.headers['set-cookie']) {
                console.log('✅ Account exists and works!');
                return account;
            }
        } catch (error) {
            console.log('❌ Login failed');
        }
    }
    
    return null;
}

async function main() {
    // First check if any accounts work
    const existingAccount = await checkExistingAccounts();
    
    if (existingAccount) {
        console.log('\n✨ Found working account:', existingAccount.email);
        console.log('You can use the postiz-api-client.js to interact with Postiz');
        return;
    }
    
    // Try to create a new account
    console.log('\n📝 Creating new admin account...');
    const token = await registerAccount('admin@untrapd.hub', 'UNTRAPDHub2025!', 'UNTRAPD Hub');
    
    if (token) {
        console.log('\n🎉 Success! Account created and ready to use.');
        console.log('You can now use postiz-api-client.js to:');
        console.log('- Schedule posts');
        console.log('- Upload images');
        console.log('- Manage content');
        console.log('\n⚠️  Note: You still need to connect social media accounts via OAuth');
    } else {
        console.log('\n😕 Registration failed. Options:');
        console.log('1. Check if Postiz allows registration (might be disabled)');
        console.log('2. Create account directly in database');
        console.log('3. Use the web UI at http://localhost:4200');
    }
}

main().catch(console.error);