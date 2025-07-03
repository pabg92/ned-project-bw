import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc, gte } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  searchQueries,
  companyUsers
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

const searchHistoryQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 50) : 20),
  days: z.string().optional().transform(val => val ? parseInt(val, 10) : 30),
});

/**
 * GET /api/v1/search/history
 * Get search history for the current company
 */
export const GET = withValidation(
  { query: searchHistoryQuerySchema },
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

      const { page, limit, days } = query!;
      const offset = (page! - 1) * limit!;

      // Calculate date filter
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days!);

      // Get search history
      const history = await db
        .select({
          id: searchQueries.id,
          query: searchQueries.query,
          resultsCount: searchQueries.resultsCount,
          filtersTags: searchQueries.filtersTags,
          createdAt: searchQueries.createdAt,
        })
        .from(searchQueries)
        .where(
          and(
            eq(searchQueries.companyId, companyUser.companyId),
            gte(searchQueries.createdAt, cutoffDate)
          )
        )
        .orderBy(desc(searchQueries.createdAt))
        .limit(limit!)
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: searchQueries.id })
        .from(searchQueries)
        .where(
          and(
            eq(searchQueries.companyId, companyUser.companyId),
            gte(searchQueries.createdAt, cutoffDate)
          )
        );

      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit!);

      // Transform the data to be more user-friendly
      const formattedHistory = history.map(item => ({
        id: item.id,
        searchParameters: item.query,
        resultsFound: item.resultsCount,
        tags: item.filtersTags,
        searchedAt: item.createdAt,
        // Extract key search terms for quick reference
        summary: generateSearchSummary(item.query),
      }));

      const response = {
        history: formattedHistory,
        pagination: {
          page: page!,
          limit: limit!,
          total,
          totalPages,
          hasNext: page! < totalPages,
          hasPrev: page! > 1,
        },
        periodDays: days!,
      };

      return createSuccessResponse(response, 'Search history retrieved successfully');

    } catch (error) {
      console.error('Search history error:', error);
      return createErrorResponse('Failed to retrieve search history', 500);
    }
  }
);

/**
 * DELETE /api/v1/search/history
 * Clear search history for the current company
 */
export async function DELETE(request: NextRequest) {
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

    // Parse query parameters for optional date range
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : null;

    let whereCondition = eq(searchQueries.companyId, companyUser.companyId);

    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      whereCondition = and(
        eq(searchQueries.companyId, companyUser.companyId),
        gte(searchQueries.createdAt, cutoffDate)
      );
    }

    // Delete search history
    const deletedQueries = await db
      .delete(searchQueries)
      .where(whereCondition)
      .returning({ id: searchQueries.id });

    const deletedCount = deletedQueries.length;

    return createSuccessResponse(
      { deletedCount },
      `Search history cleared successfully. ${deletedCount} entries removed.`
    );

  } catch (error) {
    console.error('Clear search history error:', error);
    return createErrorResponse('Failed to clear search history', 500);
  }
}

/**
 * Generate a human-readable summary of search parameters
 */
function generateSearchSummary(searchQuery: any): string {
  const parts = [];

  if (searchQuery.query) {
    parts.push(`"${searchQuery.query}"`);
  }

  if (searchQuery.experienceLevels && searchQuery.experienceLevels.length > 0) {
    parts.push(`${searchQuery.experienceLevels.join(', ')} level`);
  }

  if (searchQuery.locations && searchQuery.locations.length > 0) {
    parts.push(`in ${searchQuery.locations.join(', ')}`);
  }

  if (searchQuery.remotePreferences && searchQuery.remotePreferences.length > 0) {
    parts.push(`${searchQuery.remotePreferences.join(', ')} work`);
  }

  if (searchQuery.salaryMin || searchQuery.salaryMax) {
    const salaryRange = [];
    if (searchQuery.salaryMin) salaryRange.push(`${searchQuery.salaryCurrency || 'USD'} ${searchQuery.salaryMin}+`);
    if (searchQuery.salaryMax) salaryRange.push(`up to ${searchQuery.salaryCurrency || 'USD'} ${searchQuery.salaryMax}`);
    parts.push(salaryRange.join(' '));
  }

  if (searchQuery.requiredTags && searchQuery.requiredTags.length > 0) {
    parts.push(`with ${searchQuery.requiredTags.length} required skill${searchQuery.requiredTags.length > 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'General search';
}