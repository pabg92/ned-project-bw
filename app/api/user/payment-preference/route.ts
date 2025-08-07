import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { paymentMethod, companyData } = body;

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    // Update user metadata with payment preference and company data
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        paymentPreference: paymentMethod,
        companyName: companyData?.companyName,
        industry: companyData?.industry,
        companySize: companyData?.companySize,
        companyRole: companyData?.role,
        role: 'company', // Ensure they're marked as a company user
        onboardingCompleted: true,
      }
    });

    return createSuccessResponse({
      paymentMethod,
      companyData
    }, 'Payment preference saved successfully');

  } catch (error: any) {
    console.error('Payment preference error:', error);
    return createErrorResponse('Failed to save payment preference', 500);
  }
}