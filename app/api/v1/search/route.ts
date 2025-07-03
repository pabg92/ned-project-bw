import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, ilike, gte, lte, inArray, or, sql, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  candidateProfiles, 
  candidateTags, 
  tags, 
  workExperiences, 
  education,
  users,
  companies,
  companyUsers,
  searchQueries
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { advancedSearchFiltersSchema, searchResponseSchema } from '@/lib/validations/search';
import type { AdvancedSearchFiltersSchema, SearchResponseSchema } from '@/lib/validations/search';

/**
 * POST /api/v1/search
 * Advanced candidate search for companies
 */
export const POST = withValidation(
  { query: advancedSearchFiltersSchema },
  async ({ query }, request) => {
    const startTime = Date.now();

    try {
      // Check authentication
      const { userId } = await auth();
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Get user and verify they're associated with a company
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return createErrorResponse('User not found', 404);
      }

      // Check if user is associated with a company
      const companyUser = await db.query.companyUsers.findFirst({
        where: eq(companyUsers.userId, userId),
        with: {
          company: true,
        },
      });

      if (!companyUser) {
        return createErrorResponse('Access denied: Company membership required', 403);
      }

      const company = companyUser.company;

      // Check company search quota
      if (company.searchesUsed >= company.searchQuota) {
        return createErrorResponse('Search quota exceeded. Please upgrade your plan.', 429);
      }

      // Build the search query
      const searchResult = await executeSearch(query as AdvancedSearchFiltersSchema, company.id, userId);

      // Log the search for analytics
      await logSearchQuery(company.id, userId, query as AdvancedSearchFiltersSchema, searchResult.total);

      // Update company search usage
      await db.update(companies)
        .set({ 
          searchesUsed: company.searchesUsed + 1,
          updatedAt: new Date()
        })
        .where(eq(companies.id, company.id));

      const searchTime = Date.now() - startTime;

      const response: SearchResponseSchema = {
        results: searchResult.results,
        total: searchResult.total,
        page: query?.page || 1,
        limit: query?.limit || 10,
        totalPages: Math.ceil(searchResult.total / (query?.limit || 10)),
        facets: searchResult.facets,
        searchTime,
        searchId: searchResult.searchId,
      };

      return createSuccessResponse(response, 'Search completed successfully');

    } catch (error) {
      console.error('Search error:', error);
      return createErrorResponse('Search failed', 500);
    }
  }
);

/**
 * Execute the actual search query with filters
 */
async function executeSearch(
  filters: AdvancedSearchFiltersSchema, 
  companyId: string, 
  userId: string
) {
  const searchId = crypto.randomUUID();
  const offset = ((filters.page || 1) - 1) * (filters.limit || 10);

  // Build where conditions
  const whereConditions = [
    eq(candidateProfiles.isActive, true),
  ];

  // Include/exclude anonymized profiles based on filter
  if (!filters.includeAnonymized) {
    whereConditions.push(eq(candidateProfiles.isAnonymized, false));
  }

  // Profile completion filter
  if (filters.profileCompletedOnly) {
    whereConditions.push(eq(candidateProfiles.profileCompleted, true));
  }

  // Experience level filter
  if (filters.experienceLevels && filters.experienceLevels.length > 0) {
    whereConditions.push(inArray(candidateProfiles.experience, filters.experienceLevels));
  }

  // Location filter
  if (filters.locations && filters.locations.length > 0) {
    const locationConditions = filters.locations.map(location => 
      ilike(candidateProfiles.location, `%${location}%`)
    );
    whereConditions.push(or(...locationConditions));
  }

  // Remote preference filter
  if (filters.remotePreferences && filters.remotePreferences.length > 0) {
    whereConditions.push(inArray(candidateProfiles.remotePreference, filters.remotePreferences));
  }

  // Availability filter
  if (filters.availabilities && filters.availabilities.length > 0) {
    whereConditions.push(inArray(candidateProfiles.availability, filters.availabilities));
  }

  // Salary filters
  if (filters.salaryMin) {
    whereConditions.push(gte(candidateProfiles.salaryMin, filters.salaryMin.toString()));
  }
  if (filters.salaryMax) {
    whereConditions.push(lte(candidateProfiles.salaryMax, filters.salaryMax.toString()));
  }

  // Years of experience filter
  if (filters.minYearsExperience !== undefined || filters.maxYearsExperience !== undefined) {
    // This would require calculating years from work experiences
    // For now, we'll use a placeholder logic
  }

  // Text search across title and summary
  if (filters.query) {
    const textSearchCondition = or(
      ilike(candidateProfiles.title, `%${filters.query}%`),
      ilike(candidateProfiles.summary, `%${filters.query}%`)
    );
    whereConditions.push(textSearchCondition);
  }

  // Build sorting
  let orderBy;
  const sortColumn = filters.sortBy || 'relevance';
  const sortDirection = filters.sortOrder || 'desc';

  switch (sortColumn) {
    case 'salary':
      orderBy = sortDirection === 'asc' 
        ? asc(candidateProfiles.salaryMax) 
        : desc(candidateProfiles.salaryMax);
      break;
    case 'updated':
      orderBy = sortDirection === 'asc' 
        ? asc(candidateProfiles.updatedAt) 
        : desc(candidateProfiles.updatedAt);
      break;
    case 'alphabetical':
      orderBy = sortDirection === 'asc' 
        ? asc(candidateProfiles.title) 
        : desc(candidateProfiles.title);
      break;
    case 'experience':
      // Custom ordering for experience levels
      orderBy = sql`
        CASE ${candidateProfiles.experience}
          WHEN 'executive' THEN ${sortDirection === 'asc' ? 5 : 1}
          WHEN 'lead' THEN ${sortDirection === 'asc' ? 4 : 2}
          WHEN 'senior' THEN ${sortDirection === 'asc' ? 3 : 3}
          WHEN 'mid' THEN ${sortDirection === 'asc' ? 2 : 4}
          WHEN 'junior' THEN ${sortDirection === 'asc' ? 1 : 5}
          ELSE 0
        END
      `;
      break;
    default: // relevance
      orderBy = desc(candidateProfiles.updatedAt);
  }

  // Execute main search query
  const candidatesQuery = db
    .select({
      id: candidateProfiles.id,
      userId: candidateProfiles.userId,
      title: candidateProfiles.title,
      summary: candidateProfiles.summary,
      experience: candidateProfiles.experience,
      location: candidateProfiles.location,
      remotePreference: candidateProfiles.remotePreference,
      availability: candidateProfiles.availability,
      salaryMin: candidateProfiles.salaryMin,
      salaryMax: candidateProfiles.salaryMax,
      salaryCurrency: candidateProfiles.salaryCurrency,
      isAnonymized: candidateProfiles.isAnonymized,
      updatedAt: candidateProfiles.updatedAt,
    })
    .from(candidateProfiles)
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(filters.limit || 10)
    .offset(offset);

  // Handle tag filters if provided
  if (filters.requiredTags && filters.requiredTags.length > 0) {
    // This requires a more complex query with EXISTS subquery
    // For now, implement basic tag filtering
  }

  const candidates = await candidatesQuery;

  // Get total count
  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(candidateProfiles)
    .where(and(...whereConditions));

  const [{ count: total }] = await totalQuery;

  // Anonymize results and build response
  const results = await Promise.all(candidates.map(async (candidate) => {
    // Get candidate tags
    const candidateTagsData = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        proficiency: candidateTags.proficiency,
        yearsExperience: candidateTags.yearsExperience,
      })
      .from(candidateTags)
      .innerJoin(tags, eq(candidateTags.tagId, tags.id))
      .where(eq(candidateTags.candidateId, candidate.id))
      .limit(5);

    return {
      candidateId: candidate.id,
      score: 0.8, // Placeholder relevance score
      matchedTags: candidateTagsData,
      preview: anonymizeCandidate(candidate),
    };
  }));

  // Generate facets for filtering UI
  const facets = await generateFacets(whereConditions);

  return {
    results,
    total,
    facets,
    searchId,
  };
}

/**
 * Anonymize candidate data for search results
 */
function anonymizeCandidate(candidate: any) {
  if (candidate.isAnonymized) {
    return {
      title: candidate.title ? `${candidate.experience || 'Experienced'} Professional` : undefined,
      location: candidate.location ? generalizeLocation(candidate.location) : undefined,
      experience: candidate.experience,
      remotePreference: candidate.remotePreference,
      availability: candidate.availability,
      topSkills: [], // Will be populated from tags
      salaryRange: candidate.salaryMin && candidate.salaryMax ? {
        min: Math.floor(parseFloat(candidate.salaryMin) / 5000) * 5000,
        max: Math.ceil(parseFloat(candidate.salaryMax) / 5000) * 5000,
        currency: candidate.salaryCurrency,
      } : undefined,
    };
  }

  // Non-anonymized profile
  return {
    title: candidate.title,
    location: candidate.location,
    experience: candidate.experience,
    remotePreference: candidate.remotePreference,
    availability: candidate.availability,
    topSkills: [], // Will be populated from tags
    salaryRange: candidate.salaryMin && candidate.salaryMax ? {
      min: parseFloat(candidate.salaryMin),
      max: parseFloat(candidate.salaryMax),
      currency: candidate.salaryCurrency,
    } : undefined,
  };
}

/**
 * Generalize location for anonymized profiles
 */
function generalizeLocation(location: string): string {
  // Extract city/region and make it more general
  const parts = location.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim(); // Return country/state only
  }
  return 'Remote'; // Fallback
}

/**
 * Generate facets for search filtering
 */
async function generateFacets(whereConditions: any[]) {
  // Get experience level facets
  const experienceFacets = await db
    .select({
      value: candidateProfiles.experience,
      count: sql<number>`count(*)`,
    })
    .from(candidateProfiles)
    .where(and(...whereConditions))
    .groupBy(candidateProfiles.experience)
    .having(sql`count(*) > 0`);

  // Get location facets
  const locationFacets = await db
    .select({
      value: candidateProfiles.location,
      count: sql<number>`count(*)`,
    })
    .from(candidateProfiles)
    .where(and(...whereConditions, sql`${candidateProfiles.location} IS NOT NULL`))
    .groupBy(candidateProfiles.location)
    .having(sql`count(*) > 0`)
    .limit(10);

  // Get remote preference facets
  const remoteFacets = await db
    .select({
      value: candidateProfiles.remotePreference,
      count: sql<number>`count(*)`,
    })
    .from(candidateProfiles)
    .where(and(...whereConditions))
    .groupBy(candidateProfiles.remotePreference)
    .having(sql`count(*) > 0`);

  // Get availability facets
  const availabilityFacets = await db
    .select({
      value: candidateProfiles.availability,
      count: sql<number>`count(*)`,
    })
    .from(candidateProfiles)
    .where(and(...whereConditions))
    .groupBy(candidateProfiles.availability)
    .having(sql`count(*) > 0`);

  return {
    experience: experienceFacets.filter(f => f.value),
    location: locationFacets.filter(f => f.value),
    remotePreference: remoteFacets.filter(f => f.value),
    availability: availabilityFacets.filter(f => f.value),
  };
}

/**
 * Log search query for analytics
 */
async function logSearchQuery(
  companyId: string, 
  userId: string, 
  filters: AdvancedSearchFiltersSchema, 
  resultsCount: number
) {
  try {
    await db.insert(searchQueries).values({
      companyId,
      userId,
      query: filters,
      resultsCount,
      filtersTags: filters.requiredTags || [],
    });
  } catch (error) {
    console.error('Failed to log search query:', error);
    // Don't fail the search if logging fails
  }
}