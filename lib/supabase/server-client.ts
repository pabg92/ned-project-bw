import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with improved error handling for Vercel
 * This replaces the previous server.ts implementation
 */

// Cache the client to avoid recreating it on every request
let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  // Return cached client if available
  if (cachedClient) {
    return cachedClient;
  }

  // Get environment variables at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate environment variables
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  }

  // Additional validation for the service key format
  if (supabaseServiceKey.length < 100) {
    console.error('Service key appears to be invalid (too short)');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid');
  }

  // Check if the key looks like a JWT (basic check)
  if (!supabaseServiceKey.includes('.')) {
    console.error('Service key does not appear to be a valid JWT');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY format is invalid');
  }

  try {
    // Create the client with minimal configuration
    cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'board-champions-api'
        }
      }
    });

    console.log('[Supabase] Admin client created successfully');
    return cachedClient;
  } catch (error) {
    console.error('[Supabase] Failed to create admin client:', error);
    throw new Error(`Failed to create Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper to validate the connection
export async function validateSupabaseConnection(): Promise<{ isValid: boolean; error?: string }> {
  try {
    const client = getSupabaseAdmin();
    
    // Try a simple query
    const { error } = await client
      .from('candidate_profiles')
      .select('id')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is OK
      return { isValid: false, error: error.message };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper to get environment info for debugging
export function getSupabaseEnvInfo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
  
  return {
    url: url ? url.substring(0, 30) + '...' : 'NOT SET',
    hasServiceKey,
    keyLength,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV
  };
}