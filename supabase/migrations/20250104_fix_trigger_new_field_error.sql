-- Fix the trigger error "record 'new' has no field 'user_id'"
-- This happens when the trigger tries to access NEW.user_id on the users table

CREATE OR REPLACE FUNCTION audit_user_changes() RETURNS TRIGGER AS $$
DECLARE
    audit_action VARCHAR(50);
    admin_user_id TEXT;
    old_record JSONB;
    new_record JSONB;
    changes JSONB;
    is_self_service BOOLEAN;
    target_user_id TEXT;
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
    
    -- Determine the target user ID based on the table
    IF TG_TABLE_NAME = 'users' THEN
        target_user_id := COALESCE(NEW.id, OLD.id);
    ELSIF TG_TABLE_NAME = 'candidate_profiles' THEN
        -- For candidate_profiles table, use the user_id field
        IF TG_OP = 'DELETE' THEN
            target_user_id := OLD.user_id;
        ELSE
            target_user_id := NEW.user_id;
        END IF;
    ELSE
        -- For other tables, use the id field
        target_user_id := COALESCE(NEW.id, OLD.id);
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

-- Add helpful comment
COMMENT ON FUNCTION audit_user_changes() IS 'Audit trigger function that handles both users and candidate_profiles tables correctly, extracting the appropriate user_id for each table';