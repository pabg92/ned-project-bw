import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkIdIssue() {
  console.log('Checking for ID conflicts between users and candidate_profiles...\n');
  
  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  console.log(`Found ${users?.length || 0} recent users:`);
  users?.forEach(user => {
    console.log(`- User ID: ${user.id} (${user.first_name} ${user.last_name} - ${user.email})`);
  });

  // Get all candidate profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('candidate_profiles')
    .select('id, user_id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (profilesError) {
    console.error('Error fetching candidate profiles:', profilesError);
    return;
  }

  console.log(`\nFound ${profiles?.length || 0} recent candidate profiles:`);
  profiles?.forEach(profile => {
    console.log(`- Profile ID: ${profile.id} | User ID: ${profile.user_id} | Title: ${profile.title}`);
  });

  // Check for any ID conflicts
  console.log('\nChecking for ID conflicts...');
  const userIds = new Set(users?.map(u => u.id) || []);
  const profileIds = new Set(profiles?.map(p => p.id) || []);
  
  const conflicts = [];
  for (const id of userIds) {
    if (profileIds.has(id)) {
      conflicts.push(id);
    }
  }

  if (conflicts.length > 0) {
    console.log('\n⚠️  FOUND ID CONFLICTS:');
    conflicts.forEach(id => {
      console.log(`- ID "${id}" exists in both users and candidate_profiles tables!`);
    });
  } else {
    console.log('\n✅ No ID conflicts found between users and candidate_profiles tables');
  }

  // Check data types
  console.log('\n\nChecking data types...');
  if (users && users.length > 0) {
    console.log(`User ID type: ${typeof users[0].id} (value: ${users[0].id})`);
  }
  if (profiles && profiles.length > 0) {
    console.log(`Profile ID type: ${typeof profiles[0].id} (value: ${profiles[0].id})`);
    console.log(`Profile User ID type: ${typeof profiles[0].user_id} (value: ${profiles[0].user_id})`);
  }
}

checkIdIssue();