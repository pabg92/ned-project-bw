-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS user_version_trigger ON users;

-- Drop the old function
DROP FUNCTION IF EXISTS version_user_changes() CASCADE;

-- Create a new version function that doesn't reference metadata columns
CREATE OR REPLACE FUNCTION version_user_changes()
RETURNS TRIGGER AS $$
DECLARE
    new_version_number INTEGER;
    admin_user_id TEXT;
BEGIN
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO new_version_number
    FROM user_versions
    WHERE user_id = NEW.id;
    
    -- Get admin user ID from current setting (if set)
    admin_user_id := current_setting('app.current_user_id', true);
    
    -- Insert version record without metadata fields
    INSERT INTO user_versions (
        user_id,
        version_number,
        email,
        first_name,
        last_name,
        role,
        is_active,
        image_url,
        created_by,
        created_at,
        valid_from,
        change_reason
    ) VALUES (
        NEW.id,
        new_version_number,
        NEW.email,
        NEW.first_name,
        NEW.last_name,
        NEW.role,
        NEW.is_active,
        NEW.image_url,
        admin_user_id,
        NOW(),
        NOW(),
        current_setting('app.change_reason', true)
    );
    
    -- Update the previous version's valid_to
    UPDATE user_versions
    SET valid_to = NOW()
    WHERE user_id = NEW.id 
    AND version_number = new_version_number - 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER user_version_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION version_user_changes();

-- Also update the user_versions table to remove metadata columns if they exist
ALTER TABLE user_versions 
DROP COLUMN IF EXISTS public_metadata,
DROP COLUMN IF EXISTS private_metadata;

-- Test the update
UPDATE users 
SET role = 'company',
    first_name = 'Champions UK PLC',
    updated_at = NOW()
WHERE id = 'user_2zgX1opIYbGFN9z1ZiUWTLuayft';

-- Verify the update worked
SELECT id, email, role, first_name FROM users WHERE id = 'user_2zgX1opIYbGFN9z1ZiUWTLuayft';