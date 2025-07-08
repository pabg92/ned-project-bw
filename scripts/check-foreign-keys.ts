import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkForeignKeys() {
  console.log('Checking foreign key relationships...\n');

  // Test query with explicit foreign key
  try {
    console.log('1. Testing query with explicit foreign key (users!candidate_profiles_user_id_fkey)...');
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        users!candidate_profiles_user_id_fkey(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(1);

    if (error) {
      console.error('Error with explicit foreign key:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  // Test query with !inner join
  try {
    console.log('\n2. Testing query with !inner join...');
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
      .eq('profile_completed', true)
      .limit(1);

    if (error) {
      console.error('Error with !inner join:', error);
    } else {
      console.log('Success! Found:', data?.length || 0, 'profiles');
    }
  } catch (err) {
    console.error('Exception:', err);
  }

  // Check if there are any active profiles
  try {
    console.log('\n3. Checking for active profiles...');
    const { data, error, count } = await supabase
      .from('candidate_profiles')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (error) {
      console.error('Error checking active profiles:', error);
    } else {
      console.log('Found', count, 'active and completed profiles');
      if (data && data.length > 0) {
        console.log('First profile:', {
          id: data[0].id,
          user_id: data[0].user_id,
          title: data[0].title,
          is_active: data[0].is_active,
          profile_completed: data[0].profile_completed
        });
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

checkForeignKeys().catch(console.error);