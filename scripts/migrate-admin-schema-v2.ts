import { config } from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables are not set');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateAdminSchema() {
  console.log('🚀 Starting admin schema migration (v2)...\n');
  console.log('⚠️  Note: This migration requires manual execution in Supabase SQL Editor');
  console.log('📝 Generating migration SQL file...\n');

  try {
    // Read the admin schema SQL file (using safe version that checks for table existence)
    const schemaPath = path.join(process.cwd(), 'src/lib/supabase/admin-schema-safe.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');

    // Create a migration file with instructions
    const migrationContent = `-- Admin Schema Migration
-- Generated on: ${new Date().toISOString()}
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Run the query
--
-- This migration adds:
-- - User audit logs table
-- - User versions tables
-- - Soft delete support
-- - Admin notes fields
-- - Automatic triggers for audit trail
--

${schemaSql}

-- Verification queries (run these after migration):
-- Check new tables:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_audit_logs', 'user_versions', 'candidate_profile_versions');

-- Check new columns:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('admin_notes', 'deleted_at', 'deleted_by', 'deletion_reason');

-- Check triggers:
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public';
`;

    // Write migration file
    const outputPath = path.join(process.cwd(), 'admin-schema-migration.sql');
    await fs.writeFile(outputPath, migrationContent);

    console.log('✅ Migration file created: admin-schema-migration.sql');
    console.log('\n📋 Next steps:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy the contents of admin-schema-migration.sql');
    console.log('5. Run the query');
    console.log('\n💡 Tip: You can also run smaller parts of the migration separately if needed.');

    // Test connection to Supabase
    console.log('\n🔍 Testing Supabase connection...');
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      
      // Try to check if migration tables exist
      const { data: auditTable } = await supabaseAdmin
        .from('user_audit_logs')
        .select('count')
        .limit(1);

      if (auditTable && !auditTable.error) {
        console.log('\n⚠️  Warning: user_audit_logs table already exists.');
        console.log('   The migration script will handle this with IF NOT EXISTS clauses.');
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log('- New tables: 3 (user_audit_logs, user_versions, candidate_profile_versions)');
    console.log('- Modified tables: 3 (users, candidate_profiles, companies)');
    console.log('- New triggers: 5');
    console.log('- New indexes: 9');
    console.log('- New views: 3');

  } catch (error) {
    console.error('❌ Error preparing migration:', error);
    process.exit(1);
  }
}

// Alternative: Try to execute via Supabase Management API if available
async function tryDirectMigration() {
  console.log('\n🔄 Attempting direct migration via Supabase client...');
  
  try {
    // First, let's check what tables exist
    const { data: existingTables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_audit_logs', 'user_versions', 'candidate_profile_versions']);

    if (!tablesError && existingTables) {
      console.log('📊 Existing tables:', existingTables.map(t => t.table_name).join(', ') || 'none');
    }

    // Check for existing columns
    const { data: existingColumns, error: columnsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .in('column_name', ['admin_notes', 'deleted_at', 'deleted_by', 'deletion_reason']);

    if (!columnsError && existingColumns) {
      console.log('📊 Existing columns in users table:', existingColumns.map(c => c.column_name).join(', ') || 'none');
    }

    console.log('\n✅ Database inspection complete.');
    console.log('⚠️  Direct migration via TypeScript is not supported.');
    console.log('📝 Please use the generated SQL file with Supabase SQL Editor.');

  } catch (error) {
    console.error('❌ Direct migration attempt failed:', error);
  }
}

// Run the migration preparation
migrateAdminSchema().then(() => {
  tryDirectMigration();
}).catch(console.error);