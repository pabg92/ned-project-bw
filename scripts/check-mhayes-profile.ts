import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMhayesProfile() {
  console.log('Checking for mhayes@championsukplc.com...\n');
  
  // 1. Check if user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'mhayes@championsukplc.com')
    .single();
    
  if (userError) {
    console.log('Error finding user:', userError.message);
    return;
  }
  
  console.log('Found user:');
  console.log('- ID:', user.id);
  console.log('- Name:', user.first_name, user.last_name);
  console.log('- Role:', user.role);
  console.log('- Active:', user.is_active);
  console.log('- Created:', user.created_at);
  
  // 2. Check if they have a candidate profile
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (profileError) {
    console.log('\n❌ No candidate profile found for this user!');
    console.log('This explains why they don\'t appear in admin candidates list.');
    
    // Let's create the profile
    console.log('\nCreating candidate profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('candidate_profiles')
      .insert({
        user_id: user.id,
        title: 'Executive', // Default title
        summary: 'Profile pending completion',
        experience: 'senior',
        location: 'To be determined',
        remote_preference: 'flexible',
        availability: 'immediately',
        is_active: false,
        profile_completed: false,
        is_anonymized: true,
        salary_currency: 'USD'
      })
      .select()
      .single();
      
    if (createError) {
      console.log('Failed to create profile:', createError.message);
    } else {
      console.log('✅ Created profile:', newProfile.id);
    }
  } else {
    console.log('\nFound candidate profile:');
    console.log('- Profile ID:', profile.id);
    console.log('- Title:', profile.title);
    console.log('- Active:', profile.is_active);
    console.log('- Completed:', profile.profile_completed);
  }
  
  // 3. Check all users without profiles
  console.log('\n\nChecking for other users without profiles...');
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .order('created_at', { ascending: false });
    
  const { data: allProfiles } = await supabase
    .from('candidate_profiles')
    .select('user_id');
    
  const profileUserIds = new Set(allProfiles?.map(p => p.user_id) || []);
  const usersWithoutProfiles = allUsers?.filter(u => !profileUserIds.has(u.id)) || [];
  
  if (usersWithoutProfiles.length > 0) {
    console.log(`Found ${usersWithoutProfiles.length} users without profiles:`);
    usersWithoutProfiles.forEach(u => {
      console.log(`- ${u.email} (${u.first_name} ${u.last_name}) - ID: ${u.id}`);
    });
  } else {
    console.log('All users have profiles.');
  }
}