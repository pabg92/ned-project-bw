import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkJamesStatus() {
  const profileId = '60de3fa9-8f52-4a57-94c2-fb67faf55669';
  
  console.log('🔍 Checking James Montgomery\'s profile status...\n');
  
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
  console.log('Email:', profile.users.email);
  console.log('Active:', profile.is_active ? '✅ Yes' : '❌ No (needs approval)');
  console.log('Completed:', profile.profile_completed ? '✅ Yes' : '❌ No');
  console.log('Admin Notes:', profile.admin_notes ? profile.admin_notes.substring(0, 50) + '...' : 'Empty');
  
  console.log('\n📦 Data in private_metadata:');
  if (profile.private_metadata) {
    console.log('- Deal experiences:', profile.private_metadata.dealExperiences?.length || 0);
    console.log('- Board committees:', profile.private_metadata.boardCommittees?.length || 0);
    console.log('- Board experience types:', profile.private_metadata.boardExperienceTypes?.length || 0);
    console.log('- Work experiences:', profile.private_metadata.workExperiences?.length || 0);
    console.log('- Processing status:', profile.private_metadata.processingStatus?.status || 'Not processed');
  }
  
  console.log('\n📊 Data in database tables:');
  console.log('- Work experiences:', profile.work_experiences?.[0]?.count || 0);
  console.log('- Deal experiences:', profile.deal_experiences?.[0]?.count || 0);
  console.log('- Board committees:', profile.board_committees?.[0]?.count || 0);
  console.log('- Board experience types:', profile.board_experience_types?.[0]?.count || 0);
  
  if (!profile.is_active) {
    console.log('\n⚠️ ACTION REQUIRED:');
    console.log('1. Go to: http://localhost:3000/admin/candidates');
    console.log('2. Find James Montgomery and click "Approve"');
    console.log('3. This will trigger the processor to move PE data from private_metadata to database tables');
  } else if (profile.private_metadata?.processingStatus?.status === 'completed') {
    console.log('\n✅ Profile has been approved and processed!');
    console.log('All PE data should now be visible in the CV.');
  }
  
  console.log('\n🌐 View profile at:');
  console.log(`http://localhost:3000/search/${profileId}`);
}

checkJamesStatus().catch(console.error);