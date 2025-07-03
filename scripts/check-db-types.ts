import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabaseTypes() {
  console.log('🔍 Checking database column types...\n');

  try {
    // Check users table
    const { data: userColumns } = await supabaseAdmin
      .from('information_schema.columns' as any)
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .in('column_name', ['id']);

    console.log('📊 Users table:');
    console.log('- id column type:', userColumns?.[0]?.data_type || 'not found');

    // Check candidate_profiles table
    const { data: profileColumns } = await supabaseAdmin
      .from('information_schema.columns' as any)
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'candidate_profiles')
      .in('column_name', ['id', 'user_id']);

    console.log('\n📊 Candidate_profiles table:');
    profileColumns?.forEach(col => {
      console.log(`- ${col.column_name} column type:`, col.data_type);
    });

    // Check companies table
    const { data: companyColumns } = await supabaseAdmin
      .from('information_schema.columns' as any)
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'companies')
      .in('column_name', ['id']);

    console.log('\n📊 Companies table:');
    console.log('- id column type:', companyColumns?.[0]?.data_type || 'not found');

    console.log('\n✅ Type check complete!');
    console.log('\n📝 Migration should use:');
    console.log('- user_id references: TEXT (for Clerk IDs)');
    console.log('- profile_id references: UUID (for candidate_profiles.id)');
    console.log('- company_id references: Check the type above');

  } catch (error) {
    console.error('❌ Error checking types:', error);
  }
}

checkDatabaseTypes().catch(console.error);