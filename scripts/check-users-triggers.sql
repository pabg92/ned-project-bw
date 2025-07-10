-- Check for triggers on users table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
    AND event_object_table = 'users';

-- Check for RLS policies
SELECT 
    policyname,
    tablename,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- Check function definitions that might reference public_metadata
SELECT 
    proname,
    prosrc
FROM pg_proc
WHERE prosrc LIKE '%public_metadata%';

-- Check the actual table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;