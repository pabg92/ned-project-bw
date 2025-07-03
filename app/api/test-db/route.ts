import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Test using Supabase client to list tables
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      throw tablesError;
    }
    
    // Try to count users
    const { count: userCount, error: userError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    // Try to count candidate_profiles
    const { count: candidateCount, error: candidateError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      connection: 'Supabase connected successfully',
      counts: {
        users: userCount || 0,
        candidates: candidateCount || 0
      },
      errors: {
        users: userError?.message,
        candidates: candidateError?.message
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail || 'No additional details',
      hint: error.hint,
      fullError: JSON.stringify(error, null, 2)
    }, { status: 500 });
  }
}