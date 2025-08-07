import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Update company schema
const updateCompanySchema = z.object({
  company_name: z.string().min(1).optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  website: z.string().url().optional().nullable(),
  position: z.string().optional(),
  hiring_needs: z.string().optional(),
  is_verified: z.boolean().optional(),
  admin_notes: z.string().optional(),
});

/**
 * GET /api/admin/companies/[id]
 * Get a specific company with full details including credits
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Verify admin authentication
    const { userId: adminId } = await auth();
    
    if (!adminId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify admin role
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Get company profile
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .select(`
        *,
        user:users!company_profiles_user_id_fkey(
          id,
          email,
          role,
          first_name,
          last_name,
          created_at,
          updated_at
        )
      `)
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return createErrorResponse('Company not found', 404);
    }

    // Get Clerk metadata
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    try {
      const clerkUser = await clerkClient.users.getUser(company.user_id);
      
      // Combine data
      const companyData = {
        ...company,
        credits: (clerkUser.publicMetadata?.credits as number) || 0,
        unlockedProfiles: (clerkUser.publicMetadata?.unlockedProfiles as string[]) || [],
        creditHistory: (clerkUser.privateMetadata?.creditHistory as any[]) || [],
        onboardingCompleted: clerkUser.publicMetadata?.onboardingCompleted || false,
        clerkData: {
          id: clerkUser.id,
          emailAddresses: clerkUser.emailAddresses,
          createdAt: clerkUser.createdAt,
          lastSignInAt: clerkUser.lastSignInAt,
          publicMetadata: clerkUser.publicMetadata,
        }
      };

      // Get unlocked profile details if any
      if (companyData.unlockedProfiles.length > 0) {
        const { data: unlockedProfileDetails } = await supabaseAdmin
          .from('candidate_profiles')
          .select(`
            id,
            title,
            users!candidate_profiles_user_id_fkey(
              first_name,
              last_name,
              email
            )
          `)
          .in('id', companyData.unlockedProfiles);

        companyData.unlockedProfileDetails = unlockedProfileDetails || [];
      }

      return createSuccessResponse(companyData);

    } catch (clerkError) {
      console.error('Error fetching Clerk data:', clerkError);
      // Return company data without Clerk info
      return createSuccessResponse({
        ...company,
        credits: 0,
        unlockedProfiles: [],
        creditHistory: [],
        clerkError: 'Failed to fetch credit information'
      });
    }

  } catch (error: any) {
    console.error('Company fetch error:', error);
    return createErrorResponse('Failed to retrieve company', 500);
  }
}

/**
 * PUT /api/admin/companies/[id]
 * Update company information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Verify admin authentication
    const { userId: adminId } = await auth();
    
    if (!adminId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify admin role
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    // Update company profile
    const { data: updatedCompany, error: updateError } = await supabaseAdmin
      .from('company_profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating company:', updateError);
      throw updateError;
    }

    // If company name changed, update Clerk metadata
    if (validatedData.company_name) {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!
      });

      try {
        await clerkClient.users.updateUserMetadata(updatedCompany.user_id, {
          publicMetadata: {
            companyName: validatedData.company_name,
          }
        });
      } catch (clerkError) {
        console.error('Error updating Clerk metadata:', clerkError);
        // Continue anyway - Supabase update succeeded
      }
    }

    return createSuccessResponse(updatedCompany, 'Company updated successfully');

  } catch (error: any) {
    console.error('Company update error:', error);
    return createErrorResponse('Failed to update company', 500);
  }
}

/**
 * DELETE /api/admin/companies/[id]
 * Soft delete a company (set user role to deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Verify admin authentication
    const { userId: adminId } = await auth();
    
    if (!adminId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify admin role
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Get company to find user_id
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return createErrorResponse('Company not found', 404);
    }

    // Soft delete by updating user role
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .update({
        role: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.user_id);

    if (deleteError) {
      console.error('Error deleting company:', deleteError);
      throw deleteError;
    }

    return createSuccessResponse(null, 'Company deleted successfully');

  } catch (error: any) {
    console.error('Company delete error:', error);
    return createErrorResponse('Failed to delete company', 500);
  }
}