import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Query parameters schema
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().optional(),
  role: z.enum(['all', 'candidate', 'company', 'admin']).optional().default('all'),
  status: z.enum(['all', 'active', 'inactive', 'suspended', 'deleted']).optional().default('active'),
  includeDeleted: z.string().transform(v => v === 'true').optional().default('false'),
  sortBy: z.enum(['created_at', 'updated_at', 'email', 'name']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 * 
 * This endpoint allows admins to view and manage all users
 * including soft-deleted and suspended accounts.
 */
export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Get authenticated admin user
    const { userId: adminId } = await auth();
    
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

    // Check if admin can view users
    const adminPerms = adminUser.private_metadata?.adminPermissions || {};
    if (!adminPerms.canManageUsers && !adminPerms.canViewAnalytics && !adminPerms.canManageSystem) {
      return createErrorResponse('Insufficient permissions to view users', 403);
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const params = querySchema.parse(searchParams);

    // Build query
    let query = supabaseAdmin
      .from('users')
      .select(`
        *,
        candidate_profiles!left(id, title, is_active),
        companies!left(id, name, is_active)
      `, { count: 'exact' });

    // Apply filters
    if (params.role !== 'all') {
      query = query.eq('role', params.role);
    }

    // Status filter
    switch (params.status) {
      case 'active':
        query = query.eq('is_active', true).is('deleted_at', null);
        break;
      case 'inactive':
        query = query.eq('is_active', false).is('deleted_at', null);
        break;
      case 'suspended':
        query = query.eq('private_metadata->suspended', true);
        break;
      case 'deleted':
        query = query.not('deleted_at', 'is', null);
        break;
      case 'all':
        if (!params.includeDeleted) {
          query = query.is('deleted_at', null);
        }
        break;
    }

    // Search filter
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(`email.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
    }

    // Sorting
    const sortColumn = params.sortBy === 'name' 
      ? 'first_name' 
      : params.sortBy;
    query = query.order(sortColumn, { ascending: params.sortOrder === 'asc' });

    // Pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    // Execute query
    const { data: users, error, count } = await query;

    if (error) {
      console.error('Users query error:', error);
      throw error;
    }

    // Format users data
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      imageUrl: user.image_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login,
      deletedAt: user.deleted_at,
      isSuspended: user.private_metadata?.suspended === true,
      suspendedAt: user.private_metadata?.suspendedAt,
      adminPermissions: user.role === 'admin' ? user.private_metadata?.adminPermissions : undefined,
      profileInfo: user.role === 'candidate' && user.candidate_profiles?.[0] 
        ? {
            id: user.candidate_profiles[0].id,
            title: user.candidate_profiles[0].title,
            isActive: user.candidate_profiles[0].is_active,
          }
        : user.role === 'company' && user.companies?.[0]
        ? {
            id: user.companies[0].id,
            name: user.companies[0].name,
            isActive: user.companies[0].is_active,
          }
        : null,
    }));

    // Get recent audit logs for these users
    const userIds = formattedUsers.map(u => u.id);
    const { data: recentActivity } = await supabaseAdmin
      .from('user_audit_logs')
      .select('user_id, action, created_at')
      .in('user_id', userIds)
      .in('action', ['ROLE_CHANGE', 'STATUS_CHANGE', 'SOFT_DELETE', 'RESTORE'])
      .order('created_at', { ascending: false })
      .limit(50);

    // Group activity by user
    const activityByUser = (recentActivity || []).reduce((acc, log) => {
      if (!acc[log.user_id]) {
        acc[log.user_id] = [];
      }
      acc[log.user_id].push({
        action: log.action,
        timestamp: log.created_at,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Add recent activity to users
    const usersWithActivity = formattedUsers.map(user => ({
      ...user,
      recentActivity: activityByUser[user.id] || [],
    }));

    return createSuccessResponse({
      users: usersWithActivity,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.limit),
      },
      filters: {
        role: params.role,
        status: params.status,
        search: params.search,
        includeDeleted: params.includeDeleted,
      },
    }, 'Users retrieved successfully');

  } catch (error: any) {
    console.error('Users listing error:', error);
    return createErrorResponse('Internal server error while fetching users', 500);
  }
}