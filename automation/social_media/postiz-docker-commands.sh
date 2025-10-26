#!/bin/bash

# POSTIZ DOCKER MANAGEMENT COMMANDS
# Run these commands to manage Postiz containers

echo "🐳 Postiz Docker Management Commands"
echo "===================================="

echo ""
echo "📊 CHECK STATUS:"
echo "sudo docker ps --filter 'name=untrapd-postiz'"
echo ""

echo "📋 VIEW LOGS:"
echo "sudo docker logs untrapd-postiz"
echo "sudo docker logs untrapd-postiz-db"  
echo "sudo docker logs untrapd-postiz-redis"
echo ""

echo "🔄 RESTART SERVICES:"
echo "sudo docker restart untrapd-postiz-db"
echo "sudo docker restart untrapd-postiz-redis" 
echo "sudo docker restart untrapd-postiz"
echo ""

echo "⏹️ STOP SERVICES:"
echo "sudo docker stop untrapd-postiz untrapd-postiz-db untrapd-postiz-redis"
echo ""

echo "▶️ START SERVICES:"
echo "sudo docker start untrapd-postiz-db untrapd-postiz-redis untrapd-postiz"
echo ""

echo "🔧 RECREATE POSTIZ CONTAINER:"
echo "sudo docker stop untrapd-postiz"
echo "sudo docker rm untrapd-postiz"
echo "sudo docker run -d --name untrapd-postiz --network postiz-network -p 3000:3000 -p 4200:4200 -e NODE_ENV=production -e NEXTAUTH_SECRET=\$(openssl rand -base64 32) -e JWT_SECRET=\$(openssl rand -base64 32) -e NEXTAUTH_URL=http://localhost:3000 -e DATABASE_URL=postgresql://postiz:postiz_password@untrapd-postiz-db:5432/postiz -e REDIS_URL=redis://untrapd-postiz-redis:6379 ghcr.io/gitroomhq/postiz-app:latest"
echo ""

echo "🔍 DEBUG DATABASE:"
echo "sudo docker exec -it untrapd-postiz-db psql -U postiz -d postiz -c '\\dt'"
echo ""

echo "🌐 TEST CONNECTIONS:"
echo "curl http://localhost:3000"
echo "curl http://localhost:4200"