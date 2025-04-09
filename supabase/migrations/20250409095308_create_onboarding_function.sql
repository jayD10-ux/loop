-- Create or replace the complete_onboarding function
CREATE OR REPLACE FUNCTION complete_onboarding(
    _user_id UUID,
    _account_type TEXT
) RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Validate account type
    IF _account_type NOT IN ('individual', 'team') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid account type. Must be either "individual" or "team"'
        );
    END IF;

    -- Attempt to update the profile
    UPDATE profiles
    SET 
        account_type = _account_type::account_type_enum,
        has_completed_onboarding = true,
        updated_at = now()
    WHERE id = _user_id;

    -- Check if the update was successful
    IF FOUND THEN
        RETURN jsonb_build_object('success', true);
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profile not found'
        );
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
