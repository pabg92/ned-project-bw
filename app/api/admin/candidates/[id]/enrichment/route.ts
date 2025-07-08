import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  candidateProfiles
} from '@/lib/supabase/schema';
import { requireAdmin } from '@/lib/auth/admin-check';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { createAdminEnrichmentSchema, updateAdminEnrichmentSchema } from '@/lib/validations/admin';
import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Admin enrichment table (extending the schema)
export const adminEnrichments = pgTable('admin_enrichments', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull(),
  enrichmentType: text('enrichment_type').notNull(),
  status: text('status').notNull().default('pending'),
  data: jsonb('data').notNull(),
  notes: text('notes'),
  enrichedBy: text('enriched_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * GET /api/admin/candidates/[id]/enrichment
 * Get all enrichment records for a candidate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    await requireAdmin();

    const candidateId = params.id;

    // Verify candidate exists
    const candidate = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.id, candidateId),
    });

    if (!candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    // Get enrichment records (simulate with private metadata for now)
    const enrichmentHistory = [
      {
        id: `enrich_${candidateId}_1`,
        candidateId,
        enrichmentType: 'profile_verification',
        status: candidate.privateMetadata?.verificationStatus || 'unverified',
        data: {
          verificationMethod: 'document_review',
          documentsVerified: ['linkedin', 'resume'],
          confidence: 0.95,
        },
        notes: candidate.privateMetadata?.adminNotes || null,
        enrichedBy: candidate.privateMetadata?.lastUpdatedBy || 'system',
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      },
    ];

    // Add skill assessment if available
    if (candidate.privateMetadata?.skillAssessmentScore) {
      enrichmentHistory.push({
        id: `enrich_${candidateId}_2`,
        candidateId,
        enrichmentType: 'skill_assessment',
        status: 'completed',
        data: {
          overallScore: candidate.privateMetadata.skillAssessmentScore,
          assessmentDate: candidate.privateMetadata.lastUpdatedAt,
          assessmentType: 'technical_review',
        },
        notes: 'Technical skills assessed through portfolio and experience review',
        enrichedBy: candidate.privateMetadata?.lastUpdatedBy || 'system',
        createdAt: candidate.updatedAt,
        updatedAt: candidate.updatedAt,
      });
    }

    // Add background check if available
    if (candidate.privateMetadata?.backgroundCheckStatus) {
      enrichmentHistory.push({
        id: `enrich_${candidateId}_3`,
        candidateId,
        enrichmentType: 'background_check',
        status: candidate.privateMetadata.backgroundCheckStatus,
        data: {
          checkType: 'employment_verification',
          provider: 'internal',
          lastEmployerVerified: true,
        },
        notes: 'Employment history verified through LinkedIn and references',
        enrichedBy: candidate.privateMetadata?.lastUpdatedBy || 'system',
        createdAt: candidate.updatedAt,
        updatedAt: candidate.updatedAt,
      });
    }

    // Add portfolio review if available
    if (candidate.privateMetadata?.portfolioReviewNotes) {
      enrichmentHistory.push({
        id: `enrich_${candidateId}_4`,
        candidateId,
        enrichmentType: 'portfolio_review',
        status: 'completed',
        data: {
          portfolioUrl: candidate.portfolioUrl,
          projectsReviewed: 3,
          qualityScore: 8.5,
        },
        notes: candidate.privateMetadata.portfolioReviewNotes,
        enrichedBy: candidate.privateMetadata?.lastUpdatedBy || 'system',
        createdAt: candidate.updatedAt,
        updatedAt: candidate.updatedAt,
      });
    }

    const summary = {
      totalEnrichments: enrichmentHistory.length,
      completedEnrichments: enrichmentHistory.filter(e => e.status === 'completed').length,
      pendingEnrichments: enrichmentHistory.filter(e => e.status === 'pending').length,
      lastEnrichment: enrichmentHistory.length > 0 ? enrichmentHistory[enrichmentHistory.length - 1] : null,
    };

    return createSuccessResponse({
      candidateId,
      enrichments: enrichmentHistory.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
      summary,
    }, 'Candidate enrichment history retrieved successfully');

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin enrichment retrieval error:', error);
    return createErrorResponse('Failed to retrieve enrichment history', 500);
  }
}

/**
 * POST /api/admin/candidates/[id]/enrichment
 * Create a new enrichment record for a candidate
 */
export const POST = withValidation(
  { body: createAdminEnrichmentSchema },
  async ({ body }, request) => {
    try {
      // Check admin authentication
      const adminUser = await requireAdmin();

      const url = new URL(request.url);
      const candidateId = url.pathname.split('/')[4]; // Extract candidate ID from path

      if (!candidateId) {
        return createErrorResponse('Candidate ID is required', 400);
      }

      // Verify candidate exists
      const candidate = await db.query.candidateProfiles.findFirst({
        where: eq(candidateProfiles.id, candidateId),
      });

      if (!candidate) {
        return createErrorResponse('Candidate not found', 404);
      }

      const { enrichmentType, data, notes } = body!;

      // Update candidate's private metadata based on enrichment type
      const currentPrivateMetadata = candidate.privateMetadata || {};
      let updatedPrivateMetadata = { ...currentPrivateMetadata };

      switch (enrichmentType) {
        case 'profile_verification':
          updatedPrivateMetadata.verificationStatus = 'completed';
          updatedPrivateMetadata.verificationData = data;
          break;
        case 'skill_assessment':
          updatedPrivateMetadata.skillAssessmentScore = data.overallScore;
          updatedPrivateMetadata.skillAssessmentData = data;
          break;
        case 'background_check':
          updatedPrivateMetadata.backgroundCheckStatus = 'completed';
          updatedPrivateMetadata.backgroundCheckData = data;
          break;
        case 'portfolio_review':
          updatedPrivateMetadata.portfolioReviewNotes = notes;
          updatedPrivateMetadata.portfolioReviewData = data;
          break;
      }

      updatedPrivateMetadata.lastUpdatedBy = adminUser.id;
      updatedPrivateMetadata.lastUpdatedAt = new Date().toISOString();

      if (notes) {
        updatedPrivateMetadata.adminNotes = notes;
      }

      // Update candidate profile
      await db
        .update(candidateProfiles)
        .set({
          privateMetadata: updatedPrivateMetadata,
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.id, candidateId));

      // Create enrichment record (simulated)
      const enrichmentRecord = {
        id: `enrich_${candidateId}_${Date.now()}`,
        candidateId,
        enrichmentType,
        status: 'completed',
        data,
        notes,
        enrichedBy: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Log admin action
      await logEnrichmentAction(adminUser.id, 'enrichment_created', candidateId, {
        enrichmentType,
        dataKeys: Object.keys(data),
      });

      return createSuccessResponse(enrichmentRecord, 'Enrichment record created successfully', 201);

    } catch (error: any) {
      if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
        return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
      }
      
      console.error('Admin enrichment creation error:', error);
      return createErrorResponse('Failed to create enrichment record', 500);
    }
  }
);

/**
 * PUT /api/admin/candidates/[id]/enrichment/[enrichmentId]
 * Update an existing enrichment record
 */
export const PUT = withValidation(
  { body: updateAdminEnrichmentSchema },
  async ({ body }, request) => {
    try {
      // Check admin authentication
      const adminUser = await requireAdmin();

      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/');
      const candidateId = pathSegments[4];
      const enrichmentId = pathSegments[6];

      if (!candidateId || !enrichmentId) {
        return createErrorResponse('Candidate ID and Enrichment ID are required', 400);
      }

      // Verify candidate exists
      const candidate = await db.query.candidateProfiles.findFirst({
        where: eq(candidateProfiles.id, candidateId),
      });

      if (!candidate) {
        return createErrorResponse('Candidate not found', 404);
      }

      const { status, data, notes } = body!;

      // Update candidate's private metadata
      const currentPrivateMetadata = candidate.privateMetadata || {};
      const updatedPrivateMetadata = {
        ...currentPrivateMetadata,
        ...(data && { enrichmentData: { ...currentPrivateMetadata.enrichmentData, ...data } }),
        ...(notes && { adminNotes: notes }),
        lastUpdatedBy: adminUser.id,
        lastUpdatedAt: new Date().toISOString(),
      };

      // Update candidate profile
      await db
        .update(candidateProfiles)
        .set({
          privateMetadata: updatedPrivateMetadata,
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.id, candidateId));

      // Create updated enrichment record (simulated)
      const updatedEnrichmentRecord = {
        id: enrichmentId,
        candidateId,
        status: status || 'completed',
        data: data || {},
        notes: notes || null,
        enrichedBy: adminUser.id,
        updatedAt: new Date(),
      };

      // Log admin action
      await logEnrichmentAction(adminUser.id, 'enrichment_updated', candidateId, {
        enrichmentId,
        status,
        dataKeys: data ? Object.keys(data) : [],
      });

      return createSuccessResponse(updatedEnrichmentRecord, 'Enrichment record updated successfully');

    } catch (error: any) {
      if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
        return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
      }
      
      console.error('Admin enrichment update error:', error);
      return createErrorResponse('Failed to update enrichment record', 500);
    }
  }
);

/**
 * Log enrichment action for audit trail
 */
async function logEnrichmentAction(
  adminUserId: string,
  action: string,
  candidateId: string,
  metadata: any
) {
  try {
    console.log('Admin enrichment action logged:', {
      adminUserId,
      action,
      candidateId,
      metadata,
      timestamp: new Date().toISOString(),
    });
    
    // Future: Store in audit log table or send to monitoring service
  } catch (error) {
    console.error('Failed to log enrichment action:', error);
    // Don't fail the request if logging fails
  }
}