const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'UnTrapdHub2025!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password hash:', hash);
    console.log('\nSQL command to update password:');
    console.log(`UPDATE "User" SET password = '${hash}' WHERE email = 'admin@untrapd.hub';`);
}

hashPassword().catch(console.error);
