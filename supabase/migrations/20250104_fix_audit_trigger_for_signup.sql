-- Migration to fix audit trigger for public signups
-- This allows users to create their own profiles without requiring an admin_id

-- 1. First, make admin_id nullable in the audit logs table
ALTER TABLE user_audit_logs 
ALTER COLUMN admin_id DROP NOT NULL;

-- 2. Add a comment to clarify when admin_id can be NULL
COMMENT ON COLUMN user_audit_logs.admin_id IS 'Admin who performed the action. NULL for self-service operations like signup.';

-- 3. Drop and recreate the audit function with better NULL handling
CREATE OR REPLACE FUNCTION audit_user_changes() RETURNS TRIGGER AS $$
DECLARE
    audit_action VARCHAR(50);
    admin_user_id UUID;
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
    admin_user_id := current_setting('app.current_user_id', true)::UUID;
    
    -- Check if this is a self-service operation
    is_self_service := current_setting('app.is_self_service', true)::BOOLEAN;
    
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
        COALESCE(NEW.id, OLD.id),
        admin_user_id,  -- Can be NULL for self-service
        audit_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
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

-- 4. Add an index on admin_id that handles NULL values efficiently
DROP INDEX IF EXISTS idx_user_audit_logs_admin_id;
CREATE INDEX idx_user_audit_logs_admin_id ON user_audit_logs(admin_id) WHERE admin_id IS NOT NULL;

-- 5. Add a comment explaining the audit log behavior
COMMENT ON TABLE user_audit_logs IS 'Audit trail for all user-related operations. admin_id is NULL for self-service operations like signup.';

-- 6. Create a helper function for self-service operations
CREATE OR REPLACE FUNCTION set_self_service_context() RETURNS void AS $$
BEGIN
    PERFORM set_config('app.is_self_service', 'true', true);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_self_service_context() IS 'Call this before self-service operations to properly mark audit logs';