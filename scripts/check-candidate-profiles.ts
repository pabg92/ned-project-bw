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

async function checkCandidateProfiles() {
  console.log('🔍 Checking candidate profiles in Supabase...\n');

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting profiles:', countError);
      return;
    }

    console.log(`📊 Total candidate profiles: ${count}\n`);

    // Get first 10 records to see the structure
    const { data: profiles, error: profilesError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .limit(10);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log('📋 First few profiles:');
    profiles?.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   User ID: ${profile.user_id}`);
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Status: ${profile.status}`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleDateString()}`);
    });

    // Check for the specific IDs mentioned in the issue
    const problemIds = [
      'bf6915cc-3b5e-4808-82d3-2467e477f427',
      '0487cc77-af64-4c69-b8cb-a670c1243810'
    ];

    console.log('\n\n🔎 Checking for specific IDs mentioned in the issue:');
    
    for (const id of problemIds) {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log(`\n❌ ID ${id}: NOT FOUND in database`);
      } else if (error) {
        console.log(`\n⚠️  ID ${id}: Error - ${error.message}`);
      } else if (data) {
        console.log(`\n✅ ID ${id}: FOUND`);
        console.log(`   Name: ${data.first_name} ${data.last_name}`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Status: ${data.status}`);
      }
    }

    // Also check if these might be user_ids instead of profile ids
    console.log('\n\n🔍 Checking if these might be user_ids instead:');
    
    for (const id of problemIds) {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', id);

      if (data && data.length > 0) {
        console.log(`\n✅ Found as user_id ${id}:`);
        data.forEach(profile => {
          console.log(`   Profile ID: ${profile.id}`);
          console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
        });
      } else {
        console.log(`\n❌ No profiles found with user_id: ${id}`);
      }
    }

    // Get all unique statuses
    const { data: statuses } = await supabase
      .from('candidate_profiles')
      .select('status')
      .order('status');

    const uniqueStatuses = [...new Set(statuses?.map(s => s.status))];
    console.log('\n\n📊 Profile statuses in database:', uniqueStatuses);

    // Count profiles by status
    console.log('\n📈 Profile count by status:');
    for (const status of uniqueStatuses) {
      const { count } = await supabase
        .from('candidate_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      console.log(`   ${status}: ${count} profiles`);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkCandidateProfiles()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run check:', error);
    process.exit(1);
  });