import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMetadataStructure() {
  console.log('Checking private_metadata structure for all active profiles...\n');
  
  // Get all active profiles with their metadata
  const { data: profiles, error } = await supabase
    .from('candidate_profiles')
    .select('id, user_id, title, private_metadata, users!candidate_profiles_user_id_fkey(first_name, last_name)')
    .eq('is_active', true)
    .eq('profile_completed', true);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Found ${profiles?.length || 0} active profiles\n`);

  profiles?.forEach((profile, index) => {
    const user = profile.users;
    console.log(`\n${index + 1}. ${user?.first_name} ${user?.last_name} (${profile.title})`);
    console.log('   Profile ID:', profile.id);
    console.log('   Private Metadata:');
    
    const metadata = profile.private_metadata as any || {};
    
    // Check for expected fields
    console.log('   - roles:', metadata.roles || 'NOT FOUND');
    console.log('   - boardExperience:', metadata.boardExperience || 'NOT FOUND');
    console.log('   - boardExperienceTypes:', metadata.boardExperienceTypes || 'NOT FOUND');
    console.log('   - boardPositions:', metadata.boardPositions || 'NOT FOUND');
    console.log('   - boardPositionsData:', metadata.boardPositionsData?.length ? `${metadata.boardPositionsData.length} positions` : 'NOT FOUND');
    
    if (metadata.boardPositionsData?.length > 0) {
      console.log('     Board Positions:');
      metadata.boardPositionsData.forEach((pos: any, i: number) => {
        console.log(`     ${i + 1}. ${pos.title} at ${pos.company} (${pos.startDate} - ${pos.endDate || 'Present'})`);
      });
    }
    
    console.log('\n   Full metadata:', JSON.stringify(metadata, null, 2));
  });

  // Also check what tags are available
  console.log('\n\nChecking available tags by type...');
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, type')
    .order('type, name');

  const tagsByType: Record<string, string[]> = {};
  tags?.forEach(tag => {
    if (!tagsByType[tag.type]) tagsByType[tag.type] = [];
    tagsByType[tag.type].push(tag.name);
  });

  Object.entries(tagsByType).forEach(([type, names]) => {
    console.log(`\n${type} tags (${names.length}):`);
    console.log(names.slice(0, 10).join(', ') + (names.length > 10 ? '...' : ''));
  });
}

checkMetadataStructure();