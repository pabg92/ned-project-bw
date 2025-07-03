import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

// Supabase client for auth and storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Use Supabase pooler endpoint for better connectivity
// The pooler endpoint format is: postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const projectRef = 'jldpcxaapdncynnvibkv';
const password = 'wcpxz7?*#HeT?c!'; // Decoded password
const poolerUrl = `postgres://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

// Database connection for Drizzle ORM
const client = postgres(poolerUrl, { 
  ssl: 'require',
  prepare: false,
  max: 10,
});
export const db = drizzle(client, { schema });

// Types
export type Database = typeof schema;