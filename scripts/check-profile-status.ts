import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfile() {
  const profileId = '5f33a969-36c0-4402-84e7-0fffa0577104';
  
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', profileId)
    .single();
  
  console.log('Profile status:');
  console.log('- is_active:', profile?.is_active);
  console.log('- is_anonymized:', profile?.is_anonymized);
  console.log('- profile_completed:', profile?.profile_completed);
  console.log('- has admin_notes:', !!profile?.admin_notes);
  console.log('- title:', profile?.title);
  
  // Check if admin_notes contains the signup data
  if (profile?.admin_notes) {
    try {
      const adminData = JSON.parse(profile.admin_notes);
      console.log('\nAdmin notes contains:');
      console.log('- Deal experiences:', adminData.dealExperiences?.length || 0);
      console.log('- Board committees:', adminData.boardCommittees?.length || 0);
      console.log('- Work experiences:', adminData.workExperiences?.length || 0);
      console.log('- Board experience types:', adminData.boardExperienceTypes?.length || 0);
      console.log('- Tags:', adminData.tags?.length || 0);
    } catch (e) {
      console.log('Admin notes is not JSON:', profile.admin_notes);
    }
  }
  
  // Check the user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', profile?.user_id)
    .single();
    
  console.log('\nUser info:');
  console.log('- Name:', user?.first_name, user?.last_name);
  console.log('- Email:', user?.email);
  
  console.log('\n\nTo approve this profile:');
  console.log('1. Run: npx tsx scripts/approve-profile.ts');
  console.log('2. Or go to: http://localhost:3000/admin/candidates');
}

checkProfile();