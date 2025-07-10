-- Create deal_experiences table to store M&A, IPO, PE transactions
CREATE TABLE IF NOT EXISTS deal_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  deal_type VARCHAR(50) NOT NULL, -- acquisition, leveraged-buyout, ipo, divestiture, restructuring, etc.
  deal_value DECIMAL(12, 2), -- Deal value in millions
  deal_currency VARCHAR(3) DEFAULT 'GBP', -- GBP, USD, EUR, etc.
  company_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- led-transaction, board-oversight, advisor, etc.
  year INTEGER NOT NULL,
  description TEXT,
  sector VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for candidate lookup
CREATE INDEX IF NOT EXISTS idx_deal_experiences_candidate_id ON deal_experiences(candidate_id);

-- Create board_committees table to store committee memberships
CREATE TABLE IF NOT EXISTS board_committees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  committee_type VARCHAR(50) NOT NULL, -- audit, remuneration, nomination, risk, strategy, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for candidate lookup
CREATE INDEX IF NOT EXISTS idx_board_committees_candidate_id ON board_committees(candidate_id);

-- Create unique constraint to prevent duplicate committee entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_board_committees_unique ON board_committees(candidate_id, committee_type);

-- Create board_experience_types table to categorize board experience
CREATE TABLE IF NOT EXISTS board_experience_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  experience_type VARCHAR(50) NOT NULL, -- ftse100, ftse250, aim, private-equity, startup, nonprofit, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for candidate lookup
CREATE INDEX IF NOT EXISTS idx_board_experience_types_candidate_id ON board_experience_types(candidate_id);

-- Create unique constraint to prevent duplicate experience type entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_board_experience_types_unique ON board_experience_types(candidate_id, experience_type);

-- Add RLS policies
ALTER TABLE deal_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_experience_types ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON deal_experiences FOR SELECT USING (true);
CREATE POLICY "Public read access" ON board_committees FOR SELECT USING (true);
CREATE POLICY "Public read access" ON board_experience_types FOR SELECT USING (true);

-- Admin write access for all tables
CREATE POLICY "Admin write access" ON deal_experiences FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin write access" ON board_committees FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin write access" ON board_experience_types FOR ALL USING (auth.jwt() ->> 'role' = 'admin');