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

async function checkDatabaseSchema() {
  console.log('🗂️ Checking database schema...\n');

  try {
    // Test a simple query without joins
    console.log('1️⃣ Testing simple candidate_profiles query...');
    const { data: simpleProfiles, error: simpleError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .limit(2);

    if (simpleError) {
      console.error('Simple query error:', simpleError);
    } else {
      console.log('✅ Simple query successful. Found', simpleProfiles?.length, 'profiles');
    }

    // Test join with users table using different join syntaxes
    console.log('\n2️⃣ Testing join with users table (left join)...');
    const { data: leftJoinData, error: leftJoinError } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        summary,
        users(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .limit(2);

    if (leftJoinError) {
      console.error('Left join error:', leftJoinError);
    } else {
      console.log('✅ Left join successful. Sample data:');
      leftJoinData?.forEach((profile, i) => {
        console.log(`   Profile ${i + 1}:`, {
          id: profile.id,
          user_id: profile.user_id,
          user: profile.users
        });
      });
    }

    // Check foreign key relationships
    console.log('\n3️⃣ Checking foreign key relationships...');
    const { data: fkData, error: fkError } = await supabase.rpc('get_table_relationships', {
      table_name: 'candidate_profiles'
    }).single();

    if (fkError) {
      console.log('Note: Could not fetch FK relationships (this is normal if the function doesn\'t exist)');
    } else {
      console.log('Foreign keys:', fkData);
    }

    // Test the exact query from the search API but without the !inner modifier
    console.log('\n4️⃣ Testing search API query structure (without !inner)...');
    const { data: searchData, error: searchError } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        summary,
        experience,
        location,
        board_positions,
        board_experience,
        actively_seeking,
        available_immediate,
        willing_to_relocate,
        remote_preference,
        availability,
        salary_min,
        salary_max,
        salary_currency,
        is_active,
        profile_completed,
        created_at,
        updated_at,
        linkedin_url,
        github_url,
        portfolio_url,
        resume_url,
        users(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          title,
          location,
          start_date,
          end_date,
          is_current,
          description
        ),
        education(
          id,
          institution,
          degree,
          field_of_study,
          graduation_date
        ),
        candidate_tags(
          id,
          tag_id,
          tags(
            id,
            name,
            category
          )
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(2);

    if (searchError) {
      console.error('Search query error:', searchError);
    } else {
      console.log('✅ Search query successful. Found', searchData?.length, 'active profiles');
      if (searchData && searchData.length > 0) {
        console.log('   Sample profile structure:', {
          id: searchData[0].id,
          hasUser: !!searchData[0].users,
          hasWorkExperiences: Array.isArray(searchData[0].work_experiences),
          hasEducation: Array.isArray(searchData[0].education),
          hasTags: Array.isArray(searchData[0].candidate_tags)
        });
      }
    }

    // Check how many profiles are actually active and complete
    console.log('\n5️⃣ Checking profile statuses...');
    const { count: activeCount } = await supabase
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('profile_completed', true);

    const { count: totalCount } = await supabase
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Profile statistics:`);
    console.log(`   Total profiles: ${totalCount}`);
    console.log(`   Active and complete: ${activeCount}`);
    console.log(`   Inactive or incomplete: ${totalCount - activeCount}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkDatabaseSchema()
  .then(() => {
    console.log('\n✅ Schema check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to run check:', error);
    process.exit(1);
  });