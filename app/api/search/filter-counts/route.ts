import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createSuccessResponse, createErrorResponse } from '@/lib/validations/middleware';

interface FilterCount {
  value: string;
  label: string;
  count: number;
}

interface FilterCounts {
  role: FilterCount[];
  sectors: FilterCount[];
  experience: FilterCount[];
  location: FilterCount[];
  boardExperience: FilterCount[];
  availability: FilterCount[];
  skills: FilterCount[];
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get all active profiles with their tags
    const { data: profiles, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        id,
        experience,
        location,
        availability,
        private_metadata,
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
      console.error('Error fetching profiles for counts:', error);
      throw error;
    }

    // Initialize counts
    const counts: FilterCounts = {
      role: [],
      sectors: [],
      experience: [],
      location: [],
      boardExperience: [],
      availability: [],
      skills: []
    };

    // Count mappings
    const roleCounts: Record<string, number> = {};
    const sectorCounts: Record<string, number> = {};
    const experienceCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const boardExperienceCounts: Record<string, number> = {};
    const availabilityCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    // Process each profile
    profiles?.forEach(profile => {
      // Count experience levels
      if (profile.experience) {
        experienceCounts[profile.experience] = (experienceCounts[profile.experience] || 0) + 1;
      }

      // Count locations
      if (profile.location) {
        // Normalize location for counting
        const normalizedLocation = profile.location.toLowerCase().trim();
        if (normalizedLocation.includes('london')) {
          locationCounts['london'] = (locationCounts['london'] || 0) + 1;
        } else if (normalizedLocation.includes('manchester') || normalizedLocation.includes('birmingham')) {
          locationCounts['midlands'] = (locationCounts['midlands'] || 0) + 1;
        } else if (normalizedLocation.includes('uk') || normalizedLocation.includes('united kingdom')) {
          locationCounts['uk'] = (locationCounts['uk'] || 0) + 1;
        } else {
          locationCounts['international'] = (locationCounts['international'] || 0) + 1;
        }
      }

      // Count availability
      if (profile.availability) {
        availabilityCounts[profile.availability] = (availabilityCounts[profile.availability] || 0) + 1;
      }

      // Count from private metadata
      const metadata = profile.private_metadata as any || {};
      
      // Count roles
      if (metadata.roles && Array.isArray(metadata.roles)) {
        metadata.roles.forEach((role: string) => {
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
      }

      // Count board experience types
      if (metadata.boardExperienceTypes && Array.isArray(metadata.boardExperienceTypes)) {
        metadata.boardExperienceTypes.forEach((type: string) => {
          boardExperienceCounts[type] = (boardExperienceCounts[type] || 0) + 1;
        });
      }

      // Count tags (sectors and skills)
      profile.candidate_tags?.forEach(ct => {
        const tag = ct.tags;
        if (tag) {
          if (tag.type === 'industry') {
            sectorCounts[tag.name] = (sectorCounts[tag.name] || 0) + 1;
          } else if (tag.type === 'skill' || tag.type === 'expertise') {
            skillCounts[tag.name] = (skillCounts[tag.name] || 0) + 1;
          }
        }
      });
    });

    // Convert counts to arrays with labels
    counts.role = [
      { value: 'chair', label: 'Chair', count: roleCounts['chair'] || 0 },
      { value: 'ned', label: 'Non-Executive Director', count: roleCounts['ned'] || 0 },
      { value: 'advisor', label: 'Advisor', count: roleCounts['advisor'] || 0 },
      { value: 'trustee', label: 'Trustee', count: roleCounts['trustee'] || 0 },
      { value: 'senior-independent', label: 'Senior Independent Director', count: roleCounts['senior-independent'] || 0 },
    ];

    // Get top sectors
    counts.sectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({
        value: name.toLowerCase().replace(/\s+/g, '-'),
        label: name,
        count
      }));

    counts.experience = [
      { value: 'junior', label: '0-5 years', count: experienceCounts['junior'] || 0 },
      { value: 'mid', label: '5-10 years', count: experienceCounts['mid'] || 0 },
      { value: 'senior', label: '10-15 years', count: experienceCounts['senior'] || 0 },
      { value: 'lead', label: '15-20 years', count: experienceCounts['lead'] || 0 },
      { value: 'executive', label: '20+ years', count: experienceCounts['executive'] || 0 },
    ];

    counts.location = [
      { value: 'london', label: 'London', count: locationCounts['london'] || 0 },
      { value: 'midlands', label: 'Midlands', count: locationCounts['midlands'] || 0 },
      { value: 'uk', label: 'UK', count: locationCounts['uk'] || 0 },
      { value: 'international', label: 'International', count: locationCounts['international'] || 0 },
    ];

    counts.boardExperience = [
      { value: 'ftse100', label: 'FTSE 100', count: boardExperienceCounts['ftse100'] || 0 },
      { value: 'ftse250', label: 'FTSE 250', count: boardExperienceCounts['ftse250'] || 0 },
      { value: 'aim', label: 'AIM Listed', count: boardExperienceCounts['aim'] || 0 },
      { value: 'private-equity', label: 'Private Equity Backed', count: boardExperienceCounts['private-equity'] || 0 },
      { value: 'startup', label: 'Startup/Scale-up', count: boardExperienceCounts['startup'] || 0 },
      { value: 'public-sector', label: 'Public Sector', count: boardExperienceCounts['public-sector'] || 0 },
      { value: 'charity', label: 'Charity/Third Sector', count: boardExperienceCounts['charity'] || 0 },
    ];

    counts.availability = [
      { value: 'immediately', label: 'Immediate', count: availabilityCounts['immediately'] || 0 },
      { value: '2weeks', label: 'Within 2 weeks', count: availabilityCounts['2weeks'] || 0 },
      { value: '1month', label: 'Within 1 month', count: availabilityCounts['1month'] || 0 },
      { value: '3months', label: 'Within 3 months', count: availabilityCounts['3months'] || 0 },
      { value: '6months', label: 'Within 6 months', count: availabilityCounts['6months'] || 0 },
    ];

    // Get top skills
    counts.skills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        value: name,
        label: name,
        count
      }));

    return createSuccessResponse(counts, 'Filter counts retrieved successfully');

  } catch (error: any) {
    console.error('Filter counts API error:', error);
    return createErrorResponse('Failed to get filter counts', 500);
  }
}