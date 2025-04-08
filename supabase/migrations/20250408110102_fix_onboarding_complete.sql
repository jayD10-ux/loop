-- First drop existing function and type if they exist
DROP FUNCTION IF EXISTS complete_onboarding;
DROP TYPE IF EXISTS account_type_enum;

-- Create the account type enum
CREATE TYPE account_type_enum AS ENUM ('individual', 'team');

-- Recreate the profiles table with proper types
DROP TABLE IF EXISTS profiles;
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

-- Create the complete_onboarding function with explicit parameter names and type casting
CREATE OR REPLACE FUNCTION complete_onboarding(
    _user_id UUID,
    _account_type TEXT
) RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET 
        account_type = _account_type::account_type_enum,
        has_completed_onboarding = true,
        updated_at = now()
    WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create a trigger to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();
