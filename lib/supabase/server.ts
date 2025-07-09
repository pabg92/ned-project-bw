import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for API routes
 * This ensures proper initialization with runtime environment variables
 */

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  return url;
}

function getSupabaseServiceKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return key;
}

// Create admin client for server-side operations
export function createServerSupabaseClient() {
  try {
    const supabaseUrl = getSupabaseUrl();
    const supabaseServiceKey = getSupabaseServiceKey();
    
    console.log('[Supabase Server] Creating client with URL:', supabaseUrl?.substring(0, 30) + '...');
    
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Test the connection
    client.from('_test_connection').select('*').limit(1).then(
      () => console.log('[Supabase Server] Connection test passed'),
      (err) => console.error('[Supabase Server] Connection test failed:', err.message)
    );
    
    return client;
  } catch (error) {
    console.error('[Supabase Server] Failed to create client:', error);
    throw error;
  }
}

// Export a function that creates a new client for each request
export const getSupabaseAdmin = () => createServerSupabaseClient();