import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    // Test auth
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Test Supabase connection
    const supabaseAdmin = getSupabaseAdmin();
    
    // Try to find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();
      
    return NextResponse.json({
      authenticated: true,
      clerkUserId: userId,
      userInDb: !!user,
      userDetails: user,
      error: error?.message
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}