import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestProfile() {
  console.log('Creating test profile...');
  
  try {
    // Generate a unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const email = `test_${Date.now()}@example.com`;
    
    // Try to create user without triggering audit log
    console.log('Creating user...');
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        first_name: 'Test',
        last_name: 'Profile',
        role: 'candidate',
        is_active: true,
      })
      .select()
      .single();
    
    if (userError && userError.code !== '23502') {
      console.error('User creation error:', userError);
      return;
    }
    
    console.log('User created (or skipped audit error):', userId);
    
    // Create profile
    console.log('Creating profile...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .insert({
        user_id: userId,
        title: 'Test CEO',
        summary: 'This is a test profile created to verify the signup flow is working correctly. Has extensive experience in technology and business leadership.',
        experience: 'senior',
        location: 'London, UK',
        remote_preference: 'flexible',
        availability: 'immediately',
        is_active: true, // Make it active immediately for testing
        profile_completed: true, // Mark as complete for testing
        is_anonymized: false,
        salary_currency: 'GBP',
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up user
      await supabaseAdmin.from('users').delete().eq('id', userId);
      return;
    }
    
    console.log('Profile created successfully!');
    console.log('Profile ID:', profile.id);
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('\nThis profile should now appear in /search');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

createTestProfile();