import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Status change schema
const statusChangeSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'suspend', 'delete'] as const),
  reason: z.string().min(1).max(500),
  permanent: z.boolean().optional().default(false), // For delete action
});

/**
 * PUT /api/admin/users/[id]/status
 * Change user account status (activate, deactivate, suspend, delete)
 * 
 * This endpoint allows admins to manage user account status
 * including soft and hard deletion with proper audit trails.
 */
export async function PUT(
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
      return createErrorResponse('Insufficient permissions to manage user status', 403);
    }

    // Parse request body
    const body = await request.json();
    const validationResult = statusChangeSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Invalid request data', 400, {
        errors: validationResult.error.errors
      });
    }

    const { action, reason, permanent } = validationResult.data;

    // Get current user data
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return createErrorResponse('User not found', 404);
    }

    // Prevent self-deactivation for the last admin
    if (targetUserId === adminId && targetUser.role === 'admin' && 
        (action === 'deactivate' || action === 'suspend' || action === 'delete')) {
      // Check if this is the last active admin
      const { count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'admin')
        .eq('is_active', true)
        .is('deleted_at', null);

      if (count === 1) {
        return createErrorResponse('Cannot deactivate the last active admin', 400);
      }
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

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    switch (action) {
      case 'activate':
        if (targetUser.deleted_at) {
          return createErrorResponse('Cannot activate a deleted user. Use restore instead.', 400);
        }
        updateData.is_active = true;
        break;

      case 'deactivate':
        updateData.is_active = false;
        break;

      case 'suspend':
        updateData.is_active = false;
        updateData.private_metadata = {
          ...targetUser.private_metadata,
          suspended: true,
          suspendedAt: new Date().toISOString(),
          suspendedBy: adminId,
          suspensionReason: reason,
        };
        break;

      case 'delete':
        if (permanent) {
          // Permanent deletion - actually delete the record
          // First, delete related records
          await supabaseAdmin
            .from('candidate_profiles')
            .delete()
            .eq('user_id', targetUserId);

          await supabaseAdmin
            .from('companies')
            .delete()
            .eq('id', targetUserId);

          // Delete the user
          const { error: deleteError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', targetUserId);

          if (deleteError) {
            throw deleteError;
          }

          // Log the permanent deletion
          await supabaseAdmin
            .from('user_audit_logs')
            .insert({
              user_id: targetUserId,
              admin_id: adminId,
              action: 'PERMANENT_DELETE',
              table_name: 'users',
              record_id: targetUserId,
              old_data: targetUser,
              metadata: {
                reason,
                deletion_type: 'permanent',
                deleted_email: targetUser.email,
                deleted_role: targetUser.role,
              }
            });

          return createSuccessResponse({
            id: targetUserId,
            action: 'permanently_deleted',
            message: `User ${targetUser.email} has been permanently deleted`,
          }, 'User permanently deleted');
        } else {
          // Soft delete
          updateData.deleted_at = new Date().toISOString();
          updateData.deleted_by = adminId;
          updateData.deletion_reason = reason;
          updateData.is_active = false;
        }
        break;
    }

    // Update user status (for non-permanent deletions)
    if (action !== 'delete' || !permanent) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', targetUserId)
        .select()
        .single();

      if (updateError) {
        console.error('Status update error:', updateError);
        throw updateError;
      }

      // Also update related tables for soft delete
      if (action === 'delete' && !permanent) {
        await supabaseAdmin
          .from('candidate_profiles')
          .update({
            deleted_at: updateData.deleted_at,
            deleted_by: updateData.deleted_by,
            deletion_reason: updateData.deletion_reason,
            is_active: false,
          })
          .eq('user_id', targetUserId);

        await supabaseAdmin
          .from('companies')
          .update({
            deleted_at: updateData.deleted_at,
            deleted_by: updateData.deleted_by,
            deletion_reason: updateData.deletion_reason,
            is_active: false,
          })
          .eq('id', targetUserId);
      }

      return createSuccessResponse({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.is_active,
        status: action === 'delete' ? 'soft_deleted' : action,
        deletedAt: updatedUser.deleted_at,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
      }, `User ${action}d successfully`);
    }

  } catch (error: any) {
    console.error('Status change error:', error);
    return createErrorResponse('Internal server error during status change', 500);
  }
}