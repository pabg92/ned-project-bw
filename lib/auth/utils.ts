import { auth, currentUser } from '@clerk/nextjs/server';
import { UserRole, UserMetadata, AuthUser, AdminPermission } from '@/lib/types/auth';
import { ROLE_PERMISSIONS } from './config';

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const user = await currentUser();
    
    if (!user) return null;

    const metadata = user.unsafeMetadata as UserMetadata;
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      imageUrl: user.imageUrl || undefined,
      metadata: metadata || {
        role: 'candidate',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const user = await getCurrentUser();
    return user?.metadata.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.metadata.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }
  
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(['admin']);
}

export async function requireCompany(): Promise<AuthUser> {
  return requireRole(['company']);
}

export async function requireCandidate(): Promise<AuthUser> {
  return requireRole(['candidate']);
}

export function hasPermission(userRole: UserRole, permission: AdminPermission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export async function requirePermission(permission: AdminPermission): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!hasPermission(user.metadata.role, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
  
  return user;
}

export function isAuthenticated(): Promise<boolean> {
  return getCurrentUser().then(user => !!user);
}

export function getUserId(): Promise<string | null> {
  return auth().then(({ userId }) => userId);
}

export async function updateUserMetadata(userId: string, metadata: Partial<UserMetadata>): Promise<void> {
  try {
    const { clerkClient } = await import('@clerk/backend');
    const user = await clerkClient.users.getUser(userId);
    
    const currentMetadata = user.unsafeMetadata as UserMetadata;
    const updatedMetadata = {
      ...currentMetadata,
      ...metadata,
    };

    await clerkClient.users.updateUserMetadata(userId, {
      unsafeMetadata: updatedMetadata,
    });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
}