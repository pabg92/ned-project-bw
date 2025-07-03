import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Restore schema
const restoreSchema = z.object({
  reason: z.string().min(1).max(500),
  restoreProfile: z.boolean().optional().default(true),
  clearSuspension: z.boolean().optional().default(true),
});

/**
 * POST /api/admin/users/[id]/restore
 * Restore a soft-deleted or suspended user account
 * 
 * This endpoint allows admins to restore users who were
 * soft-deleted or suspended, with complete data recovery.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated admin user
    const { userId: adminId } = await auth();
    const { id: targetUserId } = await params;
    
    if (!adminId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify admin permissions
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role, private_metadata')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Check if admin can manage users
    const adminPerms = adminUser.private_metadata?.adminPermissions || {};
    if (!adminPerms.canManageUsers && !adminPerms.canManageSystem) {
      return createErrorResponse('Insufficient permissions to restore users', 403);
    }

    // Parse request body
    const body = await request.json();
    const validationResult = restoreSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Invalid request data', 400, {
        errors: validationResult.error.errors
      });
    }

    const { reason, restoreProfile, clearSuspension } = validationResult.data;

    // Get current user data (including soft-deleted)
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return createErrorResponse('User not found', 404);
    }

    // Check if user needs restoration
    const isSoftDeleted = targetUser.deleted_at !== null;
    const isSuspended = targetUser.private_metadata?.suspended === true;

    if (!isSoftDeleted && !isSuspended && targetUser.is_active) {
      return createErrorResponse('User is already active and does not need restoration', 400);
    }

    // Set session variables for audit trail
    await supabaseAdmin.rpc('set_config', {
      setting: 'app.current_user_id',
      value: adminId
    });
    await supabaseAdmin.rpc('set_config', {
      setting: 'app.change_reason',
      value: reason
    });

    // Prepare update data
    const updateData: any = {
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    // Clear soft delete fields if applicable
    if (isSoftDeleted) {
      updateData.deleted_at = null;
      updateData.deleted_by = null;
      updateData.deletion_reason = null;
    }

    // Clear suspension if requested
    if (isSuspended && clearSuspension) {
      const metadata = { ...targetUser.private_metadata };
      delete metadata.suspended;
      delete metadata.suspendedAt;
      delete metadata.suspendedBy;
      delete metadata.suspensionReason;
      
      // Add restoration metadata
      metadata.lastRestoredAt = new Date().toISOString();
      metadata.lastRestoredBy = adminId;
      metadata.restorationReason = reason;
      
      updateData.private_metadata = metadata;
    }

    // Update user
    const { data: restoredUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Restoration error:', updateError);
      throw updateError;
    }

    // Restore related profiles if requested and they were soft-deleted
    if (restoreProfile && isSoftDeleted) {
      // Restore candidate profile
      if (restoredUser.role === 'candidate') {
        await supabaseAdmin
          .from('candidate_profiles')
          .update({
            deleted_at: null,
            deleted_by: null,
            deletion_reason: null,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', targetUserId);
      }

      // Restore company profile
      if (restoredUser.role === 'company') {
        await supabaseAdmin
          .from('companies')
          .update({
            deleted_at: null,
            deleted_by: null,
            deletion_reason: null,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);
      }
    }

    // Get historical data for the response
    const { data: auditHistory } = await supabaseAdmin
      .from('user_audit_logs')
      .select('action, created_at, metadata')
      .eq('user_id', targetUserId)
      .in('action', ['SOFT_DELETE', 'STATUS_CHANGE', 'RESTORE'])
      .order('created_at', { ascending: false })
      .limit(5);

    return createSuccessResponse({
      id: restoredUser.id,
      email: restoredUser.email,
      role: restoredUser.role,
      firstName: restoredUser.first_name,
      lastName: restoredUser.last_name,
      isActive: restoredUser.is_active,
      wasDeleted: isSoftDeleted,
      wasSuspended: isSuspended,
      restoredAt: new Date().toISOString(),
      restoredBy: adminId,
      auditHistory: auditHistory || [],
    }, 'User restored successfully');

  } catch (error: any) {
    console.error('Restoration error:', error);
    return createErrorResponse('Internal server error during restoration', 500);
  }
}