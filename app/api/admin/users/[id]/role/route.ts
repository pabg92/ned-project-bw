import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';
import { UserRole } from '@/lib/types/auth';

// Role change schema
const roleChangeSchema = z.object({
  role: z.enum(['candidate', 'company', 'admin'] as const),
  reason: z.string().min(1).max(500),
  adminPermissions: z.object({
    canManageUsers: z.boolean().optional(),
    canManageContent: z.boolean().optional(),
    canManageBilling: z.boolean().optional(),
    canViewAnalytics: z.boolean().optional(),
    canManageSystem: z.boolean().optional(),
  }).optional(),
});

/**
 * PUT /api/admin/users/[id]/role
 * Change user role with audit trail
 * 
 * This endpoint allows admins to promote/demote user roles
 * with proper authorization checks and audit logging.
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
      return createErrorResponse('Insufficient permissions to manage user roles', 403);
    }

    // Parse request body
    const body = await request.json();
    const validationResult = roleChangeSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse('Invalid request data', 400, {
        errors: validationResult.error.errors
      });
    }

    const { role: newRole, reason, adminPermissions } = validationResult.data;

    // Get current user data
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return createErrorResponse('User not found', 404);
    }

    // Prevent self-demotion for the last admin
    if (targetUserId === adminId && targetUser.role === 'admin' && newRole !== 'admin') {
      // Check if this is the last admin
      const { count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'admin')
        .eq('is_active', true)
        .is('deleted_at', null);

      if (count === 1) {
        return createErrorResponse('Cannot demote the last active admin', 400);
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

    // Prepare metadata updates
    const updatedMetadata = { ...targetUser.private_metadata };
    
    if (newRole === 'admin' && adminPermissions) {
      updatedMetadata.adminPermissions = adminPermissions;
    } else if (newRole !== 'admin') {
      // Remove admin permissions when demoting
      delete updatedMetadata.adminPermissions;
    }

    // Update user role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        role: newRole,
        private_metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Role update error:', updateError);
      throw updateError;
    }

    // Create a more detailed audit log entry
    await supabaseAdmin
      .from('user_audit_logs')
      .insert({
        user_id: targetUserId,
        admin_id: adminId,
        action: 'ROLE_CHANGE',
        table_name: 'users',
        record_id: targetUserId,
        old_data: { role: targetUser.role },
        new_data: { role: newRole },
        metadata: {
          reason,
          previous_role: targetUser.role,
          new_role: newRole,
          admin_permissions: newRole === 'admin' ? adminPermissions : null,
        }
      });

    // Handle role-specific actions
    if (newRole === 'candidate' && targetUser.role !== 'candidate') {
      // Create candidate profile if it doesn't exist
      const { data: existingProfile } = await supabaseAdmin
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .single();

      if (!existingProfile) {
        await supabaseAdmin
          .from('candidate_profiles')
          .insert({
            user_id: targetUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    } else if (newRole === 'company' && targetUser.role !== 'company') {
      // Create company profile if it doesn't exist
      const { data: existingCompany } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('id', targetUserId)
        .single();

      if (!existingCompany) {
        await supabaseAdmin
          .from('companies')
          .insert({
            id: targetUserId,
            name: `${targetUser.first_name} ${targetUser.last_name}`.trim() || 'Unnamed Company',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    }

    return createSuccessResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      previousRole: targetUser.role,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      isActive: updatedUser.is_active,
      adminPermissions: newRole === 'admin' ? adminPermissions : undefined,
    }, `User role changed from ${targetUser.role} to ${newRole}`);

  } catch (error: any) {
    console.error('Role change error:', error);
    return createErrorResponse('Internal server error during role change', 500);
  }
}