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

async function fixCandidateProfiles() {
  console.log('🔧 Fixing candidate profiles with correct schema...\n');

  try {
    // First, update all candidate profiles to be active and complete
    const { data: profiles, error: profilesError } = await supabase
      .from('candidate_profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log(`Found ${profiles?.length || 0} candidate profiles to fix\n`);

    // Update each profile to have proper data
    for (const profile of profiles || []) {
      console.log(`Updating profile ${profile.id} (user: ${profile.user_id})...`);

      // Generate some sample data based on the profile
      const updates = {
        title: profile.title || 'Senior Executive',
        summary: profile.summary || 'Experienced executive with proven track record in leadership and strategic management.',
        experience: profile.experience || 'senior',
        location: profile.location || 'London, UK',
        remote_preference: profile.remote_preference || 'flexible',
        availability: profile.availability || 'immediately',
        is_active: true,
        profile_completed: true,
        is_anonymized: false,
        salary_min: profile.salary_min || '100000',
        salary_max: profile.salary_max || '150000',
        salary_currency: profile.salary_currency || 'GBP',
        linkedin_url: profile.linkedin_url || 'https://linkedin.com/in/example',
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update(updates)
        .eq('id', profile.id);

      if (updateError) {
        console.error(`  ❌ Failed to update profile:`, updateError.message);
      } else {
        console.log(`  ✅ Profile updated successfully`);
      }
    }

    // Now let's also create some work experiences for the two specific profiles
    const targetProfiles = [
      'bf6915cc-3b5e-4808-82d3-2467e477f427',
      '0487cc77-af64-4c69-b8cb-a670c1243810'
    ];

    console.log('\n📋 Adding work experiences to key profiles...\n');

    for (const profileId of targetProfiles) {
      // Check if work experiences already exist
      const { data: existingExp, error: expError } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('candidate_id', profileId);

      if (!expError && (!existingExp || existingExp.length === 0)) {
        // Create sample work experience (using correct column names)
        const workExperience = {
          candidate_id: profileId,
          company_name: 'Fortune 500 Company',
          position: 'Chief Executive Officer',
          description: 'Led strategic transformation and delivered 40% revenue growth over 3 years.',
          start_date: '2020-01-01',
          end_date: null,
          is_current: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('work_experiences')
          .insert(workExperience);

        if (insertError) {
          console.error(`❌ Failed to add work experience for ${profileId}:`, insertError.message);
        } else {
          console.log(`✅ Added work experience for profile ${profileId}`);
        }
      } else {
        console.log(`✅ Profile ${profileId} already has ${existingExp?.length || 0} work experiences`);
      }
    }

    // Create some tags if they don't exist
    console.log('\n🏷️ Creating tags...\n');

    const sampleTags = [
      { name: 'Leadership', type: 'skill' },
      { name: 'Strategic Planning', type: 'skill' },
      { name: 'Financial Management', type: 'skill' },
      { name: 'Technology', type: 'industry' },
      { name: 'Finance', type: 'industry' },
      { name: 'Healthcare', type: 'industry' }
    ];

    for (const tag of sampleTags) {
      const { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('name', tag.name)
        .single();

      if (!existingTag) {
        const { error: tagError } = await supabase
          .from('tags')
          .insert({
            name: tag.name,
            type: tag.type,
            created_at: new Date().toISOString()
          });

        if (tagError) {
          console.error(`❌ Failed to create tag ${tag.name}:`, tagError.message);
        } else {
          console.log(`✅ Created tag: ${tag.name} (${tag.type})`);
        }
      } else {
        console.log(`✅ Tag already exists: ${tag.name}`);
      }
    }

    // Add some tags to our target profiles
    console.log('\n🔗 Linking tags to profiles...\n');

    // Get the tag IDs
    const { data: allTags } = await supabase
      .from('tags')
      .select('*');

    if (allTags && allTags.length > 0) {
      for (const profileId of targetProfiles) {
        // Add 2-3 random tags to each profile
        const randomTags = allTags
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        for (const tag of randomTags) {
          const { data: existingLink } = await supabase
            .from('candidate_tags')
            .select('*')
            .eq('candidate_id', profileId)
            .eq('tag_id', tag.id)
            .single();

          if (!existingLink) {
            const { error: linkError } = await supabase
              .from('candidate_tags')
              .insert({
                candidate_id: profileId,
                tag_id: tag.id,
                created_at: new Date().toISOString()
              });

            if (linkError) {
              console.error(`❌ Failed to link tag ${tag.name} to profile:`, linkError.message);
            } else {
              console.log(`✅ Linked tag ${tag.name} to profile ${profileId}`);
            }
          }
        }
      }
    }

    // Verify the fix
    console.log('\n\n🔍 Verifying the fixes...\n');

    const { count: activeCount } = await supabase
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('profile_completed', true);

    console.log(`✅ Active and complete profiles: ${activeCount}`);

    // Test the exact query from the API
    console.log('\n🧪 Testing the API query...\n');

    const { data: testData, error: testError } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        summary,
        experience,
        location,
        remote_preference,
        availability,
        is_active,
        profile_completed,
        users!candidate_profiles_user_id_fkey(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          position,
          description,
          start_date,
          end_date,
          is_current
        ),
        candidate_tags(
          tag_id,
          tags(
            id,
            name,
            type
          )
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(2);

    if (testError) {
      console.error('❌ API query test failed:', testError);
    } else {
      console.log(`✅ API query successful! Found ${testData?.length || 0} profiles`);
      if (testData && testData.length > 0) {
        console.log('\nSample profile:', {
          id: testData[0].id,
          title: testData[0].title,
          user: testData[0].users,
          workExperiences: testData[0].work_experiences?.length || 0,
          tags: testData[0].candidate_tags?.length || 0
        });
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixCandidateProfiles()
  .then(() => {
    console.log('\n✅ Fix complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run fix:', error);
    process.exit(1);
  });