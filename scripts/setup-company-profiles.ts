import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCompanyProfiles() {
  console.log('📦 Setting up company profiles table...\n');
  
  try {
    // Check if table exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'company_profiles')
      .single();
    
    if (tables) {
      console.log('✅ company_profiles table already exists');
      
      // Check structure
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'company_profiles')
        .order('ordinal_position');
        
      console.log('\nTable columns:');
      columns?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ company_profiles table does not exist');
      console.log('\nPlease run this SQL in Supabase Dashboard:');
      console.log('=====================================');
      console.log(`
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
CREATE POLICY "Company profiles are viewable by all" ON company_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own company profile" ON company_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own company profile" ON company_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
      `);
      console.log('=====================================');
    }
    
    // Check if auth.pg@gmail.com has a company profile
    const { data: authUser } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', 'auth.pg@gmail.com')
      .single();
      
    if (authUser) {
      console.log(`\n🔍 Checking company profile for ${authUser.email}...`);
      
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
        
      if (companyProfile) {
        console.log('✅ Company profile exists:');
        console.log(`  - Company: ${companyProfile.company_name}`);
        console.log(`  - Industry: ${companyProfile.industry}`);
        console.log(`  - Size: ${companyProfile.company_size}`);
      } else {
        console.log('❌ No company profile found');
        console.log('   User needs to complete onboarding at /company-onboarding');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

setupCompanyProfiles().catch(console.error);