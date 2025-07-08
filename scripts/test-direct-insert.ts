import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDirectInsert() {
  console.log('Testing direct database insert...\n');
  
  const testId = `user_test_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  
  console.log('1. Attempting to insert user...');
  console.log('   ID:', testId);
  console.log('   Email:', testEmail);
  
  // First, let's check if the audit trigger is the issue by disabling it temporarily
  console.log('\n2. Testing with direct SQL (bypassing triggers)...');
  
  const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
    query: `
      INSERT INTO users (id, email, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    params: [testId, testEmail, 'Test', 'User', 'candidate', true]
  }).single();
  
  if (sqlError) {
    // Try a simpler approach
    console.log('\n3. Testing with Supabase client...');
    
    const { data: insertResult, error: insertError } = await supabase
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
      console.log('\n❌ Insert failed!');
      console.log('Error:', insertError.message);
      console.log('Code:', insertError.code);
      console.log('Details:', insertError.details);
      console.log('Hint:', insertError.hint);
      
      // Check if it's a foreign key issue
      if (insertError.message.includes('foreign key')) {
        console.log('\n⚠️  This is a foreign key constraint error.');
        console.log('The error mentions a UUID, which suggests:');
        console.log('1. The audit log might still be expecting UUID format');
        console.log('2. Or there\'s another table with a foreign key to users');
      }
    } else {
      console.log('\n✅ Insert successful!');
      console.log('User created:', insertResult);
      
      // Clean up
      await supabase.from('users').delete().eq('id', testId);
      console.log('Cleaned up test user');
    }
  } else {
    console.log('\n✅ SQL insert successful!');
    console.log('User created:', sqlResult);
  }
  
  // 4. Let's also check what happens when we query existing users
  console.log('\n4. Checking existing user structure...');
  const { data: existingUsers, error: queryError } = await supabase
    .from('users')
    .select('*')
    .limit(2);
    
  if (!queryError && existingUsers) {
    console.log('Existing users:');
    existingUsers.forEach(user => {
      console.log(`- ID: ${user.id} (type: ${typeof user.id})`);
      console.log(`  Email: ${user.email}`);
    });
  }
}

testDirectInsert().catch(console.error);