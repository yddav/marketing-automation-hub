#!/bin/bash

# UNTRAPD ECOSYSTEM - PERFORMANCE MONITORING SCRIPT
set -euo pipefail

DOMAIN="yourdomain.com"
LOG_FILE="/var/log/untrapd/performance.log"

# Performance test
performance_test() {
    local url="https://$DOMAIN"
    local metrics=$(curl -s -o /dev/null -w "time_total:%{time_total},size_download:%{size_download},speed_download:%{speed_download}" "$url")
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Performance Metrics: $metrics" >> "$LOG_FILE"
    
    # Extract time_total
    local load_time=$(echo "$metrics" | grep -o 'time_total:[0-9.]*' | cut -d: -f2)
    
    if (( $(echo "$load_time < 2.0" | bc -l) )); then
        echo "✅ Load time: ${load_time}s (Good)"
    elif (( $(echo "$load_time < 5.0" | bc -l) )); then
        echo "⚠️  Load time: ${load_time}s (Acceptable)"
    else
        echo "❌ Load time: ${load_time}s (Poor)"
    fi
}

main() {
    echo "Performance monitoring for: $DOMAIN"
    performance_test
}

main "$@"
