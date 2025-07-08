import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createActiveProfile() {
  console.log('Creating active profile using existing user...');
  
  try {
    // Use one of the existing test users
    const userId = 'test-1748952472892'; // This user already exists
    
    // Create profile for existing user
    const { data: profile, error: profileError } = await supabase
      .from('candidate_profiles')
      .insert({
        user_id: userId,
        title: 'Senior Technology Executive',
        summary: 'Experienced technology leader with 20+ years in enterprise software, digital transformation, and strategic leadership. Proven track record of scaling businesses and leading high-performance teams.',
        experience: 'executive',
        location: 'London, UK',
        remote_preference: 'hybrid',
        availability: 'immediately',
        is_active: true,
        profile_completed: true,
        is_anonymized: false,
        salary_min: '150000',
        salary_max: '250000',
        salary_currency: 'GBP',
        linkedin_url: 'https://linkedin.com/in/testexecutive',
        private_metadata: {
          verificationStatus: 'verified',
          signupDate: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      return;
    }
    
    console.log('Profile created successfully!');
    console.log('Profile ID:', profile.id);
    console.log('User ID:', userId);
    console.log('\nThis profile should now appear in /search immediately');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

createActiveProfile();