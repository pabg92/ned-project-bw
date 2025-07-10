import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    console.log('[Test] Starting company setup test...');
    
    // 1. Test auth
    const authResult = await auth();
    console.log('[Test] Auth result:', { userId: authResult.userId });
    
    if (!authResult.userId) {
      return NextResponse.json({ 
        step: 'auth',
        error: 'Not authenticated',
        solution: 'Make sure you are logged in'
      }, { status: 401 });
    }
    
    // 2. Test Clerk secret key
    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json({ 
        step: 'env',
        error: 'CLERK_SECRET_KEY is not set',
        solution: 'Add CLERK_SECRET_KEY to your .env.local file'
      });
    }
    
    // 3. Test Supabase connection
    try {
      const supabaseAdmin = getSupabaseAdmin();
      console.log('[Test] Supabase admin client created');
      
      // 4. Try to find user
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, role')
        .eq('id', authResult.userId)
        .single();
        
      if (error) {
        return NextResponse.json({ 
          step: 'user_lookup',
          error: error.message,
          userId: authResult.userId,
          solution: 'Run: npx tsx scripts/create-user-in-db.ts'
        });
      }
      
      // 5. Check company_profiles table exists
      const { data: tables } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'company_profiles')
        .single();
        
      if (!tables) {
        return NextResponse.json({ 
          step: 'table_check',
          error: 'company_profiles table does not exist',
          solution: 'Run the SQL script: scripts/create-company-profiles-complete.sql'
        });
      }
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        checks: {
          auth: '✅ Authenticated',
          env: '✅ Environment variables set',
          supabase: '✅ Supabase connected',
          user: '✅ User found in database',
          table: '✅ company_profiles table exists'
        }
      });
      
    } catch (dbError) {
      return NextResponse.json({ 
        step: 'database',
        error: dbError instanceof Error ? dbError.message : 'Database error',
        solution: 'Check Supabase connection and credentials'
      });
    }
    
  } catch (error) {
    console.error('[Test] Unexpected error:', error);
    return NextResponse.json({
      step: 'unexpected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}