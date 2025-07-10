-- First, let's see what triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- Drop any trigger that might be causing issues
-- This is a common trigger name that might reference public_metadata
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS on_auth_user_created ON users;
DROP TRIGGER IF EXISTS handle_user_metadata ON users;

-- Create a simple updated_at trigger that doesn't reference metadata
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Test the update
UPDATE users 
SET role = 'company' 
WHERE id = 'user_2zgX1opIYbGFN9z1ZiUWTLuayft';