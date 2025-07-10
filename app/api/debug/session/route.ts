import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const user = await currentUser();
    
    return NextResponse.json({
      userId,
      sessionClaims: {
        ...sessionClaims,
        publicMetadata: sessionClaims?.publicMetadata
      },
      userMetadata: {
        publicMetadata: user?.publicMetadata,
        role: user?.publicMetadata?.role
      },
      debug: {
        hasUserId: !!userId,
        hasSessionClaims: !!sessionClaims,
        hasUser: !!user,
        roleFromSession: sessionClaims?.publicMetadata?.role,
        roleFromUser: user?.publicMetadata?.role
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}