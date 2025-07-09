import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

// Validation schema for search parameters
const searchCandidatesSchema = z.object({
  query: z.string().optional(),
  experience: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']).optional(),
  location: z.string().optional(),
  sectors: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
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
      experience: searchParams.get('experience') as any || undefined,
      location: searchParams.get('location') || undefined,
      sectors: searchParams.get('sectors')?.split(',').filter(Boolean) || undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
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
      query = query.or(`title.ilike.${searchQuery},summary.ilike.${searchQuery},location.ilike.${searchQuery}`);
    }

    if (validatedParams.experience) {
      query = query.eq('experience', validatedParams.experience);
    }

    if (validatedParams.location) {
      query = query.ilike('location', `%${validatedParams.location}%`);
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
        };
      } catch (err) {
        console.error('Error transforming candidate:', candidate.id, err);
        return null;
      }
    }).filter(Boolean);

    const totalPages = Math.ceil((count || 0) / validatedParams.limit);

    return createSuccessResponse({
      profiles,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
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