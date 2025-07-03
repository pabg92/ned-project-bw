import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/utils';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

const adminUpdateCandidateSchema = z.object({
  // Profile data updates
  title: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  experience: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']).optional(),
  location: z.string().max(200).optional(),
  remotePreference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).optional(),
  availability: z.enum(['immediately', '2weeks', '1month', '3months']).optional(),
  
  // Admin-specific enrichment data
  privateMetadata: z.record(z.any()).optional(),
  adminNotes: z.string().max(5000).optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  backgroundCheckStatus: z.enum(['not_required', 'pending', 'completed', 'failed']).optional(),
  skillAssessmentScore: z.number().min(0).max(100).optional(),
  portfolioReviewNotes: z.string().max(2000).optional(),
  
  // Profile visibility and status
  isActive: z.boolean().optional(),
  profileCompleted: z.boolean().optional(),
  isAnonymized: z.boolean().optional(),
  
  // Contact information (admin can update)
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  resumeUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * GET /api/admin/candidates/[id]
 * Get complete candidate profile with admin-only data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In dev mode, skip admin authentication but still allow Supabase access
    const isDevMode = process.env.DEV_MODE === 'true';
    const isTestMode = process.env.TEST_MODE === 'true';
    
    if (!isDevMode && !isTestMode) {
      await requireAdmin();
    }

    const candidateId = params.id;

    // Get complete candidate profile with user data
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          image_url,
          role,
          is_active,
          created_at,
          updated_at,
          last_login
        )
      `)
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      console.error('Candidate fetch error:', candidateError);
      return createErrorResponse('Candidate not found', 404);
    }

    // Get candidate tags/skills
    const { data: candidateTagsData } = await supabaseAdmin
      .from('candidate_tags')
      .select(`
        tag_id,
        tags (
          id,
          name,
          category,
          color
        ),
        proficiency,
        years_experience,
        is_endorsed,
        created_at
      `)
      .eq('candidate_id', candidateId);

    // Get work experiences
    const { data: experiences } = await supabaseAdmin
      .from('work_experiences')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('order');

    // Get education
    const { data: educationRecords } = await supabaseAdmin
      .from('education')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('order');

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion({
      ...candidate,
      tags: candidateTagsData || [],
      workExperiences: experiences || [],
      education: educationRecords || [],
    });

    // Build complete admin profile view
    const adminProfile = {
      // Basic profile information
      id: candidate.id,
      userId: candidate.user_id,
      title: candidate.title,
      summary: candidate.summary,
      experience: candidate.experience,
      location: candidate.location,
      remotePreference: candidate.remote_preference,
      availability: candidate.availability,
      
      // Contact and user information
      user: candidate.users ? {
        id: candidate.users.id,
        email: candidate.users.email,
        firstName: candidate.users.first_name,
        lastName: candidate.users.last_name,
        imageUrl: candidate.users.image_url,
        role: candidate.users.role,
        isActive: candidate.users.is_active,
        createdAt: candidate.users.created_at,
        updatedAt: candidate.users.updated_at,
        lastLogin: candidate.users.last_login,
      } : null,
      
      // Salary information (admin sees exact values)
      salary: {
        min: candidate.salary_min ? parseFloat(candidate.salary_min) : null,
        max: candidate.salary_max ? parseFloat(candidate.salary_max) : null,
        currency: candidate.salary_currency,
      },
      
      // Skills and expertise
      skills: (candidateTagsData || []).map((tag: any) => ({
        id: tag.tag_id,
        name: tag.tags?.name,
        category: tag.tags?.category,
        color: tag.tags?.color,
        proficiency: tag.proficiency,
        yearsExperience: tag.years_experience,
        isEndorsed: tag.is_endorsed,
        addedAt: tag.created_at,
      })),
      
      // Work experience
      workExperience: (experiences || []).map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        title: exp.title,
        description: exp.description,
        location: exp.location,
        startDate: exp.start_date,
        endDate: exp.end_date,
        isCurrent: exp.is_current,
        isRemote: exp.is_remote,
        order: exp.order,
      })),
      
      // Education
      education: (educationRecords || []).map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        gpa: edu.gpa ? parseFloat(edu.gpa) : null,
        startDate: edu.start_date,
        endDate: edu.end_date,
        description: edu.description,
        order: edu.order,
      })),
      
      // Files and documents
      documents: {
        resumeUrl: candidate.resume_url,
        portfolioUrl: candidate.portfolio_url,
      },
      
      // Profile metadata and settings
      settings: {
        isActive: candidate.is_active,
        profileCompleted: candidate.profile_completed,
        isAnonymized: candidate.is_anonymized,
        profileCompletion,
      },
      
      // Admin-only data
      adminData: {
        privateMetadata: candidate.private_metadata,
        publicMetadata: candidate.public_metadata,
        verificationStatus: candidate.private_metadata?.verificationStatus || 'unverified',
        backgroundCheckStatus: candidate.private_metadata?.backgroundCheckStatus || 'not_required',
        skillAssessmentScore: candidate.private_metadata?.skillAssessmentScore,
        adminNotes: candidate.private_metadata?.adminNotes,
        portfolioReviewNotes: candidate.private_metadata?.portfolioReviewNotes,
      },
      
      // Timestamps
      createdAt: candidate.created_at,
      updatedAt: candidate.updated_at,
    };

    return createSuccessResponse({ data: adminProfile }, 'Admin candidate profile retrieved successfully');

  } catch (error: any) {
    if (error.message?.includes('Authentication required') || error.message?.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin candidate retrieval error:', error);
    return createErrorResponse('Failed to retrieve candidate profile', 500);
  }
}

/**
 * PUT /api/admin/candidates/[id]
 * Update candidate profile with admin enrichment data
 */
export const PUT = withValidation(
  { body: adminUpdateCandidateSchema },
  async ({ body }, request) => {
    try {
      // In dev mode, skip admin authentication but still allow Supabase access
      const isDevMode = process.env.DEV_MODE === 'true';
      const isTestMode = process.env.TEST_MODE === 'true';
      let adminUser: any = null;
      
      if (!isDevMode && !isTestMode) {
        adminUser = await requireAdmin();
      } else {
        // Mock admin user for dev mode
        adminUser = { id: isDevMode ? 'dev-admin' : 'test-admin', email: isDevMode ? 'admin@dev.com' : 'admin@test.com' };
      }

      const url = new URL(request.url);
      const candidateId = url.pathname.split('/').pop();

      if (!candidateId) {
        return createErrorResponse('Candidate ID is required', 400);
      }

      // Verify candidate exists
      const { data: candidate, error: fetchError } = await supabaseAdmin
        .from('candidate_profiles')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (fetchError || !candidate) {
        return createErrorResponse('Candidate not found', 404);
      }

      const {
        privateMetadata,
        adminNotes,
        verificationStatus,
        backgroundCheckStatus,
        skillAssessmentScore,
        portfolioReviewNotes,
        ...profileUpdates
      } = body!;

      // Prepare private metadata update
      const currentPrivateMetadata = candidate.private_metadata || {};
      const updatedPrivateMetadata = {
        ...currentPrivateMetadata,
        ...(privateMetadata && privateMetadata),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(verificationStatus && { verificationStatus }),
        ...(backgroundCheckStatus && { backgroundCheckStatus }),
        ...(skillAssessmentScore !== undefined && { skillAssessmentScore }),
        ...(portfolioReviewNotes !== undefined && { portfolioReviewNotes }),
        lastUpdatedBy: adminUser.id,
        lastUpdatedAt: new Date().toISOString(),
      };

      // Convert camelCase to snake_case for database columns
      const dbUpdates: any = {};
      if (profileUpdates.title !== undefined) dbUpdates.title = profileUpdates.title;
      if (profileUpdates.summary !== undefined) dbUpdates.summary = profileUpdates.summary;
      if (profileUpdates.experience !== undefined) dbUpdates.experience = profileUpdates.experience;
      if (profileUpdates.location !== undefined) dbUpdates.location = profileUpdates.location;
      if (profileUpdates.remotePreference !== undefined) dbUpdates.remote_preference = profileUpdates.remotePreference;
      if (profileUpdates.availability !== undefined) dbUpdates.availability = profileUpdates.availability;
      if (profileUpdates.linkedinUrl !== undefined) dbUpdates.linkedin_url = profileUpdates.linkedinUrl;
      if (profileUpdates.githubUrl !== undefined) dbUpdates.github_url = profileUpdates.githubUrl;
      if (profileUpdates.portfolioUrl !== undefined) dbUpdates.portfolio_url = profileUpdates.portfolioUrl;
      if (profileUpdates.resumeUrl !== undefined) dbUpdates.resume_url = profileUpdates.resumeUrl;
      if (profileUpdates.isActive !== undefined) dbUpdates.is_active = profileUpdates.isActive;
      if (profileUpdates.profileCompleted !== undefined) dbUpdates.profile_completed = profileUpdates.profileCompleted;
      if (profileUpdates.isAnonymized !== undefined) dbUpdates.is_anonymized = profileUpdates.isAnonymized;
      
      dbUpdates.private_metadata = updatedPrivateMetadata;
      dbUpdates.updated_at = new Date().toISOString();

      // Update candidate profile
      const { data: updatedCandidate, error: updateError } = await supabaseAdmin
        .from('candidate_profiles')
        .update(dbUpdates)
        .eq('id', candidateId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return createErrorResponse('Failed to update candidate profile', 500);
      }

      // Log admin action for audit trail
      await logAdminAction(adminUser.id, 'candidate_update', candidateId, {
        updatedFields: Object.keys(body!),
        verificationStatus,
        backgroundCheckStatus,
      });

      return createSuccessResponse({
        candidateId: updatedCandidate.id,
        updatedFields: Object.keys(body!),
        adminData: {
          verificationStatus: updatedPrivateMetadata.verificationStatus,
          backgroundCheckStatus: updatedPrivateMetadata.backgroundCheckStatus,
          skillAssessmentScore: updatedPrivateMetadata.skillAssessmentScore,
          lastUpdatedBy: adminUser.id,
          lastUpdatedAt: updatedPrivateMetadata.lastUpdatedAt,
        },
      }, 'Candidate profile updated successfully');

    } catch (error: any) {
      if (error.message?.includes('Authentication required') || error.message?.includes('Access denied')) {
        return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
      }
      
      console.error('Admin candidate update error:', error);
      return createErrorResponse('Failed to update candidate profile', 500);
    }
  }
);

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile: any): number {
  let completedFields = 0;
  let totalFields = 0;

  // Required fields (60% weight)
  const requiredFields = [
    'title', 'summary', 'experience', 'location', 'remotePreference', 'availability'
  ];
  
  requiredFields.forEach(field => {
    totalFields += 10; // Each required field worth 10 points
    if (profile[field] || profile[field.replace(/([A-Z])/g, '_$1').toLowerCase()]) {
      completedFields += 10;
    }
  });

  // Optional fields (25% weight)
  const optionalFields = [
    'salaryMin', 'salaryMax', 'linkedinUrl', 'githubUrl', 'portfolioUrl'
  ];
  
  optionalFields.forEach(field => {
    totalFields += 5; // Each optional field worth 5 points
    const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (profile[field] || profile[snakeField]) {
      completedFields += 5;
    }
  });

  // Bonus content (15% weight)
  totalFields += 15; // 15 points for bonus content
  
  if (profile.tags && profile.tags.length > 0) {
    completedFields += 5; // Tags present
  }
  if (profile.workExperiences && profile.workExperiences.length > 0) {
    completedFields += 5; // Work experience present
  }
  if (profile.education && profile.education.length > 0) {
    completedFields += 5; // Education present
  }

  return Math.round((completedFields / totalFields) * 100);
}

/**
 * DELETE /api/admin/candidates/[id]
 * Delete candidate profile (soft delete with option for hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In dev mode, skip admin authentication but still allow Supabase access
    const isDevMode = process.env.DEV_MODE === 'true';
    const isTestMode = process.env.TEST_MODE === 'true';
    let adminUser: any = null;
    
    if (!isDevMode && !isTestMode) {
      adminUser = await requireAdmin();
    } else {
      // Mock admin user for dev mode
      adminUser = { id: isDevMode ? 'dev-admin' : 'test-admin', email: isDevMode ? 'admin@dev.com' : 'admin@test.com' };
    }

    const candidateId = params.id;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Verify candidate exists and get user info
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        *,
        users!inner(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    if (hardDelete) {
      // Hard delete: Remove all related data
      
      // Delete related records first (due to foreign key constraints)
      await supabaseAdmin.from('candidate_tags').delete().eq('candidate_id', candidateId);
      await supabaseAdmin.from('work_experiences').delete().eq('candidate_id', candidateId);
      await supabaseAdmin.from('education').delete().eq('candidate_id', candidateId);
      
      // Delete the candidate profile
      const { error: deleteError } = await supabaseAdmin
        .from('candidate_profiles')
        .delete()
        .eq('id', candidateId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return createErrorResponse('Failed to delete candidate profile', 500);
      }

      // Log admin action
      await logAdminAction(adminUser.id, 'candidate_hard_delete', candidateId, {
        userEmail: candidate.users?.email,
        userName: `${candidate.users?.first_name} ${candidate.users?.last_name}`,
      });

      return createSuccessResponse({
        candidateId,
        deletionType: 'hard',
        message: 'Candidate profile and all related data permanently deleted',
      }, 'Candidate permanently deleted');

    } else {
      // Soft delete: Mark as inactive and add deletion metadata
      const deletionMetadata = {
        ...(candidate.private_metadata || {}),
        isDeleted: true,
        deletedBy: adminUser.id,
        deletedAt: new Date().toISOString(),
        deletionReason: searchParams.get('reason') || 'Admin deletion',
      };

      const { data: updatedCandidate, error: updateError } = await supabaseAdmin
        .from('candidate_profiles')
        .update({
          is_active: false,
          private_metadata: deletionMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId)
        .select()
        .single();

      if (updateError) {
        console.error('Soft delete error:', updateError);
        return createErrorResponse('Failed to deactivate candidate profile', 500);
      }

      // Log admin action
      await logAdminAction(adminUser.id, 'candidate_soft_delete', candidateId, {
        userEmail: candidate.users?.email,
        userName: `${candidate.users?.first_name} ${candidate.users?.last_name}`,
        reason: searchParams.get('reason'),
      });

      return createSuccessResponse({
        candidateId: updatedCandidate.id,
        deletionType: 'soft',
        isActive: updatedCandidate.is_active,
        deletedAt: deletionMetadata.deletedAt,
        message: 'Candidate profile deactivated (soft delete)',
      }, 'Candidate profile deactivated');
    }

  } catch (error: any) {
    if (error.message?.includes('Authentication required') || error.message?.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin candidate deletion error:', error);
    return createErrorResponse('Failed to delete candidate profile', 500);
  }
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(
  adminUserId: string,
  action: string,
  targetId: string,
  metadata: any
) {
  try {
    console.log('Admin action logged:', {
      adminUserId,
      action,
      targetId,
      metadata,
      timestamp: new Date().toISOString(),
    });
    
    // Future: Store in audit log table or send to monitoring service
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't fail the request if logging fails
  }
}