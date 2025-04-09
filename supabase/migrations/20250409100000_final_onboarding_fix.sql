-- First, create a clear and effective function that avoids using the enum type directly
CREATE OR REPLACE FUNCTION complete_onboarding(
    _user_id UUID,
    _account_type TEXT
) RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Skip type validation and cast, work directly with the text value
    UPDATE profiles
    SET 
        account_type = CASE 
            WHEN _account_type = 'individual' THEN 'individual'::account_type_enum
            WHEN _account_type = 'team' THEN 'team'::account_type_enum
            ELSE NULL
        END,
        has_completed_onboarding = true,
        updated_at = now()
    WHERE id = _user_id;

    -- Check if the update was successful
    IF FOUND THEN
        RETURN jsonb_build_object('success', true);
    ELSE
        -- Try to insert if update fails
        BEGIN
            INSERT INTO profiles (id, account_type, has_completed_onboarding, created_at, updated_at)
            VALUES (
                _user_id, 
                CASE 
                    WHEN _account_type = 'individual' THEN 'individual'::account_type_enum
                    WHEN _account_type = 'team' THEN 'team'::account_type_enum
                    ELSE NULL
                END,
                true, 
                now(), 
                now()
            );
            
            RETURN jsonb_build_object('success', true, 'message', 'Profile created');
        EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', SQLERRM,
                'code', SQLSTATE
            );
        END;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
