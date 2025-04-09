-- Create the account type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE account_type_enum AS ENUM ('individual', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
