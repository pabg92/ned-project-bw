import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { processProfileOnApproval } from '../lib/services/admin-profile-processor';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reprocessProfiles() {
  console.log('🔄 Starting profile reprocessing...\n');
  
  // Find profiles that have work experiences in metadata but not in database
  const { data: profiles, error } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      users!candidate_profiles_user_id_fkey (
        email,
        first_name,
        last_name
      ),
      private_metadata,
      admin_notes
    `)
    .eq('is_active', true)
    .eq('profile_completed', true);
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log(`Found ${profiles?.length || 0} active profiles to check\n`);
  
  for (const profile of profiles || []) {
    // Check if profile has work experiences in metadata
    const metadataWorkExp = profile.private_metadata?.workExperiences?.length || 0;
    
    // Check if profile has work experiences in database
    const { data: dbWorkExp } = await supabase
      .from('work_experiences')
      .select('id')
      .eq('candidate_id', profile.id);
      
    const dbWorkExpCount = dbWorkExp?.length || 0;
    
    if (metadataWorkExp > 0 && dbWorkExpCount === 0) {
      console.log(`📋 Profile needs reprocessing: ${profile.users.first_name} ${profile.users.last_name}`);
      console.log(`   - Email: ${profile.users.email}`);
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - Work experiences in metadata: ${metadataWorkExp}`);
      console.log(`   - Work experiences in database: ${dbWorkExpCount}`);
      
      // Reprocess the profile
      console.log('   ⚙️ Reprocessing...');
      
      try {
        const result = await processProfileOnApproval(profile.id, 'recovery-script');
        
        if (result.success) {
          console.log('   ✅ Reprocessing successful!');
          if (result.errors && result.errors.length > 0) {
            console.log('   ⚠️ Some errors occurred:', result.errors);
          }
        } else {
          console.log('   ❌ Reprocessing failed:', result.error);
        }
      } catch (err) {
        console.error('   ❌ Error during reprocessing:', err);
      }
      
      console.log('');
    }
  }
  
  // Special check for Victoria's profile
  const victoriaId = 'de6f426d-40e4-4776-a788-38dcddbe28fc';
  console.log('\n🔍 Checking Victoria\'s profile specifically...');
  
  const { data: victoria } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      work_experiences (id),
      deal_experiences (id),
      board_committees (id)
    `)
    .eq('id', victoriaId)
    .single();
    
  if (victoria) {
    console.log('Victoria\'s profile status:');
    console.log(`- Work experiences: ${victoria.work_experiences?.length || 0}`);
    console.log(`- Deal experiences: ${victoria.deal_experiences?.length || 0}`);
    console.log(`- Board committees: ${victoria.board_committees?.length || 0}`);
    console.log(`- Processing status:`, victoria.private_metadata?.processingStatus);
    
    if (victoria.work_experiences?.length === 0) {
      console.log('\n⚙️ Reprocessing Victoria\'s profile...');
      const result = await processProfileOnApproval(victoriaId, 'recovery-script');
      console.log('Result:', result);
    }
  }
  
  console.log('\n✅ Reprocessing complete!');
}

reprocessProfiles().catch(console.error);