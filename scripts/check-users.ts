import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  // Check existing users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, first_name, last_name')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('Existing users:');
  if (users) {
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
    });
  }
  
  if (error) {
    console.log('Error:', error);
  }
  
  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('id, user_id, title, is_active, profile_completed')
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log('\nExisting profiles:');
  if (profiles) {
    profiles.forEach(profile => {
      console.log(`- ${profile.id}: ${profile.title} (User: ${profile.user_id}) - Active: ${profile.is_active}, Complete: ${profile.profile_completed}`);
    });
  }
}

checkUsers();