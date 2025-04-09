-- First, drop everything related to onboarding to start fresh
DROP FUNCTION IF EXISTS complete_onboarding;
DROP TRIGGER IF EXISTS handle_updated_at ON profiles;
DROP FUNCTION IF EXISTS handle_updated_at;
DROP TABLE IF EXISTS profiles;
DROP TYPE IF EXISTS account_type_enum;

-- Create the account type enum
CREATE TYPE account_type_enum AS ENUM ('individual', 'team');

-- Create the profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    account_type account_type_enum,
    has_completed_onboarding BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create the complete_onboarding function with explicit parameter names
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
