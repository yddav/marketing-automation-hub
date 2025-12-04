#!/bin/bash

# Supabase Migration Deployment Script
# Deploys email marketing infrastructure to Supabase

set -e

SUPABASE_URL="https://zdceeulkqfpzdjeyekgs.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY2VldWxrcWZwemRqZXlla2dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ4NTE0NiwiZXhwIjoyMDY1MDYxMTQ2fQ.waTWz-6b9x7hK8cQLn_nxzLoN6RaJ5Fw9A6eqqdK3yo"

echo "🚀 Deploying Email Marketing Infrastructure to Supabase..."
echo "Project: zdceeulkqfpzdjeyekgs"
echo ""

# Function to execute SQL via Supabase REST API
execute_sql() {
    local sql_file="$1"
    local description="$2"

    echo "📝 Executing: $description"
    echo "   File: $sql_file"

    # Read SQL file
    SQL_CONTENT=$(cat "$sql_file")

    # Execute via Supabase REST API (using PostgREST)
    curl -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}" \
        2>&1 | head -20

    echo "   ✅ Done"
    echo ""
}

# Deploy migrations in order
echo "Step 1/3: Creating tables, indexes, RLS policies..."
execute_sql "supabase/migrations/add_email_marketing_infrastructure.sql" "Email Marketing Infrastructure"

echo "Step 2/3: Creating SQL helper functions..."
execute_sql "supabase/migrations/add_email_scheduler_functions.sql" "Email Scheduler Functions"

echo "Step 3/3: Validating infrastructure..."
execute_sql "supabase/migrations/validate_email_infrastructure.sql" "Infrastructure Validation"

echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify tables created in Supabase Dashboard"
echo "2. Configure Netlify environment variables"
echo "3. Test beta signup flow"
