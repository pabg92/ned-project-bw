-- Manual migration to add clerk_id column to users table
-- Run this in your Supabase SQL editor

-- 1. Add the clerk_id column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- 3. Add comment explaining the column
COMMENT ON COLUMN public.users.clerk_id IS 'Clerk authentication user ID for mapping authenticated users to database records';

-- 4. Update existing users to link with Clerk IDs (if you know them)
-- Example: UPDATE public.users SET clerk_id = 'user_2xxPM7cYdgriSxF3cvcAuTMpiCM' WHERE email = 'john.doe@example.com';