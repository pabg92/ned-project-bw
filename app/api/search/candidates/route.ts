import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

// Validation schema for search parameters
const searchCandidatesSchema = z.object({
  query: z.string().optional(),
  experience: z.string().optional(), // Changed to accept year ranges like "0-5", "5-10", etc.
  location: z.string().optional(),
  sectors: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  role: z.array(z.string()).optional(), // Added role filter
  boardExperience: z.array(z.string()).optional(), // Added board experience filter
  availability: z.enum(['immediately', '2weeks', '1month', '3months', '6months']).optional(),
  remotePreference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
  sortBy: z.enum(['relevance', 'experience', 'recent', 'rating', 'views']).default('relevance'),
});

type SearchParams = z.infer<typeof searchCandidatesSchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: SearchParams = {
      query: searchParams.get('query') || undefined,
      experience: searchParams.get('experience') || undefined,
      location: searchParams.get('location') || undefined,
      sectors: searchParams.get('sectors')?.split(',').filter(Boolean) || undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
      role: searchParams.get('role')?.split(',').filter(Boolean) || undefined,
      boardExperience: searchParams.get('boardExperience')?.split(',').filter(Boolean) || undefined,
      availability: searchParams.get('availability') as any || undefined,
      remotePreference: searchParams.get('remotePreference') as any || undefined,
      salaryMin: searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined,
      salaryMax: searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
      sortBy: searchParams.get('sortBy') as any || 'relevance',
    };

    // Validate parameters
    const validatedParams = searchCandidatesSchema.parse(params);

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();

    // Build query with all related data
    let query = supabaseAdmin
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
        is_active,
        profile_completed,
        private_metadata,
        public_metadata,
        created_at,
        updated_at,
        linkedin_url,
        github_url,
        portfolio_url,
        resume_url,
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          position,
          start_date,
          end_date,
          is_current,
          description
        ),
        education(
          id,
          institution,
          degree,
          field_of_study,
          start_date,
          end_date
        ),
        candidate_tags(
          tag_id,
          tags(
            id,
            name,
            type
          )
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('profile_completed', true);

    // Apply search filters
    if (validatedParams.query) {
      const searchQuery = `%${validatedParams.query}%`;
      // Expanded search to include user names and work experiences
      query = query.or(`title.ilike.${searchQuery},summary.ilike.${searchQuery},location.ilike.${searchQuery},users.first_name.ilike.${searchQuery},users.last_name.ilike.${searchQuery}`);
    }

    // Handle experience filter - map year ranges to levels
    if (validatedParams.experience) {
      const experienceLevel = mapExperienceYearsToLevel(validatedParams.experience);
      if (experienceLevel) {
        query = query.eq('experience', experienceLevel);
      }
    }

    if (validatedParams.location) {
      query = query.ilike('location', `%${validatedParams.location}%`);
    }

    // Handle role filter through tags
    if (validatedParams.role && validatedParams.role.length > 0) {
      // Filter profiles that have any of the specified role tags
      query = query.contains('private_metadata', { roles: validatedParams.role });
    }

    // Handle sectors filter through tags - simplified approach
    if (validatedParams.sectors && validatedParams.sectors.length > 0) {
      // For now, we'll filter in post-processing since complex tag queries are challenging
      // This will be handled after the query executes
    }

    // Handle skills filter - simplified approach
    if (validatedParams.skills && validatedParams.skills.length > 0) {
      // For now, we'll filter in post-processing since complex tag queries are challenging
      // This will be handled after the query executes
    }

    // Handle board experience filter
    if (validatedParams.boardExperience && validatedParams.boardExperience.length > 0) {
      query = query.contains('private_metadata', { boardExperienceTypes: validatedParams.boardExperience });
    }

    // Handle availability filter
    if (validatedParams.availability) {
      query = query.eq('availability', validatedParams.availability);
    }

    // Handle remote preference filter
    if (validatedParams.remotePreference) {
      query = query.eq('remote_preference', validatedParams.remotePreference);
    }

    // Handle salary range filters
    if (validatedParams.salaryMin) {
      query = query.gte('salary_min', validatedParams.salaryMin);
    }
    if (validatedParams.salaryMax) {
      query = query.lte('salary_max', validatedParams.salaryMax);
    }

    // Apply sorting
    switch (validatedParams.sortBy) {
      case 'experience':
        query = query.order('experience', { ascending: false });
        break;
      case 'recent':
        query = query.order('updated_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const offset = (validatedParams.page - 1) * validatedParams.limit;
    query = query.range(offset, offset + validatedParams.limit - 1);

    // Execute query
    const { data: candidates, error, count } = await query;

    if (error) {
      console.error('Search query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    // Transform data to match the frontend's expected format
    const profiles = (candidates || []).map(candidate => {
      try {
        // Get user data
        const user = candidate.users || {};
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Executive Profile';

        // Extract tags by type
        const tags = candidate.candidate_tags?.map(ct => ct.tags).filter(Boolean) || [];
        const skills = tags.filter(tag => tag.type === 'skill').map(tag => tag.name);
        const expertise = tags.filter(tag => tag.type === 'expertise').map(tag => tag.name);
        const industries = tags.filter(tag => tag.type === 'industry').map(tag => tag.name);
        const roles = tags.filter(tag => tag.type === 'role').map(tag => tag.name);

        // Get work experiences
        const workExperiences = candidate.work_experiences || [];
        
        // Get education
        const education = candidate.education || [];
        
        // Extract data from private_metadata
        const privateMetadata = candidate.private_metadata || {};
        const boardPositions = privateMetadata.boardPositions || 0;
        const boardExperience = privateMetadata.boardExperience || false;
        const activelySeeking = privateMetadata.activelySeeking || false;
        const availableImmediate = privateMetadata.availableImmediate || false;
        const willingToRelocate = privateMetadata.willingToRelocate || false;

        return {
          id: candidate.id,
          name: fullName,
          title: candidate.title || 'Executive',
          location: candidate.location || 'Not specified',
          experience: formatExperience(candidate.experience),
          sectors: industries.slice(0, 5),
          skills: [...skills, ...expertise].slice(0, 5),
          roles: roles, // Added roles
          bio: candidate.summary || 'Profile summary not available.',
          imageUrl: null,
          isUnlocked: false,
          boardPositions: boardPositions,
          boardExperience: boardExperience,
          availability: candidate.availability || 'Available',
          rating: 4.5,
          profileViews: 100,
          // Additional data for detailed view
          workExperiences: workExperiences,
          education: education,
          activelySeeking: activelySeeking,
          willingToRelocate: willingToRelocate,
          remotePreference: candidate.remote_preference || 'flexible',
          linkedinUrl: candidate.linkedin_url,
          portfolioUrl: candidate.portfolio_url,
          githubUrl: candidate.github_url,
          resumeUrl: candidate.resume_url,
          // Raw data for filtering
          rawExperience: candidate.experience,
          privateMetadata: candidate.private_metadata,
        };
      } catch (err) {
        console.error('Error transforming candidate:', candidate.id, err);
        return null;
      }
    }).filter(Boolean);

    // Post-process filtering for sectors and skills
    let filteredProfiles = profiles;
    
    if (validatedParams.sectors && validatedParams.sectors.length > 0) {
      filteredProfiles = filteredProfiles.filter(profile => {
        // Check if profile has any of the requested sectors
        const profileSectors = profile.sectors.map(s => s.toLowerCase());
        return validatedParams.sectors.some(sector => 
          profileSectors.some(ps => ps.includes(sector.toLowerCase()))
        );
      });
    }

    if (validatedParams.skills && validatedParams.skills.length > 0) {
      filteredProfiles = filteredProfiles.filter(profile => {
        // Check if profile has any of the requested skills
        const profileSkills = profile.skills.map(s => s.toLowerCase());
        return validatedParams.skills.some(skill => 
          profileSkills.some(ps => ps.includes(skill.toLowerCase()))
        );
      });
    }

    // Adjust count for filtered results
    const filteredCount = filteredProfiles.length;
    const totalPages = Math.ceil(filteredCount / validatedParams.limit);

    return createSuccessResponse({
      profiles: filteredProfiles,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: filteredCount,
        totalPages,
        hasNextPage: validatedParams.page < totalPages,
        hasPreviousPage: validatedParams.page > 1,
      },
      filters: validatedParams,
    }, 'Search completed successfully');

  } catch (error: any) {
    console.error('Search API error:', error);
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid search parameters', 400, error.errors);
    }
    
    return createErrorResponse('Failed to search candidates', 500);
  }
}

// Helper function to map year ranges to experience levels
function mapExperienceYearsToLevel(yearRange?: string): string | undefined {
  if (!yearRange) return undefined;
  
  const experienceMap: Record<string, string> = {
    '0-5': 'junior',
    '5-10': 'mid',
    '10-15': 'senior',
    '15-20': 'lead',
    '20+': 'executive',
  };
  
  return experienceMap[yearRange];
}

function formatExperience(experience?: string | number | null): string {
  if (typeof experience === 'number') {
    if (experience < 5) return '0-5 years';
    if (experience < 10) return '5-10 years';
    if (experience < 20) return '10-20 years';
    if (experience < 25) return '20-25 years';
    return '25+ years';
  }
  
  if (typeof experience === 'string') {
    const expMap: Record<string, string> = {
      'junior': '0-5 years',
      'mid': '5-10 years',
      'senior': '10-20 years',
      'lead': '20-25 years',
      'executive': '25+ years',
    };
    return expMap[experience] || '10+ years';
  }
  
  return '10+ years';
}