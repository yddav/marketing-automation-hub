#!/bin/bash

# Claude Code with Smart CCR Fallback
# Maintains user control over model switching

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_FILE="/tmp/ccr-claude-session.json"
FALLBACK_SCRIPT="$SCRIPT_DIR/ccr-fallback.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[Claude-CCR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  [Claude-CCR]${NC} $1"
}

print_error() {
    echo -e "${RED}❌ [Claude-CCR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ [Claude-CCR]${NC} $1"
}

check_ccr_status() {
    if ! command -v ccr &> /dev/null; then
        print_error "CCR not found. Please install Claude Code Router first."
        exit 1
    fi
    
    # Check if CCR service is running
    if ! ccr status &> /dev/null; then
        print_warning "CCR service not running. Starting..."
        ccr start
    fi
}

get_session_state() {
    if [[ -f "$SESSION_FILE" ]]; then
        node -e "
            const session = JSON.parse(require('fs').readFileSync('$SESSION_FILE', 'utf8'));
            console.log(session.usingFallback ? 'fallback' : 'claude');
        "
    else
        echo "claude"
    fi
}

prompt_user_choice() {
    local message="$1"
    echo -e "\n${YELLOW}$message${NC}"
    echo "Your options:"
    echo "  y) Switch back to Claude Code"
    echo "  n) Continue with CCR models"
    echo "  s) Show current session status"
    
    read -p "Choice (y/n/s): " choice
    echo "$choice"
}

show_session_status() {
    if [[ -f "$SESSION_FILE" ]]; then
        echo -e "\n${BLUE}📊 Current Session Status:${NC}"
        node -e "
            const session = JSON.parse(require('fs').readFileSync('$SESSION_FILE', 'utf8'));
            console.log(\`Mode: \${session.usingFallback ? 'CCR Fallback' : 'Claude Code'}\`);
            console.log(\`Session started: \${new Date(session.startTime).toLocaleString()}\`);
            console.log(\`Switches: \${session.switches || 0}\`);
            if (session.lastSwitch) {
                console.log(\`Last switch: \${new Date(session.lastSwitch).toLocaleString()}\`);
            }
        "
    else
        echo -e "\n${BLUE}📊 No active session${NC}"
    fi
}

# Main execution function
execute_with_smart_fallback() {
    local prompt="$1"
    local task_type="${2:-general}"
    
    print_status "Initializing smart fallback system..."
    check_ccr_status
    
    local current_mode=$(get_session_state)
    
    if [[ "$current_mode" == "fallback" ]]; then
        print_warning "Currently using CCR fallback mode"
        
        # Check if Claude might be available again
        print_status "Checking if Claude Code is available..."
        
        # Simple availability test (you can customize this)
        if timeout 5s bash -c 'echo "test" | head -1' &> /dev/null; then
            choice=$(prompt_user_choice "🔄 Claude Code appears to be available again!")
            
            case "$choice" in
                y|Y)
                    print_success "Switching back to Claude Code..."
                    # Update session to use Claude
                    node -e "
                        const fs = require('fs');
                        const session = fs.existsSync('$SESSION_FILE') ? 
                            JSON.parse(fs.readFileSync('$SESSION_FILE', 'utf8')) : 
                            { startTime: Date.now(), switches: 0 };
                        session.usingFallback = false;
                        session.lastSwitch = Date.now();
                        session.switches = (session.switches || 0) + 1;
                        fs.writeFileSync('$SESSION_FILE', JSON.stringify(session, null, 2));
                    "
                    
                    print_success "Now using Claude Code. Use 'claude-fallback' if you hit limits again."
                    return 0
                    ;;
                s|S)
                    show_session_status
                    execute_with_smart_fallback "$prompt" "$task_type"
                    return $?
                    ;;
                *)
                    print_status "Continuing with CCR models..."
                    ;;
            esac
        fi
        
        # Execute with CCR
        print_status "Executing with CCR models..."
        node "$FALLBACK_SCRIPT" "$prompt" "$task_type"
        
    else
        print_status "Using Claude Code (normal mode)"
        print_status "If you hit rate limits, this will automatically offer CCR fallback"
        
        # Here you would normally execute with Claude Code
        # For now, we'll simulate and potentially trigger fallback
        echo -e "\n${GREEN}🤖 [Simulated Claude Response]${NC}"
        echo "This is where your Claude Code response would appear."
        echo "Prompt: $prompt"
        
        # Simulate occasional rate limiting for demo
        if (( RANDOM % 3 == 0 )); then
            print_error "Simulated: Claude rate limit reached!"
            
            choice=$(prompt_user_choice "🔄 Would you like to switch to CCR models?")
            
            case "$choice" in
                y|Y)
                    print_warning "Switching to CCR fallback mode..."
                    # Update session to use fallback
                    node -e "
                        const fs = require('fs');
                        const session = fs.existsSync('$SESSION_FILE') ? 
                            JSON.parse(fs.readFileSync('$SESSION_FILE', 'utf8')) : 
                            { startTime: Date.now(), switches: 0 };
                        session.usingFallback = true;
                        session.lastSwitch = Date.now();
                        session.switches = (session.switches || 0) + 1;
                        fs.writeFileSync('$SESSION_FILE', JSON.stringify(session, null, 2));
                    "
                    
                    print_status "Now using CCR models. Will monitor for Claude reset."
                    node "$FALLBACK_SCRIPT" "$prompt" "$task_type"
                    ;;
                s|S)
                    show_session_status
                    ;;
                *)
                    print_status "Staying with Claude Code (you may need to wait)"
                    ;;
            esac
        fi
    fi
}

# Command line interface
show_help() {
    echo "Claude Code with Smart CCR Fallback"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  execute \"prompt\" [task_type]    Execute with smart fallback"
    echo "  status                          Show current session status"
    echo "  reset                           Reset to Claude Code mode"
    echo "  ccr-only                        Force CCR mode"
    echo "  help                            Show this help"
    echo ""
    echo "Task types: coding, analysis, longContext, general"
    echo ""
    echo "Examples:"
    echo "  $0 execute \"Write a Python function\" coding"
    echo "  $0 status"
    echo "  $0 reset"
}

case "${1:-help}" in
    execute|e)
        if [[ -z "$2" ]]; then
            print_error "Please provide a prompt"
            echo "Usage: $0 execute \"your prompt\" [task_type]"
            exit 1
        fi
        execute_with_smart_fallback "$2" "$3"
        ;;
    status|s)
        show_session_status
        ;;
    reset|r)
        print_status "Resetting to Claude Code mode..."
        rm -f "$SESSION_FILE"
        print_success "Reset complete. Next execution will use Claude Code."
        ;;
    ccr-only|ccr)
        print_status "Forcing CCR mode..."
        node -e "
            const fs = require('fs');
            const session = { 
                usingFallback: true, 
                startTime: Date.now(), 
                switches: 0,
                forced: true
            };
            fs.writeFileSync('$SESSION_FILE', JSON.stringify(session, null, 2));
        "
        print_success "Now in CCR-only mode. Use 'reset' to return to Claude."
        ;;
    help|h|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac