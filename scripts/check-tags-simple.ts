import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTagsSimple() {
  console.log('Checking tags with simple query...\n');
  
  const profileId = '02fb18e4-1964-409f-8a0c-1de1ab35651e';
  
  // Simple query to get candidate tags
  const { data: candidateTags, error: tagError } = await supabase
    .from('candidate_tags')
    .select('*')
    .eq('candidate_id', profileId);
  
  if (tagError) {
    console.error('Error fetching candidate tags:', tagError);
  } else {
    console.log(`Found ${candidateTags?.length || 0} candidate tag records`);
    if (candidateTags && candidateTags.length > 0) {
      console.log('First record:', candidateTags[0]);
    }
  }
  
  // Get tags separately
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .limit(5);
  
  if (tagsError) {
    console.error('Error fetching tags:', tagsError);
  } else {
    console.log(`\nSample tags from tags table:`);
    tags?.forEach(tag => {
      console.log(`- ${tag.name} (ID: ${tag.id})`);
    });
  }
  
  // If we have candidate tags, try to manually join
  if (candidateTags && candidateTags.length > 0) {
    console.log('\n\nManually joining tags:');
    for (const ct of candidateTags) {
      const { data: tag } = await supabase
        .from('tags')
        .select('name')
        .eq('id', ct.tag_id)
        .single();
      
      if (tag) {
        console.log(`- ${tag.name}`);
      }
    }
  }
  
  // Check the profile page URL
  console.log(`\n\nProfile URL: http://localhost:3001/search/${profileId}`);
}

checkTagsSimple();