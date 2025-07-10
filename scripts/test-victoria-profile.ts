import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVictoriaProfile() {
  const profileId = 'de6f426d-40e4-4776-a788-38dcddbe28fc';
  
  console.log('🔍 Checking Victoria Ashworth\'s profile processing status...\n');
  
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
      work_experiences (
        id,
        company_name,
        position,
        is_board_position,
        company_type
      ),
      deal_experiences (
        id,
        company_name,
        deal_type,
        deal_value
      ),
      board_committees (
        id,
        committee_type
      ),
      board_experience_types (
        id,
        experience_type
      )
    `)
    .eq('id', profileId)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return;
  }
  
  console.log('Profile:', profile.users.first_name, profile.users.last_name);
  console.log('Email:', profile.users.email);
  console.log('Status:', profile.is_active ? 'Active' : 'Inactive');
  console.log('Completed:', profile.profile_completed ? 'Yes' : 'No');
  
  console.log('\n📊 Data Processing Results:');
  console.log(`✅ Work Experiences: ${profile.work_experiences?.length || 0} records`);
  if (profile.work_experiences?.length > 0) {
    profile.work_experiences.forEach((exp: any) => {
      console.log(`   - ${exp.position} at ${exp.company_name} (Board: ${exp.is_board_position ? 'Yes' : 'No'})`);
    });
  }
  
  console.log(`\n💼 Deal Experiences: ${profile.deal_experiences?.length || 0} records`);
  if (profile.deal_experiences?.length > 0) {
    profile.deal_experiences.forEach((deal: any) => {
      console.log(`   - ${deal.deal_type} at ${deal.company_name} (£${deal.deal_value}M)`);
    });
  }
  
  console.log(`\n🏛️ Board Committees: ${profile.board_committees?.length || 0} records`);
  if (profile.board_committees?.length > 0) {
    profile.board_committees.forEach((committee: any) => {
      console.log(`   - ${committee.committee_type}`);
    });
  }
  
  console.log(`\n🏢 Board Experience Types: ${profile.board_experience_types?.length || 0} records`);
  if (profile.board_experience_types?.length > 0) {
    profile.board_experience_types.forEach((type: any) => {
      console.log(`   - ${type.experience_type}`);
    });
  }
  
  // Check processing status in metadata
  if (profile.private_metadata?.processingStatus) {
    console.log('\n⚙️ Processing Status:');
    console.log('Status:', profile.private_metadata.processingStatus.status);
    console.log('Last Processed:', profile.private_metadata.processingStatus.lastProcessedAt);
    if (profile.private_metadata.processingStatus.errors) {
      console.log('Errors:', profile.private_metadata.processingStatus.errors);
    }
  }
  
  // Check what's in private metadata vs database
  console.log('\n🔍 Data Verification:');
  const metadataWorkExp = profile.private_metadata?.workExperiences?.length || 0;
  const dbWorkExp = profile.work_experiences?.length || 0;
  console.log(`Work Experiences - Metadata: ${metadataWorkExp}, Database: ${dbWorkExp}`);
  
  if (metadataWorkExp > dbWorkExp) {
    console.log('⚠️ Some work experiences may not have been processed!');
  }
  
  console.log('\n🌐 View full CV at:');
  console.log(`http://localhost:3000/search/${profileId}`);
}

testVictoriaProfile().catch(console.error);