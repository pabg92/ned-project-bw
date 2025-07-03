-- Admin functionality database schema extensions
-- Task 18.2: Extend Database Schema for Admin Functionality

-- 1. User Audit Logs Table
-- Tracks all changes made to user records
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, RESTORE, ROLE_CHANGE, STATUS_CHANGE
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changes JSONB, -- Computed diff between old and new
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB, -- Additional context (reason, notes, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_user_audit_logs_user_id ON user_audit_logs(user_id);
CREATE INDEX idx_user_audit_logs_admin_id ON user_audit_logs(admin_id);
CREATE INDEX idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC);
CREATE INDEX idx_user_audit_logs_table_record ON user_audit_logs(table_name, record_id);

-- 2. User Versions Table
-- Stores historical versions of user profiles
CREATE TABLE IF NOT EXISTS user_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    version_number INTEGER NOT NULL,
    -- User table fields snapshot
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    public_metadata JSONB,
    private_metadata JSONB,
    -- Version metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ,
    change_reason TEXT,
    UNIQUE(user_id, version_number)
);

-- Indexes for version queries
CREATE INDEX idx_user_versions_user_id ON user_versions(user_id);
CREATE INDEX idx_user_versions_valid_period ON user_versions(user_id, valid_from, valid_to);

-- 3. Candidate Profile Versions Table
-- Stores historical versions of candidate profiles
CREATE TABLE IF NOT EXISTS candidate_profile_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES candidate_profiles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    version_number INTEGER NOT NULL,
    -- Candidate profile fields snapshot
    title VARCHAR(255),
    summary TEXT,
    experience_level VARCHAR(20),
    location VARCHAR(100),
    remote_preference VARCHAR(20),
    availability VARCHAR(20),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(3),
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    is_anonymized BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    public_metadata JSONB,
    private_metadata JSONB,
    -- Version metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ,
    change_reason TEXT,
    UNIQUE(profile_id, version_number)
);

-- Indexes for profile version queries
CREATE INDEX idx_candidate_profile_versions_profile_id ON candidate_profile_versions(profile_id);
CREATE INDEX idx_candidate_profile_versions_user_id ON candidate_profile_versions(user_id);
CREATE INDEX idx_candidate_profile_versions_valid_period ON candidate_profile_versions(profile_id, valid_from, valid_to);

-- 4. Add admin_notes field to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 5. Add soft delete support
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Indexes for soft delete queries
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidate_profiles_deleted_at ON candidate_profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL;

-- 6. Create trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION audit_user_changes() RETURNS TRIGGER AS $$
DECLARE
    audit_action VARCHAR(50);
    admin_user_id UUID;
    old_record JSONB;
    new_record JSONB;
    changes JSONB;
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
    
    -- Get the admin user ID from the current session
    admin_user_id := current_setting('app.current_user_id', true)::UUID;
    
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
        admin_user_id,
        audit_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_record,
        new_record,
        changes,
        jsonb_build_object(
            'timestamp', NOW(),
            'schema', TG_TABLE_SCHEMA,
            'operation', TG_OP
        )
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger function for user versioning
CREATE OR REPLACE FUNCTION version_user_changes() RETURNS TRIGGER AS $$
DECLARE
    new_version_number INTEGER;
    admin_user_id UUID;
BEGIN
    -- Only version on UPDATE
    IF TG_OP != 'UPDATE' THEN
        RETURN NEW;
    END IF;
    
    -- Get the admin user ID from the current session
    admin_user_id := current_setting('app.current_user_id', true)::UUID;
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO new_version_number
    FROM user_versions
    WHERE user_id = NEW.id;
    
    -- Close the previous version
    UPDATE user_versions
    SET valid_to = NOW()
    WHERE user_id = NEW.id
    AND valid_to IS NULL;
    
    -- Insert new version
    INSERT INTO user_versions (
        user_id,
        version_number,
        email,
        first_name,
        last_name,
        role,
        is_active,
        image_url,
        public_metadata,
        private_metadata,
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
        NEW.public_metadata,
        NEW.private_metadata,
        admin_user_id,
        NOW(),
        NOW(),
        current_setting('app.change_reason', true)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger function for candidate profile versioning
CREATE OR REPLACE FUNCTION version_candidate_profile_changes() RETURNS TRIGGER AS $$
DECLARE
    new_version_number INTEGER;
    admin_user_id UUID;
BEGIN
    -- Only version on UPDATE
    IF TG_OP != 'UPDATE' THEN
        RETURN NEW;
    END IF;
    
    -- Get the admin user ID from the current session
    admin_user_id := current_setting('app.current_user_id', true)::UUID;
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO new_version_number
    FROM candidate_profile_versions
    WHERE profile_id = NEW.id;
    
    -- Close the previous version
    UPDATE candidate_profile_versions
    SET valid_to = NOW()
    WHERE profile_id = NEW.id
    AND valid_to IS NULL;
    
    -- Insert new version
    INSERT INTO candidate_profile_versions (
        profile_id,
        user_id,
        version_number,
        title,
        summary,
        experience_level,
        location,
        remote_preference,
        availability,
        salary_min,
        salary_max,
        salary_currency,
        linkedin_url,
        github_url,
        portfolio_url,
        resume_url,
        is_anonymized,
        is_active,
        public_metadata,
        private_metadata,
        created_by,
        created_at,
        valid_from,
        change_reason
    ) VALUES (
        NEW.id,
        NEW.user_id,
        new_version_number,
        NEW.title,
        NEW.summary,
        NEW.experience_level,
        NEW.location,
        NEW.remote_preference,
        NEW.availability,
        NEW.salary_min,
        NEW.salary_max,
        NEW.salary_currency,
        NEW.linkedin_url,
        NEW.github_url,
        NEW.portfolio_url,
        NEW.resume_url,
        NEW.is_anonymized,
        NEW.is_active,
        NEW.public_metadata,
        NEW.private_metadata,
        admin_user_id,
        NOW(),
        NOW(),
        current_setting('app.change_reason', true)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Apply triggers to tables
-- Audit triggers
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

CREATE TRIGGER audit_candidate_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

CREATE TRIGGER audit_companies_changes
    AFTER INSERT OR UPDATE OR DELETE ON companies
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

-- Version triggers
CREATE TRIGGER version_users_changes
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION version_user_changes();

CREATE TRIGGER version_candidate_profiles_changes
    AFTER UPDATE ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION version_candidate_profile_changes();

-- 10. RLS policies for new tables
-- Enable RLS
ALTER TABLE user_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_versions ENABLE ROW LEVEL SECURITY;

-- Audit logs - only admins can read
CREATE POLICY "Admins can read audit logs"
    ON user_audit_logs FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- User versions - admins can read all, users can read their own
CREATE POLICY "Admins can read all user versions"
    ON user_versions FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can read their own versions"
    ON user_versions FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Candidate profile versions - similar to user versions
CREATE POLICY "Admins can read all profile versions"
    ON candidate_profile_versions FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can read their own profile versions"
    ON candidate_profile_versions FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Update existing RLS policies to handle soft deletes
-- This ensures soft-deleted records are hidden from normal queries
CREATE OR REPLACE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_candidate_profiles AS
SELECT * FROM candidate_profiles WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_companies AS
SELECT * FROM companies WHERE deleted_at IS NULL;

-- Grant permissions
GRANT SELECT ON user_audit_logs TO authenticated;
GRANT SELECT ON user_versions TO authenticated;
GRANT SELECT ON candidate_profile_versions TO authenticated;
GRANT SELECT ON active_users TO authenticated;
GRANT SELECT ON active_candidate_profiles TO authenticated;
GRANT SELECT ON active_companies TO authenticated;