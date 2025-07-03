import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROLE_REDIRECTS } from './config';

// Create route matchers for different types of routes
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const isProfileRoute = createRouteMatcher(['/profile(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Get auth data
  const authData = await auth();
  const { userId, sessionClaims } = authData;

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Get user role from session claims
  const userRole = sessionClaims?.metadata?.role as string;
  
  if (!userRole) {
    // If no role is set, redirect to role setup (this would be handled by webhook normally)
    return NextResponse.redirect(new URL('/setup-role', req.url));
  }

  // Check admin routes - require admin role
  if (isAdminRoute(req)) {
    if (userRole !== 'admin') {
      const redirectUrl = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // Check dashboard routes - require company role
  if (isDashboardRoute(req)) {
    if (userRole !== 'company') {
      const redirectUrl = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // Check profile routes - require candidate role
  if (isProfileRoute(req)) {
    if (userRole !== 'candidate') {
      const redirectUrl = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // For other protected routes, check if user has appropriate role
  const roleRoutes = PROTECTED_ROUTES[userRole as keyof typeof PROTECTED_ROUTES] || [];
  const isAuthorizedRoute = roleRoutes.some(route => pathname.startsWith(route));

  if (!isAuthorizedRoute) {
    const redirectUrl = ROLE_REDIRECTS[userRole as keyof typeof ROLE_REDIRECTS] || '/';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};