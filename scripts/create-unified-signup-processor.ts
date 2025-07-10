import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This script shows how to properly process signup data for a unified experience

async function processSignupDataUnified(profileId: string) {
  console.log(`Processing signup data for profile ${profileId}...\n`);
  
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
  
  // Check if we have admin_notes with signup data
  let signupData: any = null;
  
  if (profile.admin_notes) {
    try {
      signupData = JSON.parse(profile.admin_notes);
      console.log('Found signup data in admin_notes');
    } catch (e) {
      console.log('Admin notes is not JSON, checking private_metadata');
    }
  }
  
  // If no admin_notes, check private_metadata (for older signups)
  if (!signupData && profile.private_metadata) {
    signupData = profile.private_metadata;
    console.log('Found signup data in private_metadata');
  }
  
  if (!signupData) {
    console.error('No signup data found');
    return;
  }
  
  // Process all the enriched data
  const updates: any = {
    is_active: true,
    profile_completed: true,
    is_anonymized: false, // Show full profile
  };
  
  // Store enriched metadata
  const enrichedMetadata = {
    ...profile.private_metadata,
    phone: signupData.phone,
    company: signupData.company,
    industry: signupData.industry,
    boardExperience: signupData.boardExperience,
    boardPositions: signupData.boardPositions,
    boardExperienceTypes: signupData.boardExperienceTypes || [],
    boardCommittees: signupData.boardCommittees || [],
    boardDetails: signupData.boardDetails,
    roleTypes: signupData.roleTypes || signupData.roles || [],
    activelySeeking: signupData.activelySeeking,
    willingToRelocate: signupData.willingToRelocate,
    yearsExperience: signupData.yearsExperience,
    availability: signupData.availability,
    remotePreference: signupData.remotePreference,
    // Extract skills from tags
    skills: signupData.tags?.filter((t: any) => t.category === 'skill').map((t: any) => t.name) || [],
    functionalExpertise: signupData.tags?.filter((t: any) => t.category === 'expertise').map((t: any) => t.name) || [],
    industryExpertise: signupData.tags?.filter((t: any) => t.category === 'industry').map((t: any) => t.name) || [],
    // Store deal experiences
    dealExperiences: signupData.dealExperiences || [],
    processedAt: new Date().toISOString()
  };
  
  updates.private_metadata = enrichedMetadata;
  
  // Update salary if provided
  if (signupData.compensationMin) {
    updates.salary_min = parseInt(signupData.compensationMin);
  }
  if (signupData.compensationMax) {
    updates.salary_max = parseInt(signupData.compensationMax);
  }
  
  // Update the profile
  const { error: updateError } = await supabase
    .from('candidate_profiles')
    .update(updates)
    .eq('id', profileId);
  
  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }
  
  console.log('Profile updated with enriched metadata');
  
  // Process deal experiences into a structured format for display
  if (signupData.dealExperiences && signupData.dealExperiences.length > 0) {
    console.log(`\nFound ${signupData.dealExperiences.length} deal experiences`);
    
    // Store deal experiences in admin_notes for easy retrieval
    const updatedAdminNotes = {
      ...signupData,
      processedDealExperiences: signupData.dealExperiences.map((deal: any) => ({
        ...deal,
        formattedValue: deal.dealValue ? `${deal.dealCurrency || '£'}${deal.dealValue}M` : null
      }))
    };
    
    await supabase
      .from('candidate_profiles')
      .update({
        admin_notes: JSON.stringify(updatedAdminNotes)
      })
      .eq('id', profileId);
  }
  
  console.log('\n✅ Profile processing complete!');
  console.log(`View at: http://localhost:3000/search/${profileId}`);
  
  // Log what data is available
  console.log('\nAvailable data:');
  console.log('- Board Experience:', enrichedMetadata.boardExperience ? 'Yes' : 'No');
  console.log('- Board Committees:', enrichedMetadata.boardCommittees.length);
  console.log('- Deal Experiences:', enrichedMetadata.dealExperiences.length);
  console.log('- Skills:', enrichedMetadata.skills.length);
  console.log('- Work Experiences:', signupData.workExperiences?.length || 0);
  console.log('- Education:', signupData.education?.length || 0);
}

// Process the specific profile
processSignupDataUnified('333590b2-2672-45a8-a560-cce2d1faf3db');