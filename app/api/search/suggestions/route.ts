import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createSuccessResponse, createErrorResponse } from '@/lib/validations/middleware';

interface SearchSuggestion {
  type: 'role' | 'skill' | 'sector' | 'location' | 'company' | 'name';
  value: string;
  count?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get all active profiles with their data
    const { data: profiles, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        id,
        title,
        location,
        users!candidate_profiles_user_id_fkey(
          first_name,
          last_name
        ),
        work_experiences(
          company_name,
          position
        ),
        candidate_tags(
          tag_id,
          tags(
            id,
            name,
            type
          )
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Error fetching profiles for suggestions:', error);
      throw error;
    }

    const suggestions: SearchSuggestion[] = [];
    const uniqueSuggestions = new Set<string>();

    // Helper to add unique suggestions
    const addSuggestion = (type: SearchSuggestion['type'], value: string) => {
      const key = `${type}:${value.toLowerCase()}`;
      if (!uniqueSuggestions.has(key) && value.toLowerCase().includes(query)) {
        uniqueSuggestions.add(key);
        suggestions.push({ type, value });
      }
    };

    // Process profiles for suggestions
    profiles?.forEach(profile => {
      // Add name suggestions
      const user = profile.users;
      if (user) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        if (fullName) {
          addSuggestion('name', fullName);
        }
      }

      // Add title/role suggestions
      if (profile.title) {
        addSuggestion('role', profile.title);
      }

      // Add location suggestions
      if (profile.location) {
        addSuggestion('location', profile.location);
      }

      // Add company suggestions from work experiences
      profile.work_experiences?.forEach(exp => {
        if (exp.company_name) {
          addSuggestion('company', exp.company_name);
        }
        if (exp.position) {
          addSuggestion('role', exp.position);
        }
      });

      // Add tag suggestions (sectors and skills)
      profile.candidate_tags?.forEach(ct => {
        const tag = ct.tags;
        if (tag) {
          if (tag.type === 'industry') {
            addSuggestion('sector', tag.name);
          } else if (tag.type === 'skill' || tag.type === 'expertise') {
            addSuggestion('skill', tag.name);
          }
        }
      });
    });

    // Sort suggestions by relevance (exact matches first, then by type)
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Exact matches first
        const aExact = a.value.toLowerCase() === query;
        const bExact = b.value.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by type priority
        const typePriority = ['name', 'role', 'skill', 'company', 'sector', 'location'];
        const aIndex = typePriority.indexOf(a.type);
        const bIndex = typePriority.indexOf(b.type);
        if (aIndex !== bIndex) return aIndex - bIndex;

        // Finally alphabetically
        return a.value.localeCompare(b.value);
      })
      .slice(0, 10); // Limit to top 10 suggestions

    return createSuccessResponse(sortedSuggestions, 'Search suggestions retrieved successfully');

  } catch (error: any) {
    console.error('Search suggestions API error:', error);
    return createErrorResponse('Failed to get search suggestions', 500);
  }
}