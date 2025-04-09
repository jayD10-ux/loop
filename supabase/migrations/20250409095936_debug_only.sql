-- Create a diagnostic function that doesn't modify schema but helps us debug
CREATE OR REPLACE FUNCTION debug_database_state() 
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    enum_exists boolean;
    profiles_exists boolean;
    profiles_columns jsonb;
    onboarding_function_exists boolean;
BEGIN
    -- Check if enum exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'account_type_enum'
    ) INTO enum_exists;
    
    -- Check if profiles table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles'
    ) INTO profiles_exists;
    
    -- Get columns from profiles if it exists
    IF profiles_exists THEN
        SELECT jsonb_agg(jsonb_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'udt_name', udt_name
        ))
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        INTO profiles_columns;
    END IF;
    
    -- Check if onboarding function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'complete_onboarding'
    ) INTO onboarding_function_exists;
    
    -- Build result
    result := jsonb_build_object(
        'enum_exists', enum_exists,
        'profiles_exists', profiles_exists,
        'profiles_columns', profiles_columns,
        'onboarding_function_exists', onboarding_function_exists
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
