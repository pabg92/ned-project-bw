-- Add clerk_id column to users table for Clerk authentication integration
-- This allows mapping between Clerk user IDs and our database user IDs

-- 1. Add the clerk_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 3. Add comment explaining the column
COMMENT ON COLUMN users.clerk_id IS 'Clerk authentication user ID for mapping authenticated users to database records';

-- 4. Update the audit trigger to handle clerk_id changes
-- The existing trigger should already handle this, but let's ensure it's included

-- 5. Create a function to get user by clerk_id (for easier queries)
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(p_clerk_id TEXT)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user users;
BEGIN
    SELECT * INTO v_user
    FROM users
    WHERE clerk_id = p_clerk_id
    AND is_active = true
    AND deleted_at IS NULL
    LIMIT 1;
    
    RETURN v_user;
END;
$$;

-- 6. Create a function to link clerk_id to existing user (for migration)
CREATE OR REPLACE FUNCTION link_clerk_id_to_user(p_clerk_id TEXT, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated BOOLEAN := FALSE;
BEGIN
    -- Update user with matching email if clerk_id is not already set
    UPDATE users
    SET clerk_id = p_clerk_id,
        updated_at = NOW()
    WHERE email = p_email
    AND clerk_id IS NULL
    AND deleted_at IS NULL;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT > 0;
    
    RETURN v_updated;
END;
$$;

-- 7. Add RLS policy for users to read their own data by clerk_id
CREATE POLICY "Users can view own profile by clerk_id" ON users
    FOR SELECT
    USING (
        auth.uid()::TEXT = clerk_id
    );

-- Note: After running this migration, you'll need to:
-- 1. Update the Clerk webhook to populate clerk_id on user creation
-- 2. Run a script to backfill clerk_id for existing users
-- 3. Update the application code to use clerk_id for lookups