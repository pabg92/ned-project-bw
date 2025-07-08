import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Middleware Configuration
 * 
 * This middleware handles authentication and role-based access control
 * for the Board Champions platform.
 * 
 * Route Protection Strategy:
 * 1. Public routes: Accessible without authentication
 * 2. Company routes: Require 'company' or 'admin' role
 * 3. Admin routes: Require 'admin' role only
 * 4. All other routes: Require authentication
 */

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",                          // Homepage
  "/companies",                 // Company information page
  "/sign-in(.*)",              // Clerk sign in
  "/sign-up(.*)",              // Clerk sign up
  "/signup(.*)",               // Candidate application form
  "/api/v1/candidates/signup", // Public signup API
  "/api/webhooks(.*)",         // Webhook endpoints
  "/api/health",               // Health check
]);

// Define company-only routes (companies and admins can access)
const isCompanyRoute = createRouteMatcher([
  "/search(.*)",                     // Browse candidates
  "/billing(.*)",                    // Credit purchase
  "/credits(.*)",                    // Credit management
  "/shortlist(.*)",                  // Saved candidates
  "/api/search(.*)",                 // Search API
  "/api/profiles/(.*)/unlock",       // Profile unlock API
  "/api/user/credits(.*)",           // Credits API
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",                // Admin dashboard and all sub-routes
  "/api/admin(.*)",            // Admin API endpoints
]);

// Development/testing routes (remove in production)
const isDevelopmentRoute = createRouteMatcher([
  "/test-clerk",
  "/debug-clerk",
  "/set-admin",
  "/api/admin/set-admin",
  "/api/test-db",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const userRole = sessionClaims?.publicMetadata?.role as string || 'user';
  
  // Log middleware checks for debugging
  console.log('[Middleware] Path:', req.nextUrl.pathname);
  console.log('[Middleware] User ID:', userId);
  console.log('[Middleware] User Role:', userRole);
  
  // Allow development routes in development mode only
  if (isDevelopmentRoute(req) && process.env.NODE_ENV !== 'development') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // Check company routes
  if (isCompanyRoute(req)) {
    if (!userId) {
      // Not authenticated, redirect to sign in
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check if user has company or admin role
    if (userRole !== 'company' && userRole !== 'admin') {
      // User doesn't have required role, redirect to company info
      console.log('[Middleware] Access denied to company route, redirecting to /companies');
      return NextResponse.redirect(new URL('/companies', req.url));
    }
  }
  
  // Check admin routes
  if (isAdminRoute(req) && !req.url.includes('/api/admin/set-admin')) {
    if (!userId) {
      // Not authenticated, redirect to sign in
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Hardcoded admin check for development
    const isHardcodedAdmin = userId === 'user_2xxPM7cYdgriSxF3cvcAuTMpiCM';
    
    // Check for admin role
    if (userRole !== 'admin' && !isHardcodedAdmin) {
      console.log('[Middleware] Access denied to admin route, redirecting to home');
      // In development, redirect to set-admin page
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.redirect(new URL('/set-admin', req.url));
      }
      // In production, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    // This will redirect to sign-in if not authenticated
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};