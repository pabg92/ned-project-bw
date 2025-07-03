import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, ilike, sql, desc, and } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  tags, 
  candidateProfiles, 
  workExperiences,
  companies,
  companyUsers
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

const searchSuggestionsQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(100, 'Query must be less than 100 characters'),
  type: z.enum(['tag', 'company', 'location', 'title']).optional(),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 20) : 10),
});

/**
 * GET /api/v1/search/suggestions
 * Get search suggestions for autocomplete
 */
export const GET = withValidation(
  { query: searchSuggestionsQuerySchema },
  async ({ query }, request) => {
    try {
      // Check authentication
      const { userId } = await auth();
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Verify company membership
      const companyUser = await db.query.companyUsers.findFirst({
        where: eq(companyUsers.userId, userId),
      });

      if (!companyUser) {
        return createErrorResponse('Access denied: Company membership required', 403);
      }

      const { q, type, limit } = query!;
      const suggestions = [];

      // If no specific type, search across all types
      const searchTypes = type ? [type] : ['tag', 'company', 'location', 'title'];

      for (const searchType of searchTypes) {
        let typeSuggestions = [];

        switch (searchType) {
          case 'tag':
            typeSuggestions = await getTagSuggestions(q, limit || 10);
            break;
          case 'company':
            typeSuggestions = await getCompanySuggestions(q, limit || 10);
            break;
          case 'location':
            typeSuggestions = await getLocationSuggestions(q, limit || 10);
            break;
          case 'title':
            typeSuggestions = await getTitleSuggestions(q, limit || 10);
            break;
        }

        suggestions.push(...typeSuggestions);
      }

      // Sort by relevance/count and limit results
      const sortedSuggestions = suggestions
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, limit || 10);

      return createSuccessResponse(sortedSuggestions, 'Suggestions retrieved successfully');

    } catch (error) {
      console.error('Search suggestions error:', error);
      return createErrorResponse('Failed to retrieve suggestions', 500);
    }
  }
);

/**
 * Get tag suggestions
 */
async function getTagSuggestions(query: string, limit: number) {
  const tagSuggestions = await db
    .select({
      value: tags.name,
      count: sql<number>`count(*)`,
      category: tags.category,
    })
    .from(tags)
    .where(
      and(
        ilike(tags.name, `%${query}%`),
        eq(tags.isVerified, true)
      )
    )
    .groupBy(tags.id, tags.name, tags.category)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return tagSuggestions.map(suggestion => ({
    type: 'tag' as const,
    value: suggestion.value,
    count: suggestion.count,
    category: suggestion.category,
  }));
}

/**
 * Get company suggestions from work experiences
 */
async function getCompanySuggestions(query: string, limit: number) {
  const companySuggestions = await db
    .select({
      value: workExperiences.company,
      count: sql<number>`count(distinct ${workExperiences.candidateId})`,
    })
    .from(workExperiences)
    .where(ilike(workExperiences.company, `%${query}%`))
    .groupBy(workExperiences.company)
    .orderBy(desc(sql`count(distinct ${workExperiences.candidateId})`))
    .limit(limit);

  return companySuggestions.map(suggestion => ({
    type: 'company' as const,
    value: suggestion.value,
    count: suggestion.count,
  }));
}

/**
 * Get location suggestions
 */
async function getLocationSuggestions(query: string, limit: number) {
  const locationSuggestions = await db
    .select({
      value: candidateProfiles.location,
      count: sql<number>`count(*)`,
    })
    .from(candidateProfiles)
    .where(
      and(
        ilike(candidateProfiles.location, `%${query}%`),
        eq(candidateProfiles.isActive, true)
      )
    )
    .groupBy(candidateProfiles.location)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return locationSuggestions
    .filter(suggestion => suggestion.value) // Filter out null locations
    .map(suggestion => ({
      type: 'location' as const,
      value: suggestion.value!,
      count: suggestion.count,
    }));
}

/**
 * Get job title suggestions
 */
async function getTitleSuggestions(query: string, limit: number) {
  const titleSuggestions = await db
    .select({
      value: candidateProfiles.title,
      count: sql<number>`count(*)`,
    })
    .from(candidateProfiles)
    .where(
      and(
        ilike(candidateProfiles.title, `%${query}%`),
        eq(candidateProfiles.isActive, true)
      )
    )
    .groupBy(candidateProfiles.title)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return titleSuggestions
    .filter(suggestion => suggestion.value) // Filter out null titles
    .map(suggestion => ({
      type: 'title' as const,
      value: suggestion.value!,
      count: suggestion.count,
    }));
}