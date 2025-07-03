import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  companies,
  companyUsers
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { createSavedSearchSchema } from '@/lib/validations/search';
import { pgTable, uuid, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

// Saved searches table (extending the schema)
export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  companyId: uuid('company_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  filters: jsonb('filters').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  alertsEnabled: boolean('alerts_enabled').notNull().default(false),
  alertFrequency: text('alert_frequency').notNull().default('weekly'),
  lastExecuted: timestamp('last_executed'),
  resultCount: text('result_count'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * GET /api/v1/search/saved
 * Get all saved searches for the current company user
 */
export async function GET(request: NextRequest) {
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

    // Get saved searches for this company
    const searches = await db
      .select()
      .from(savedSearches)
      .where(
        and(
          eq(savedSearches.companyId, companyUser.companyId),
          eq(savedSearches.isActive, true)
        )
      )
      .orderBy(desc(savedSearches.updatedAt));

    return createSuccessResponse(searches, 'Saved searches retrieved successfully');

  } catch (error) {
    console.error('Get saved searches error:', error);
    return createErrorResponse('Failed to retrieve saved searches', 500);
  }
}

/**
 * POST /api/v1/search/saved
 * Create a new saved search
 */
export const POST = withValidation(
  { body: createSavedSearchSchema },
  async ({ body }, request) => {
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

      // Create the saved search
      const [savedSearch] = await db
        .insert(savedSearches)
        .values({
          userId,
          companyId: companyUser.companyId,
          name: body!.name,
          description: body!.description,
          filters: body!.filters,
          alertsEnabled: body!.alertsEnabled,
          alertFrequency: body!.alertFrequency,
        })
        .returning();

      return createSuccessResponse(savedSearch, 'Saved search created successfully', 201);

    } catch (error) {
      console.error('Create saved search error:', error);
      return createErrorResponse('Failed to create saved search', 500);
    }
  }
);

/**
 * PUT /api/v1/search/saved/[id]
 * Update a saved search
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Extract search ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const searchId = pathSegments[pathSegments.length - 1];

    if (!searchId) {
      return createErrorResponse('Search ID is required', 400);
    }

    // Verify company membership
    const companyUser = await db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, userId),
    });

    if (!companyUser) {
      return createErrorResponse('Access denied: Company membership required', 403);
    }

    // Parse request body
    const body = await request.json();

    // Update the saved search
    const [updatedSearch] = await db
      .update(savedSearches)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(savedSearches.id, searchId),
          eq(savedSearches.companyId, companyUser.companyId)
        )
      )
      .returning();

    if (!updatedSearch) {
      return createErrorResponse('Saved search not found or access denied', 404);
    }

    return createSuccessResponse(updatedSearch, 'Saved search updated successfully');

  } catch (error) {
    console.error('Update saved search error:', error);
    return createErrorResponse('Failed to update saved search', 500);
  }
}

/**
 * DELETE /api/v1/search/saved/[id]
 * Delete a saved search
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Extract search ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const searchId = pathSegments[pathSegments.length - 1];

    if (!searchId) {
      return createErrorResponse('Search ID is required', 400);
    }

    // Verify company membership
    const companyUser = await db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, userId),
    });

    if (!companyUser) {
      return createErrorResponse('Access denied: Company membership required', 403);
    }

    // Soft delete the saved search
    const [deletedSearch] = await db
      .update(savedSearches)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(savedSearches.id, searchId),
          eq(savedSearches.companyId, companyUser.companyId)
        )
      )
      .returning();

    if (!deletedSearch) {
      return createErrorResponse('Saved search not found or access denied', 404);
    }

    return createSuccessResponse(null, 'Saved search deleted successfully');

  } catch (error) {
    console.error('Delete saved search error:', error);
    return createErrorResponse('Failed to delete saved search', 500);
  }
}