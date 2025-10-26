#!/bin/bash
# 🔍 Smart Documentation Search Tool
# Usage: ./find-docs.sh [category] [search-term]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Base directory (adjust if running from different location)
BASE_DIR="$(cd "$(dirname "$0")/../../" && pwd)"

echo -e "${CYAN}🔍 UNTRAPD Documentation Search Tool${NC}"
echo -e "${YELLOW}📁 Base Directory: ${BASE_DIR}${NC}"
echo ""

# Function to display usage
show_usage() {
    echo -e "${BLUE}Usage: ./find-docs.sh [category] [search-term]${NC}"
    echo ""
    echo -e "${GREEN}Categories:${NC}"
    echo "  finderr     - FINDERR app related documents"
    echo "  automation  - Hub automation and social media"
    echo "  content     - Content templates and branding"
    echo "  strategy    - Strategy and planning documents"
    echo "  deployment  - Deployment and operations"
    echo "  session     - Session management and checkpoints"
    echo "  current     - Current work (2025-01-14)"
    echo "  all         - Search all documents"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./find-docs.sh finderr revenue"
    echo "  ./find-docs.sh automation social"
    echo "  ./find-docs.sh current"
    echo "  ./find-docs.sh strategy android"
}

# Function to search FINDERR related docs
search_finderr() {
    echo -e "${PURPLE}📱 FINDERR App Documents:${NC}"
    find "$BASE_DIR" -name "*FINDERR*" -o -name "*finderr*" -o -name "*APPFINDER*" -o -path "*/apps/finderr/*" | head -20
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching FINDERR docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR" --include="*FINDERR*" --include="*finderr*" --include="*APPFINDER*" 2>/dev/null | head -10
    fi
}

# Function to search automation docs
search_automation() {
    echo -e "${PURPLE}🤖 Automation System Documents:${NC}"
    find "$BASE_DIR" -path "*/automation/*" -name "*.md" -o -name "*AUTOMATION*" -o -name "*HUB*SOCIAL*" | head -20
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching automation docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR/automation" --include="*.md" 2>/dev/null | head -10
    fi
}

# Function to search content docs
search_content() {
    echo -e "${PURPLE}🎨 Content & Branding Documents:${NC}"
    find "$BASE_DIR" -path "*/content_templates/*" -name "*.md" -o -path "*/content_templates/*" -name "*.json" | head -20
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching content docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR/content_templates" --include="*.md" --include="*.json" 2>/dev/null | head -10
    fi
}

# Function to search strategy docs
search_strategy() {
    echo -e "${PURPLE}📋 Strategy & Planning Documents:${NC}"
    find "$BASE_DIR" -name "*STRATEGY*" -o -name "*PLAN*" -o -name "*ROADMAP*" | head -20
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching strategy docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR" --include="*STRATEGY*" --include="*PLAN*" --include="*ROADMAP*" 2>/dev/null | head -10
    fi
}

# Function to search deployment docs
search_deployment() {
    echo -e "${PURPLE}🚀 Deployment & Operations Documents:${NC}"
    find "$BASE_DIR" -name "*DEPLOYMENT*" -o -name "*PRODUCTION*" -o -name "*LAUNCH*" | head -20
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching deployment docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR" --include="*DEPLOYMENT*" --include="*PRODUCTION*" --include="*LAUNCH*" 2>/dev/null | head -10
    fi
}

# Function to search session docs
search_session() {
    echo -e "${PURPLE}💾 Session Management Documents:${NC}"
    find "$BASE_DIR" -name "*SESSION*" -o -name "*CHECKPOINT*" -o -name "*BRIEFING*" | head -20
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching session docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR" --include="*SESSION*" --include="*CHECKPOINT*" --include="*BRIEFING*" 2>/dev/null | head -10
    fi
}

# Function to search current work
search_current() {
    echo -e "${PURPLE}⭐ Current Work (2025-01-14):${NC}"
    find "$BASE_DIR" -name "*2025-01-14*" -o -name "*CURRENT*" -o -name "*NEXT*"
    
    echo -e "\n${GREEN}🔥 Priority Documents:${NC}"
    echo "📱 FINDERR Android Strategy: $BASE_DIR/FINDERR_ANDROID_REVENUE_STRATEGY_2025-01-14.md"
    echo "🧭 Documentation Tree: $BASE_DIR/DOCUMENTATION_TREE_2025-01-14.md"
    echo "🎯 Current Focus: $BASE_DIR/docs/quick-access/CURRENT_FOCUS_2025-01-14.md"
    
    if [ ! -z "$1" ]; then
        echo -e "\n${YELLOW}🔍 Searching current docs for: '$1'${NC}"
        grep -r -i "$1" "$BASE_DIR" --include="*2025-01-14*" 2>/dev/null | head -10
    fi
}

# Function to search all docs
search_all() {
    echo -e "${PURPLE}🔍 Searching All Documents for: '$1'${NC}"
    if [ ! -z "$1" ]; then
        grep -r -i "$1" "$BASE_DIR" --include="*.md" 2>/dev/null | head -20
    else
        echo -e "${RED}❌ Please provide a search term for 'all' category${NC}"
        show_usage
        exit 1
    fi
}

# Function to show quick stats
show_stats() {
    echo -e "\n${CYAN}📊 Documentation Statistics:${NC}"
    echo -e "${GREEN}Total MD files:${NC} $(find "$BASE_DIR" -name "*.md" | wc -l)"
    echo -e "${GREEN}FINDERR docs:${NC} $(find "$BASE_DIR" -name "*FINDERR*" -o -name "*finderr*" | wc -l)"
    echo -e "${GREEN}Automation docs:${NC} $(find "$BASE_DIR" -path "*/automation/*" -name "*.md" | wc -l)"
    echo -e "${GREEN}Content templates:${NC} $(find "$BASE_DIR" -path "*/content_templates/*" -name "*.json" | wc -l)"
    echo -e "${GREEN}Session checkpoints:${NC} $(find "$BASE_DIR" -name "*SESSION*" | wc -l)"
    echo -e "${GREEN}Current work:${NC} $(find "$BASE_DIR" -name "*2025-01-14*" | wc -l)"
}

# Main logic
case "$1" in
    "finderr")
        search_finderr "$2"
        ;;
    "automation")
        search_automation "$2"
        ;;
    "content")
        search_content "$2"
        ;;
    "strategy")
        search_strategy "$2"
        ;;
    "deployment")
        search_deployment "$2"
        ;;
    "session")
        search_session "$2"
        ;;
    "current")
        search_current "$2"
        ;;
    "all")
        search_all "$2"
        ;;
    "stats")
        show_stats
        ;;
    "")
        show_usage
        show_stats
        ;;
    *)
        echo -e "${RED}❌ Unknown category: $1${NC}"
        show_usage
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}✅ Search complete. Use 'grep -r \"term\" .' for custom searches.${NC}"