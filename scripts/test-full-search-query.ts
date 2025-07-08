import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFullSearchQuery() {
  console.log('Testing full search query step by step...\n');

  const candidateId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';

  // Test 1: Basic query
  try {
    console.log('1. Basic query with just users...');
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  // Test 2: Add work_experiences
  try {
    console.log('\n2. Adding work_experiences...');
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          position
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
      if (data && data[0]) {
        console.log('Work experiences:', data[0].work_experiences?.length || 0);
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  // Test 3: Add education
  try {
    console.log('\n3. Adding education...');
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          position
        ),
        education(
          id,
          institution,
          degree
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
      if (data && data[0]) {
        console.log('Education entries:', data[0].education?.length || 0);
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  // Test 4: Add candidate_tags
  try {
    console.log('\n4. Adding candidate_tags...');
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          position
        ),
        education(
          id,
          institution,
          degree
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
      .eq('profile_completed', true);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
      if (data && data[0]) {
        console.log('Tags:', data[0].candidate_tags?.length || 0);
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  // Test 5: Full query from search API
  try {
    console.log('\n5. Testing full query from search API...');
    const { data, error, count } = await supabase
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
        users!candidate_profiles_user_id_fkey!inner(
          id,
          email,
          first_name,
          last_name
        ),
        work_experiences(
          id,
          company_name,
          position,
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
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
      console.log('Total count:', count);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testFullSearchQuery().catch(console.error);