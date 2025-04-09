-- Drop all existing objects to start fresh
DROP FUNCTION IF EXISTS complete_onboarding;
DROP FUNCTION IF EXISTS debug_database_state;
DROP FUNCTION IF EXISTS check_account_type_enum;
DROP TRIGGER IF EXISTS handle_updated_at ON profiles;
DROP FUNCTION IF EXISTS handle_updated_at;
DROP TABLE IF EXISTS profiles;
DROP TYPE IF EXISTS account_type_enum;

-- Create the account type enum
CREATE TYPE account_type_enum AS ENUM ('individual', 'team');

-- Create the profiles table with proper structure
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    account_type account_type_enum,
    has_completed_onboarding BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
    
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create handle_updated_at function
CREATE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create a function to initialize a profile when a user is created
CREATE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the complete_onboarding function
CREATE FUNCTION complete_onboarding(
    user_id UUID,
    account_type TEXT
) RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Update the profile directly without using text to enum casting
    UPDATE profiles
    SET 
        account_type = (
            CASE 
                WHEN account_type = 'individual' THEN 'individual'::account_type_enum
                WHEN account_type = 'team' THEN 'team'::account_type_enum
                ELSE NULL
            END
        ),
        has_completed_onboarding = true,
        updated_at = now()
    WHERE id = user_id;

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
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
