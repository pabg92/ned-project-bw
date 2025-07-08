import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const user = await currentUser();
    
    return NextResponse.json({
      userId,
      email: user?.emailAddresses[0]?.emailAddress,
      publicMetadata: user?.publicMetadata,
      role: user?.publicMetadata?.role || 'no role set',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}