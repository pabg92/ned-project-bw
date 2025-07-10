-- Fix candidate_tags table schema
-- This ensures the table matches the application schema

-- First check if we need to add the id column
ALTER TABLE candidate_tags 
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY;

-- Add other missing columns if needed
ALTER TABLE candidate_tags
ADD COLUMN IF NOT EXISTS proficiency text,
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS is_endorsed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS candidate_tags_tag_idx ON candidate_tags(tag_id);
CREATE INDEX IF NOT EXISTS candidate_tags_proficiency_idx ON candidate_tags(proficiency);

-- If there's already a primary key on (candidate_id, tag_id), we need to handle it differently
-- This is a safer approach that checks constraints first
DO $$ 
BEGIN
    -- Check if the compound primary key exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'candidate_tags_pkey' 
        AND contype = 'p'
        AND conrelid = 'candidate_tags'::regclass
    ) THEN
        -- Drop the existing primary key if it's not on 'id'
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            WHERE c.conname = 'candidate_tags_pkey' 
            AND c.contype = 'p'
            AND c.conrelid = 'candidate_tags'::regclass
            AND a.attname = 'id'
        ) THEN
            ALTER TABLE candidate_tags DROP CONSTRAINT candidate_tags_pkey;
            -- Add unique constraint for the compound key instead
            ALTER TABLE candidate_tags 
            ADD CONSTRAINT candidate_tags_candidate_tag_unique UNIQUE (candidate_id, tag_id);
        END IF;
    END IF;
END $$;