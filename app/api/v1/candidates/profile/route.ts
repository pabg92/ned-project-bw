import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { updateCandidateProfileSchema } from '@/lib/validations/candidate';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * GET /api/v1/candidates/profile
 * Retrieve the current user's candidate profile with related data
 * 
 * This endpoint allows authenticated candidates to view their own profile
 * including all related data like skills, work experience, and education.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify user exists by clerk_id and has candidate role
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .eq('role', 'candidate')
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      console.error('User verification error:', userError);
      // If user doesn't exist with clerk_id, they might not have been synced yet
      if (userError?.code === 'PGRST116') {
        return createErrorResponse('User profile not found. Please ensure your account is properly synced.', 404);
      }
      return createErrorResponse('User not found or not authorized as candidate', 403);
    }

    // Get candidate profile with related data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        candidate_tags (
          id,
          tag_id,
          proficiency,
          years_experience,
          is_endorsed,
          tags (
            id,
            name,
            category
          )
        ),
        work_experiences (
          id,
          company,
          title,
          start_date,
          end_date,
          current,
          description,
          technologies,
          order
        ),
        education (
          id,
          institution,
          degree,
          field_of_study,
          start_date,
          end_date,
          grade,
          activities,
          order
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return createErrorResponse('Candidate profile not found', 404);
      }
      console.error('Profile retrieval error:', profileError);
      throw profileError;
    }

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion({
      ...profile,
      tags: profile.candidate_tags || [],
      workExperiences: profile.work_experiences || [],
      education: profile.education || [],
    });

    // Transform snake_case to camelCase for response
    const responseData = {
      id: profile.id,
      userId: profile.user_id,
      title: profile.title,
      summary: profile.summary,
      experience: profile.experience,
      location: profile.location,
      remotePreference: profile.remote_preference,
      salaryMin: profile.salary_min ? parseFloat(profile.salary_min) : null,
      salaryMax: profile.salary_max ? parseFloat(profile.salary_max) : null,
      salaryCurrency: profile.salary_currency,
      availability: profile.availability,
      isAnonymized: profile.is_anonymized,
      isActive: profile.is_active,
      profileCompleted: profile.profile_completed,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      portfolioUrl: profile.portfolio_url,
      resumeUrl: profile.resume_url,
      skills: (profile.candidate_tags || []).map((ct: any) => ({
        id: ct.id,
        tagId: ct.tag_id,
        name: ct.tags?.name,
        category: ct.tags?.category,
        proficiency: ct.proficiency,
        yearsExperience: ct.years_experience,
        isEndorsed: ct.is_endorsed,
      })),
      workExperiences: (profile.work_experiences || []).map((we: any) => ({
        id: we.id,
        company: we.company,
        title: we.title,
        startDate: we.start_date,
        endDate: we.end_date,
        current: we.current,
        description: we.description,
        technologies: we.technologies,
        order: we.order,
      })),
      education: (profile.education || []).map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.field_of_study,
        startDate: edu.start_date,
        endDate: edu.end_date,
        grade: edu.grade,
        activities: edu.activities,
        order: edu.order,
      })),
      profileCompletion,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return createSuccessResponse(responseData, 'Profile retrieved successfully');

  } catch (error: any) {
    console.error('Profile retrieval error:', error);
    return createErrorResponse('Internal server error during profile retrieval', 500);
  }
}

/**
 * PUT /api/v1/candidates/profile
 * Update the current user's candidate profile
 * 
 * This endpoint allows candidates to update their own profile information.
 * Only the fields provided in the request will be updated.
 */
export const PUT = withValidation(
  { body: updateCandidateProfileSchema },
  async ({ body }, request) => {
    try {
      // Get authenticated user from Clerk
      const { userId } = await auth();
      
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Verify user exists by clerk_id and has candidate role
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('clerk_id', userId)
        .eq('role', 'candidate')
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        console.error('User verification error:', userError);
        // If user doesn't exist with clerk_id, they might not have been synced yet
        if (userError?.code === 'PGRST116') {
          return createErrorResponse('User profile not found. Please ensure your account is properly synced.', 404);
        }
        return createErrorResponse('User not found or not authorized as candidate', 403);
      }

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileCheckError) {
        if (profileCheckError.code === 'PGRST116') {
          return createErrorResponse('Candidate profile not found. Please create a profile first.', 404);
        }
        throw profileCheckError;
      }

      // Prepare update data (convert camelCase to snake_case)
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Only update fields that are provided
      if (body.title !== undefined) updateData.title = body.title;
      if (body.summary !== undefined) updateData.summary = body.summary;
      if (body.experience !== undefined) updateData.experience = body.experience;
      if (body.location !== undefined) updateData.location = body.location;
      if (body.remotePreference !== undefined) updateData.remote_preference = body.remotePreference;
      if (body.salaryMin !== undefined) updateData.salary_min = body.salaryMin?.toString();
      if (body.salaryMax !== undefined) updateData.salary_max = body.salaryMax?.toString();
      if (body.salaryCurrency !== undefined) updateData.salary_currency = body.salaryCurrency;
      if (body.availability !== undefined) updateData.availability = body.availability;
      if (body.isAnonymized !== undefined) updateData.is_anonymized = body.isAnonymized;
      if (body.linkedinUrl !== undefined) updateData.linkedin_url = body.linkedinUrl;
      if (body.githubUrl !== undefined) updateData.github_url = body.githubUrl;
      if (body.portfolioUrl !== undefined) updateData.portfolio_url = body.portfolioUrl;

      // Update profile
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('candidate_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      // Get counts for profile completion calculation
      const [tagsResult, experiencesResult, educationResult] = await Promise.all([
        supabaseAdmin
          .from('candidate_tags')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', updatedProfile.id),
        supabaseAdmin
          .from('work_experiences')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', updatedProfile.id),
        supabaseAdmin
          .from('education')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', updatedProfile.id),
      ]);

      // Calculate profile completion with updated data
      const profileCompletion = calculateProfileCompletion({
        ...updatedProfile,
        tags: Array(tagsResult.count || 0).fill({}),
        workExperiences: Array(experiencesResult.count || 0).fill({}),
        education: Array(educationResult.count || 0).fill({}),
      });

      // Update profile completion status
      if (profileCompletion.isCompleted !== updatedProfile.profile_completed) {
        await supabaseAdmin
          .from('candidate_profiles')
          .update({ profile_completed: profileCompletion.isCompleted })
          .eq('id', updatedProfile.id);
      }

      // Log self-edit action in private metadata
      const privateMetadata = updatedProfile.private_metadata || {};
      privateMetadata.lastSelfEditAt = new Date().toISOString();
      privateMetadata.lastSelfEditFields = Object.keys(updateData).filter(k => k !== 'updated_at');
      
      await supabaseAdmin
        .from('candidate_profiles')
        .update({ private_metadata: privateMetadata })
        .eq('id', updatedProfile.id);

      // Prepare response data (convert snake_case to camelCase)
      const responseData = {
        id: updatedProfile.id,
        userId: updatedProfile.user_id,
        title: updatedProfile.title,
        summary: updatedProfile.summary,
        experience: updatedProfile.experience,
        location: updatedProfile.location,
        remotePreference: updatedProfile.remote_preference,
        salaryMin: updatedProfile.salary_min ? parseFloat(updatedProfile.salary_min) : null,
        salaryMax: updatedProfile.salary_max ? parseFloat(updatedProfile.salary_max) : null,
        salaryCurrency: updatedProfile.salary_currency,
        availability: updatedProfile.availability,
        isAnonymized: updatedProfile.is_anonymized,
        isActive: updatedProfile.is_active,
        profileCompleted: updatedProfile.profile_completed,
        linkedinUrl: updatedProfile.linkedin_url,
        githubUrl: updatedProfile.github_url,
        portfolioUrl: updatedProfile.portfolio_url,
        profileCompletion,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
      };

      return createSuccessResponse(responseData, 'Profile updated successfully');

    } catch (error: any) {
      console.error('Profile update error:', error);
      return createErrorResponse('Internal server error during profile update', 500);
    }
  }
);

/**
 * Calculate profile completion percentage and status
 * This matches the calculation used in the admin endpoints
 */
function calculateProfileCompletion(profile: any) {
  const requiredFields = [
    'title',
    'summary',
    'experience',
    'location',
    'remote_preference',
    'availability',
  ];

  const optionalFields = [
    'salary_min',
    'salary_max',
    'linkedin_url',
    'github_url',
    'portfolio_url',
  ];

  const requiredCompleted = requiredFields.filter(field => 
    profile[field] && profile[field].toString().trim().length > 0
  ).length;

  const optionalCompleted = optionalFields.filter(field => 
    profile[field] && profile[field].toString().trim().length > 0
  ).length;

  // Bonus points for additional data
  let bonusScore = 0;
  if (profile.tags && profile.tags.length > 0) bonusScore += 10;
  if (profile.workExperiences && profile.workExperiences.length > 0) bonusScore += 15;
  if (profile.education && profile.education.length > 0) bonusScore += 10;

  const requiredPercentage = (requiredCompleted / requiredFields.length) * 100;
  const optionalPercentage = (optionalCompleted / optionalFields.length) * 100;
  
  // Profile is complete if all required fields are filled
  const isCompleted = requiredCompleted === requiredFields.length;
  
  // Overall completion considers required fields, optional fields, and bonus content
  const basePercentage = (requiredPercentage * 0.6) + (optionalPercentage * 0.4);
  const overallPercentage = Math.min(100, Math.round(basePercentage + (bonusScore * 0.5)));

  return {
    isCompleted,
    overallPercentage,
    requiredPercentage: Math.round(requiredPercentage),
    optionalPercentage: Math.round(optionalPercentage),
    bonusScore,
    requiredCompleted,
    requiredTotal: requiredFields.length,
    optionalCompleted,
    optionalTotal: optionalFields.length,
    missingRequired: requiredFields.filter(field => 
      !profile[field] || profile[field].toString().trim().length === 0
    ),
    missingOptional: optionalFields.filter(field => 
      !profile[field] || profile[field].toString().trim().length === 0
    ),
  };
}