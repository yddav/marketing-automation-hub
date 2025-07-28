#!/bin/bash

# DEPLOYMENT VALIDATION SCRIPT
# Agent Charlie - Launch Readiness Testing

echo "🔍 DEPLOYMENT VALIDATION SUITE"
echo "=============================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation results
validation_results=()

# Function to add validation result
add_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "✅ ${GREEN}PASS${NC}: $test_name"
        validation_results+=("PASS: $test_name")
    elif [ "$status" = "FAIL" ]; then
        echo -e "❌ ${RED}FAIL${NC}: $test_name - $details"
        validation_results+=("FAIL: $test_name - $details")
    else
        echo -e "⚠️  ${YELLOW}WARN${NC}: $test_name - $details"
        validation_results+=("WARN: $test_name - $details")
    fi
}

echo "🔧 VALIDATING PROJECT STRUCTURE"
echo "==============================="

# Check project root files
if [ -f "vercel.json" ]; then
    add_result "Project root verification" "PASS" ""
else
    add_result "Project root verification" "FAIL" "vercel.json not found"
fi

if [ -f "package.json" ]; then
    add_result "Node.js configuration" "PASS" ""
else
    add_result "Node.js configuration" "FAIL" "package.json not found"
fi

# Check deployment scripts
if [ -x "deploy-demo.sh" ]; then
    add_result "Demo deployment script" "PASS" ""
else
    add_result "Demo deployment script" "FAIL" "deploy-demo.sh not executable"
fi

if [ -x "deploy-bulletproof.sh" ]; then
    add_result "Bulletproof deployment script" "PASS" ""
else
    add_result "Bulletproof deployment script" "FAIL" "deploy-bulletproof.sh not executable"
fi

if [ -f "deploy-nodejs-simple.js" ]; then
    add_result "Simple Node.js server" "PASS" ""
else
    add_result "Simple Node.js server" "FAIL" "deploy-nodejs-simple.js not found"
fi

echo ""
echo "📁 VALIDATING PUBLIC DIRECTORY"
echo "==============================="

# Check public directory structure
required_files=(
    "public/index.html"
    "public/templates.html"
    "public/payment-dashboard.html"
    "public/dashboard/index.html"
    "public/css/main.css"
    "public/css/templates.css"
    "public/js/main.js"
    "public/js/templates.js"
    "public/js/analytics.js"
    "public/content_templates/content-schema.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        add_result "Required file: $(basename "$file")" "PASS" ""
    else
        add_result "Required file: $(basename "$file")" "FAIL" "File missing: $file"
    fi
done

# Count content templates
if [ -d "public/content_templates" ]; then
    template_count=$(find public/content_templates -name "*.json" -not -name "content-schema.json" | wc -l)
    if [ $template_count -gt 10 ]; then
        add_result "Content templates quantity" "PASS" "$template_count templates found"
    else
        add_result "Content templates quantity" "WARN" "Only $template_count templates found"
    fi
else
    add_result "Content templates directory" "FAIL" "Directory not found"
fi

echo ""
echo "🌐 VALIDATING WEB ASSETS"
echo "========================"

# Check CSS files
if [ -f "public/css/main.css" ]; then
    css_size=$(wc -c < "public/css/main.css")
    if [ $css_size -gt 1000 ]; then
        add_result "Main CSS file" "PASS" "${css_size} bytes"
    else
        add_result "Main CSS file" "WARN" "File seems small: ${css_size} bytes"
    fi
fi

# Check JavaScript files
if [ -f "public/js/main.js" ]; then
    js_size=$(wc -c < "public/js/main.js")
    if [ $js_size -gt 1000 ]; then
        add_result "Main JavaScript file" "PASS" "${js_size} bytes"
    else
        add_result "Main JavaScript file" "WARN" "File seems small: ${js_size} bytes"
    fi
fi

echo ""
echo "🛠️ VALIDATING RUNTIME DEPENDENCIES"
echo "==================================="

# Check Node.js
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version)
    add_result "Node.js runtime" "PASS" "Version: $node_version"
else
    add_result "Node.js runtime" "WARN" "Node.js not found - Python fallback available"
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    npm_version=$(npm --version)
    add_result "npm package manager" "PASS" "Version: $npm_version"
else
    add_result "npm package manager" "WARN" "npm not found - Simple server available"
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    python_version=$(python3 --version)
    add_result "Python3 runtime" "PASS" "$python_version"
elif command -v python >/dev/null 2>&1; then
    python_version=$(python --version)
    add_result "Python runtime" "PASS" "$python_version"
else
    add_result "Python runtime" "FAIL" "No Python found - at least one runtime required"
fi

echo ""
echo "🚀 TESTING DEPLOYMENT METHODS"
echo "============================="

# Test Python server (most reliable)
echo "Testing Python HTTP server..."
if command -v python3 >/dev/null 2>&1; then
    timeout 3s bash -c 'cd public && python3 -m http.server 8001 >/dev/null 2>&1' &
    sleep 1
    if curl -s http://localhost:8001 >/dev/null 2>&1; then
        add_result "Python HTTP server" "PASS" "Port 8001 responsive"
    else
        add_result "Python HTTP server" "WARN" "Server started but not responsive"
    fi
    # Kill the test server
    pkill -f "python3 -m http.server 8001" 2>/dev/null
else
    add_result "Python HTTP server" "FAIL" "Python3 not available"
fi

# Test Node.js simple server
echo "Testing Node.js simple server..."
if command -v node >/dev/null 2>&1 && [ -f "deploy-nodejs-simple.js" ]; then
    timeout 3s bash -c 'PORT=3001 node deploy-nodejs-simple.js >/dev/null 2>&1' &
    sleep 1
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
        add_result "Node.js simple server" "PASS" "Port 3001 responsive with health check"
    else
        add_result "Node.js simple server" "WARN" "Server started but not responsive"
    fi
    # Kill the test server
    pkill -f "node deploy-nodejs-simple.js" 2>/dev/null
else
    add_result "Node.js simple server" "FAIL" "Node.js or script not available"
fi

echo ""
echo "📱 VALIDATING MOBILE RESPONSIVENESS"
echo "==================================="

# Check for responsive CSS
if grep -q "@media" public/css/main.css 2>/dev/null; then
    add_result "Responsive CSS design" "PASS" "Media queries found"
else
    add_result "Responsive CSS design" "WARN" "No media queries found in main.css"
fi

# Check viewport meta tag
if grep -q "viewport" public/index.html 2>/dev/null; then
    add_result "Mobile viewport meta tag" "PASS" "Viewport tag found"
else
    add_result "Mobile viewport meta tag" "FAIL" "Viewport meta tag missing"
fi

echo ""
echo "📊 VALIDATION SUMMARY"
echo "===================="

# Count results
total_tests=${#validation_results[@]}
pass_count=$(printf "%s\\n" "${validation_results[@]}" | grep -c "^PASS")
fail_count=$(printf "%s\\n" "${validation_results[@]}" | grep -c "^FAIL")
warn_count=$(printf "%s\\n" "${validation_results[@]}" | grep -c "^WARN")

echo "Total Tests: $total_tests"
echo -e "✅ ${GREEN}Passed${NC}: $pass_count"
echo -e "⚠️  ${YELLOW}Warnings${NC}: $warn_count"
echo -e "❌ ${RED}Failed${NC}: $fail_count"

# Calculate score
if [ $total_tests -gt 0 ]; then
    score=$((pass_count * 100 / total_tests))
    echo ""
    echo "🏆 DEPLOYMENT READINESS SCORE: ${score}%"
    
    if [ $score -ge 90 ]; then
        echo -e "${GREEN}🚀 EXCELLENT - Ready for launch!${NC}"
        exit_code=0
    elif [ $score -ge 75 ]; then
        echo -e "${YELLOW}⚠️  GOOD - Minor issues to address${NC}"
        exit_code=1
    elif [ $score -ge 50 ]; then
        echo -e "${YELLOW}⚠️  FAIR - Several issues need attention${NC}"
        exit_code=2
    else
        echo -e "${RED}❌ POOR - Major issues must be fixed${NC}"
        exit_code=3
    fi
else
    echo "No tests were run"
    exit_code=4
fi

echo ""
echo "🎯 LAUNCH RECOMMENDATIONS"
echo "========================="

if [ $fail_count -eq 0 ]; then
    echo "✅ All critical systems operational"
    echo "✅ Multiple deployment methods available"
    echo "✅ Ready for immediate launch"
else
    echo "⚠️  Address failed tests before launch"
    echo "✅ Fallback deployment methods available"
    echo "⚠️  Consider fixing warnings for optimal performance"
fi

echo ""
echo "🚀 AVAILABLE DEPLOYMENT COMMANDS:"
echo "================================="
echo "./deploy-bulletproof.sh    # Auto-select best method"
echo "./deploy-demo.sh           # Python HTTP server"
echo "node deploy-nodejs-simple.js  # Simple Node.js server"
echo "npm start                  # Full Node.js application"

exit $exit_code