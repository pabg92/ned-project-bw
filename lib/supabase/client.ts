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
const getDatabaseUrl = () => {
  // Use DATABASE_URL if provided
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // During build or when no URL is set, return a placeholder
  if (!supabaseUrl || supabaseUrl === '' || supabaseUrl.includes('placeholder')) {
    console.log('Using placeholder database URL for build');
    return 'postgres://placeholder:placeholder@localhost:5432/placeholder';
  }
  
  // This should not be reached in production - DATABASE_URL should always be set
  throw new Error('DATABASE_URL environment variable is required');
};

// Create database client conditionally
let db: any;

try {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl.includes('placeholder')) {
    const client = postgres(dbUrl, { 
      ssl: 'require',
      prepare: false,
      max: 10,
    });
    db = drizzle(client, { schema });
  } else {
    // Mock for build time
    db = new Proxy({}, {
      get: () => {
        throw new Error('Database not initialized. Please configure DATABASE_URL.');
      }
    });
  }
} catch (error) {
  console.warn('Database initialization skipped:', error);
  // Provide a mock that throws helpful errors
  db = new Proxy({}, {
    get: () => {
      throw new Error('Database not initialized. Please configure DATABASE_URL.');
    }
  });
}

export { db };

// Types
export type Database = typeof schema;