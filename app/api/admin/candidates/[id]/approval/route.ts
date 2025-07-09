import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { requireAdmin } from '@/lib/auth/admin-check';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';
// import { processProfileOnApproval } from '@/lib/services/admin-profile-processor'; // No longer needed

const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes'], {
    errorMap: () => ({ message: 'Action must be approve, reject, or request_changes' })
  }),
  reason: z.string().max(1000, 'Reason must be less than 1000 characters').optional(),
  requiredChanges: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notifyCandidate: z.boolean().default(true),
});

/**
 * GET /api/admin/candidates/[id]/approval
 * Get approval status and history for a candidate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Check admin authentication (skip in dev mode)
    const isDevMode = process.env.DEV_MODE === 'true';
    if (!isDevMode) {
      await requireAdmin();
    }

    const candidateId = params.id;
    
    console.log('[APPROVAL GET] Fetching candidate:', candidateId);

    // Get candidate with approval data using Supabase
    // Use specific relationship to avoid ambiguity
    const { data: candidate, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users:users!candidate_profiles_user_id_fkey(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', candidateId)
      .single();
      
    if (error || !candidate) {
      console.error('[APPROVAL GET] Error fetching candidate:', {
        candidateId,
        error: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      return NextResponse.json({
        error: 'NOT_FOUND',
        message: 'Candidate not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    console.log('[APPROVAL GET] Found candidate:', {
      id: candidate.id,
      userId: candidate.user_id,
      hasUser: !!candidate.users
    });

    // Extract approval data from private metadata
    const privateMetadata = candidate.private_metadata || {};
    const approvalHistory = privateMetadata.approvalHistory || [];
    const currentStatus = privateMetadata.approvalStatus || 'pending';

    // Calculate profile completion and quality score
    const qualityAssessment = calculateProfileQuality(candidate);

    const approvalData = {
      candidateId,
      candidate: {
        id: candidate.id,
        name: `${candidate.users?.first_name || ''} ${candidate.users?.last_name || ''}`.trim(),
        email: candidate.users?.email,
        title: candidate.title,
        location: candidate.location,
        experience: candidate.experience,
      },
      
      approval: {
        status: currentStatus,
        lastAction: approvalHistory.length > 0 ? approvalHistory[approvalHistory.length - 1] : null,
        history: approvalHistory.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        actionCount: approvalHistory.length,
        hasAdminNotes: !!privateMetadata.adminNotes,
      },
      
      profileQuality: qualityAssessment,
      
      metadata: {
        isActive: candidate.is_active,
        profileCompleted: candidate.profile_completed,
        isAnonymized: candidate.is_anonymized,
        createdAt: candidate.created_at,
        updatedAt: candidate.updated_at,
      },
    };

    return createSuccessResponse({ data: approvalData }, 'Approval data retrieved successfully');

  } catch (error: any) {
    if (error.message?.includes('Authentication required') || error.message?.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Approval data retrieval error:', error);
    return createErrorResponse('Failed to retrieve approval data', 500);
  }
}

/**
 * POST /api/admin/candidates/[id]/approval
 * Take approval action on a candidate profile
 */
export const POST = withValidation(
  { body: approvalActionSchema },
  async ({ body }, request) => {
    try {
      // Check admin authentication
      const isDevMode = process.env.DEV_MODE === 'true';
      let adminUser: any = null;
      
      if (!isDevMode) {
        const userId = await requireAdmin();
        // In production, get admin details from Clerk
        const { clerkClient } = await import('@clerk/backend');
        const user = await clerkClient.users.getUser(userId);
        adminUser = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      } else {
        // Mock admin user for dev mode
        adminUser = { 
          id: 'dev-admin', 
          email: 'admin@dev.com',
          firstName: 'Dev',
          lastName: 'Admin'
        };
      }

      const url = new URL(request.url);
      const candidateId = url.pathname.split('/')[4];

      console.log('[APPROVAL POST] Processing approval for candidate:', candidateId);
      console.log('[APPROVAL POST] Action:', body?.action);

      if (!candidateId) {
        return createErrorResponse('Candidate ID is required', 400);
      }

      // Get candidate with specific foreign key relationship
      const { data: candidate, error: fetchError } = await supabaseAdmin
        .from('candidate_profiles')
        .select(`
          *,
          users:users!candidate_profiles_user_id_fkey(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('id', candidateId)
        .single();

      if (fetchError || !candidate) {
        console.error('[APPROVAL POST] Candidate not found:', {
          candidateId,
          error: fetchError?.message,
          details: fetchError?.details
        });
        return NextResponse.json({
          error: 'NOT_FOUND',
          message: 'Candidate not found',
          candidateId,
          timestamp: new Date().toISOString()
        }, { status: 404 });
      }
      
      console.log('[APPROVAL POST] Found candidate:', {
        id: candidate.id,
        userId: candidate.user_id,
        hasUser: !!candidate.users
      });

      const { action, reason, requiredChanges, priority, notifyCandidate } = body!;

      // Create approval action record
      const approvalAction = {
        id: `approval_${Date.now()}`,
        action,
        reason: reason || '',
        requiredChanges: requiredChanges || [],
        priority,
        adminId: adminUser.id,
        adminName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin',
        timestamp: new Date().toISOString(),
      };

      // Get current private metadata
      const currentPrivateMetadata = candidate.private_metadata || {};
      const approvalHistory = currentPrivateMetadata.approvalHistory || [];
      
      // Add new action to history
      approvalHistory.push(approvalAction);

      // Prepare profile updates based on action
      let newApprovalStatus = currentPrivateMetadata.approvalStatus || 'pending';
      const profileUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      switch (action) {
        case 'approve':
          newApprovalStatus = 'approved';
          profileUpdates.is_active = true;
          profileUpdates.profile_completed = true;
          
          // Process profile data if approved
          if (action === 'approve') {
            try {
              const processingResult = await processProfileOnApproval(candidateId, adminUser.id);
              if (processingResult.success) {
                console.log(`Profile ${candidateId} processed successfully`);
              } else {
                console.error(`Failed to process profile ${candidateId}:`, processingResult.error);
              }
            } catch (processError) {
              console.error('Error processing profile:', processError);
              // Don't fail the approval if processing fails
            }
          }
          break;
        case 'reject':
          newApprovalStatus = 'rejected';
          profileUpdates.is_active = false;
          break;
        case 'request_changes':
          newApprovalStatus = 'changes_requested';
          // Profile remains active for editing
          break;
      }

      // Update private metadata
      profileUpdates.private_metadata = {
        ...currentPrivateMetadata,
        approvalStatus: newApprovalStatus,
        approvalHistory,
        lastUpdatedBy: adminUser.id,
        lastUpdatedAt: new Date().toISOString(),
      };

      // Update candidate profile
      const { data: updatedCandidate, error: updateError } = await supabaseAdmin
        .from('candidate_profiles')
        .update(profileUpdates)
        .eq('id', candidateId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return createErrorResponse('Failed to update candidate profile', 500);
      }

      // Send notification to candidate if requested
      if (notifyCandidate && candidate.users) {
        await sendApprovalNotification(candidate.users.id, action, reason, requiredChanges);
      }

      // Log admin action
      await logApprovalAction(adminUser.id, candidateId, action, {
        reason,
        requiredChanges,
        priority,
        previousStatus: currentPrivateMetadata.approvalStatus || 'pending',
        newStatus: newApprovalStatus,
      });

      return createSuccessResponse({
        candidateId,
        action,
        newStatus: newApprovalStatus,
        approvalAction,
        notificationSent: notifyCandidate,
      }, `Candidate profile ${action} action completed successfully`);

    } catch (error: any) {
      if (error.message?.includes('Authentication required') || error.message?.includes('Access denied')) {
        return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
      }
      
      console.error('Approval action error:', error);
      return createErrorResponse('Failed to process approval action', 500);
    }
  }
);

/**
 * Calculate profile quality score
 */
function calculateProfileQuality(candidate: any) {
  let score = 0;
  const issues = [];
  const strengths = [];

  // Basic information (25%)
  if (candidate.title) score += 5;
  else issues.push('Missing job title');
  
  if (candidate.summary && candidate.summary.length > 100) score += 10;
  else issues.push('Summary too short or missing');
  
  if (candidate.location) score += 5;
  else issues.push('Missing location');
  
  if (candidate.experience) score += 5;
  else issues.push('Missing experience level');

  // Professional details (25%)
  if (candidate.remote_preference) score += 5;
  if (candidate.availability) score += 5;
  if (candidate.salary_min && candidate.salary_max) score += 10;
  else issues.push('Missing salary expectations');
  
  if (candidate.linkedin_url) {
    score += 5;
    strengths.push('LinkedIn profile provided');
  }

  // Documents (20%)
  if (candidate.resume_url) {
    score += 10;
    strengths.push('Resume uploaded');
  } else {
    issues.push('No resume uploaded');
  }
  
  if (candidate.portfolio_url) {
    score += 10;
    strengths.push('Portfolio provided');
  }

  // Profile completeness (30%)
  const privateMetadata = candidate.private_metadata || {};
  
  if (privateMetadata.skills?.length > 3) {
    score += 10;
    strengths.push(`${privateMetadata.skills.length} skills listed`);
  } else {
    issues.push('Limited skills listed');
  }
  
  if (privateMetadata.workExperiences?.length > 0) {
    score += 10;
    strengths.push('Work experience detailed');
  } else {
    issues.push('No work experience provided');
  }
  
  if (privateMetadata.education?.length > 0) {
    score += 10;
    strengths.push('Education information provided');
  }

  return {
    score: Math.min(score, 100),
    issues,
    strengths,
    recommendation: score >= 70 ? 'ready_for_approval' : 'needs_improvement',
  };
}

/**
 * Send notification to candidate
 */
async function sendApprovalNotification(
  userId: string, 
  action: string, 
  reason?: string,
  requiredChanges?: string[]
) {
  try {
    // Future: Implement notification system
    console.log('Notification sent to user:', {
      userId,
      action,
      reason,
      requiredChanges,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Log admin action for audit trail
 */
async function logApprovalAction(
  adminUserId: string,
  candidateId: string,
  action: string,
  metadata: any
) {
  try {
    console.log('Admin approval action logged:', {
      adminUserId,
      candidateId,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });
    
    // Future: Store in audit log table
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}