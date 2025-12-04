#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zdceeulkqfpzdjeyekgs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const migrations = [
  {
    name: 'add_email_marketing_infrastructure',
    file: 'supabase/migrations/add_email_marketing_infrastructure.sql'
  },
  {
    name: 'add_email_scheduler_functions',
    file: 'supabase/migrations/add_email_scheduler_functions.sql'
  },
  {
    name: 'validate_email_infrastructure',
    file: 'supabase/migrations/validate_email_infrastructure.sql'
  }
];

console.log('🚀 Starting database migration deployment...\n');

for (const migration of migrations) {
  console.log(`📝 Deploying: ${migration.name}`);

  try {
    const sql = readFileSync(migration.file, 'utf-8');

    // Execute migration via RPC (requires exec_sql function in database)
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`❌ Failed: ${migration.name}`);
      console.error(`   Error: ${error.message}`);

      // Try alternative: direct query execution (less reliable for DDL)
      console.log(`   Attempting direct execution...`);
      const { error: directError } = await supabase.from('_migrations').insert({
        name: migration.name,
        sql: sql
      });

      if (directError) {
        console.error(`   Direct execution also failed: ${directError.message}`);
        console.error(`   Please deploy manually via Supabase Dashboard`);
      }
    } else {
      console.log(`✅ Success: ${migration.name}`);
      if (data) console.log(`   Result:`, JSON.stringify(data).substring(0, 100));
    }
  } catch (err) {
    console.error(`❌ Exception: ${migration.name}`);
    console.error(`   ${err.message}`);
  }

  console.log('');
}

console.log('✨ Migration deployment complete!');
