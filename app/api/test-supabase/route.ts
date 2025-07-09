import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getSupabaseAdminClient } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    },
    tests: {
      clientImport: 'pending',
      clientFunction: 'pending',
      serverFunction: 'pending',
      query: 'pending',
    },
    errors: [] as any[],
  };

  // Test 1: Try using the imported supabaseAdmin
  try {
    const { data, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      results.tests.clientImport = 'failed';
      results.errors.push({ test: 'clientImport', error: error.message });
    } else {
      results.tests.clientImport = 'success';
    }
  } catch (err: any) {
    results.tests.clientImport = 'error';
    results.errors.push({ test: 'clientImport', error: err.message });
  }

  // Test 2: Try using getSupabaseAdminClient
  try {
    const client = getSupabaseAdminClient();
    const { data, error } = await client
      .from('candidate_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      results.tests.clientFunction = 'failed';
      results.errors.push({ test: 'clientFunction', error: error.message });
    } else {
      results.tests.clientFunction = 'success';
    }
  } catch (err: any) {
    results.tests.clientFunction = 'error';
    results.errors.push({ test: 'clientFunction', error: err.message });
  }

  // Test 3: Try using server function
  try {
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from('candidate_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      results.tests.serverFunction = 'failed';
      results.errors.push({ test: 'serverFunction', error: error.message });
    } else {
      results.tests.serverFunction = 'success';
    }
  } catch (err: any) {
    results.tests.serverFunction = 'error';
    results.errors.push({ test: 'serverFunction', error: err.message });
  }

  // Test 4: Direct query test
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error(`Missing env vars: URL=${!!url}, KEY=${!!key}`);
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    const directClient = createClient(url, key);
    
    const { data, error } = await directClient
      .from('candidate_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      results.tests.query = 'failed';
      results.errors.push({ test: 'query', error: error.message });
    } else {
      results.tests.query = 'success';
    }
  } catch (err: any) {
    results.tests.query = 'error';
    results.errors.push({ test: 'query', error: err.message });
  }

  return NextResponse.json(results, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}