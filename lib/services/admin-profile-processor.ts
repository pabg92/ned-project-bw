import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { 
  CandidateProfileApiResponse,
  Tag,
  TagCategory,
  WorkExperience,
  Education 
} from '@/lib/types/profile';

interface SignupMetadata {
  phone?: string;
  company?: string;
  industry?: string;
  boardExperience?: boolean;
  boardPositions?: number;
  boardDetails?: string;
  boardExperienceTypes?: string[]; // ftse100, ftse250, aim, private-equity, etc.
  boardCommittees?: string[]; // audit, remuneration, nomination, etc.
  workExperiences?: WorkExperience[];
  dealExperiences?: Array<{
    dealType: string;
    dealValue: string;
    dealCurrency: string;
    companyName: string;
    role: string;
    year: string;
    description: string;
    sector: string;
  }>;
  education?: Education[];
  tags?: Array<{ name: string; category: TagCategory }>;
  activelySeeking?: boolean;
  availableImmediate?: boolean;
  willingToRelocate?: boolean;
  compensationMin?: string;
  compensationMax?: string;
  yearsExperience?: number;
}

/**
 * Process candidate profile on admin approval
 * This extracts all the metadata from adminNotes and properly stores it in the database
 */
export async function processProfileOnApproval(profileId: string, adminId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const processingErrors: string[] = [];
  
  try {
    // Update processing status to 'processing'
    await updateProcessingStatus(profileId, 'processing', []);
    
    // Get the current profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users!candidate_profiles_user_id_fkey (*)
      `)
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    // Get metadata from private_metadata first (where signup stores it), then fall back to admin notes
    let metadata: SignupMetadata = {};
    
    // First, check private_metadata (this is where the signup API stores the data)
    if (profile.private_metadata) {
      console.log('[PROCESSOR] Found private_metadata, extracting signup data');
      metadata = {
        phone: profile.private_metadata.phone,
        company: profile.private_metadata.company,
        industry: profile.private_metadata.industry,
        boardExperience: profile.private_metadata.boardExperience,
        boardPositions: profile.private_metadata.boardPositions,
        boardExperienceTypes: profile.private_metadata.boardExperienceTypes || [],
        boardCommittees: profile.private_metadata.boardCommittees || [],
        boardDetails: profile.private_metadata.boardDetails,
        workExperiences: profile.private_metadata.workExperiences || [],
        dealExperiences: profile.private_metadata.dealExperiences || [],
        education: profile.private_metadata.education || [],
        tags: profile.private_metadata.tags || [],
        activelySeeking: profile.private_metadata.activelySeeking,
        availableImmediate: profile.private_metadata.availableImmediate,
        willingToRelocate: profile.private_metadata.willingToRelocate,
        compensationMin: profile.private_metadata.compensationMin,
        compensationMax: profile.private_metadata.compensationMax,
        yearsExperience: profile.private_metadata.yearsExperience
      };
    }
    
    // Fall back to admin notes if they contain JSON (for manually created test profiles)
    if (profile.admin_notes && Object.keys(metadata).length === 0) {
      try {
        const adminNotesData = JSON.parse(profile.admin_notes);
        console.log('[PROCESSOR] Using data from admin_notes (test profile)');
        metadata = adminNotesData;
      } catch (e) {
        console.log('[PROCESSOR] Admin notes are not JSON, no metadata to process');
      }
    }

    // Update the profile with parsed data
    const updateData: any = {
      is_active: true,
      profile_completed: true,
      salary_min: metadata.compensationMin ? parseInt(metadata.compensationMin) : profile.private_metadata?.salary_min || null,
      salary_max: metadata.compensationMax ? parseInt(metadata.compensationMax) : profile.private_metadata?.salary_max || null,
    };

    // Update user with phone if provided
    if (metadata.phone && profile.users) {
      await supabaseAdmin
        .from('users')
        .update({ phone: metadata.phone })
        .eq('id', profile.user_id);
    }

    // Update the profile
    const { error: updateError } = await supabaseAdmin
      .from('candidate_profiles')
      .update(updateData)
      .eq('id', profileId);

    if (updateError) throw updateError;

    // Process tags
    if (metadata.tags && metadata.tags.length > 0) {
      try {
        await processTags(profileId, metadata.tags);
      } catch (e: any) {
        processingErrors.push(`Failed to process tags: ${e.message}`);
      }
    }

    // Process work experiences with board position data
    try {
      // Check if work experiences already exist in database
      const { data: existingWorkExp } = await supabaseAdmin
        .from('work_experiences')
        .select('id')
        .eq('candidate_id', profileId)
        .limit(1);
      
      if (!existingWorkExp || existingWorkExp.length === 0) {
        // No work experiences in DB, try to process them
        let workExperiencesToProcess = null;
        
        if (metadata.workExperiences && metadata.workExperiences.length > 0) {
          console.log(`[PROCESSOR] Processing ${metadata.workExperiences.length} work experiences from admin notes`);
          workExperiencesToProcess = metadata.workExperiences;
        } else if (profile.private_metadata?.workExperiences && profile.private_metadata.workExperiences.length > 0) {
          console.log(`[PROCESSOR] Processing ${profile.private_metadata.workExperiences.length} work experiences from private metadata`);
          workExperiencesToProcess = profile.private_metadata.workExperiences;
        }
        
        if (workExperiencesToProcess) {
          await processWorkExperiences(profileId, workExperiencesToProcess);
        } else {
          console.log('[PROCESSOR] No work experiences found to process');
        }
      } else {
        console.log(`[PROCESSOR] Work experiences already exist in database (${existingWorkExp.length} found)`);
      }
    } catch (e: any) {
      processingErrors.push(`Failed to process work experiences: ${e.message}`);
      console.error('[PROCESSOR] Work experience processing error:', e);
    }

    // Process education
    try {
      if (metadata.education && metadata.education.length > 0) {
        console.log(`[PROCESSOR] Processing ${metadata.education.length} education records`);
        await processEducation(profileId, metadata.education);
      } else {
        console.log('[PROCESSOR] No education records found to process');
      }
    } catch (e: any) {
      processingErrors.push(`Failed to process education: ${e.message}`);
      console.error('[PROCESSOR] Education processing error:', e);
    }

    // Process deal experiences
    try {
      if (metadata.dealExperiences && metadata.dealExperiences.length > 0) {
        console.log(`[PROCESSOR] Processing ${metadata.dealExperiences.length} deal experiences`);
        await processDealExperiences(profileId, metadata.dealExperiences);
      } else {
        console.log('[PROCESSOR] No deal experiences found to process');
      }
    } catch (e: any) {
      processingErrors.push(`Failed to process deal experiences: ${e.message}`);
      console.error('[PROCESSOR] Deal experience processing error:', e);
    }

    // Process board committees
    try {
      if (metadata.boardCommittees && metadata.boardCommittees.length > 0) {
        console.log(`[PROCESSOR] Processing ${metadata.boardCommittees.length} board committees`);
        await processBoardCommittees(profileId, metadata.boardCommittees);
      } else {
        console.log('[PROCESSOR] No board committees found to process');
      }
    } catch (e: any) {
      processingErrors.push(`Failed to process board committees: ${e.message}`);
      console.error('[PROCESSOR] Board committee processing error:', e);
    }

    // Process board experience types
    try {
      if (metadata.boardExperienceTypes && metadata.boardExperienceTypes.length > 0) {
        console.log(`[PROCESSOR] Processing ${metadata.boardExperienceTypes.length} board experience types`);
        await processBoardExperienceTypes(profileId, metadata.boardExperienceTypes);
      } else {
        console.log('[PROCESSOR] No board experience types found to process');
      }
    } catch (e: any) {
      processingErrors.push(`Failed to process board experience types: ${e.message}`);
      console.error('[PROCESSOR] Board experience type processing error:', e);
    }

    // Store enriched data in private metadata
    const privateMetadata = profile.private_metadata || {};
    privateMetadata.boardDetails = metadata.boardDetails;
    privateMetadata.processedAt = new Date().toISOString();
    privateMetadata.processedBy = adminId;
    privateMetadata.boardExperience = metadata.boardExperience || false;
    privateMetadata.boardPositions = metadata.boardPositions || 0;
    privateMetadata.activelySeeking = metadata.activelySeeking || false;
    privateMetadata.willingToRelocate = metadata.willingToRelocate || false;
    privateMetadata.yearsExperience = metadata.yearsExperience || null;
    // Keep the original signup data arrays for backup
    privateMetadata.originalBoardExperienceTypes = metadata.boardExperienceTypes;
    privateMetadata.originalBoardCommittees = metadata.boardCommittees;
    privateMetadata.originalDealExperiences = metadata.dealExperiences;

    await supabaseAdmin
      .from('candidate_profiles')
      .update({ 
        private_metadata: privateMetadata,
        admin_notes: 'Profile processed and approved' // Clear the JSON from admin notes
      })
      .eq('id', profileId);

    // Update processing status to 'completed'
    await updateProcessingStatus(profileId, 'completed', processingErrors);
    
    return { success: true, message: 'Profile processed successfully', errors: processingErrors };
  } catch (error: any) {
    console.error('Error processing profile:', error);
    processingErrors.push(`Fatal error: ${error.message}`);
    
    // Update processing status to 'failed'
    await updateProcessingStatus(profileId, 'failed', processingErrors);
    
    return { success: false, error: error.message, errors: processingErrors };
  }
}

/**
 * Process and store tags for a candidate
 */
async function processTags(candidateId: string, tags: Array<{ name: string; category: TagCategory }>) {
  const supabaseAdmin = getSupabaseAdmin();
  
  // First, get or create tags
  const tagIds: string[] = [];

  for (const tag of tags) {
    // Check if tag exists
    const { data: existingTag } = await supabaseAdmin
      .from('tags')
      .select('id')
      .eq('name', tag.name)
      .eq('category', tag.category)
      .single();

    if (existingTag) {
      tagIds.push(existingTag.id);
    } else {
      // Create new tag
      const { data: newTag, error } = await supabaseAdmin
        .from('tags')
        .insert({
          name: tag.name,
          category: tag.category,
          is_active: true
        })
        .select()
        .single();

      if (newTag) {
        tagIds.push(newTag.id);
      }
    }
  }

  // Remove existing candidate tags
  await supabaseAdmin
    .from('candidate_tags')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new candidate tags
  if (tagIds.length > 0) {
    const candidateTags = tagIds.map(tagId => ({
      candidate_id: candidateId,
      tag_id: tagId
    }));

    await supabaseAdmin
      .from('candidate_tags')
      .insert(candidateTags);
  }
}

/**
 * Process and store work experiences
 */
async function processWorkExperiences(candidateId: string, experiences: WorkExperience[]) {
  const supabaseAdmin = getSupabaseAdmin();
  
  console.log(`[PROCESSOR] Processing ${experiences.length} work experiences for candidate ${candidateId}`);
  
  // Helper function to format dates
  const formatDate = (date: string | null | undefined): string | null => {
    if (!date || date === '') return null;
    // If date is in YYYY-MM format, append -01
    if (date.match(/^\d{4}-\d{2}$/)) {
      return `${date}-01`;
    }
    // If date is in YYYY format, append -01-01
    if (date.match(/^\d{4}$/)) {
      return `${date}-01-01`;
    }
    return date;
  };
  
  // Remove existing work experiences
  await supabaseAdmin
    .from('work_experiences')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new work experiences with board position fields
  const workExps = experiences
    .filter(exp => exp.companyName && exp.title)
    .map((exp, index) => {
      const formatted = {
        candidate_id: candidateId,
        company_name: exp.companyName,
        position: exp.title, // Fixed: database column is 'position' not 'title'
        location: exp.location || null,
        start_date: formatDate(exp.startDate),
        end_date: exp.isCurrent ? null : formatDate(exp.endDate),
        is_current: exp.isCurrent || false,
        description: exp.description || null,
        is_board_position: exp.isBoardPosition || exp.is_board_position || false,
        company_type: exp.companyType || exp.company_type || null
      };
      
      console.log(`[PROCESSOR] Formatting work exp: ${exp.title} at ${exp.companyName}, dates: ${formatted.start_date} to ${formatted.end_date}`);
      return formatted;
    });

  if (workExps.length > 0) {
    const { error } = await supabaseAdmin
      .from('work_experiences')
      .insert(workExps);
      
    if (error) {
      console.error('[PROCESSOR] Error inserting work experiences:', error);
      throw error;
    } else {
      console.log(`[PROCESSOR] Successfully inserted ${workExps.length} work experiences`);
    }
  }
}

/**
 * Process and store education
 */
async function processEducation(candidateId: string, educationList: Education[]) {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Remove existing education
  await supabaseAdmin
    .from('education')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new education
  const eduRecords = educationList
    .filter(edu => edu.institution && edu.degree)
    .map((edu, index) => ({
      candidate_id: candidateId,
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.fieldOfStudy || null,
      graduation_date: edu.graduationDate ? `${edu.graduationDate}-01-01` : null,
      order: index
    }));

  if (eduRecords.length > 0) {
    await supabaseAdmin
      .from('education')
      .insert(eduRecords);
  }
}

/**
 * Get a structured view of a candidate's complete profile
 */
export async function getCompleteProfile(profileId: string): Promise<CandidateProfileApiResponse | null> {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const { data, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users!candidate_profiles_user_id_fkey!inner (
          id,
          email,
          first_name,
          last_name,
          phone,
          role,
          is_active
        ),
        candidate_tags (
          id,
          tag_id,
          tags (
            id,
            name,
            category
          )
        ),
        work_experiences (
          id,
          company_name,
          title,
          location,
          start_date,
          end_date,
          is_current,
          description
        ),
        education (
          id,
          institution,
          degree,
          field_of_study,
          graduation_date
        )
      `)
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching complete profile:', error);
      return null;
    }

    return data as unknown as CandidateProfileApiResponse;
  } catch (error) {
    console.error('Error in getCompleteProfile:', error);
    return null;
  }
}

/**
 * Update processing status in private metadata
 */
async function updateProcessingStatus(profileId: string, status: 'processing' | 'completed' | 'failed', errors: string[]) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Get current private metadata
    const { data: profile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('private_metadata')
      .eq('id', profileId)
      .single();
    
    const privateMetadata = profile?.private_metadata || {};
    
    // Update processing status
    privateMetadata.processingStatus = {
      status,
      lastProcessedAt: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
      completedSteps: status === 'completed' ? [
        'tags',
        'workExperiences', 
        'education',
        'dealExperiences',
        'boardCommittees',
        'boardExperienceTypes'
      ] : privateMetadata.processingStatus?.completedSteps || []
    };
    
    // Update the profile
    await supabaseAdmin
      .from('candidate_profiles')
      .update({ private_metadata: privateMetadata })
      .eq('id', profileId);
      
  } catch (error) {
    console.error('Failed to update processing status:', error);
  }
}

/**
 * Process and store deal experiences
 */
async function processDealExperiences(candidateId: string, dealExperiences: Array<{
  dealType: string;
  dealValue: string;
  dealCurrency: string;
  companyName: string;
  role: string;
  year: string;
  description: string;
  sector: string;
}>) {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Remove existing deal experiences
  await supabaseAdmin
    .from('deal_experiences')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new deal experiences
  const deals = dealExperiences
    .filter(deal => deal.companyName && deal.dealType)
    .map(deal => ({
      candidate_id: candidateId,
      deal_type: deal.dealType,
      deal_value: deal.dealValue ? parseFloat(deal.dealValue) : null,
      deal_currency: deal.dealCurrency || 'GBP',
      company_name: deal.companyName,
      role: deal.role,
      year: parseInt(deal.year),
      description: deal.description || null,
      sector: deal.sector || null
    }));

  if (deals.length > 0) {
    const { error } = await supabaseAdmin
      .from('deal_experiences')
      .insert(deals);
    
    if (error) {
      console.error('Error inserting deal experiences:', error);
    }
  }
}

/**
 * Process and store board committees
 */
async function processBoardCommittees(candidateId: string, committees: string[]) {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Remove existing board committees
  await supabaseAdmin
    .from('board_committees')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new board committees
  const committeeRecords = committees
    .filter(committee => committee && committee.trim())
    .map(committee => ({
      candidate_id: candidateId,
      committee_type: committee.toLowerCase()
    }));

  if (committeeRecords.length > 0) {
    const { error } = await supabaseAdmin
      .from('board_committees')
      .insert(committeeRecords);
    
    if (error) {
      console.error('Error inserting board committees:', error);
    }
  }
}

/**
 * Process and store board experience types
 */
async function processBoardExperienceTypes(candidateId: string, experienceTypes: string[]) {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Remove existing board experience types
  await supabaseAdmin
    .from('board_experience_types')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new board experience types
  const typeRecords = experienceTypes
    .filter(type => type && type.trim())
    .map(type => ({
      candidate_id: candidateId,
      experience_type: type.toLowerCase()
    }));

  if (typeRecords.length > 0) {
    const { error } = await supabaseAdmin
      .from('board_experience_types')
      .insert(typeRecords);
    
    if (error) {
      console.error('Error inserting board experience types:', error);
    }
  }
}