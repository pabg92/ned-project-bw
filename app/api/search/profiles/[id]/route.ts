import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/search/profiles/[id]
 * Public endpoint to view a candidate profile
 * Returns different levels of detail based on authentication and unlock status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params;
    
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
          category
        )
      `)
      .eq('candidate_id', profileId);

    // Transform tags into skills and sectors
    const skills = candidateTags
      ?.filter(ct => ct.tags?.category === 'skill')
      ?.map(ct => ct.tags?.name) || [];
    
    const sectors = candidateTags
      ?.filter(ct => ct.tags?.category === 'sector' || ct.tags?.category === 'industry')
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
    
    // Show full details if:
    // 1. It's the user's own profile
    // 2. The profile is not anonymized
    // 3. TODO: The viewer has unlocked this profile (requires credit system implementation)
    const showFullDetails = isOwnProfile || !profile.is_anonymized;
    
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

    // Prepare response data
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
      skills,
      sectors,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      email: showFullDetails ? email : undefined,
      user: showFullDetails ? {
        email: profile.users?.email,
        firstName: profile.users?.first_name,
        lastName: profile.users?.last_name,
      } : undefined,
      isOwnProfile,
      isActive: profile.is_active,
      profileCompleted: profile.profile_completed,
      isAnonymized: profile.is_anonymized,
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