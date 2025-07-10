import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');
  
  try {
    // Get column information using raw SQL
    const { data: columns, error } = await supabase.rpc('get_table_columns', {
      schema_name: 'public',
      table_name: 'users'
    }).select('*');
      
    if (error) {
      console.error('Error fetching columns:', error);
      return;
    }
    
    console.log('Users table columns:');
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    // Check for triggers
    const { data: triggers } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation')
      .eq('event_object_schema', 'public')
      .eq('event_object_table', 'users');
      
    if (triggers && triggers.length > 0) {
      console.log('\nTriggers on users table:');
      triggers.forEach(t => {
        console.log(`  - ${t.trigger_name} (${t.event_manipulation})`);
      });
    }
    
    // Try a simple update to see if it works
    console.log('\n🧪 Testing simple update...');
    const { error: testError } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', 'test-id-that-does-not-exist');
      
    if (testError) {
      console.log('Update test error:', testError);
    } else {
      console.log('✅ Update query syntax is valid');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsersTable().catch(console.error);