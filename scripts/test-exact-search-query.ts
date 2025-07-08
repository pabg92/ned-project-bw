import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testExactSearchQuery() {
  console.log('Testing exact search query from API...\n');

  try {
    // Exact query from search API
    const { data, error, count } = await supabase
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
        salary_min,
        salary_max,
        salary_currency,
        is_active,
        profile_completed,
        private_metadata,
        public_metadata,
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
          start_date,
          end_date
        ),
        candidate_tags(
          id,
          tag_id,
          tags(
            id,
            name,
            type
          )
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
      console.log('Total count:', count);
      
      if (data && data.length > 0) {
        console.log('\nFirst profile:');
        console.log('- ID:', data[0].id);
        console.log('- Title:', data[0].title);
        console.log('- User:', data[0].users?.email);
        console.log('- Work experiences:', data[0].work_experiences?.length || 0);
        console.log('- Education:', data[0].education?.length || 0);
        console.log('- Tags:', data[0].candidate_tags?.length || 0);
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testExactSearchQuery().catch(console.error);