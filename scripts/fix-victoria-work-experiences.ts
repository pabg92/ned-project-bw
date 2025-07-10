import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixVictoriaWorkExperiences() {
  const profileId = 'de6f426d-40e4-4776-a788-38dcddbe28fc';
  
  console.log('🔧 Fixing Victoria\'s work experiences...\n');
  
  // Get the profile metadata
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('private_metadata')
    .eq('id', profileId)
    .single();
    
  if (!profile?.private_metadata?.workExperiences) {
    console.error('No work experiences found in metadata');
    return;
  }
  
  const workExperiences = profile.private_metadata.workExperiences;
  console.log(`Found ${workExperiences.length} work experiences in metadata\n`);
  
  // Process work experiences with the corrected 'position' field
  const workExps = workExperiences.map((exp: any, index: number) => {
    console.log(`Processing: ${exp.title} at ${exp.companyName}`);
    return {
      candidate_id: profileId,
      company_name: exp.companyName,
      position: exp.title, // Using 'position' not 'title'
      location: exp.location || null,
      start_date: exp.startDate ? `${exp.startDate}-01` : null,
      end_date: exp.endDate && exp.endDate !== '' ? `${exp.endDate}-01` : null,
      is_current: exp.isCurrent || false,
      description: exp.description || null,
      is_board_position: exp.isBoardPosition || false,
      company_type: exp.companyType || null
    };
  });
  
  // Insert work experiences
  const { error } = await supabase
    .from('work_experiences')
    .insert(workExps);
    
  if (error) {
    console.error('\n❌ Error inserting work experiences:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  } else {
    console.log(`\n✅ Successfully inserted ${workExps.length} work experiences!`);
    
    // Update processing status
    const updatedMetadata = { ...profile.private_metadata };
    updatedMetadata.processingStatus = {
      status: 'completed',
      lastProcessedAt: new Date().toISOString(),
      completedSteps: [
        'tags',
        'workExperiences',
        'education',
        'dealExperiences',
        'boardCommittees',
        'boardExperienceTypes'
      ]
    };
    
    await supabase
      .from('candidate_profiles')
      .update({ private_metadata: updatedMetadata })
      .eq('id', profileId);
      
    console.log('✅ Updated processing status to completed');
  }
  
  console.log('\n🎯 View Victoria\'s complete CV at:');
  console.log(`http://localhost:3000/search/${profileId}`);
}

fixVictoriaWorkExperiences().catch(console.error);