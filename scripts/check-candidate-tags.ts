import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCandidateTags() {
  console.log('Checking candidate tags for Kailum profile...\n');
  
  const profileId = '02fb18e4-1964-409f-8a0c-1de1ab35651e';
  
  // Check if there are any tags for this candidate
  const { data: candidateTags, error: tagError } = await supabase
    .from('candidate_tags')
    .select(`
      id,
      candidate_id,
      tag_id,
      tags (
        id,
        name,
        category,
        is_active
      )
    `)
    .eq('candidate_id', profileId);
  
  if (tagError) {
    console.error('Error fetching candidate tags:', tagError);
    return;
  }
  
  console.log(`Found ${candidateTags?.length || 0} tags for this profile:`);
  candidateTags?.forEach((ct, index) => {
    console.log(`${index + 1}. ${ct.tags?.name} (${ct.tags?.category})`);
  });
  
  // Check all available tags in the system
  const { data: allTags, error: allTagsError } = await supabase
    .from('tags')
    .select('id, name, category, is_active')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  
  if (allTagsError) {
    console.error('Error fetching all tags:', allTagsError);
    return;
  }
  
  console.log(`\n\nTotal tags in system: ${allTags?.length || 0}`);
  
  // Group by category
  const tagsByCategory = allTags?.reduce((acc: any, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag.name);
    return acc;
  }, {});
  
  console.log('\nTags by category:');
  Object.entries(tagsByCategory || {}).forEach(([category, tags]) => {
    console.log(`\n${category}: ${(tags as string[]).length} tags`);
    console.log((tags as string[]).slice(0, 5).join(', ') + (((tags as string[]).length > 5) ? '...' : ''));
  });
  
  // Check private metadata for skills
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('private_metadata')
    .eq('id', profileId)
    .single();
  
  if (!profileError && profile) {
    console.log('\n\nPrivate metadata skills:');
    const privateMetadata = profile.private_metadata || {};
    console.log('Skills:', privateMetadata.skills || 'None');
    console.log('Tags:', privateMetadata.tags || 'None');
  }
}

checkCandidateTags();