import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugJamesProfile() {
  const profileId = '60de3fa9-8f52-4a57-94c2-fb67faf55669';
  
  console.log('🔍 Debugging James Montgomery\'s profile display issue...\n');
  
  // Get the full profile data
  const { data: profile, error } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      users!candidate_profiles_user_id_fkey (
        email,
        first_name,
        last_name
      ),
      deal_experiences (*),
      board_committees (*),
      board_experience_types (*),
      work_experiences (*)
    `)
    .eq('id', profileId)
    .single();
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📋 Profile Settings:');
  console.log('- is_active:', profile.is_active);
  console.log('- profile_completed:', profile.profile_completed);
  console.log('- is_anonymized:', profile.is_anonymized);
  console.log('- Name:', profile.users.first_name, profile.users.last_name);
  
  console.log('\n💼 Work Experiences in DB:', profile.work_experiences.length);
  profile.work_experiences.forEach((exp: any) => {
    console.log(`  - ${exp.position} at ${exp.company_name}`);
  });
  
  console.log('\n💰 Deal Experiences in DB:', profile.deal_experiences.length);
  profile.deal_experiences.forEach((deal: any) => {
    console.log(`  - ${deal.deal_type}: ${deal.company_name} (${deal.deal_currency}${deal.deal_value}M)`);
  });
  
  console.log('\n🏛️ Board Committees in DB:', profile.board_committees.length);
  profile.board_committees.forEach((com: any) => {
    console.log(`  - ${com.committee_type}`);
  });
  
  console.log('\n❓ Issue Analysis:');
  if (profile.is_anonymized) {
    console.log('⚠️ Profile is set to anonymized - this hides the name and shows "Executive Profile"');
    console.log('   This is correct behavior for the credit system');
  }
  
  console.log('\n💡 The profile display route checks:');
  console.log('1. If user has unlocked the profile with credits');
  console.log('2. If user is viewing their own profile');
  console.log('3. Only then shows full details including PE data');
  
  console.log('\n🔓 To see full profile details:');
  console.log('- Click "Unlock Profile (1 Credit)" button');
  console.log('- Or log in as James Montgomery himself');
  console.log('- Or temporarily set is_anonymized to false (for testing only)');
}

debugJamesProfile().catch(console.error);