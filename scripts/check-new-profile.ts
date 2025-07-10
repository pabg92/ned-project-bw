import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNewProfile() {
  console.log('Checking profile 333590b2-2672-45a8-a560-cce2d1faf3db...\n');
  
  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', '333590b2-2672-45a8-a560-cce2d1faf3db')
    .single();
  
  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    return;
  }
  
  console.log('Profile found:');
  console.log('- ID:', profile.id);
  console.log('- Title:', profile.title);
  console.log('- Location:', profile.location);
  console.log('- Is Active:', profile.is_active);
  console.log('- Profile Completed:', profile.profile_completed);
  console.log('- Is Anonymized:', profile.is_anonymized);
  console.log('- Created:', profile.created_at);
  
  console.log('\nAdmin Notes:');
  if (profile.admin_notes) {
    try {
      const adminData = JSON.parse(profile.admin_notes);
      console.log('- Has structured data:', true);
      console.log('- Deal Experiences:', adminData.dealExperiences?.length || 0);
      console.log('- Board Committees:', adminData.boardCommittees?.length || 0);
      console.log('- Work Experiences:', adminData.workExperiences?.length || 0);
      console.log('- Education:', adminData.education?.length || 0);
      console.log('- Board Experience:', adminData.boardExperience);
      console.log('- Board Experience Types:', adminData.boardExperienceTypes);
      
      // Check if it has all new fields
      console.log('\nNew fields check:');
      console.log('- Has dealExperiences?', !!adminData.dealExperiences);
      console.log('- Has boardCommittees?', !!adminData.boardCommittees);
      
      // Log first deal if exists
      if (adminData.dealExperiences && adminData.dealExperiences.length > 0) {
        console.log('\nFirst deal experience:');
        console.log(JSON.stringify(adminData.dealExperiences[0], null, 2));
      }
    } catch (e) {
      console.log('- Admin notes are not JSON');
      console.log('- Content:', profile.admin_notes);
    }
  } else {
    console.log('- No admin notes');
  }
  
  console.log('\nPrivate Metadata:');
  console.log(JSON.stringify(profile.private_metadata, null, 2));
  
  // Check the user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', profile.user_id)
    .single();
  
  if (user) {
    console.log('\nUser info:');
    console.log('- First Name:', user.first_name);
    console.log('- Last Name:', user.last_name);
    console.log('- Email:', user.email);
  }
  
  // Check approval status
  const approvalStatus = profile.private_metadata?.approvalStatus || 'pending';
  console.log('\n\nApproval Status:', approvalStatus);
  console.log('\nTo approve this profile, you need to:');
  console.log('1. Go to http://localhost:3000/admin/candidates');
  console.log('2. Find this profile and click "Approve"');
  console.log('3. The profile will then be processed and enriched');
}

checkNewProfile();