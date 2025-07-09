import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    console.log('All candidates API called');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    
    // Get all candidate profiles (including inactive and incomplete)
    const { data: candidates, error, count } = await supabaseAdmin
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
        is_anonymized,
        profile_completed,
        created_at,
        updated_at,
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name,
          image_url
        )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    console.log('Found candidates:', candidates?.length || 0);

    // Transform data for frontend
    const profiles = (candidates || []).map(candidate => {
      // Determine display name
      let displayName = 'Executive Profile';
      let imageUrl = null;
      
      if (candidate.users) {
        const firstName = candidate.users.first_name || '';
        const lastName = candidate.users.last_name || '';
        if (firstName || lastName) {
          displayName = `${firstName} ${lastName}`.trim();
        }
        imageUrl = candidate.users.image_url;
      }

      return {
        id: candidate.id,
        name: displayName,
        title: candidate.title || 'Executive',
        location: candidate.location || 'Not specified',
        experience: formatExperience(candidate.experience),
        sectors: [], // No tags for now
        skills: [], // No tags for now
        bio: candidate.summary || 'Profile summary not available.',
        imageUrl: imageUrl,
        isUnlocked: false,
        boardPositions: 0,
        availability: formatAvailability(candidate.availability),
        rating: 4.5,
        profileViews: 100,
        // Debug info
        isActive: candidate.is_active,
        isCompleted: candidate.profile_completed,
        userId: candidate.user_id
      };
    });

    return createSuccessResponse({
      profiles,
      pagination: {
        page: 1,
        limit: 50,
        total: count || 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    }, 'All candidates fetched');

  } catch (error: any) {
    console.error('API error:', error);
    return createErrorResponse('Failed to fetch candidates', 500);
  }
}

function formatExperience(experience?: string | null): string {
  if (!experience) return '10+ years';
  
  const expMap: Record<string, string> = {
    'junior': '0-5 years',
    'mid': '5-10 years',
    'senior': '10-20 years',
    'lead': '20-25 years',
    'executive': '25+ years',
  };
  
  return expMap[experience] || '10+ years';
}

function formatAvailability(availability?: string | null): string {
  if (!availability) return 'Available';
  
  const availMap: Record<string, string> = {
    'immediately': 'Immediate',
    '2weeks': '2 weeks',
    '1month': '1 month',
    '3months': '3 months',
    '6months': '6 months',
  };
  
  return availMap[availability] || 'Available';
}