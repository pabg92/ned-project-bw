import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPabloProfile() {
  console.log('Fixing Pablo profile to be complete...');
  
  // Update the PabloG profile to be complete (it's already active)
  const { data, error } = await supabase
    .from('candidate_profiles')
    .update({ 
      profile_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', '0487cc77-af64-4c69-b8cb-a670c1243810')
    .select();
    
  if (error) {
    console.error('Error updating profile:', error);
  } else {
    console.log('Profile updated successfully!');
    console.log('The PabloG profile should now appear in /search');
  }
}

fixPabloProfile();