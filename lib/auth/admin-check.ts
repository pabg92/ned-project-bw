import { auth } from '@clerk/nextjs/server';

// Hardcoded admin user IDs
const ADMIN_USER_IDS = [
  'user_2xxPM7cYdgriSxF3cvcAuTMpiCM' // pablogarner@outlook.com
];

export async function isAdmin(): Promise<{ isAdmin: boolean; userId: string | null }> {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return { isAdmin: false, userId: null };
  }
  
  // Check hardcoded admin list
  if (ADMIN_USER_IDS.includes(userId)) {
    return { isAdmin: true, userId };
  }
  
  // Check Clerk metadata
  const userRole = sessionClaims?.publicMetadata?.role || sessionClaims?.unsafeMetadata?.role || 'user';
  
  return { isAdmin: userRole === 'admin', userId };
}

export async function requireAdmin() {
  const { isAdmin, userId } = await isAdmin();
  
  if (!userId) {
    throw new Error('Unauthorized: Not authenticated');
  }
  
  if (!isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }
  
  return userId;
}