-- Add board-related fields to work_experiences table
ALTER TABLE work_experiences 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS is_board_position boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS company_type text;

-- Add index for board positions
CREATE INDEX IF NOT EXISTS idx_work_experiences_board ON work_experiences(is_board_position);

-- Update existing board positions if we can identify them
UPDATE work_experiences 
SET is_board_position = true 
WHERE title ILIKE '%director%' 
   OR title ILIKE '%chair%' 
   OR title ILIKE '%trustee%'
   OR title ILIKE '%advisor%'
   OR title ILIKE 'NED%'
   OR title ILIKE '%board%';

-- Add comment to clarify company_type values
COMMENT ON COLUMN work_experiences.company_type IS 'Board company type: ftse100, ftse250, aim, private-equity, startup, public-sector, charity';
COMMENT ON COLUMN work_experiences.is_board_position IS 'Whether this is a board position (Director, Chair, Trustee, etc.)';
COMMENT ON COLUMN work_experiences.location IS 'Location of the company/role';