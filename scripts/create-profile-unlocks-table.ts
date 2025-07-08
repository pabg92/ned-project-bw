import { config } from 'dotenv';
import path from 'path';
import { supabaseAdmin } from '../lib/supabase/client';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function createProfileUnlocksTable() {
  try {
    console.log('Creating profile_unlocks table...');
    
    // Create the profile_unlocks table
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profile_unlocks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
          credits_used INTEGER NOT NULL DEFAULT 1,
          unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, profile_id)
        );
        
        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_profile_unlocks_user_id ON profile_unlocks(user_id);
        CREATE INDEX IF NOT EXISTS idx_profile_unlocks_profile_id ON profile_unlocks(profile_id);
        CREATE INDEX IF NOT EXISTS idx_profile_unlocks_unlocked_at ON profile_unlocks(unlocked_at);
      `
    });
    
    if (error) {
      console.error('Error creating table:', error);
      return;
    }
    
    console.log('Profile unlocks table created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
createProfileUnlocksTable();