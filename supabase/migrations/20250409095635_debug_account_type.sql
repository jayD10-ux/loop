-- First, let's ALWAYS try to create the account type 
DROP TYPE IF EXISTS account_type_enum;

CREATE TYPE account_type_enum AS ENUM ('individual', 'team');

-- Let's create a diagnostic function to check the enum
CREATE OR REPLACE FUNCTION check_account_type_enum() 
RETURNS TEXT AS $$
DECLARE
    enum_exists BOOLEAN;
    result TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'account_type_enum'
    ) INTO enum_exists;
    
    IF enum_exists THEN
        result := 'account_type_enum exists';
    ELSE
        result := 'account_type_enum DOES NOT exist';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
