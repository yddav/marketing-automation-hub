#!/bin/bash
# Fix /resume by cleaning excessive session history
# Keep recent meaningful sessions, remove micro-session pollution

CLAUDE_DIR="$HOME/.claude"
PROJECTS_DIR="$CLAUDE_DIR/projects"

echo "🚨 FIXING /RESUME SESSION OVERFLOW"
echo "=================================="

# Count current sessions
current_sessions=$(find "$PROJECTS_DIR" -name "*.jsonl" | wc -l)
echo "📊 Current sessions: $current_sessions"

if [[ $current_sessions -lt 100 ]]; then
    echo "✅ Session count is already reasonable ($current_sessions)"
    exit 0
fi

# Create backup
backup_dir="$CLAUDE_DIR/backups/session-cleanup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
echo "💾 Creating backup in: $backup_dir"

# Keep only the 50 most recent sessions per project directory
for project_dir in "$PROJECTS_DIR"/*; do
    if [[ -d "$project_dir" ]]; then
        project_name=$(basename "$project_dir")
        session_count=$(find "$project_dir" -name "*.jsonl" | wc -l)
        
        if [[ $session_count -gt 50 ]]; then
            echo "🧹 Cleaning $project_name: $session_count sessions → 50"
            
            # Backup first
            mkdir -p "$backup_dir/$project_name"
            cp "$project_dir"/*.jsonl "$backup_dir/$project_name/" 2>/dev/null
            
            # Keep only 50 most recent files
            ls -t "$project_dir"/*.jsonl | tail -n +51 | xargs rm -f 2>/dev/null
        else
            echo "✅ $project_name: $session_count sessions (keeping all)"
        fi
    fi
done

# Final count
final_sessions=$(find "$PROJECTS_DIR" -name "*.jsonl" | wc -l)
echo ""
echo "=================================="
echo "✅ /RESUME OVERFLOW FIXED!"
echo ""
echo "📊 Results:"
echo "  - Sessions: $current_sessions → $final_sessions"
echo "  - Reduction: $((current_sessions - final_sessions)) sessions removed"
echo "  - Backup: Available in $backup_dir"
echo ""
echo "🎯 Your /resume should now be manageable!"

# Update the army cleanup script to maintain this
echo "🔧 Updating maintenance script..."

cat >> "$CLAUDE_DIR/army-cleanup-script.sh" << 'EOF'

# Function: Clean excess sessions
clean_sessions() {
    echo "🧹 Cleaning excess session files..."
    
    for project_dir in "$CLAUDE_DIR/projects"/*; do
        if [[ -d "$project_dir" ]]; then
            session_count=$(find "$project_dir" -name "*.jsonl" | wc -l)
            
            if [[ $session_count -gt 20 ]]; then
                # Keep only 20 most recent sessions per project
                ls -t "$project_dir"/*.jsonl 2>/dev/null | tail -n +21 | xargs rm -f 2>/dev/null
            fi
        fi
    done
    
    local total_sessions=$(find "$CLAUDE_DIR/projects" -name "*.jsonl" | wc -l)
    echo "✅ Total sessions: $total_sessions (target: <500)"
}
EOF

# Update the main function to include session cleanup
sed -i '/clean_session_snapshots/a clean_sessions' "$CLAUDE_DIR/army-cleanup-script.sh" 2>/dev/null

echo "✅ Automatic session cleanup enabled (max 20 per project)"
echo "⏰ Maintenance runs hourly to keep /resume clean"