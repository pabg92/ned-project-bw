import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { candidateProfiles, notifications } from '@/lib/supabase/schema';
import { requireAdmin } from '@/lib/auth/utils';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

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
  try {
    // Check admin authentication
    await requireAdmin();

    const candidateId = params.id;

    // Get candidate with approval data
    const candidate = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.id, candidateId),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    // Extract approval data from private metadata
    const privateMetadata = candidate.privateMetadata || {};
    const approvalHistory = privateMetadata.approvalHistory || [];
    const currentStatus = privateMetadata.approvalStatus || 'pending';

    // Calculate profile completion and quality score
    const qualityAssessment = calculateProfileQuality(candidate);

    const approvalData = {
      candidateId,
      candidate: {
        id: candidate.id,
        name: `${candidate.user?.firstName || ''} ${candidate.user?.lastName || ''}`.trim(),
        email: candidate.user?.email,
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
      },
      
      assessment: qualityAssessment,
      
      verification: {
        profileCompleted: candidate.profileCompleted,
        verificationStatus: privateMetadata.verificationStatus || 'unverified',
        backgroundCheckStatus: privateMetadata.backgroundCheckStatus || 'not_required',
        documentsUploaded: (privateMetadata.documents || []).length,
      },
      
      timeline: {
        registeredAt: candidate.createdAt,
        lastUpdated: candidate.updatedAt,
        daysSinceRegistration: Math.floor(
          (new Date().getTime() - new Date(candidate.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    };

    return createSuccessResponse(approvalData, 'Candidate approval data retrieved successfully');

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin approval retrieval error:', error);
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
      const adminUser = await requireAdmin();

      const url = new URL(request.url);
      const candidateId = url.pathname.split('/')[4];

      if (!candidateId) {
        return createErrorResponse('Candidate ID is required', 400);
      }

      // Get candidate
      const candidate = await db.query.candidateProfiles.findFirst({
        where: eq(candidateProfiles.id, candidateId),
        with: {
          user: true,
        },
      });

      if (!candidate) {
        return createErrorResponse('Candidate not found', 404);
      }

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

      // Update candidate's approval status
      const currentPrivateMetadata = candidate.privateMetadata || {};
      const approvalHistory = currentPrivateMetadata.approvalHistory || [];
      approvalHistory.push(approvalAction);

      let newApprovalStatus = currentStatus(action);
      let profileUpdates: any = {};

      // Apply action-specific updates
      switch (action) {
        case 'approve':
          newApprovalStatus = 'approved';
          profileUpdates.isActive = true;
          profileUpdates.profileCompleted = true;
          break;
        case 'reject':
          newApprovalStatus = 'rejected';
          profileUpdates.isActive = false;
          break;
        case 'request_changes':
          newApprovalStatus = 'changes_requested';
          // Profile remains active for editing
          break;
      }

      // Update candidate profile
      await db
        .update(candidateProfiles)
        .set({
          ...profileUpdates,
          privateMetadata: {
            ...currentPrivateMetadata,
            approvalStatus: newApprovalStatus,
            approvalHistory,
            lastUpdatedBy: adminUser.id,
            lastUpdatedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.id, candidateId));

      // Send notification to candidate if requested
      if (notifyCandidate && candidate.user) {
        await sendApprovalNotification(candidate.user.id, action, reason, requiredChanges);
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
      if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
        return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
      }
      
      console.error('Admin approval action error:', error);
      return createErrorResponse('Failed to process approval action', 500);
    }
  }
);

/**
 * Calculate profile quality score
 */
function calculateProfileQuality(candidate: any) {
  let score = 0;
  let maxScore = 100;
  const issues = [];
  const strengths = [];

  // Basic information (30 points)
  if (candidate.title) score += 10;
  else issues.push('Missing professional title');

  if (candidate.summary && candidate.summary.length > 50) {
    score += 10;
    strengths.push('Comprehensive summary provided');
  } else {
    issues.push('Summary too short or missing');
  }

  if (candidate.location) score += 10;
  else issues.push('Location not specified');

  // Professional details (40 points)
  if (candidate.experience) {
    score += 10;
    strengths.push('Experience level specified');
  } else {
    issues.push('Experience level not specified');
  }

  if (candidate.remotePreference) score += 10;
  else issues.push('Remote work preference not specified');

  if (candidate.availability) score += 10;
  else issues.push('Availability not specified');

  if (candidate.salaryMin && candidate.salaryMax) {
    score += 10;
    strengths.push('Salary expectations provided');
  } else {
    issues.push('Salary expectations missing');
  }

  // Additional content (30 points)
  if (candidate.linkedinUrl) {
    score += 10;
    strengths.push('LinkedIn profile linked');
  } else {
    issues.push('LinkedIn profile not linked');
  }

  if (candidate.githubUrl || candidate.portfolioUrl) {
    score += 10;
    strengths.push('Portfolio or GitHub linked');
  } else {
    issues.push('No portfolio or GitHub profile');
  }

  if (candidate.resumeUrl) {
    score += 10;
    strengths.push('Resume uploaded');
  } else {
    issues.push('Resume not uploaded');
  }

  // Calculate percentage
  const percentage = Math.round((score / maxScore) * 100);
  
  let grade = 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';

  return {
    score: percentage,
    grade,
    maxScore: 100,
    issues,
    strengths,
    recommendation: getQualityRecommendation(percentage, issues),
  };
}

/**
 * Get quality recommendation based on score
 */
function getQualityRecommendation(score: number, issues: string[]) {
  if (score >= 85) {
    return 'Excellent profile quality. Ready for approval.';
  } else if (score >= 70) {
    return 'Good profile quality. Minor improvements recommended.';
  } else if (score >= 50) {
    return 'Moderate profile quality. Several improvements needed before approval.';
  } else {
    return 'Poor profile quality. Significant improvements required before approval.';
  }
}

/**
 * Map action to status
 */
function currentStatus(action: string): string {
  switch (action) {
    case 'approve': return 'approved';
    case 'reject': return 'rejected';
    case 'request_changes': return 'changes_requested';
    default: return 'pending';
  }
}

/**
 * Send approval notification to candidate
 */
async function sendApprovalNotification(
  userId: string,
  action: string,
  reason?: string,
  requiredChanges?: string[]
) {
  try {
    let title = '';
    let message = '';

    switch (action) {
      case 'approve':
        title = 'Profile Approved';
        message = 'Congratulations! Your profile has been approved and is now active on the platform.';
        break;
      case 'reject':
        title = 'Profile Rejected';
        message = `Your profile has been rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`;
        break;
      case 'request_changes':
        title = 'Profile Changes Requested';
        message = `Please update your profile. ${reason ? `Details: ${reason}` : ''}`;
        if (requiredChanges && requiredChanges.length > 0) {
          message += ` Required changes: ${requiredChanges.join(', ')}`;
        }
        break;
    }

    // Create notification (simulate for now)
    const notification = {
      id: `notif_${Date.now()}`,
      userId,
      type: 'admin_alert',
      title,
      message,
      data: {
        action,
        reason,
        requiredChanges,
      },
      isRead: false,
      createdAt: new Date(),
    };

    console.log('Approval notification created:', notification);
    
    // Future: Store in notifications table and send email via Resend

  } catch (error) {
    console.error('Failed to send approval notification:', error);
    // Don't fail the approval process if notification fails
  }
}

/**
 * Log approval action for audit trail
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
    
    // Future: Store in audit log table or send to monitoring service
  } catch (error) {
    console.error('Failed to log approval action:', error);
    // Don't fail the request if logging fails
  }
}