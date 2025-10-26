#!/bin/bash

echo "🚨 EMERGENCY BACKUP SERVER - App Marketing Automation Hub"
echo "==========================================================="
echo "🚀 Starting immediate demo deployment..."
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 detected"
    python3 emergency_server.py
elif command -v python &> /dev/null; then
    echo "✅ Python detected"
    python emergency_server.py
else
    echo "❌ Python not found. Please install Python 3"
    echo "💡 Try: sudo apt update && sudo apt install python3"
    exit 1
fi