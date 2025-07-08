import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDatabaseState() {
  console.log('=== VERIFYING DATABASE STATE ===\n');
  
  // 1. Check all users
  console.log('1. ALL USERS:');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, created_at')
    .order('created_at', { ascending: false });
    
  if (usersError) {
    console.log('Error fetching users:', usersError);
  } else {
    users?.forEach(user => {
      console.log(`- ${user.email}`);
      console.log(`  ID: ${user.id} (${typeof user.id})`);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log(`  Role: ${user.role}, Active: ${user.is_active}`);
      console.log(`  Created: ${user.created_at}`);
      console.log('');
    });
  }
  
  // 2. Check all candidate profiles
  console.log('\n2. ALL CANDIDATE PROFILES:');
  const { data: profiles, error: profilesError } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      user_id,
      title,
      is_active,
      profile_completed,
      created_at,
      users!candidate_profiles_user_id_fkey(
        email,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });
    
  if (profilesError) {
    console.log('Error fetching profiles:', profilesError);
  } else {
    profiles?.forEach(profile => {
      console.log(`- Profile ID: ${profile.id}`);
      console.log(`  User: ${profile.users?.email} (${profile.users?.first_name} ${profile.users?.last_name})`);
      console.log(`  User ID: ${profile.user_id}`);
      console.log(`  Title: ${profile.title}`);
      console.log(`  Active: ${profile.is_active}, Completed: ${profile.profile_completed}`);
      console.log(`  Created: ${profile.created_at}`);
      console.log('');
    });
  }
  
  // 3. Check users without profiles
  console.log('\n3. USERS WITHOUT PROFILES:');
  const profileUserIds = new Set(profiles?.map(p => p.user_id) || []);
  const usersWithoutProfiles = users?.filter(u => !profileUserIds.has(u.id)) || [];
  
  if (usersWithoutProfiles.length > 0) {
    console.log(`Found ${usersWithoutProfiles.length} users without profiles:`);
    usersWithoutProfiles.forEach(u => {
      console.log(`- ${u.email} (ID: ${u.id})`);
    });
  } else {
    console.log('✅ All users have profiles');
  }
  
  // 4. Check the trigger status
  console.log('\n4. CHECKING TRIGGER ERROR:');
  console.log('The error "record new has no field user_id" indicates the audit trigger needs to be fixed.');
  console.log('You need to run the migration: 20250104_complete_audit_fix.sql');
  
  // 5. Summary for admin panel
  console.log('\n5. ADMIN PANEL SUMMARY:');
  const activeProfiles = profiles?.filter(p => p.is_active) || [];
  const inactiveProfiles = profiles?.filter(p => !p.is_active) || [];
  
  console.log(`- Total profiles: ${profiles?.length || 0}`);
  console.log(`- Active profiles: ${activeProfiles.length}`);
  console.log(`- Inactive profiles: ${inactiveProfiles.length}`);
  console.log(`- Users without profiles: ${usersWithoutProfiles.length}`);
}

verifyDatabaseState().catch(console.error);