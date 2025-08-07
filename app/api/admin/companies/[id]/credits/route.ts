import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Credit adjustment schema
const creditAdjustmentSchema = z.object({
  amount: z.number().int(), // positive to add, negative to remove
  reason: z.string().min(1),
  adminNote: z.string().optional(),
});

/**
 * GET /api/admin/companies/[id]/credits/history
 * Get credit transaction history for a company
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

    // Get company to find user_id
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .select('user_id, company_name')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return createErrorResponse('Company not found', 404);
    }

    // Get credit history from Clerk
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    try {
      const clerkUser = await clerkClient.users.getUser(company.user_id);
      const creditHistory = (clerkUser.privateMetadata?.creditHistory as any[]) || [];
      const currentCredits = (clerkUser.publicMetadata?.credits as number) || 0;

      // Sort history by timestamp (newest first)
      creditHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return createSuccessResponse({
        company_name: company.company_name,
        current_credits: currentCredits,
        history: creditHistory,
        total_transactions: creditHistory.length,
        total_added: creditHistory
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0),
        total_used: Math.abs(creditHistory
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)),
      });

    } catch (clerkError) {
      console.error('Error fetching credit history:', clerkError);
      return createErrorResponse('Failed to fetch credit history', 500);
    }

  } catch (error: any) {
    console.error('Credit history error:', error);
    return createErrorResponse('Failed to retrieve credit history', 500);
  }
}

/**
 * POST /api/admin/companies/[id]/credits
 * Add or remove credits from a company
 */
export async function POST(
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
      .select('role, email')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const { amount, reason, adminNote } = creditAdjustmentSchema.parse(body);

    // Get company to find user_id
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .select('user_id, company_name')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return createErrorResponse('Company not found', 404);
    }

    // Get current credits from Clerk
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    try {
      const clerkUser = await clerkClient.users.getUser(company.user_id);
      const currentCredits = (clerkUser.publicMetadata?.credits as number) || 0;
      const creditHistory = (clerkUser.privateMetadata?.creditHistory as any[]) || [];
      const unlockedProfiles = (clerkUser.publicMetadata?.unlockedProfiles as string[]) || [];

      // Calculate new balance
      const newCredits = currentCredits + amount;

      // Validate new balance
      if (newCredits < 0) {
        return createErrorResponse('Insufficient credits. Would result in negative balance.', 400);
      }

      // Create transaction record
      const transaction = {
        timestamp: new Date().toISOString(),
        amount,
        balance: newCredits,
        reason,
        adminNote,
        adminId,
        adminEmail: adminUser.email,
        type: amount > 0 ? 'admin_grant' : 'admin_deduction',
      };

      // Update Clerk metadata
      await clerkClient.users.updateUserMetadata(company.user_id, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          credits: newCredits,
          unlockedProfiles, // Preserve existing unlocked profiles
        },
        privateMetadata: {
          ...clerkUser.privateMetadata,
          creditHistory: [...creditHistory, transaction],
        }
      });

      return createSuccessResponse({
        company_name: company.company_name,
        previous_balance: currentCredits,
        adjustment: amount,
        new_balance: newCredits,
        transaction,
      }, `Successfully ${amount > 0 ? 'added' : 'removed'} ${Math.abs(amount)} credits`);

    } catch (clerkError) {
      console.error('Error updating credits:', clerkError);
      return createErrorResponse('Failed to update credits', 500);
    }

  } catch (error: any) {
    console.error('Credit adjustment error:', error);
    return createErrorResponse('Failed to adjust credits', 500);
  }
}

/**
 * PATCH /api/admin/companies/[id]/credits/unlocks
 * Reset unlocked profiles for a company
 */
export async function PATCH(
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
      .select('role, email')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Get company to find user_id
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .select('user_id, company_name')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return createErrorResponse('Company not found', 404);
    }

    // Reset unlocked profiles in Clerk
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    try {
      const clerkUser = await clerkClient.users.getUser(company.user_id);
      const creditHistory = (clerkUser.privateMetadata?.creditHistory as any[]) || [];
      const previousUnlockedCount = (clerkUser.publicMetadata?.unlockedProfiles as string[])?.length || 0;

      // Create reset transaction
      const transaction = {
        timestamp: new Date().toISOString(),
        amount: 0,
        balance: (clerkUser.publicMetadata?.credits as number) || 0,
        reason: 'admin_unlock_reset',
        adminNote: `Reset ${previousUnlockedCount} unlocked profiles`,
        adminId,
        adminEmail: adminUser.email,
        type: 'admin_unlock_reset',
      };

      // Update Clerk metadata - keep credits but clear unlocked profiles
      await clerkClient.users.updateUserMetadata(company.user_id, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          unlockedProfiles: [], // Clear the array
        },
        privateMetadata: {
          ...clerkUser.privateMetadata,
          creditHistory: [...creditHistory, transaction],
        }
      });

      return createSuccessResponse({
        company_name: company.company_name,
        previous_unlocked_count: previousUnlockedCount,
        message: `Reset ${previousUnlockedCount} unlocked profiles`
      }, 'Unlocked profiles reset successfully');

    } catch (clerkError) {
      console.error('Error resetting unlocked profiles:', clerkError);
      return createErrorResponse('Failed to reset unlocked profiles', 500);
    }

  } catch (error: any) {
    console.error('Unlock reset error:', error);
    return createErrorResponse('Failed to reset unlocks', 500);
  }
}

/**
 * DELETE /api/admin/companies/[id]/credits/reset
 * Reset company credits to 0
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
      .select('role, email')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Get company to find user_id
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .select('user_id, company_name')
      .eq('id', params.id)
      .single();

    if (companyError || !company) {
      return createErrorResponse('Company not found', 404);
    }

    // Reset credits in Clerk
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    try {
      const clerkUser = await clerkClient.users.getUser(company.user_id);
      const currentCredits = (clerkUser.publicMetadata?.credits as number) || 0;
      const creditHistory = (clerkUser.privateMetadata?.creditHistory as any[]) || [];

      // Create reset transaction
      const transaction = {
        timestamp: new Date().toISOString(),
        amount: -currentCredits,
        balance: 0,
        reason: 'admin_reset',
        adminNote: 'Credits reset to 0 by admin',
        adminId,
        adminEmail: adminUser.email,
        type: 'admin_reset',
      };

      // Update Clerk metadata
      await clerkClient.users.updateUserMetadata(company.user_id, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          credits: 0,
        },
        privateMetadata: {
          ...clerkUser.privateMetadata,
          creditHistory: [...creditHistory, transaction],
        }
      });

      return createSuccessResponse({
        company_name: company.company_name,
        previous_balance: currentCredits,
        new_balance: 0,
      }, 'Credits reset to 0 successfully');

    } catch (clerkError) {
      console.error('Error resetting credits:', clerkError);
      return createErrorResponse('Failed to reset credits', 500);
    }

  } catch (error: any) {
    console.error('Credit reset error:', error);
    return createErrorResponse('Failed to reset credits', 500);
  }
}