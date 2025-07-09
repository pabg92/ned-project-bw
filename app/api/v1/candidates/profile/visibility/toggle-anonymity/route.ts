import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * POST /api/v1/candidates/profile/visibility/toggle-anonymity
 * Quick toggle for anonymity setting
 * 
 * This endpoint provides a quick way to toggle profile anonymization
 * without updating other visibility settings.
 */
export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

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

    // Get current profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id, is_anonymized')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return createErrorResponse('Candidate profile not found', 404);
      }
      throw profileError;
    }

    // Toggle anonymity
    const newAnonymityState = !profile.is_anonymized;

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('candidate_profiles')
      .update({
        is_anonymized: newAnonymityState,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('id, is_anonymized, updated_at')
      .single();

    if (updateError) {
      console.error('Anonymity toggle error:', updateError);
      throw updateError;
    }

    // Log the toggle action in private metadata
    const { data: currentPrivateMetadata } = await supabaseAdmin
      .from('candidate_profiles')
      .select('private_metadata')
      .eq('id', updatedProfile.id)
      .single();

    const privateMetadata = currentPrivateMetadata?.private_metadata || {};
    privateMetadata.lastAnonymityToggleAt = new Date().toISOString();
    privateMetadata.lastAnonymityToggleBy = 'self';
    privateMetadata.anonymityToggleCount = (privateMetadata.anonymityToggleCount || 0) + 1;
    
    await supabaseAdmin
      .from('candidate_profiles')
      .update({ private_metadata: privateMetadata })
      .eq('id', updatedProfile.id);

    const responseData = {
      isAnonymized: updatedProfile.is_anonymized,
      previousState: profile.is_anonymized,
      updatedAt: updatedProfile.updated_at,
    };

    return createSuccessResponse(
      responseData, 
      `Profile ${newAnonymityState ? 'anonymized' : 'de-anonymized'} successfully`
    );

  } catch (error: any) {
    console.error('Anonymity toggle error:', error);
    return createErrorResponse('Internal server error during anonymity toggle', 500);
  }
}