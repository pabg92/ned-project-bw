-- Fix the audit log foreign key constraint to work with TEXT user IDs
-- The issue is that user_audit_logs expects UUID but our users table uses TEXT IDs

-- 1. First, drop the existing foreign key constraint
ALTER TABLE user_audit_logs 
DROP CONSTRAINT IF EXISTS user_audit_logs_user_id_fkey;

-- 2. Change the user_id column type from UUID to TEXT to match the users table
ALTER TABLE user_audit_logs 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. Change the admin_id column type from UUID to TEXT as well (since admins are also users)
ALTER TABLE user_audit_logs 
ALTER COLUMN admin_id TYPE TEXT USING admin_id::TEXT;

-- 4. Change the record_id to TEXT as well since it references user IDs
ALTER TABLE user_audit_logs 
ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;

-- 5. Re-add the foreign key constraints with the correct types
ALTER TABLE user_audit_logs 
ADD CONSTRAINT user_audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_audit_logs 
ADD CONSTRAINT user_audit_logs_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- 6. Update the audit trigger function to handle TEXT IDs
CREATE OR REPLACE FUNCTION audit_user_changes() RETURNS TRIGGER AS $$
DECLARE
    audit_action VARCHAR(50);
    admin_user_id TEXT;  -- Changed from UUID to TEXT
    old_record JSONB;
    new_record JSONB;
    changes JSONB;
    is_self_service BOOLEAN;
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
        
        -- Check for specific action types
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
    
    -- Get the admin user ID from the current session (may be NULL)
    -- No need to cast to UUID anymore
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
        -- check if this might be a user updating their own record
        IF TG_TABLE_NAME = 'users' AND TG_OP IN ('INSERT', 'UPDATE') THEN
            -- For users table, allow if it's a new user or user updating themselves
            IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.id = NEW.id) THEN
                is_self_service := true;
            END IF;
        ELSIF TG_TABLE_NAME = 'candidate_profiles' AND TG_OP IN ('INSERT', 'UPDATE') THEN
            -- For candidate_profiles, allow if it's their own profile
            is_self_service := true;
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
        CASE 
            WHEN TG_TABLE_NAME = 'users' THEN COALESCE(NEW.id, OLD.id)
            WHEN TG_TABLE_NAME = 'candidate_profiles' THEN COALESCE(NEW.user_id, OLD.user_id)
            ELSE COALESCE(NEW.id, OLD.id)
        END,
        admin_user_id,  -- Can be NULL for self-service
        audit_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id)::TEXT,
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

-- 7. Add comment explaining the fix
COMMENT ON TABLE user_audit_logs IS 'Audit trail for all user-related operations. Uses TEXT IDs to match the users table. admin_id is NULL for self-service operations like signup.';