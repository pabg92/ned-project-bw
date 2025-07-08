import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSignupIssue() {
  console.log('=== DEBUGGING SIGNUP UUID/TEXT MISMATCH ===\n');
  
  // 1. Check if audit log table has the correct column types
  const { data: auditColumns, error: auditError } = await supabase
    .rpc('get_table_columns', { 
      table_name: 'user_audit_logs',
      schema_name: 'public' 
    })
    .select('*');
    
  if (auditError) {
    // Try a different approach
    console.log('Checking audit log structure...');
    const { data: sample, error: sampleError } = await supabase
      .from('user_audit_logs')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log('Cannot query audit logs:', sampleError.message);
    } else {
      console.log('Sample audit log entry:', sample);
    }
  } else {
    console.log('Audit log columns:', auditColumns);
  }
  
  // 2. Check the users table structure
  console.log('\nChecking users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .limit(5);
    
  if (usersError) {
    console.log('Error querying users:', usersError);
  } else {
    console.log('Sample user IDs:');
    users?.forEach(user => {
      console.log(`  ${user.id} (${typeof user.id}) - ${user.email}`);
    });
  }
  
  // 3. Try to manually insert a user with TEXT ID
  console.log('\nTrying manual insert with TEXT ID...');
  const testId = `user_test_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  
  console.log(`Inserting user with ID: ${testId}`);
  
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      id: testId,
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      role: 'candidate',
      is_active: true
    })
    .select()
    .single();
    
  if (insertError) {
    console.log('Insert failed:', insertError);
    console.log('Error details:', {
      code: insertError.code,
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint
    });
  } else {
    console.log('Insert successful:', newUser);
    
    // Clean up
    await supabase.from('users').delete().eq('id', testId);
    console.log('Cleaned up test user');
  }
  
  // 4. Check database schema information
  console.log('\nChecking column data types...');
  const schemaQuery = `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_audit_logs')
    AND column_name IN ('id', 'user_id', 'admin_id', 'record_id')
    ORDER BY table_name, column_name;
  `;
  
  const { data: schema, error: schemaError } = await supabase
    .rpc('execute_sql', { query: schemaQuery })
    .single();
    
  if (schemaError) {
    // Try direct query
    console.log('Note: Cannot query schema directly');
  } else {
    console.log('Schema information:', schema);
  }
}

debugSignupIssue().catch(console.error);