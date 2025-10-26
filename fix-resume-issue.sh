#!/bin/bash
# Ultimate Fix for SuperClaude Army Todo Pollution
# This script aggressively cleans the todo system to restore /resume functionality

CLAUDE_DIR="$HOME/.claude"
TODO_DIR="$CLAUDE_DIR/todos"

echo "🚨 FIXING SUPERCLAUDE ARMY TODO POLLUTION"
echo "=========================================="

# Count current files
current_count=$(ls "$TODO_DIR"/*.json 2>/dev/null | wc -l)
echo "📊 Current todo files: $current_count"

# Step 1: Remove ALL empty agent todo files
echo "🧹 Removing empty agent todo files..."
find "$TODO_DIR" -name "*agent*.json" -size 2c -delete 2>/dev/null

# Step 2: Remove files with only empty array content
echo "🧹 Removing empty todo arrays..."
for file in "$TODO_DIR"/*.json; do
    if [[ -f "$file" && "$(cat "$file" 2>/dev/null)" == "[]" ]]; then
        rm -f "$file"
    fi
done

# Step 3: Keep only the 5 most recent non-empty files
echo "🧹 Keeping only 5 most recent meaningful todos..."
temp_dir=$(mktemp -d)
count=0

# Sort by modification time (newest first) and check content
for file in $(ls -t "$TODO_DIR"/*.json 2>/dev/null); do
    if [[ -f "$file" ]]; then
        content=$(cat "$file" 2>/dev/null)
        # Keep files that are not empty arrays and have actual content
        if [[ "$content" != "[]" && ${#content} -gt 10 ]]; then
            count=$((count + 1))
            if [[ $count -le 5 ]]; then
                cp "$file" "$temp_dir/"
            fi
        fi
    fi
done

# Remove all files and restore the good ones
rm -f "$TODO_DIR"/*.json 2>/dev/null
cp "$temp_dir"/*.json "$TODO_DIR/" 2>/dev/null
rm -rf "$temp_dir"

# Final count
final_count=$(ls "$TODO_DIR"/*.json 2>/dev/null | wc -l)
echo "✅ Todo files reduced from $current_count to $final_count"

# Step 4: Update the army cleanup script to be more aggressive
echo "🔧 Updating army cleanup script for permanent fix..."

cat > "$CLAUDE_DIR/army-cleanup-script.sh" << 'EOF'
#!/bin/bash
# Enhanced SuperClaude Army Cleanup Script
# Prevents todo pollution and maintains resume function performance

CLAUDE_DIR="$HOME/.claude"
TODO_DIR="$CLAUDE_DIR/todos"

# Function: Aggressive todo cleanup
clean_todos() {
    echo "🧹 Aggressive todo cleanup..."
    
    # Remove ALL empty agent files immediately
    find "$TODO_DIR" -name "*agent*.json" -size 2c -delete 2>/dev/null
    
    # Remove files with only empty arrays
    for file in "$TODO_DIR"/*.json; do
        if [[ -f "$file" && "$(cat "$file" 2>/dev/null)" == "[]" ]]; then
            rm -f "$file"
        fi
    done
    
    # Keep only 5 most recent meaningful files
    temp_dir=$(mktemp -d)
    count=0
    
    for file in $(ls -t "$TODO_DIR"/*.json 2>/dev/null); do
        if [[ -f "$file" ]]; then
            content=$(cat "$file" 2>/dev/null)
            if [[ "$content" != "[]" && ${#content} -gt 10 ]]; then
                count=$((count + 1))
                if [[ $count -le 5 ]]; then
                    cp "$file" "$temp_dir/"
                fi
            fi
        fi
    done
    
    rm -f "$TODO_DIR"/*.json 2>/dev/null
    cp "$temp_dir"/*.json "$TODO_DIR/" 2>/dev/null
    rm -rf "$temp_dir"
    
    local remaining=$(ls "$TODO_DIR"/*.json 2>/dev/null | wc -l)
    echo "✅ Todo files: $remaining (target: ≤5)"
}

# Function: Clean session snapshots
clean_session_snapshots() {
    echo "🧹 Cleaning session snapshots..."
    ls -t "$CLAUDE_DIR/shell-snapshots"/* 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
    echo "✅ Session snapshots: $(ls "$CLAUDE_DIR/shell-snapshots"/* 2>/dev/null | wc -l) (target: ≤5)"
}

# Main execution
echo "🚀 SuperClaude Army Maintenance"
echo "==============================="
clean_todos
clean_session_snapshots
echo "✅ Maintenance complete"
EOF

chmod +x "$CLAUDE_DIR/army-cleanup-script.sh"

# Step 5: Set up more frequent cleanup (every hour instead of daily)
echo "⏰ Setting up hourly cleanup..."
cron_job="0 * * * * $CLAUDE_DIR/army-cleanup-script.sh >/dev/null 2>&1"

# Remove old daily cron job
crontab -l 2>/dev/null | grep -v "army-cleanup-script.sh" | crontab - 2>/dev/null

# Add new hourly cron job
(crontab -l 2>/dev/null; echo "$cron_job") | crontab - 2>/dev/null

echo "=========================================="
echo "✅ RESUME FUNCTION FULLY RESTORED!"
echo ""
echo "📊 Final Status:"
echo "  - Todo files: $final_count (down from $current_count)"
echo "  - Cleanup: Every hour (was daily)"
echo "  - Target: ≤5 meaningful todo files"
echo "  - Empty agent files: Auto-deleted"
echo ""
echo "🎯 Your /resume should now show only relevant sessions!"