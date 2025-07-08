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

async function fixProfiles() {
  console.log('🔧 Fixing candidate profiles...\n');

  const targetProfiles = [
    'bf6915cc-3b5e-4808-82d3-2467e477f427',
    '0487cc77-af64-4c69-b8cb-a670c1243810'
  ];

  try {
    // Since we can't update due to the trigger issue, let's first check what data we have
    const { data: profiles, error: fetchError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .in('id', targetProfiles);

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return;
    }

    console.log('Current profile states:');
    profiles?.forEach(profile => {
      console.log(`\nProfile: ${profile.id}`);
      console.log(`  User ID: ${profile.user_id}`);
      console.log(`  Title: ${profile.title || 'Not set'}`);
      console.log(`  Summary: ${profile.summary ? profile.summary.substring(0, 50) + '...' : 'Not set'}`);
      console.log(`  Experience: ${profile.experience || 'Not set'}`);
      console.log(`  Is Active: ${profile.is_active}`);
      console.log(`  Profile Completed: ${profile.profile_completed}`);
    });

    // Let's also check if the candidate_profile_versions table exists and what columns it has
    console.log('\n\n📊 Checking candidate_profile_versions table...\n');

    const { data: versionSample, error: versionError } = await supabase
      .from('candidate_profile_versions')
      .select('*')
      .limit(1);

    if (versionError) {
      console.log('❌ Error accessing candidate_profile_versions:', versionError.message);
      console.log('\n💡 The versioning trigger is causing issues. You need to fix the trigger function first.');
      console.log('\nSuggested fix:');
      console.log('1. Update the version_candidate_profile_changes() function to use "experience" instead of "experience_level"');
      console.log('2. Or temporarily disable the trigger while updating profiles');
    } else {
      console.log('✅ candidate_profile_versions table exists');
      if (versionSample && versionSample.length > 0) {
        const columns = Object.keys(versionSample[0]);
        console.log('Columns:', columns);
      }
    }

    // Test the API routes directly
    console.log('\n\n🧪 Testing API endpoints...\n');

    // First, let's see what the search API returns
    const searchUrl = `http://localhost:3000/api/search/candidates?page=1&limit=12`;
    console.log(`Testing: GET ${searchUrl}`);
    
    try {
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      console.log(`Status: ${searchResponse.status}`);
      if (searchData.error) {
        console.log(`Error: ${searchData.error}`);
      } else {
        console.log(`Success: ${searchData.success}`);
        console.log(`Total profiles: ${searchData.data?.pagination?.total || 0}`);
      }
    } catch (err) {
      console.log('Could not test API - make sure dev server is running');
    }

    // Now test the admin API for specific profiles
    for (const profileId of targetProfiles) {
      const adminUrl = `http://localhost:3000/api/admin/candidates/${profileId}`;
      console.log(`\nTesting: GET ${adminUrl}`);
      
      try {
        const response = await fetch(adminUrl);
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        if (data.error) {
          console.log(`Error: ${data.error}`);
        } else if (data.data) {
          console.log(`Found profile: ${data.data.title || 'No title'}`);
        }
      } catch (err) {
        console.log('Could not test API - make sure dev server is running');
      }
    }

    console.log('\n\n📝 Summary of issues found:');
    console.log('1. The version_candidate_profile_changes() trigger function references "experience_level" but the column is named "experience"');
    console.log('2. This prevents any updates to the candidate_profiles table');
    console.log('3. The profiles exist but cannot be marked as active/complete due to this trigger');
    console.log('\n🔧 To fix this, you need to:');
    console.log('1. Update the trigger function in the database to use the correct column name');
    console.log('2. Or create a migration that fixes the function');
    console.log('3. Or temporarily disable the trigger, update the profiles, then re-enable it');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the diagnostic
fixProfiles()
  .then(() => {
    console.log('\n✅ Diagnostic complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run diagnostic:', error);
    process.exit(1);
  });