import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * POST /api/user/upgrade-role
 * 
 * Temporary endpoint to upgrade a user's role to company
 * This allows existing users to become company users without re-registering
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log('[Upgrade Role] Upgrading user to company role:', userId);
    
    // Get current user
    const user = await clerkClient.users.getUser(userId);
    
    // Update user metadata to company role
    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'company',
        credits: 0,
        unlockedProfiles: []
      }
    });
    
    console.log('[Upgrade Role] User upgraded successfully:', {
      userId,
      newRole: 'company',
      publicMetadata: updatedUser.publicMetadata
    });
    
    return NextResponse.json({
      success: true,
      message: "Successfully upgraded to company account",
      role: 'company'
    });
    
  } catch (error: any) {
    console.error('[Upgrade Role] Error:', error);
    return NextResponse.json(
      { error: "Failed to upgrade account", details: error.message },
      { status: 500 }
    );
  }
}