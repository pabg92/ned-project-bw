import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get environment variables with fallbacks for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a dummy client during build if env vars are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Using placeholder values for build.');
    // Return a dummy URL that won't be used at runtime
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

const createSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase admin environment variables not found. Using placeholder values for build.');
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Supabase client for auth and storage
export const supabase = createSupabaseClient();

// Supabase admin client for server-side operations
export const supabaseAdmin = createSupabaseAdmin();

// Database connection for Drizzle ORM
// Use DATABASE_URL from environment or construct from Supabase URL
const getDatabaseUrl = () => {
  // If DATABASE_URL is provided, use it
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // During build, return a placeholder
  if (!supabaseUrl || supabaseUrl === '') {
    return 'postgres://placeholder:placeholder@localhost:5432/placeholder';
  }
  
  // Extract project ref from Supabase URL for pooler connection
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    throw new Error('Invalid Supabase URL format');
  }
  
  // Construct pooler URL (you'll need to set the password as an env var)
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || '';
  return `postgres://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
};

const dbUrl = getDatabaseUrl();
const client = postgres(dbUrl, { 
  ssl: dbUrl.includes('localhost') ? undefined : 'require',
  prepare: false,
  max: 10,
});
export const db = drizzle(client, { schema });

// Types
export type Database = typeof schema;