-- Simple update to activate all profiles
-- This bypasses any trigger issues

-- Temporarily disable triggers for this update
SET session_replication_role = 'replica';

-- Update all candidate profiles to be active and complete
UPDATE candidate_profiles 
SET 
    is_active = true,
    profile_completed = true,
    updated_at = NOW();

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Show the results
SELECT 
    COUNT(*) as total_profiles,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_profiles,
    SUM(CASE WHEN profile_completed = true THEN 1 ELSE 0 END) as completed_profiles
FROM candidate_profiles;