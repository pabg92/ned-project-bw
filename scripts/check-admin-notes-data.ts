import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminNotesData() {
  console.log('Checking admin_notes content in recent profiles...\n');
  
  // Get the most recent profiles with admin_notes
  const { data: profiles, error } = await supabase
    .from('candidate_profiles')
    .select('id, user_id, admin_notes, private_metadata, created_at')
    .not('admin_notes', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  profiles?.forEach((profile, i) => {
    console.log(`\n${i + 1}. Profile ID: ${profile.id}`);
    console.log(`   Created: ${profile.created_at}`);
    console.log(`   Has admin_notes: ${!!profile.admin_notes}`);
    console.log(`   Has private_metadata: ${!!profile.private_metadata}`);
    
    if (profile.admin_notes) {
      try {
        const parsed = JSON.parse(profile.admin_notes);
        console.log(`   admin_notes contains: ${Object.keys(parsed).join(', ')}`);
        console.log(`   - dealExperiences: ${parsed.dealExperiences?.length || 0}`);
        console.log(`   - boardCommittees: ${parsed.boardCommittees?.length || 0}`);
        console.log(`   - workExperiences: ${parsed.workExperiences?.length || 0}`);
        console.log(`   - boardExperienceTypes: ${parsed.boardExperienceTypes?.length || 0}`);
      } catch (e) {
        console.log(`   admin_notes is not JSON: "${profile.admin_notes?.substring(0, 50)}..."`);
      }
    }
    
    if (profile.private_metadata) {
      console.log(`\n   private_metadata contains:`);
      console.log(`   - dealExperiences: ${profile.private_metadata.dealExperiences?.length || 0}`);
      console.log(`   - boardCommittees: ${profile.private_metadata.boardCommittees?.length || 0}`);
      console.log(`   - workExperiences: ${profile.private_metadata.workExperiences?.length || 0}`);
      console.log(`   - boardExperienceTypes: ${profile.private_metadata.boardExperienceTypes?.length || 0}`);
    }
  });
}

checkAdminNotesData();