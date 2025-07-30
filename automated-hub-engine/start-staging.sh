#!/bin/bash
source staging-config.env
cd staging-deployment
nohup python3 -m http.server $PORT > ../staging-server.log 2>&1 &
echo $! > ../staging-server.pid
echo "Staging server started on port $PORT"
