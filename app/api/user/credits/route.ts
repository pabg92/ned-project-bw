import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * GET /api/user/credits
 * Get the current user's credit balance
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Get credits from public metadata (visible to frontend)
    const credits = user.publicMetadata?.credits as number || 0;
    
    return createSuccessResponse({
      credits,
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    }, 'Credits retrieved successfully');

  } catch (error: any) {
    console.error('Credits fetch error:', error);
    return createErrorResponse('Failed to retrieve credits', 500);
  }
}

/**
 * POST /api/user/credits/deduct
 * Deduct credits when unlocking a profile
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    const { amount = 1, profileId, reason = 'profile_unlock' } = await request.json();

    // Get current user
    const user = await clerkClient.users.getUser(userId);
    const currentCredits = user.publicMetadata?.credits as number || 0;

    // Check if user has enough credits
    if (currentCredits < amount) {
      return createErrorResponse('Insufficient credits', 400);
    }

    // Deduct credits
    const newCredits = currentCredits - amount;
    
    // Update user metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        credits: newCredits,
      },
      privateMetadata: {
        ...user.privateMetadata,
        creditHistory: [
          ...(user.privateMetadata?.creditHistory as any[] || []),
          {
            timestamp: new Date().toISOString(),
            amount: -amount,
            balance: newCredits,
            reason,
            profileId,
          }
        ]
      }
    });

    return createSuccessResponse({
      credits: newCredits,
      deducted: amount,
      profileId,
    }, 'Credits deducted successfully');

  } catch (error: any) {
    console.error('Credits deduction error:', error);
    return createErrorResponse('Failed to deduct credits', 500);
  }
}