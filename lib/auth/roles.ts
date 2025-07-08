import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Role Management Utilities
 * 
 * This module provides utilities for checking and managing user roles
 * throughout the application. It works with Clerk's publicMetadata
 * to store and retrieve role information.
 * 
 * Roles:
 * - company: Can search and unlock candidate profiles
 * - admin: Full platform access
 * - candidate: Board members (future features)
 * - user: Default role (no specific permissions)
 */

export type UserRole = "company" | "admin" | "candidate" | "user";

/**
 * Role permissions mapping
 * Defines what each role can access
 */
export const ROLE_PERMISSIONS = {
  company: {
    canSearch: true,
    canUnlockProfiles: true,
    canPurchaseCredits: true,
    canAccessAdmin: false,
    canEditOwnProfile: true,
    canApplyAsCandidate: false,
  },
  admin: {
    canSearch: true,
    canUnlockProfiles: true,
    canPurchaseCredits: false, // Admins don't need to buy credits
    canAccessAdmin: true,
    canEditOwnProfile: true,
    canApplyAsCandidate: true,
    canEditAnyProfile: true,
    canApproveCandiates: true,
  },
  candidate: {
    canSearch: false,
    canUnlockProfiles: false,
    canPurchaseCredits: false,
    canAccessAdmin: false,
    canEditOwnProfile: true, // Future feature
    canApplyAsCandidate: false, // Already a candidate
  },
  user: {
    canSearch: false,
    canUnlockProfiles: false,
    canPurchaseCredits: false,
    canAccessAdmin: false,
    canEditOwnProfile: false,
    canApplyAsCandidate: true,
  },
} as const;

/**
 * Get the current user's role from Clerk session
 * @returns The user's role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  
  if (!sessionClaims) {
    return null;
  }
  
  const role = sessionClaims.publicMetadata?.role as UserRole;
  return role || "user";
}

/**
 * Check if the current user has a specific role
 * @param requiredRole The role to check for
 * @returns True if the user has the role, false otherwise
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === requiredRole;
}

/**
 * Check if the current user has any of the specified roles
 * @param roles Array of roles to check
 * @returns True if the user has any of the roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole !== null && roles.includes(userRole);
}

/**
 * Check if the current user has a specific permission
 * @param permission The permission to check
 * @returns True if the user's role grants the permission
 */
export async function hasPermission(
  permission: keyof typeof ROLE_PERMISSIONS.company
): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  
  if (!userRole || userRole === "user") {
    // Check default user permissions
    return ROLE_PERMISSIONS.user[permission] || false;
  }
  
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

/**
 * Require a specific role for a page or component
 * Redirects to appropriate page if user doesn't have the role
 * @param requiredRole The role required to access
 * @param redirectTo Where to redirect if check fails (defaults to home)
 */
export async function requireRole(
  requiredRole: UserRole,
  redirectTo: string = "/"
): Promise<void> {
  const userRole = await getCurrentUserRole();
  
  if (!userRole) {
    // Not authenticated, redirect to sign in
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`);
  }
  
  if (userRole !== requiredRole) {
    // Authenticated but wrong role
    redirect(redirectTo);
  }
}

/**
 * Require any of the specified roles
 * @param roles Array of acceptable roles
 * @param redirectTo Where to redirect if check fails
 */
export async function requireAnyRole(
  roles: UserRole[],
  redirectTo: string = "/"
): Promise<void> {
  const hasRequiredRole = await hasAnyRole(roles);
  
  if (!hasRequiredRole) {
    const { userId } = await auth();
    
    if (!userId) {
      // Not authenticated
      redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`);
    } else {
      // Authenticated but wrong role
      redirect(redirectTo);
    }
  }
}

/**
 * Get the default redirect path for a user based on their role
 * @param role The user's role
 * @returns The default path for that role
 */
export function getRoleRedirectPath(role: UserRole | null): string {
  switch (role) {
    case "company":
      return "/search";
    case "admin":
      return "/admin";
    case "candidate":
      return "/profile"; // Future feature
    case "user":
    default:
      return "/";
  }
}

/**
 * Check if a role can access a specific route
 * @param role The user's role
 * @param route The route to check
 * @returns True if the role can access the route
 */
export function canAccessRoute(role: UserRole | null, route: string): boolean {
  if (!role) return false;
  
  // Define route access patterns
  const routePatterns: Record<string, UserRole[]> = {
    "/search": ["company", "admin"],
    "/billing": ["company"],
    "/credits": ["company", "admin"],
    "/shortlist": ["company", "admin"],
    "/admin": ["admin"],
    "/profile": ["candidate", "company", "admin"],
    "/signup": ["user"], // Only non-candidates can apply
  };
  
  // Check each pattern
  for (const [pattern, allowedRoles] of Object.entries(routePatterns)) {
    if (route.startsWith(pattern)) {
      return allowedRoles.includes(role);
    }
  }
  
  // Default allow for unspecified routes
  return true;
}

/**
 * Format role for display
 * @param role The role to format
 * @returns Human-readable role name
 */
export function formatRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    company: "Company",
    admin: "Administrator",
    candidate: "Board Member",
    user: "User",
  };
  
  return roleNames[role] || "User";
}

/**
 * Server-side role check for API routes
 * Throws an error if the user doesn't have the required role
 * @param requiredRoles Array of acceptable roles
 */
export async function apiRequireRole(requiredRoles: UserRole[]): Promise<UserRole> {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error("Authentication required");
  }
  
  const userRole = (sessionClaims?.publicMetadata?.role as UserRole) || "user";
  
  if (!requiredRoles.includes(userRole)) {
    throw new Error(`Access denied. Required role: ${requiredRoles.join(" or ")}`);
  }
  
  return userRole;
}

/**
 * Check if the current user is a company user
 * Convenience function for common check
 */
export async function isCompanyUser(): Promise<boolean> {
  return hasRole("company");
}

/**
 * Check if the current user is an admin
 * Convenience function for common check
 */
export async function isAdminUser(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if the current user is a candidate
 * Convenience function for future features
 */
export async function isCandidateUser(): Promise<boolean> {
  return hasRole("candidate");
}