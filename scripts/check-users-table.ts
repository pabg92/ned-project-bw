import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersTable() {
  // Try to query users table to see what columns exist
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Users table columns:', Object.keys(data[0]));
  } else {
    console.log('No users found, trying to insert a test user...');
    
    // Try without phone field
    const { data: testUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: 'test_' + Date.now(),
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'candidate',
        is_active: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Successfully created user with columns:', Object.keys(testUser));
      // Clean up
      await supabase.from('users').delete().eq('id', testUser.id);
    }
  }
}

checkUsersTable();