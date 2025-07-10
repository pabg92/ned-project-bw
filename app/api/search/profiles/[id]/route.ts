import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/search/profiles/[id]
 * Public endpoint to view a candidate profile
 * Returns different levels of detail based on authentication and unlock status
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Handle both Next.js 15 Promise params and regular params
    const resolvedParams = 'then' in props.params ? await props.params : props.params;
    const profileId = resolvedParams.id;
    console.log('[Profile API] Fetching profile:', profileId);
    
    // Get the current user's ID if authenticated
    const { userId } = await auth();
    
    // Get the profile with user data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        summary,
        experience,
        location,
        remote_preference,
        availability,
        salary_min,
        salary_max,
        salary_currency,
        linkedin_url,
        github_url,
        portfolio_url,
        resume_url,
        is_active,
        is_anonymized,
        profile_completed,
        private_metadata,
        admin_notes,
        created_at,
        updated_at,
        users!candidate_profiles_user_id_fkey(
          id,
          email,
          first_name,
          last_name,
          image_url,
          role
        )
      `)
      .eq('id', profileId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return createErrorResponse('Profile not found', 404);
      }
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }

    // Check if the current user owns this profile
    // For now, disable ownership check since clerk_id doesn't exist
    // TODO: Re-enable when clerk_id column is added
    let isOwnProfile = false;
    // if (userId && profile.users?.clerk_id === userId) {
    //   isOwnProfile = true;
    // }

    // Get candidate tags/skills
    const { data: candidateTags } = await supabaseAdmin
      .from('candidate_tags')
      .select(`
        tag_id,
        tags (
          id,
          name,
          category,
          type
        )
      `)
      .eq('candidate_id', profileId);

    // Transform tags into skills and sectors
    const skills = candidateTags
      ?.filter(ct => ct.tags?.type === 'skill' || ct.tags?.category === 'skill')
      ?.map(ct => ct.tags?.name) || [];
    
    const sectors = candidateTags
      ?.filter(ct => ct.tags?.type === 'industry' || ct.tags?.category === 'sector' || ct.tags?.category === 'industry')
      ?.map(ct => ct.tags?.name) || [];

    // Format availability
    const formatAvailability = (availability?: string | null): string => {
      if (!availability) return 'Available';
      const availMap: Record<string, string> = {
        'immediately': 'Immediate',
        '2weeks': '2 weeks',
        '1month': '1 month',
        '3months': '3 months',
        '6months': '6 months',
      };
      return availMap[availability] || 'Available';
    };

    // Format experience
    const formatExperience = (experience?: string | null): string => {
      if (!experience) return '10+ years';
      const expMap: Record<string, string> = {
        'junior': '0-5 years',
        'mid': '5-10 years',
        'senior': '10-20 years',
        'lead': '20-25 years',
        'executive': '25+ years',
      };
      return expMap[experience] || '10+ years';
    };

    // Determine display name and contact info visibility
    let displayName = 'Executive Profile';
    let email: string | undefined;
    let imageUrl: string | null = null;
    let linkedinUrl: string | undefined;
    let githubUrl: string | undefined;
    let portfolioUrl: string | undefined;
    
    // Check if the user has unlocked this profile
    let hasUnlockedProfile = false;
    if (userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const unlockedProfiles = user.publicMetadata?.unlockedProfiles as string[] || [];
        hasUnlockedProfile = unlockedProfiles.includes(profileId);
      } catch (error) {
        console.error('Error checking unlocked profiles:', error);
      }
    }
    
    // Show full details if:
    // 1. It's the user's own profile
    // 2. The profile is not anonymized
    // 3. The viewer has unlocked this profile
    const showFullDetails = isOwnProfile || !profile.is_anonymized || hasUnlockedProfile;
    
    if (showFullDetails && profile.users) {
      const firstName = profile.users.first_name || '';
      const lastName = profile.users.last_name || '';
      if (firstName || lastName) {
        displayName = `${firstName} ${lastName}`.trim();
      }
      email = profile.users.email;
      imageUrl = profile.users.image_url;
      linkedinUrl = profile.linkedin_url || undefined;
      githubUrl = profile.github_url || undefined;
      portfolioUrl = profile.portfolio_url || undefined;
    }

    // Get work experiences
    const { data: workExperiences } = await supabaseAdmin
      .from('work_experiences')
      .select('*')
      .eq('candidate_id', profileId)
      .order('start_date', { ascending: false });

    // Get education
    const { data: education } = await supabaseAdmin
      .from('education')
      .select('*')
      .eq('candidate_id', profileId)
      .order('graduation_year', { ascending: false });

    // Get deal experiences from database
    const { data: dealExperiencesDb } = await supabaseAdmin
      .from('deal_experiences')
      .select('*')
      .eq('candidate_id', profileId)
      .order('year', { ascending: false });

    // Get board committees from database
    const { data: boardCommitteesDb } = await supabaseAdmin
      .from('board_committees')
      .select('committee_type')
      .eq('candidate_id', profileId);

    // Get board experience types from database
    const { data: boardExperienceTypesDb } = await supabaseAdmin
      .from('board_experience_types')
      .select('experience_type')
      .eq('candidate_id', profileId);

    // Parse private metadata to get additional data
    let privateMetadata: any = {};
    if (profile.private_metadata) {
      privateMetadata = profile.private_metadata;
    }

    // Parse admin notes to get enriched data
    let adminNotesData: any = {};
    if (profile.admin_notes) {
      try {
        adminNotesData = JSON.parse(profile.admin_notes);
      } catch (e) {
        console.log('Failed to parse admin_notes');
      }
    }

    // Use database data first, then fall back to metadata
    const dealExperiences = dealExperiencesDb && dealExperiencesDb.length > 0 
      ? dealExperiencesDb.map(deal => ({
          dealType: deal.deal_type,
          dealValue: deal.deal_value?.toString(),
          dealCurrency: deal.deal_currency,
          companyName: deal.company_name,
          role: deal.role,
          year: deal.year.toString(),
          description: deal.description,
          sector: deal.sector
        }))
      : adminNotesData.dealExperiences || privateMetadata.dealExperiences || [];
    
    // Extract board committees from database or metadata
    const boardCommittees = boardCommitteesDb && boardCommitteesDb.length > 0
      ? boardCommitteesDb.map(c => c.committee_type)
      : adminNotesData.boardCommittees || privateMetadata.boardCommittees || [];
    
    // Extract board experience types from database or metadata
    const boardExperienceTypes = boardExperienceTypesDb && boardExperienceTypesDb.length > 0
      ? boardExperienceTypesDb.map(t => t.experience_type)
      : adminNotesData.boardExperienceTypes || privateMetadata.boardExperienceTypes || [];
    
    // Extract enriched skills data
    const keySkills = adminNotesData.tags?.filter((t: any) => t.category === 'skill').map((t: any) => t.name) || privateMetadata.skills || skills;
    const functionalExpertise = adminNotesData.tags?.filter((t: any) => t.category === 'expertise').map((t: any) => t.name) || privateMetadata.functionalExpertise || [];
    const industryExpertise = adminNotesData.tags?.filter((t: any) => t.category === 'industry').map((t: any) => t.name) || privateMetadata.industryExpertise || sectors;

    // Calculate board positions from work experiences
    const boardPositions = adminNotesData.boardPositions || privateMetadata.boardPositions || 0;

    // Prepare response data with enhanced information
    const responseData = {
      id: profile.id,
      name: displayName,
      title: profile.title || 'Executive',
      location: profile.location || 'Not specified',
      experience: formatExperience(profile.experience),
      bio: profile.summary || 'Profile summary not available.',
      imageUrl,
      availability: formatAvailability(profile.availability),
      remotePreference: profile.remote_preference,
      skills: keySkills,
      sectors: industryExpertise,
      keySkills,
      functionalExpertise,
      industryExpertise,
      dealExperiences: showFullDetails ? dealExperiences : [],
      boardCommittees: showFullDetails ? boardCommittees : [],
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      email: showFullDetails ? email : undefined,
      phone: showFullDetails ? privateMetadata.phone : undefined,
      user: showFullDetails ? {
        email: profile.users?.email,
        firstName: profile.users?.first_name,
        lastName: profile.users?.last_name,
      } : undefined,
      isOwnProfile,
      isActive: profile.is_active,
      profileCompleted: profile.profile_completed,
      isAnonymized: profile.is_anonymized,
      isUnlocked: hasUnlockedProfile,
      boardPositions,
      workExperiences: showFullDetails ? workExperiences : [],
      education: showFullDetails ? education : [],
      // Include enriched data from private metadata
      adminNotes: showFullDetails ? JSON.stringify({
        phone: privateMetadata.phone,
        company: privateMetadata.company,
        industry: privateMetadata.industry,
        boardExperience: privateMetadata.boardExperience,
        boardPositions: privateMetadata.boardPositions,
        boardExperienceTypes: boardExperienceTypes,
        boardCommittees: boardCommittees,
        boardDetails: privateMetadata.boardDetails,
        roleTypes: privateMetadata.roles || privateMetadata.roleTypes || [],
        workExperiences: privateMetadata.boardPositionsData ? [
          ...(workExperiences || []),
          ...(privateMetadata.boardPositionsData || [])
        ] : workExperiences,
        education: education,
        tags: [
          ...skills.map(s => ({ name: s, category: 'skill' })),
          ...sectors.map(s => ({ name: s, category: 'industry' }))
        ],
        activelySeeking: privateMetadata.activelySeeking,
        willingToRelocate: privateMetadata.willingToRelocate,
        compensationMin: profile.salary_min,
        compensationMax: profile.salary_max,
        yearsExperience: privateMetadata.yearsExperience,
        availability: profile.availability,
        remotePreference: profile.remote_preference
      }) : undefined,
      roleTypes: privateMetadata.roles || privateMetadata.roleTypes || [],
      boardExperienceTypes: boardExperienceTypes,
      activelySeeking: privateMetadata.activelySeeking,
      willingToRelocate: privateMetadata.willingToRelocate,
      // Salary information - only show to authenticated users or own profile
      salary: (userId || isOwnProfile) ? {
        min: profile.salary_min ? parseFloat(profile.salary_min) : null,
        max: profile.salary_max ? parseFloat(profile.salary_max) : null,
        currency: profile.salary_currency || 'USD',
      } : undefined,
    };

    return createSuccessResponse(responseData, 'Profile retrieved successfully');

  } catch (error: any) {
    console.error('Profile view error:', error);
    return createErrorResponse('Failed to retrieve profile', 500);
  }
}