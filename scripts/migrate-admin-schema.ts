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

async function migrateAdminSchema() {
  console.log('🚀 Starting admin schema migration...\n');

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the admin schema SQL file
    const schemaPath = path.join(process.cwd(), 'src/lib/supabase/admin-schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');

    console.log('📋 Applying admin schema extensions...');
    
    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        // Use Supabase's rpc to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        }).single();
        
        if (error) {
          // Try direct execution as fallback
          const { error: directError } = await supabase
            .from('_sql')
            .select()
            .eq('query', statement + ';')
            .single();
            
          if (directError) {
            throw directError;
          }
        }
        
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] Statement executed successfully`);
      } catch (error: any) {
        errorCount++;
        errors.push({ statement: statement.substring(0, 100) + '...', error: error.message });
        console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n✨ Admin schema migration completed successfully!');
      console.log('\n📝 New features added:');
      console.log('  - User audit logs table for tracking all changes');
      console.log('  - User versions table for historical data');
      console.log('  - Candidate profile versions table');
      console.log('  - Admin notes fields on user tables');
      console.log('  - Soft delete support with deleted_at timestamps');
      console.log('  - Automatic audit logging triggers');
      console.log('  - Version tracking triggers');
      console.log('  - RLS policies for new tables');
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the output above.');
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((e, i) => {
        console.log(`\n${i + 1}. Statement: ${e.statement}`);
        console.log(`   Error: ${e.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateAdminSchema().catch(console.error);