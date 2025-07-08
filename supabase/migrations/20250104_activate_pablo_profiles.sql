-- Activate Pablo profiles so they appear in search
-- This is a simple data update, not a schema change

UPDATE candidate_profiles 
SET 
    is_active = true,
    profile_completed = true,
    updated_at = NOW()
WHERE user_id IN ('Pablo', 'PabloG');

-- Verify the update
SELECT 
    cp.id,
    cp.user_id,
    u.first_name,
    u.last_name,
    u.email,
    cp.is_active,
    cp.profile_completed
FROM candidate_profiles cp
JOIN users u ON cp.user_id = u.id
WHERE cp.user_id IN ('Pablo', 'PabloG');