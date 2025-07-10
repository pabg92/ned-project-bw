import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTagsToKailum() {
  console.log('Adding tags to Kailum profile...\n');
  
  const profileId = '02fb18e4-1964-409f-8a0c-1de1ab35651e';
  
  // Define tags to add
  const tagsToAdd = [
    { name: 'Strategic Planning', category: 'skill' },
    { name: 'Corporate Governance', category: 'skill' },
    { name: 'M&A', category: 'skill' },
    { name: 'Risk Management', category: 'skill' },
    { name: 'Financial Management', category: 'skill' },
    { name: 'Board Leadership', category: 'expertise' },
    { name: 'Private Equity', category: 'expertise' },
    { name: 'Audit Committee', category: 'expertise' },
    { name: 'Technology', category: 'industry' },
    { name: 'Financial Services', category: 'industry' },
    { name: 'Retail', category: 'industry' }
  ];
  
  // First, ensure tags exist
  for (const tag of tagsToAdd) {
    const { data: existingTag, error: checkError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tag.name)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // Tag doesn't exist, create it
      const { data: newTag, error: createError } = await supabase
        .from('tags')
        .insert({
          name: tag.name,
          category: tag.category,
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`Failed to create tag ${tag.name}:`, createError);
        continue;
      }
      
      console.log(`Created tag: ${tag.name} (${tag.category})`);
      
      // Add to candidate
      const { error: linkError } = await supabase
        .from('candidate_tags')
        .insert({
          candidate_id: profileId,
          tag_id: newTag.id
        });
      
      if (linkError) {
        console.error(`Failed to link tag ${tag.name}:`, linkError);
      } else {
        console.log(`Linked tag ${tag.name} to profile`);
      }
    } else if (existingTag) {
      // Tag exists, just link it
      // Check if already linked
      const { data: existingLink } = await supabase
        .from('candidate_tags')
        .select('id')
        .eq('candidate_id', profileId)
        .eq('tag_id', existingTag.id)
        .single();
      
      if (!existingLink) {
        const { error: linkError } = await supabase
          .from('candidate_tags')
          .insert({
            candidate_id: profileId,
            tag_id: existingTag.id
          });
        
        if (linkError) {
          console.error(`Failed to link tag ${tag.name}:`, linkError);
        } else {
          console.log(`Linked tag ${tag.name} to profile`);
        }
      } else {
        console.log(`Tag ${tag.name} already linked`);
      }
    }
  }
  
  // Also update private metadata with skills
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('private_metadata')
    .eq('id', profileId)
    .single();
  
  if (!profileError && profile) {
    const privateMetadata = profile.private_metadata || {};
    privateMetadata.skills = tagsToAdd.filter(t => t.category === 'skill').map(t => t.name);
    privateMetadata.functionalExpertise = tagsToAdd.filter(t => t.category === 'expertise').map(t => t.name);
    privateMetadata.industryExpertise = tagsToAdd.filter(t => t.category === 'industry').map(t => t.name);
    
    const { error: updateError } = await supabase
      .from('candidate_profiles')
      .update({ private_metadata: privateMetadata })
      .eq('id', profileId);
    
    if (updateError) {
      console.error('Failed to update private metadata:', updateError);
    } else {
      console.log('\nUpdated private metadata with skills');
    }
  }
  
  console.log('\n✅ Tags added successfully!');
}

addTagsToKailum();