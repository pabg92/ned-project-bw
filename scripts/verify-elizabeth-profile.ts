import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyElizabethProfile() {
  const profileId = '97f933ca-44a5-4516-95dc-5ca76c4cda19';
  
  console.log('🔍 Verifying Elizabeth Windsor\'s profile data...\n');
  
  // Get the profile with all related data
  const { data: profile, error } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      users!candidate_profiles_user_id_fkey (
        email,
        first_name,
        last_name
      ),
      work_experiences (count),
      deal_experiences (count),
      board_committees (count),
      board_experience_types (count)
    `)
    .eq('id', profileId)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return;
  }
  
  console.log('Profile:', profile.users.first_name, profile.users.last_name);
  console.log('Status:', profile.is_active ? 'Active' : 'Inactive (needs approval)');
  
  console.log('\n📦 Data in private_metadata:');
  if (profile.private_metadata) {
    console.log('- Deal experiences:', profile.private_metadata.dealExperiences?.length || 0);
    console.log('- Board committees:', profile.private_metadata.boardCommittees?.length || 0);
    console.log('- Board experience types:', profile.private_metadata.boardExperienceTypes?.length || 0);
    console.log('- Work experiences:', profile.private_metadata.workExperiences?.length || 0);
  }
  
  console.log('\n📊 Data in database tables:');
  console.log('- Work experiences:', profile.work_experiences?.[0]?.count || 0);
  console.log('- Deal experiences:', profile.deal_experiences?.[0]?.count || 0);
  console.log('- Board committees:', profile.board_committees?.[0]?.count || 0);
  console.log('- Board experience types:', profile.board_experience_types?.[0]?.count || 0);
  
  if (!profile.is_active) {
    console.log('\n⚠️ Profile needs approval!');
    console.log('After approval, the processor should move data from private_metadata to database tables.');
  }
  
  console.log('\n🌐 View profile at:');
  console.log(`http://localhost:3000/search/${profileId}`);
}

verifyElizabethProfile().catch(console.error);