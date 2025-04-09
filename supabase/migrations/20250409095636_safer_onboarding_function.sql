-- Create a simpler version of the complete_onboarding function that doesn't rely on the enum directly
CREATE OR REPLACE FUNCTION complete_onboarding(
    _user_id UUID,
    _account_type TEXT
) RETURNS jsonb AS $$
DECLARE
    enum_exists BOOLEAN;
    prof_exists BOOLEAN;
    v_result jsonb;
    v_error_details jsonb;
BEGIN
    -- Check if enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'account_type_enum'
    ) INTO enum_exists;
    
    -- Check if profile exists
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = _user_id
    ) INTO prof_exists;
    
    -- Log diagnostic information
    v_error_details := jsonb_build_object(
        'account_type_param', _account_type,
        'enum_exists', enum_exists,
        'profile_exists', prof_exists,
        'timestamp', now()
    );
    
    -- Validate account type
    IF _account_type NOT IN ('individual', 'team') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid account type. Must be either "individual" or "team"',
            'diagnostic', v_error_details
        );
    END IF;

    -- Attempt to update the profile without using the enum directly
    IF enum_exists AND prof_exists THEN
        -- Use the enum since it exists
        UPDATE profiles
        SET 
            account_type = _account_type::account_type_enum,
            has_completed_onboarding = true,
            updated_at = now()
        WHERE id = _user_id;
    ELSIF prof_exists THEN
        -- Fallback: Use TEXT directly since enum doesn't exist
        UPDATE profiles
        SET 
            account_type = _account_type::TEXT,
            has_completed_onboarding = true,
            updated_at = now()
        WHERE id = _user_id;
    ELSE
        -- Profile doesn't exist, let's create it
        INSERT INTO profiles (id, account_type, has_completed_onboarding, created_at, updated_at)
        VALUES (_user_id, _account_type, true, now(), now());
    END IF;

    -- Check if the update was successful
    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'diagnostic', v_error_details
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to update or create profile',
            'diagnostic', v_error_details
        );
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'diagnostic', v_error_details || jsonb_build_object('sql_error_code', SQLSTATE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
