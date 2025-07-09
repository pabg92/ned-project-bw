import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, validateSupabaseConnection, getSupabaseEnvInfo } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: getSupabaseEnvInfo(),
    keyValidation: {
      format: 'pending',
      connection: 'pending'
    },
    diagnostics: [] as any[],
    recommendation: ''
  };

  // Check key format
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    results.keyValidation.format = 'missing';
    results.recommendation = 'SUPABASE_SERVICE_ROLE_KEY is not set in Vercel environment variables';
  } else {
    // Basic JWT format validation
    const parts = serviceKey.split('.');
    if (parts.length !== 3) {
      results.keyValidation.format = 'invalid';
      results.diagnostics.push({
        issue: 'Invalid JWT format',
        details: `Expected 3 parts, got ${parts.length}`,
        keyPreview: serviceKey.substring(0, 20) + '...'
      });
      results.recommendation = 'The service key does not appear to be a valid JWT. Please check if you copied the entire key.';
    } else if (serviceKey.length < 100) {
      results.keyValidation.format = 'invalid';
      results.diagnostics.push({
        issue: 'Key too short',
        details: `Key length: ${serviceKey.length} characters`,
        expected: 'Typically 200+ characters'
      });
      results.recommendation = 'The service key appears to be truncated. Please copy the entire key from Supabase dashboard.';
    } else {
      results.keyValidation.format = 'valid';
      
      // Try the actual connection
      const connectionTest = await validateSupabaseConnection();
      results.keyValidation.connection = connectionTest.isValid ? 'success' : 'failed';
      
      if (!connectionTest.isValid) {
        results.diagnostics.push({
          issue: 'Connection failed',
          error: connectionTest.error,
          possibleCauses: [
            'Service role key is from a different project',
            'Service role key has been regenerated',
            'Service role key was copied incorrectly',
            'The Supabase URL and service key don\'t match'
          ]
        });
        
        // Check if it's specifically an invalid API key error
        if (connectionTest.error?.includes('Invalid API key')) {
          results.recommendation = 'The service key is being rejected by Supabase. This usually means:\n' +
            '1. The key is from a different Supabase project\n' +
            '2. The key has been regenerated in Supabase dashboard\n' +
            '3. There was an error when copying the key (extra spaces, missing characters)\n\n' +
            'Please go to your Supabase dashboard > Settings > API > Service role key and copy the entire key again.';
        }
      }
    }
  }

  // Additional checks
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && serviceKey) {
    // Extract project ref from URL
    const urlMatch = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (urlMatch) {
      const projectRef = urlMatch[1];
      results.diagnostics.push({
        info: 'Project reference',
        projectRef,
        urlPreview: url.substring(0, 40) + '...'
      });
    }
  }

  // Status code based on results
  const isHealthy = results.keyValidation.format === 'valid' && 
                   results.keyValidation.connection === 'success';

  return NextResponse.json(results, { 
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}