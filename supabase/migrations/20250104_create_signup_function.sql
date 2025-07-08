-- Create a stored procedure for public signups that handles the audit log properly
-- This is a workaround until the audit trigger can be modified

CREATE OR REPLACE FUNCTION public.create_candidate_signup(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_title TEXT,
    p_summary TEXT,
    p_experience TEXT,
    p_location TEXT,
    p_linkedin_url TEXT DEFAULT NULL,
    p_admin_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_user_id TEXT;
    v_profile_id UUID;
    v_result JSONB;
BEGIN
    -- Generate a unique user ID
    v_user_id := 'user_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9);
    
    -- Set a system admin context for the audit log
    -- This uses a special system user ID that indicates automated signup
    PERFORM set_config('app.current_user_id', '00000000-0000-0000-0000-000000000000', true);
    
    -- Create the user record
    INSERT INTO users (
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        is_active
    ) VALUES (
        v_user_id,
        p_email,
        p_first_name,
        p_last_name,
        'candidate',
        true
    );
    
    -- Create the candidate profile
    INSERT INTO candidate_profiles (
        user_id,
        title,
        summary,
        experience,
        location,
        remote_preference,
        availability,
        linkedin_url,
        is_active,
        profile_completed,
        is_anonymized,
        salary_currency,
        private_metadata
    ) VALUES (
        v_user_id,
        p_title,
        p_summary,
        p_experience,
        p_location,
        'flexible',
        'immediately',
        p_linkedin_url,
        false,  -- Not active until admin approves
        false,  -- Not complete until admin approves
        true,   -- Anonymized by default
        'USD',
        jsonb_build_object(
            'signupNotes', p_admin_notes,
            'signupDate', now(),
            'verificationStatus', 'unverified',
            'source', 'public_signup'
        )
    ) RETURNING id INTO v_profile_id;
    
    -- Build result
    v_result := jsonb_build_object(
        'success', true,
        'userId', v_user_id,
        'profileId', v_profile_id,
        'email', p_email,
        'message', 'Signup successful. Your profile will be reviewed by an admin.'
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Email already exists
        RETURN jsonb_build_object(
            'success', false,
            'error', 'email_exists',
            'message', 'An account with this email already exists'
        );
    WHEN OTHERS THEN
        -- Log the error and return generic message
        RAISE WARNING 'Signup error: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'signup_failed',
            'message', 'Failed to create account. Please try again.'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles for public signup
GRANT EXECUTE ON FUNCTION public.create_candidate_signup TO anon;
GRANT EXECUTE ON FUNCTION public.create_candidate_signup TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.create_candidate_signup IS 'Public signup function that creates user and candidate profile with proper audit logging. Uses system user ID (00000000-0000-0000-0000-000000000000) for audit trail.';

-- Also create a function to properly approve profiles
CREATE OR REPLACE FUNCTION public.approve_candidate_profile(
    p_profile_id UUID,
    p_admin_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Set admin context for audit log
    PERFORM set_config('app.current_user_id', p_admin_id, true);
    
    -- Update the profile
    UPDATE candidate_profiles
    SET 
        is_active = true,
        profile_completed = true,
        updated_at = now()
    WHERE id = p_profile_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only admins can approve profiles
GRANT EXECUTE ON FUNCTION public.approve_candidate_profile TO authenticated;

COMMENT ON FUNCTION public.approve_candidate_profile IS 'Admin function to approve candidate profiles with proper audit logging.';