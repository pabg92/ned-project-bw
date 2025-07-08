-- Complete fix for audit system to support public signups
-- This migration fixes all issues with the audit trigger

-- 1. First ensure the audit log columns are TEXT type (not UUID)
DO $$ 
BEGIN
    -- Check if user_id is still UUID and convert if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_audit_logs' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE user_audit_logs ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
    
    -- Check if admin_id is still UUID and convert if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_audit_logs' 
        AND column_name = 'admin_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE user_audit_logs ALTER COLUMN admin_id TYPE TEXT USING admin_id::TEXT;
    END IF;
    
    -- Check if record_id is still UUID and convert if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_audit_logs' 
        AND column_name = 'record_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE user_audit_logs ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;
    END IF;
END $$;

-- 2. Drop and recreate foreign key constraints with correct types
ALTER TABLE user_audit_logs DROP CONSTRAINT IF EXISTS user_audit_logs_user_id_fkey;
ALTER TABLE user_audit_logs DROP CONSTRAINT IF EXISTS user_audit_logs_admin_id_fkey;

ALTER TABLE user_audit_logs 
ADD CONSTRAINT user_audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_audit_logs 
ADD CONSTRAINT user_audit_logs_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Fix the trigger function to handle the users table correctly
CREATE OR REPLACE FUNCTION audit_user_changes() RETURNS TRIGGER AS $$
DECLARE
    audit_action VARCHAR(50);
    admin_user_id TEXT;
    old_record JSONB;
    new_record JSONB;
    changes JSONB;
    is_self_service BOOLEAN;
    target_user_id TEXT;
    target_record_id TEXT;
BEGIN
    -- Determine the action
    IF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        old_record := to_jsonb(OLD);
        new_record := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        audit_action := 'CREATE';
        old_record := NULL;
        new_record := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action := 'UPDATE';
        old_record := to_jsonb(OLD);
        new_record := to_jsonb(NEW);
        
        -- Check for specific action types (only for users table)
        IF TG_TABLE_NAME = 'users' THEN
            IF OLD.role IS DISTINCT FROM NEW.role THEN
                audit_action := 'ROLE_CHANGE';
            ELSIF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
                audit_action := 'STATUS_CHANGE';
            ELSIF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
                audit_action := 'SOFT_DELETE';
            ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
                audit_action := 'RESTORE';
            END IF;
        END IF;
    END IF;
    
    -- Get the admin user ID from the current session (may be NULL)
    admin_user_id := current_setting('app.current_user_id', true);
    
    -- Check if this is a self-service operation
    BEGIN
        is_self_service := current_setting('app.is_self_service', true)::BOOLEAN;
    EXCEPTION
        WHEN OTHERS THEN
            is_self_service := false;
    END;
    
    -- For self-service operations (signup), admin_id can be NULL
    IF admin_user_id IS NULL AND NOT COALESCE(is_self_service, false) THEN
        -- If not explicitly marked as self-service and no admin_id, 
        -- assume self-service for INSERT operations
        IF TG_OP = 'INSERT' THEN
            is_self_service := true;
        ELSIF TG_OP = 'UPDATE' THEN
            -- For updates, check if user is updating their own record
            IF TG_TABLE_NAME = 'users' AND OLD.id = NEW.id THEN
                is_self_service := true;
            ELSIF TG_TABLE_NAME = 'candidate_profiles' THEN
                is_self_service := true;
            END IF;
        END IF;
    END IF;
    
    -- Calculate changes for updates
    IF TG_OP = 'UPDATE' THEN
        SELECT jsonb_object_agg(key, jsonb_build_object('old', old_value, 'new', new_value))
        INTO changes
        FROM (
            SELECT key, old_record->key as old_value, new_record->key as new_value
            FROM jsonb_object_keys(old_record) AS key
            WHERE old_record->key IS DISTINCT FROM new_record->key
        ) AS diff;
    END IF;
    
    -- Determine the user_id and record_id based on the table
    IF TG_TABLE_NAME = 'users' THEN
        -- For users table, user_id and record_id are the same (the user's ID)
        IF TG_OP = 'DELETE' THEN
            target_user_id := OLD.id;
            target_record_id := OLD.id;
        ELSE
            target_user_id := NEW.id;
            target_record_id := NEW.id;
        END IF;
    ELSIF TG_TABLE_NAME = 'candidate_profiles' THEN
        -- For candidate_profiles, user_id comes from the user_id column
        IF TG_OP = 'DELETE' THEN
            target_user_id := OLD.user_id;
            target_record_id := OLD.id;
        ELSE
            target_user_id := NEW.user_id;
            target_record_id := NEW.id;
        END IF;
    ELSE
        -- For any other tables (shouldn't happen but just in case)
        IF TG_OP = 'DELETE' THEN
            target_user_id := OLD.id;
            target_record_id := OLD.id;
        ELSE
            target_user_id := NEW.id;
            target_record_id := NEW.id;
        END IF;
    END IF;
    
    -- Insert audit log
    INSERT INTO user_audit_logs (
        user_id,
        admin_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        changes,
        metadata
    ) VALUES (
        target_user_id,
        admin_user_id,  -- Can be NULL for self-service
        audit_action,
        TG_TABLE_NAME,
        target_record_id,
        old_record,
        new_record,
        changes,
        jsonb_build_object(
            'timestamp', NOW(),
            'schema', TG_TABLE_SCHEMA,
            'operation', TG_OP,
            'is_self_service', COALESCE(is_self_service, false),
            'source', CASE 
                WHEN admin_user_id IS NOT NULL THEN 'admin'
                WHEN is_self_service THEN 'self_service'
                ELSE 'system'
            END
        )
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure the trigger is attached to the correct tables
DROP TRIGGER IF EXISTS audit_users_changes ON users;
DROP TRIGGER IF EXISTS audit_candidate_profiles_changes ON candidate_profiles;

CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

CREATE TRIGGER audit_candidate_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

-- 5. Add helpful comments
COMMENT ON FUNCTION audit_user_changes() IS 'Fixed audit trigger that correctly handles user_id extraction for both users and candidate_profiles tables';
COMMENT ON TABLE user_audit_logs IS 'Audit trail with TEXT IDs matching users table. Supports self-service operations with NULL admin_id';