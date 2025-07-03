/**
 * Runtime check for Supabase configuration
 * This helps prevent build-time errors when environment variables are not available
 */
export function checkSupabaseConfig() {
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (isBuildTime) {
    console.warn('Supabase configuration not available during build');
    return false;
  }
  
  const hasConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  if (!hasConfig && process.env.NODE_ENV === 'production') {
    console.error('Missing required Supabase environment variables in production');
  }
  
  return hasConfig;
}

export function assertSupabaseConfig() {
  if (!checkSupabaseConfig() && process.env.NODE_ENV === 'production') {
    throw new Error('Supabase configuration is required in production');
  }
}