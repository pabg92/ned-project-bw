-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  position TEXT,
  hiring_needs TEXT,
  logo_url TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX idx_company_profiles_is_verified ON company_profiles(is_verified);

-- Enable RLS
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all company profiles
CREATE POLICY "Company profiles are viewable by all" ON company_profiles
  FOR SELECT USING (true);

-- Users can only update their own company profile
CREATE POLICY "Users can update own company profile" ON company_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can insert their own company profile
CREATE POLICY "Users can insert own company profile" ON company_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();