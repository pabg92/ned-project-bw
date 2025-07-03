import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/supabase/client';
import { candidateProfiles, users } from '@/lib/supabase/schema';
import { createCandidateProfileSchema } from '@/lib/validations/candidate';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { eq, and } from 'drizzle-orm';
import { logger, trackUsage, measurePerformance } from '@/lib/monitoring';

/**
 * POST /api/v1/candidates/register
 * Create or update a candidate profile
 * 
 * This endpoint handles candidate registration with upsert logic:
 * - If the user already has a profile, it updates the existing one
 * - If not, it creates a new profile
 * - Calculates profile completion status
 * - Handles proper error responses
 */
export const POST = withValidation(
  { body: createCandidateProfileSchema },
  async ({ body }, request) => {
    try {
      // Get authenticated user
      const { userId } = auth();
      
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Verify user exists and has candidate role
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, userId),
          eq(users.role, 'candidate'),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (!user) {
        return createErrorResponse('User not found or not authorized as candidate', 403);
      }

      // Check if profile already exists
      const [existingProfile] = await db
        .select()
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, userId))
        .limit(1);

      // Calculate profile completion
      const profileCompletion = calculateProfileCompletion({
        ...body,
        userId,
      });

      const profileData = {
        userId,
        title: body.title,
        summary: body.summary,
        experience: body.experience,
        location: body.location,
        remotePreference: body.remotePreference,
        salaryMin: body.salaryMin?.toString(),
        salaryMax: body.salaryMax?.toString(),
        salaryCurrency: body.salaryCurrency,
        availability: body.availability,
        isAnonymized: body.isAnonymized,
        linkedinUrl: body.linkedinUrl,
        githubUrl: body.githubUrl,
        portfolioUrl: body.portfolioUrl,
        profileCompleted: profileCompletion.isCompleted,
        updatedAt: new Date(),
      };

      let result;

      if (existingProfile) {
        // Update existing profile
        [result] = await db
          .update(candidateProfiles)
          .set(profileData)
          .where(eq(candidateProfiles.userId, userId))
          .returning();
      } else {
        // Create new profile
        [result] = await db
          .insert(candidateProfiles)
          .values({
            ...profileData,
            createdAt: new Date(),
          })
          .returning();
      }

      // Handle tags if provided
      if (body.tags && body.tags.length > 0) {
        // Note: Tag assignment will be handled in a separate endpoint
        // For now, we'll store them in publicMetadata
        await db
          .update(candidateProfiles)
          .set({
            publicMetadata: { tags: body.tags },
            updatedAt: new Date(),
          })
          .where(eq(candidateProfiles.id, result.id));
      }

      // Prepare response (exclude sensitive data)
      const responseData = {
        id: result.id,
        userId: result.userId,
        title: result.title,
        summary: result.summary,
        experience: result.experience,
        location: result.location,
        remotePreference: result.remotePreference,
        salaryMin: result.salaryMin ? parseFloat(result.salaryMin) : null,
        salaryMax: result.salaryMax ? parseFloat(result.salaryMax) : null,
        salaryCurrency: result.salaryCurrency,
        availability: result.availability,
        isAnonymized: result.isAnonymized,
        isActive: result.isActive,
        profileCompleted: result.profileCompleted,
        linkedinUrl: result.linkedinUrl,
        githubUrl: result.githubUrl,
        portfolioUrl: result.portfolioUrl,
        profileCompletion,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return createSuccessResponse(
        responseData,
        existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
        existingProfile ? 200 : 201
      );

    } catch (error) {
      console.error('Candidate registration error:', error);
      return createErrorResponse(
        'Internal server error during registration',
        500
      );
    }
  }
);

/**
 * Calculate profile completion percentage and status
 */
function calculateProfileCompletion(profile: any) {
  const requiredFields = [
    'title',
    'summary',
    'experience',
    'location',
    'remotePreference',
    'availability',
  ];

  const optionalFields = [
    'salaryMin',
    'salaryMax',
    'linkedinUrl',
    'githubUrl',
    'portfolioUrl',
  ];

  const requiredCompleted = requiredFields.filter(field => 
    profile[field] && profile[field].toString().trim().length > 0
  ).length;

  const optionalCompleted = optionalFields.filter(field => 
    profile[field] && profile[field].toString().trim().length > 0
  ).length;

  const requiredPercentage = (requiredCompleted / requiredFields.length) * 100;
  const optionalPercentage = (optionalCompleted / optionalFields.length) * 100;
  
  // Profile is complete if all required fields are filled
  const isCompleted = requiredCompleted === requiredFields.length;
  
  // Overall completion considers both required and optional fields
  const overallPercentage = Math.round(
    (requiredPercentage * 0.7) + (optionalPercentage * 0.3)
  );

  return {
    isCompleted,
    overallPercentage,
    requiredPercentage: Math.round(requiredPercentage),
    optionalPercentage: Math.round(optionalPercentage),
    requiredCompleted,
    requiredTotal: requiredFields.length,
    optionalCompleted,
    optionalTotal: optionalFields.length,
    missingRequired: requiredFields.filter(field => 
      !profile[field] || profile[field].toString().trim().length === 0
    ),
    missingOptional: optionalFields.filter(field => 
      !profile[field] || profile[field].toString().trim().length === 0
    ),
  };
}