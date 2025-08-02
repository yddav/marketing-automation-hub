#!/bin/bash

# UNTRAPD Hub Social Media Automation - Deployment Script
# Makes production deployment simple and safe

echo "🚀 UNTRAPD Hub Social Media Automation - Deployment Script"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "untrapd-hub-launcher.js" ]; then
    print_error "Not in the social media automation directory"
    echo "Please run this script from: automation/social_media/"
    exit 1
fi

print_status "Located in correct directory"

# Check Node.js installation
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 16+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js detected: $NODE_VERSION"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_status "Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_info "Creating environment file from template..."
    cp .env.template .env
    print_status "Environment file created"
    print_warning "IMPORTANT: Edit .env file with your API tokens!"
    echo ""
    echo "Required tokens:"
    echo "- INSTAGRAM_ACCESS_TOKEN"
    echo "- FACEBOOK_PAGE_TOKEN" 
    echo "- TIKTOK_ACCESS_TOKEN"
    echo ""
    read -p "Press Enter after adding your API tokens to .env..."
else
    print_status "Environment file exists"
fi

# Run system validation
print_info "Running system validation..."
npm run test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "System validation passed"
else
    print_error "System validation failed"
    echo "Run 'npm run test' for details"
    exit 1
fi

# Check API tokens (if not in demo mode)
print_info "Checking API token setup..."
if grep -q "your_.*_token" .env; then
    print_warning "Placeholder tokens detected - running in demo mode"
    DEMO_MODE=true
else
    print_info "API tokens configured - testing connections..."
    npm run validate
    if [ $? -eq 0 ]; then
        print_status "API connections validated"
        DEMO_MODE=false
    else
        print_warning "API validation failed - falling back to demo mode"
        DEMO_MODE=true
    fi
fi

echo ""
echo "🎯 DEPLOYMENT OPTIONS"
echo "===================="

if [ "$DEMO_MODE" = true ]; then
    echo "1) Demo Mode Test (safe - no real posts)"
    echo "2) Setup API Tokens (follow guide)"
    echo "3) Exit"
    echo ""
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            print_info "Running demo test..."
            npm run demo
            print_status "Demo test completed successfully!"
            ;;
        2)
            print_info "Opening API setup guide..."
            echo ""
            echo "📖 API Setup Instructions:"
            echo "=========================="
            echo "1. Open API_SETUP_GUIDE.md"
            echo "2. Follow the platform-specific setup instructions"
            echo "3. Add your tokens to the .env file"
            echo "4. Run this script again"
            echo ""
            echo "Quick start for Facebook/Instagram:"
            echo "→ Go to developers.facebook.com"
            echo "→ Create business app"
            echo "→ Add Instagram Basic Display + Facebook Login"
            echo "→ Generate tokens for:"
            echo "   - Facebook Page ID: 750014458192598"
            echo "   - Instagram Account ID: 76216363129"
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
else
    echo "1) Single Test Post (recommended first)"
    echo "2) Launch Continuous Automation"
    echo "3) PM2 Background Process"
    echo "4) Demo Mode Test"
    echo "5) Exit"
    echo ""
    read -p "Choose option (1-5): " choice
    
    case $choice in
        1)
            print_info "Running single test post..."
            npm run once
            if [ $? -eq 0 ]; then
                print_status "Test post completed! Check your social media accounts."
                echo ""
                echo "If the test was successful, you can now:"
                echo "- Run option 2 for continuous automation"
                echo "- Run option 3 for background process"
            else
                print_error "Test post failed - check API tokens and permissions"
            fi
            ;;
        2)
            print_warning "This will start continuous automation"
            print_info "Press Ctrl+C to stop when running"
            read -p "Continue? (y/N): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                print_info "Starting continuous automation..."
                npm start
            else
                echo "Cancelled"
            fi
            ;;
        3)
            if ! command -v pm2 &> /dev/null; then
                print_info "Installing PM2 for background processes..."
                npm install -g pm2
            fi
            
            print_info "Starting background automation with PM2..."
            npm run pm2-start
            print_status "Automation running in background!"
            echo ""
            echo "Management commands:"
            echo "- npm run pm2-logs   (view logs)"
            echo "- npm run pm2-stop   (stop automation)"
            echo "- pm2 status         (check status)"
            ;;
        4)
            print_info "Running demo test..."
            npm run demo
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
fi

echo ""
print_status "Deployment script completed!"
echo ""
echo "📁 Important files:"
echo "- API_SETUP_GUIDE.md (API token setup)"
echo "- PRODUCTION_CHECKLIST.md (full deployment guide)"
echo "- .env (your API tokens - keep secure!)"
echo "- reports/ (daily analytics reports)"
echo ""
echo "🔧 Quick commands:"
echo "- npm run demo     (safe testing)"
echo "- npm run once     (single post test)"
echo "- npm start        (continuous automation)"
echo "- npm run insights (analytics)"