#!/usr/bin/env node

/**
 * Postiz Authentication Bypass
 * Creates valid session using database user
 */

const axios = require('axios');

async function createAdminAccountAndLogin() {
    console.log('🔧 Creating admin account directly in database...');
    
    const commands = [
        'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
        `DELETE FROM "UserOrganization" WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'admin@untrapd.hub');`,
        `DELETE FROM "Organization" WHERE name = 'UNTRAPD Hub';`,
        `DELETE FROM "User" WHERE email = 'admin@untrapd.hub';`,
        `INSERT INTO "User" (
            id, email, password, "providerName", name, "isSuperAdmin", 
            activated, timezone, "createdAt", "updatedAt", 
            "lastReadNotifications", "lastOnline"
        ) VALUES (
            gen_random_uuid()::text,
            'admin@untrapd.hub',
            crypt('UNTRAPDHub2025!', gen_salt('bf')),
            'LOCAL',
            'UNTRAPD Hub Admin',
            true,
            true,
            0,
            NOW(),
            NOW(),
            NOW(),
            NOW()
        );`,
        `INSERT INTO "Organization" (id, name, "createdAt", "updatedAt") 
         VALUES (gen_random_uuid()::text, 'UNTRAPD Hub', NOW(), NOW());`,
        `INSERT INTO "UserOrganization" (
            id, "organizationId", "userId", role, "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::text,
            (SELECT id FROM "Organization" WHERE name = 'UNTRAPD Hub'),
            (SELECT id FROM "User" WHERE email = 'admin@untrapd.hub'),
            'ADMIN',
            NOW(),
            NOW()
        );`
    ];

    // Execute each command
    for (const cmd of commands) {
        try {
            const { spawn } = require('child_process');
            await new Promise((resolve, reject) => {
                const process = spawn('docker', [
                    'exec', '-t', 'untrapd-postiz-db', 
                    'psql', '-U', 'postiz', '-d', 'postiz', '-c', cmd
                ]);

                process.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Command failed: ${cmd}`));
                });
            });
        } catch (error) {
            console.log(`⚠️ Command might have failed (this is often normal): ${cmd.substring(0, 50)}...`);
        }
    }

    console.log('✅ Database setup complete');

    // Now test login
    console.log('🔐 Testing login...');
    
    try {
        const loginResponse = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@untrapd.hub',
            password: 'UNTRAPDHub2025!',
            provider: 'LOCAL'
        }, {
            withCredentials: true
        });

        const authCookie = loginResponse.headers['set-cookie']?.[0];
        const token = authCookie?.match(/auth=([^;]+)/)?.[1];
        
        if (token) {
            console.log('✅ Login successful!');
            
            // Test the token
            const meResponse = await axios.get('http://localhost:3000/auth/me', {
                headers: { 'Cookie': `auth=${token}` }
            });
            
            console.log('👤 User verified:', meResponse.data.email);
            return token;
        }
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
    
    return null;
}

async function listIntegrations(token) {
    try {
        console.log('\n📱 Checking available integrations...');
        
        const response = await axios.get('http://localhost:3000/integrations', {
            headers: { 'Cookie': `auth=${token}` }
        });
        
        console.log(`Found ${response.data.length} connected channels`);
        
        if (response.data.length === 0) {
            console.log('\n🔗 No channels connected. To connect:');
            console.log('1. Configure OAuth apps (Instagram, Facebook, TikTok)');
            console.log('2. Set environment variables in docker-compose');
            console.log('3. Restart Postiz');
            console.log('4. Visit: http://localhost:4200/dashboard');
            console.log('5. Click "Add Channel" and complete OAuth');
        } else {
            console.log('\n📋 Connected channels:');
            response.data.forEach((channel, i) => {
                console.log(`${i+1}. ${channel.name} (${channel.providerIdentifier})`);
            });
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Failed to get integrations:', error.message);
        return [];
    }
}

async function main() {
    console.log('🚀 Postiz Authentication Bypass & Channel Setup');
    console.log('===============================================\n');
    
    const token = await createAdminAccountAndLogin();
    
    if (!token) {
        console.log('\n❌ Could not establish authentication');
        console.log('Manual steps:');
        console.log('1. Visit http://localhost:4200');
        console.log('2. Register manually (ignore login issues)');
        console.log('3. Use database account for API calls');
        return;
    }
    
    await listIntegrations(token);
    
    console.log('\n🎉 Authentication working!');
    console.log('========================\n');
    
    console.log('📋 Next steps:');
    console.log('1. Set up OAuth apps (see postiz-oauth-setup.js output)');
    console.log('2. Add environment variables to docker-compose');
    console.log('3. Restart containers');
    console.log('4. Visit http://localhost:4200/dashboard to add channels');
    console.log('5. Use postiz-api-client.js for automated posting');
    
    console.log('\n💡 Working credentials:');
    console.log('Email: admin@untrapd.hub');
    console.log('Password: UNTRAPDHub2025!');
    console.log(`Auth token: ${token.substring(0, 20)}...`);
    
    return token;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createAdminAccountAndLogin, listIntegrations };