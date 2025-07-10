import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTagsToProfile() {
  const profileId = '02fb18e4-1964-409f-8a0c-1de1ab35651e';

  try {
    // Define tags to add
    const tagsToAdd = [
      // Skills
      { name: 'Financial Strategy', type: 'skill' },
      { name: 'M&A', type: 'skill' },
      { name: 'Corporate Finance', type: 'skill' },
      { name: 'Risk Management', type: 'skill' },
      { name: 'ESG & Sustainability', type: 'skill' },
      { name: 'Strategic Planning', type: 'skill' },
      { name: 'Leadership', type: 'skill' },
      { name: 'Corporate Governance', type: 'skill' },
      // Industries
      { name: 'Sports & Entertainment', type: 'industry' },
      { name: 'Retail', type: 'industry' },
      { name: 'Real Estate', type: 'industry' },
      { name: 'Financial Services', type: 'industry' },
    ];

    // First, ensure all tags exist
    for (const tag of tagsToAdd) {
      const { error } = await supabase
        .from('tags')
        .upsert(
          { name: tag.name, type: tag.type },
          { onConflict: 'name' }
        );
      
      if (error) {
        console.error(`Error creating tag ${tag.name}:`, error);
      }
    }

    // Get all tag IDs
    const { data: existingTags, error: fetchError } = await supabase
      .from('tags')
      .select('id, name, type')
      .in('name', tagsToAdd.map(t => t.name));

    if (fetchError) {
      console.error('Error fetching tags:', fetchError);
      return;
    }

    console.log('Found tags:', existingTags);

    // Delete existing candidate tags to avoid duplicates
    await supabase
      .from('candidate_tags')
      .delete()
      .eq('candidate_id', profileId);

    // Add candidate tags
    if (existingTags && existingTags.length > 0) {
      const candidateTagsToInsert = existingTags.map(tag => ({
        candidate_id: profileId,
        tag_id: tag.id
      }));

      const { error: tagError } = await supabase
        .from('candidate_tags')
        .insert(candidateTagsToInsert);

      if (tagError) {
        console.error('Error inserting candidate tags:', tagError);
      } else {
        console.log(`Added ${candidateTagsToInsert.length} tags to profile`);
      }
    }

    // Also update the education to use correct date format
    const { data: educationRecords } = await supabase
      .from('education')
      .select('*')
      .eq('candidate_id', profileId);

    console.log('Current education records:', educationRecords);

    // If no education exists, let's add some
    if (!educationRecords || educationRecords.length === 0) {
      const education = [
        {
          candidate_id: profileId,
          institution: 'London Business School',
          degree: 'MBA',
          field_of_study: 'Business Administration',
          end_date: '1995-06-01'
        },
        {
          candidate_id: profileId,
          institution: 'University of Manchester',
          degree: 'BSc Economics',
          field_of_study: 'Economics',
          end_date: '1988-06-01'
        }
      ];

      const { error: eduError } = await supabase
        .from('education')
        .insert(education);

      if (eduError) {
        console.error('Error inserting education:', eduError);
      } else {
        console.log('Education records added');
      }
    }

    console.log('Tags and education setup complete!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
addTagsToProfile();