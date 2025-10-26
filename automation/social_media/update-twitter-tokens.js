#!/usr/bin/env node

/**
 * Twitter Token Updater
 * Updates .env file with new Twitter Access Token and Secret
 *
 * Usage: node update-twitter-tokens.js <access_token> <access_token_secret>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('❌ Error: Missing arguments\n');
  console.log('Usage: node update-twitter-tokens.js <access_token> <access_token_secret>\n');
  console.log('Example:');
  console.log('  node update-twitter-tokens.js "1234567890-AbCdEf..." "xYz123AbC..."');
  process.exit(1);
}

const [accessToken, accessTokenSecret] = args;

// Validate token format
if (!accessToken || accessToken.length < 20) {
  console.log('❌ Error: Access Token looks invalid (too short)');
  process.exit(1);
}

if (!accessTokenSecret || accessTokenSecret.length < 20) {
  console.log('❌ Error: Access Token Secret looks invalid (too short)');
  process.exit(1);
}

const envPath = path.join(__dirname, '.env');

// Read current .env
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found .env file');
} catch (error) {
  console.log('❌ Error: Could not read .env file');
  console.log('   Make sure you are in the automation/social_media directory');
  process.exit(1);
}

// Backup original .env
const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
try {
  fs.writeFileSync(backupPath, envContent);
  console.log(`✅ Created backup: ${path.basename(backupPath)}`);
} catch (error) {
  console.log('⚠️  Warning: Could not create backup file');
}

// Update tokens
let updated = false;
const lines = envContent.split('\n');
const updatedLines = lines.map(line => {
  if (line.startsWith('TWITTER_ACCESS_TOKEN=') && !line.startsWith('TWITTER_ACCESS_TOKEN_SECRET=')) {
    updated = true;
    return `TWITTER_ACCESS_TOKEN=${accessToken}`;
  }
  if (line.startsWith('TWITTER_ACCESS_TOKEN_SECRET=')) {
    updated = true;
    return `TWITTER_ACCESS_TOKEN_SECRET=${accessTokenSecret}`;
  }
  return line;
});

if (!updated) {
  console.log('⚠️  Warning: Did not find TWITTER_ACCESS_TOKEN variables in .env');
  console.log('   Adding them now...');

  // Add tokens to end of file
  updatedLines.push('');
  updatedLines.push('# Twitter OAuth 1.0a Tokens (Updated: ' + new Date().toISOString() + ')');
  updatedLines.push(`TWITTER_ACCESS_TOKEN=${accessToken}`);
  updatedLines.push(`TWITTER_ACCESS_TOKEN_SECRET=${accessTokenSecret}`);
}

// Write updated .env
try {
  fs.writeFileSync(envPath, updatedLines.join('\n'));
  console.log('✅ Updated .env file with new tokens');
} catch (error) {
  console.log('❌ Error: Could not write to .env file');
  console.log('   Error:', error.message);
  process.exit(1);
}

// Mask tokens for display
const maskedToken = accessToken.substring(0, 10) + '...' + accessToken.substring(accessToken.length - 4);
const maskedSecret = accessTokenSecret.substring(0, 10) + '...' + accessTokenSecret.substring(accessTokenSecret.length - 4);

console.log('\n📝 Updated tokens:');
console.log(`   Access Token: ${maskedToken}`);
console.log(`   Access Token Secret: ${maskedSecret}`);
console.log('\n🎯 Next step: Test Twitter posting');
console.log('   node test-twitter-only.js');
console.log('\n✅ Done!');
