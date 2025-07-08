-- Fix the version_candidate_profile_changes function to use correct column names
CREATE OR REPLACE FUNCTION public.version_candidate_profile_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_version_number INTEGER;
    admin_user_id TEXT;
BEGIN
    IF TG_OP != 'UPDATE' THEN
        RETURN NEW;
    END IF;
    
    admin_user_id := current_setting('app.current_user_id', true);
    
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO new_version_number
    FROM candidate_profile_versions
    WHERE profile_id = NEW.id;
    
    UPDATE candidate_profile_versions
    SET valid_to = NOW()
    WHERE profile_id = NEW.id
    AND valid_to IS NULL;
    
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
        NEW.experience,  -- Maps from 'experience' column to 'experience_level' in versions table
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
$function$;

-- Now update the candidate profiles to be active and complete
UPDATE candidate_profiles 
SET 
    is_active = true,
    profile_completed = true,
    updated_at = NOW()
WHERE id IN (
    'bf6915cc-3b5e-4808-82d3-2467e477f427',
    '0487cc77-af64-4c69-b8cb-a670c1243810'
);

-- Also update any profiles that have basic required fields filled
UPDATE candidate_profiles 
SET 
    profile_completed = true,
    updated_at = NOW()
WHERE 
    title IS NOT NULL 
    AND summary IS NOT NULL 
    AND experience IS NOT NULL
    AND profile_completed = false;