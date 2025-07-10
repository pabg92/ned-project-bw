import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentTags() {
  console.log('Checking current tags for Kailum profile...\n');
  
  const profileId = '02fb18e4-1964-409f-8a0c-1de1ab35651e';
  
  // Get all tags linked to this profile
  const { data: candidateTags, error: tagError } = await supabase
    .from('candidate_tags')
    .select(`
      id,
      tag_id,
      tags:tag_id (
        id,
        name
      )
    `)
    .eq('candidate_id', profileId);
  
  if (tagError) {
    console.error('Error fetching candidate tags:', tagError);
    return;
  }
  
  console.log(`Found ${candidateTags?.length || 0} tags linked to this profile:`);
  candidateTags?.forEach((ct, index) => {
    console.log(`${index + 1}. ${ct.tags?.name || 'Unknown'}`);
  });
  
  // Check private metadata
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('private_metadata')
    .eq('id', profileId)
    .single();
  
  if (!profileError && profile) {
    const pm = profile.private_metadata || {};
    console.log('\n\nPrivate metadata content:');
    console.log('Skills:', pm.skills);
    console.log('Functional Expertise:', pm.functionalExpertise);
    console.log('Industry Expertise:', pm.industryExpertise);
  }
}

checkCurrentTags();