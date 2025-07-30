#!/bin/bash
if [[ -f staging-server.pid ]]; then
    PID=$(cat staging-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Staging server stopped (PID: $PID)"
        rm staging-server.pid
    else
        echo "Staging server not running"
        rm -f staging-server.pid
    fi
else
    echo "No staging server PID file found"
fi
