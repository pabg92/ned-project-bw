import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findRecentCompanyUsers() {
  console.log('🔍 Finding recent company users...\n');
  
  try {
    // Get all recent users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at, clerk_id')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log('Recent users:');
    console.log('==============');
    
    users?.forEach(user => {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Name: ${user.first_name || 'Not set'} ${user.last_name || ''}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`User ID: ${user.id}`);
      console.log(`Clerk ID: ${user.clerk_id || 'Not set'}`);
      console.log('---');
    });
    
    // Check specifically for auth.pg@gmail.com
    console.log('\n🔍 Searching for auth.pg@gmail.com specifically...\n');
    
    const { data: authUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'auth.pg@gmail.com')
      .single();
      
    if (authUser) {
      console.log('✅ Found auth.pg@gmail.com!');
      console.log('User details:', authUser);
    } else {
      console.log('❌ auth.pg@gmail.com not found in users table');
      console.log('\nThis user might:');
      console.log('1. Not have completed signup yet');
      console.log('2. Be stuck in Clerk without syncing to database');
      console.log('3. Have a different email in the database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

findRecentCompanyUsers().catch(console.error);