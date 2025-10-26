#!/bin/bash

# SUDO COMMANDS FOR POSTIZ ADMIN ACCOUNT CREATION
# Run these commands one by one to create the admin account

echo "🔧 POSTIZ ADMIN ACCOUNT CREATION - SUDO COMMANDS"
echo "================================================"
echo ""

echo "📊 Step 1: Check container status"
echo "sudo docker ps --filter 'name=untrapd-postiz'"
echo ""

echo "🗄️ Step 2: Check database tables"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c '\\dt'"
echo ""

echo "👀 Step 3: Check users table structure"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c '\\d users'"
echo ""

echo "👤 Step 4: Create admin user (Method A - with bcrypt)"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c \"INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES ('untrapd77@gmail.com', '\\\$2b\\\$10\\\$X.Z9Z9Z9Z9Z9Z9Z9Z9Z9Ze0YYYYYYYYYYYYYYYYYYYYYYYYe', 'UNTRAPD Hub Admin', 'admin', NOW(), NOW());\""
echo ""

echo "👤 Step 4 Alternative: Create admin user (Method B - simple password)"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c \"INSERT INTO users (email, password, name, created_at, updated_at) VALUES ('untrapd77@gmail.com', 'UNTRAPDHub2025', 'UNTRAPD Hub Admin', NOW(), NOW());\""
echo ""

echo "🔍 Step 5: Verify account creation"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c \"SELECT id, email, name, role, created_at FROM users WHERE email = 'untrapd77@gmail.com';\""
echo ""

echo "🔄 Step 6: Restart Postiz container to refresh state"
echo "sudo docker restart untrapd-postiz"
echo ""

echo "✅ Step 7: Test login via browser"
echo "Open: http://localhost:4200/auth/login"
echo "Email: untrapd77@gmail.com"
echo "Password: UNTRAPDHub2025"
echo ""

echo "📋 Step 8: If database doesn't exist, initialize it"
echo "sudo docker exec -it untrapd-postiz npm run db:migrate"
echo "sudo docker exec -it untrapd-postiz npm run db:seed"
echo ""

echo "🔧 Step 9: Alternative - Access container shell for manual work"
echo "sudo docker exec -it untrapd-postiz sh"
echo "# Then inside container:"
echo "# npm run db:migrate"
echo "# npm run db:seed"
echo "# node scripts/create-admin.js (if exists)"
echo ""

echo "🗄️ Step 10: Database direct access for troubleshooting"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz"
echo "# Then in PostgreSQL prompt:"
echo "# \\l    (list databases)"
echo "# \\dt   (list tables)"
echo "# \\d users  (describe users table)"
echo "# SELECT * FROM users;"
echo ""

echo "💡 TROUBLESHOOTING NOTES:"
echo "========================="
echo "1. If 'users' table doesn't exist, run migrations first"
echo "2. If migrations fail, check Postiz container logs"
echo "3. Password might need bcrypt hashing for security"
echo "4. Some Postiz versions require specific user roles/permissions"
echo "5. Container restart may be needed after manual DB changes"