import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { profileVisibilitySchema } from '@/lib/validations/candidate';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * GET /api/v1/candidates/profile/visibility
 * Get current profile visibility settings
 * 
 * This endpoint allows candidates to retrieve their privacy settings
 * including anonymization and field visibility preferences.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify user exists and has candidate role
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('role', 'candidate')
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      console.error('User verification error:', userError);
      return createErrorResponse('User not found or not authorized as candidate', 403);
    }

    // Get candidate profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id, is_anonymized, is_active, public_metadata')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return createErrorResponse('Candidate profile not found', 404);
      }
      throw profileError;
    }

    // Extract visibility settings from metadata or use defaults
    const metadata = profile.public_metadata || {};
    const visibilitySettings = {
      isAnonymized: profile.is_anonymized,
      isActive: profile.is_active,
      showSalary: metadata.showSalary ?? true,
      showLocation: metadata.showLocation ?? true,
      showExperience: metadata.showExperience ?? true,
      showContact: metadata.showContact ?? false,
    };

    return createSuccessResponse(visibilitySettings, 'Visibility settings retrieved successfully');

  } catch (error: any) {
    console.error('Visibility settings retrieval error:', error);
    return createErrorResponse('Internal server error during visibility settings retrieval', 500);
  }
}

/**
 * PUT /api/v1/candidates/profile/visibility
 * Update profile visibility settings
 * 
 * This endpoint allows candidates to update their privacy preferences
 * including what information is visible to companies.
 */
export const PUT = withValidation(
  { body: profileVisibilitySchema },
  async ({ body }, request) => {
    try {
      // Get authenticated user from Clerk
      const { userId } = await auth();
      
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Verify user exists and has candidate role
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('role', 'candidate')
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        console.error('User verification error:', userError);
        return createErrorResponse('User not found or not authorized as candidate', 403);
      }

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('candidate_profiles')
        .select('id, public_metadata')
        .eq('user_id', userId)
        .single();

      if (profileCheckError) {
        if (profileCheckError.code === 'PGRST116') {
          return createErrorResponse('Candidate profile not found. Please create a profile first.', 404);
        }
        throw profileCheckError;
      }

      // Prepare updated metadata
      const currentMetadata = existingProfile.public_metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        showSalary: body.showSalary,
        showLocation: body.showLocation,
        showExperience: body.showExperience,
        showContact: body.showContact,
        visibilityUpdatedAt: new Date().toISOString(),
      };

      // Update profile with new visibility settings
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('candidate_profiles')
        .update({
          is_anonymized: body.isAnonymized,
          is_active: body.isActive,
          public_metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select('id, is_anonymized, is_active, public_metadata, updated_at')
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      // Log visibility change in private metadata
      const { data: currentPrivateMetadata } = await supabaseAdmin
        .from('candidate_profiles')
        .select('private_metadata')
        .eq('id', updatedProfile.id)
        .single();

      const privateMetadata = currentPrivateMetadata?.private_metadata || {};
      privateMetadata.lastVisibilityChangeAt = new Date().toISOString();
      privateMetadata.lastVisibilityChangeBy = 'self';
      
      await supabaseAdmin
        .from('candidate_profiles')
        .update({ private_metadata: privateMetadata })
        .eq('id', updatedProfile.id);

      // Prepare response data
      const responseData = {
        isAnonymized: updatedProfile.is_anonymized,
        isActive: updatedProfile.is_active,
        showSalary: body.showSalary,
        showLocation: body.showLocation,
        showExperience: body.showExperience,
        showContact: body.showContact,
        updatedAt: updatedProfile.updated_at,
      };

      return createSuccessResponse(responseData, 'Visibility settings updated successfully');

    } catch (error: any) {
      console.error('Visibility settings update error:', error);
      return createErrorResponse('Internal server error during visibility settings update', 500);
    }
  }
);

