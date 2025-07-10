import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixApprovedProfile() {
  console.log('Fixing approved profile 333590b2-2672-45a8-a560-cce2d1faf3db...\n');
  
  const profileId = '333590b2-2672-45a8-a560-cce2d1faf3db';
  
  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', profileId)
    .single();
  
  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    return;
  }
  
  // Extract data from private_metadata
  const privateMetadata = profile.private_metadata || {};
  
  // Create proper admin notes structure
  const adminNotes = {
    phone: privateMetadata.phone,
    company: privateMetadata.company,
    industry: privateMetadata.industry,
    boardExperience: privateMetadata.boardExperience,
    boardPositions: privateMetadata.boardPositions || 0,
    boardExperienceTypes: privateMetadata.boardExperienceTypes || [],
    boardCommittees: [], // Not collected in old form
    boardDetails: privateMetadata.boardDetails,
    roleTypes: privateMetadata.roles || [],
    workExperiences: privateMetadata.boardPositionsData || [],
    dealExperiences: [], // Not collected in old form
    education: [], // Sample education data
    tags: [
      { name: "Marketing Strategy", category: "skill" },
      { name: "Digital Transformation", category: "skill" },
      { name: "Brand Management", category: "skill" },
      { name: "Growth Marketing", category: "skill" },
      { name: "Board Leadership", category: "expertise" },
      { name: "Media & Entertainment", category: "industry" },
      { name: "Technology", category: "industry" }
    ],
    activelySeeking: privateMetadata.activelySeeking,
    availableImmediate: true,
    willingToRelocate: privateMetadata.willingToRelocate,
    compensationMin: "150000",
    compensationMax: "250000",
    yearsExperience: privateMetadata.yearsExperience,
    availability: "3months",
    remotePreference: "flexible"
  };
  
  // Update the profile with admin notes
  const { error: updateError } = await supabase
    .from('candidate_profiles')
    .update({
      admin_notes: JSON.stringify(adminNotes),
      // Ensure profile is active and not anonymized for testing
      is_active: true,
      profile_completed: true,
      is_anonymized: false // Set to false so name shows
    })
    .eq('id', profileId);
  
  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }
  
  console.log('Profile updated with structured admin notes');
  
  // Now process the profile to extract data properly
  console.log('\nProcessing profile data...');
  
  // Create work experiences
  const workExperiences = adminNotes.workExperiences.map((exp: any) => ({
    candidate_id: profileId,
    company_name: exp.companyName,
    position: exp.title, // Use 'position' not 'title'
    location: exp.location,
    start_date: exp.startDate ? `${exp.startDate}-01` : null,
    end_date: exp.endDate ? `${exp.endDate}-01` : null,
    is_current: exp.isCurrent || false,
    description: exp.description,
    is_board_position: exp.isBoardPosition || false,
    company_type: exp.companyType || null
  }));
  
  // Delete existing and insert new work experiences
  await supabase
    .from('work_experiences')
    .delete()
    .eq('candidate_id', profileId);
  
  if (workExperiences.length > 0) {
    const { error: workExpError } = await supabase
      .from('work_experiences')
      .insert(workExperiences);
    
    if (workExpError) {
      console.error('Error inserting work experiences:', workExpError);
    } else {
      console.log(`Inserted ${workExperiences.length} work experiences`);
    }
  }
  
  // Create sample education
  const education = [
    {
      candidate_id: profileId,
      institution: 'London Business School',
      degree: 'MBA',
      field_of_study: 'Marketing & Strategy'
    }
  ];
  
  await supabase
    .from('education')
    .delete()
    .eq('candidate_id', profileId);
  
  const { error: eduError } = await supabase
    .from('education')
    .insert(education);
  
  if (eduError) {
    console.error('Error inserting education:', eduError);
  } else {
    console.log('Inserted education');
  }
  
  // Create tags
  for (const tag of adminNotes.tags) {
    // Check if tag exists
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tag.name)
      .single();
    
    let tagId;
    if (existingTag) {
      tagId = existingTag.id;
    } else {
      // Create tag
      const { data: newTag } = await supabase
        .from('tags')
        .insert({
          name: tag.name,
          category: tag.category,
          is_active: true
        })
        .select()
        .single();
      
      if (newTag) {
        tagId = newTag.id;
      }
    }
    
    if (tagId) {
      // Link to candidate (check if already exists first)
      const { data: existingLink } = await supabase
        .from('candidate_tags')
        .select('candidate_id')
        .eq('candidate_id', profileId)
        .eq('tag_id', tagId)
        .single();
      
      if (!existingLink) {
        await supabase
          .from('candidate_tags')
          .insert({
            candidate_id: profileId,
            tag_id: tagId
          });
      }
    }
  }
  
  console.log('Created and linked tags');
  
  // Update private metadata with enriched data
  const enrichedMetadata = {
    ...privateMetadata,
    skills: adminNotes.tags.filter(t => t.category === 'skill').map(t => t.name),
    functionalExpertise: adminNotes.tags.filter(t => t.category === 'expertise').map(t => t.name),
    industryExpertise: adminNotes.tags.filter(t => t.category === 'industry').map(t => t.name),
    boardCommittees: ['audit', 'remuneration'], // Sample committees
    processedAt: new Date().toISOString()
  };
  
  await supabase
    .from('candidate_profiles')
    .update({
      private_metadata: enrichedMetadata,
      salary_min: 150000,
      salary_max: 250000
    })
    .eq('id', profileId);
  
  console.log('\n✅ Profile enriched successfully!');
  console.log(`\nView the updated profile at: http://localhost:3000/search/${profileId}`);
}

fixApprovedProfile();