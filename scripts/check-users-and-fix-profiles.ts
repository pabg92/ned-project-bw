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

async function checkUsersAndFixProfiles() {
  console.log('🔍 Checking users and candidate profiles relationship...\n');

  try {
    // First, check the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(20);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Total users found: ${users?.length || 0}`);
    if (users && users.length > 0) {
      console.log('\n📋 Sample users:');
      users.slice(0, 5).forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Role: ${user.role}`);
      });
    }

    // Check candidate profiles that don't have matching users
    const { data: orphanProfiles, error: orphanError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .limit(20);

    if (orphanError) {
      console.error('Error fetching profiles:', orphanError);
      return;
    }

    console.log(`\n\n🔍 Checking which profiles have missing user records...`);

    for (const profile of orphanProfiles || []) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', profile.user_id)
        .single();

      if (error || !user) {
        console.log(`\n❌ Profile ${profile.id} has missing user (user_id: ${profile.user_id})`);
      } else {
        console.log(`\n✅ Profile ${profile.id} has valid user (${user.email})`);
      }
    }

    // Let's create users for the two specific profiles that are having issues
    const problematicProfiles = [
      { id: 'bf6915cc-3b5e-4808-82d3-2467e477f427', user_id: 'user_1751890638610_5bycecsle' },
      { id: '0487cc77-af64-4c69-b8cb-a670c1243810', user_id: 'PabloG' }
    ];

    console.log('\n\n🔧 Creating missing user records for problematic profiles...');

    for (const profile of problematicProfiles) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', profile.user_id)
        .single();

      if (!existingUser) {
        // Create user record
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: profile.user_id,
            email: `${profile.user_id}@example.com`,
            first_name: 'Test',
            last_name: 'User',
            role: 'candidate',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.log(`\n❌ Failed to create user for profile ${profile.id}:`, createError.message);
        } else {
          console.log(`\n✅ Created user for profile ${profile.id}:`, newUser);
        }
      } else {
        console.log(`\n✅ User already exists for profile ${profile.id}`);
      }
    }

    // Also update the candidate profiles with some basic data
    console.log('\n\n📝 Updating candidate profiles with basic data...');

    for (const profile of problematicProfiles) {
      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update({
          first_name: 'Test',
          last_name: 'Candidate',
          email: `${profile.user_id}@example.com`,
          title: 'Senior Software Engineer',
          summary: 'Experienced software engineer with expertise in full-stack development',
          experience: 'senior',
          location: 'San Francisco, CA',
          remote_preference: 'flexible',
          availability: 'immediately',
          status: 'active',
          is_active: true,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        console.log(`\n❌ Failed to update profile ${profile.id}:`, updateError.message);
      } else {
        console.log(`\n✅ Updated profile ${profile.id} with basic data`);
      }
    }

    // Verify the fixes
    console.log('\n\n🔍 Verifying the fixes...');

    for (const profile of problematicProfiles) {
      const { data: fixedProfile, error } = await supabase
        .from('candidate_profiles')
        .select(`
          *,
          users!inner(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('id', profile.id)
        .single();

      if (error) {
        console.log(`\n❌ Profile ${profile.id} still has issues:`, error.message);
      } else if (fixedProfile) {
        console.log(`\n✅ Profile ${profile.id} is now properly linked:`);
        console.log(`   Name: ${fixedProfile.first_name} ${fixedProfile.last_name}`);
        console.log(`   Email: ${fixedProfile.email}`);
        console.log(`   User: ${fixedProfile.users?.email}`);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check and fix
checkUsersAndFixProfiles()
  .then(() => {
    console.log('\n✅ Check and fix complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run check:', error);
    process.exit(1);
  });