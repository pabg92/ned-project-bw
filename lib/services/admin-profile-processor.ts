import { supabaseAdmin } from '@/lib/supabase/client';
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
  workExperiences?: WorkExperience[];
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
  try {
    // Get the current profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users (*)
      `)
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    // Parse admin notes if they contain JSON metadata
    let metadata: SignupMetadata = {};
    if (profile.admin_notes) {
      try {
        metadata = JSON.parse(profile.admin_notes);
      } catch (e) {
        console.log('Admin notes are not JSON, treating as plain text');
      }
    }

    // Update the profile with parsed data
    const updateData: any = {
      is_active: true,
      profile_completed: true,
      is_verified: false, // Requires manual verification
      years_experience: metadata.yearsExperience || null,
      board_experience: metadata.boardExperience || false,
      board_positions: metadata.boardPositions || 0,
      actively_seeking: metadata.activelySeeking || false,
      available_immediate: metadata.availableImmediate || false,
      willing_to_relocate: metadata.willingToRelocate || false,
      compensation_min: metadata.compensationMin ? parseInt(metadata.compensationMin) : null,
      compensation_max: metadata.compensationMax ? parseInt(metadata.compensationMax) : null,
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
      await processTags(profileId, metadata.tags);
    }

    // Process work experiences
    if (metadata.workExperiences && metadata.workExperiences.length > 0) {
      await processWorkExperiences(profileId, metadata.workExperiences);
    }

    // Process education
    if (metadata.education && metadata.education.length > 0) {
      await processEducation(profileId, metadata.education);
    }

    // Store board details in private metadata
    if (metadata.boardDetails) {
      const privateMetadata = profile.private_metadata || {};
      privateMetadata.boardDetails = metadata.boardDetails;
      privateMetadata.processedAt = new Date().toISOString();
      privateMetadata.processedBy = adminId;

      await supabaseAdmin
        .from('candidate_profiles')
        .update({ 
          private_metadata: privateMetadata,
          admin_notes: 'Profile processed and approved' // Clear the JSON from admin notes
        })
        .eq('id', profileId);
    }

    return { success: true, message: 'Profile processed successfully' };
  } catch (error) {
    console.error('Error processing profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process and store tags for a candidate
 */
async function processTags(candidateId: string, tags: Array<{ name: string; category: TagCategory }>) {
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
  // Remove existing work experiences
  await supabaseAdmin
    .from('work_experiences')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new work experiences
  const workExps = experiences
    .filter(exp => exp.companyName && exp.title)
    .map(exp => ({
      candidate_id: candidateId,
      company_name: exp.companyName,
      title: exp.title,
      location: exp.location || null,
      start_date: exp.startDate || null,
      end_date: exp.endDate || null,
      is_current: exp.isCurrent || false,
      description: exp.description || null
    }));

  if (workExps.length > 0) {
    await supabaseAdmin
      .from('work_experiences')
      .insert(workExps);
  }
}

/**
 * Process and store education
 */
async function processEducation(candidateId: string, educationList: Education[]) {
  // Remove existing education
  await supabaseAdmin
    .from('education')
    .delete()
    .eq('candidate_id', candidateId);

  // Insert new education
  const eduRecords = educationList
    .filter(edu => edu.institution && edu.degree)
    .map(edu => ({
      candidate_id: candidateId,
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.fieldOfStudy || null,
      graduation_date: edu.graduationDate ? `${edu.graduationDate}-01-01` : null
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
  try {
    const { data, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users!inner (
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