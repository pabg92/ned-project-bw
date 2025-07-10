import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function checkCompanyOnboarding(request: NextRequest) {
  const user = await currentUser();
  
  if (!user) return null;
  
  const userRole = user.publicMetadata?.role as string;
  const onboardingCompleted = user.publicMetadata?.onboardingCompleted as boolean;
  
  // If user is a company and hasn't completed onboarding
  if (userRole === 'company' && !onboardingCompleted) {
    const pathname = request.nextUrl.pathname;
    
    // Allow access to onboarding page and API routes
    if (pathname === '/company-onboarding' || pathname.startsWith('/api/')) {
      return null;
    }
    
    // Redirect to onboarding for all other pages
    return NextResponse.redirect(new URL('/company-onboarding', request.url));
  }
  
  return null;
}