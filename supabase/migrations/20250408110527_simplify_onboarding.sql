-- Drop existing function
DROP FUNCTION IF EXISTS complete_onboarding;

-- Create a simpler version of the function
CREATE OR REPLACE FUNCTION complete_onboarding(
    _user_id UUID,
    _account_type TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH update_result AS (
        UPDATE profiles
        SET 
            account_type = _account_type::account_type_enum,
            has_completed_onboarding = true,
            updated_at = now()
        WHERE id = _user_id
        RETURNING *
    )
    SELECT 
        CASE 
            WHEN (SELECT COUNT(*) FROM update_result) > 0 
            THEN jsonb_build_object('success', true)
            ELSE jsonb_build_object('success', false, 'error', 'Profile not found')
        END INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
