import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function activateProfiles() {
  console.log('🔧 Activating specific candidate profiles...\n');

  const targetProfiles = [
    'bf6915cc-3b5e-4808-82d3-2467e477f427',
    '0487cc77-af64-4c69-b8cb-a670c1243810'
  ];

  try {
    // Update the specific profiles to be active and complete
    for (const profileId of targetProfiles) {
      console.log(`Activating profile ${profileId}...`);

      const { data, error } = await supabase
        .from('candidate_profiles')
        .update({
          is_active: true,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select();

      if (error) {
        console.error(`  ❌ Failed to activate profile:`, error.message);
        console.error('  Full error:', error);
      } else {
        console.log(`  ✅ Profile activated successfully`);
        console.log(`  Data:`, data);
      }
    }

    // Now let's check if there are any board-related columns
    console.log('\n🔍 Checking for board-related columns...\n');
    
    const { data: profiles } = await supabase
      .from('candidate_profiles')
      .select('*')
      .in('id', targetProfiles);

    if (profiles && profiles.length > 0) {
      const sampleProfile = profiles[0];
      const columns = Object.keys(sampleProfile);
      console.log('Available columns:', columns);
      
      // Check for board-related columns
      const boardColumns = columns.filter(col => col.includes('board'));
      if (boardColumns.length > 0) {
        console.log('Board-related columns found:', boardColumns);
      }
    }

    // Test the search query
    console.log('\n🧪 Testing search query...\n');

    const { data: searchResults, error: searchError } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        summary,
        is_active,
        profile_completed
      `)
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (searchError) {
      console.error('Search error:', searchError);
    } else {
      console.log(`Found ${searchResults?.length || 0} active and complete profiles`);
      searchResults?.forEach(profile => {
        console.log(`- ${profile.id}: ${profile.title || 'No title'}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the activation
activateProfiles()
  .then(() => {
    console.log('\n✅ Activation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run activation:', error);
    process.exit(1);
  });