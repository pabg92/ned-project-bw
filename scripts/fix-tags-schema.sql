-- Fix tags table schema to match the application requirements
-- Add missing columns if they don't exist

-- Add category column if it doesn't exist
ALTER TABLE tags 
ADD COLUMN IF NOT EXISTS category text;

-- Add is_active column if it doesn't exist (instead of is_verified)
ALTER TABLE tags 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing records to have a category if null
UPDATE tags 
SET category = 'skill' 
WHERE category IS NULL;

-- Make category NOT NULL after setting defaults
ALTER TABLE tags 
ALTER COLUMN category SET NOT NULL;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS tags_category_idx ON tags(category);
CREATE INDEX IF NOT EXISTS tags_active_idx ON tags(is_active);

-- Check if we need to populate some default tags for testing
INSERT INTO tags (name, category, is_active) VALUES
  ('Strategic Planning', 'skill', true),
  ('Financial Management', 'skill', true),
  ('Corporate Governance', 'skill', true),
  ('M&A', 'skill', true),
  ('Risk Management', 'skill', true),
  ('Digital Transformation', 'skill', true),
  ('ESG', 'skill', true),
  ('Private Equity', 'expertise', true),
  ('Board Leadership', 'expertise', true),
  ('Audit Committee', 'expertise', true),
  ('Remuneration Committee', 'expertise', true),
  ('Technology', 'industry', true),
  ('Financial Services', 'industry', true),
  ('Healthcare', 'industry', true),
  ('Retail', 'industry', true),
  ('Energy', 'industry', true),
  ('Manufacturing', 'industry', true)
ON CONFLICT (name) DO UPDATE 
SET category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;

-- View the tags table structure
-- COMMENT ON COLUMN tags.category IS 'Tag category: skill, expertise, industry';