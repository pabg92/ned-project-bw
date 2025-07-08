import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dynamic import of clerkClient
    const { clerkClient } = await import('@clerk/backend');
    
    // Update the current user to have admin role
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      },
      unsafeMetadata: {
        role: 'admin',
        isActive: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin role granted successfully',
      userId 
    });

  } catch (error) {
    console.error('Error setting admin role:', error);
    return NextResponse.json({ 
      error: 'Failed to set admin role', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}