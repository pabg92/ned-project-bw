import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function activateAllProfiles() {
  console.log('Activating all candidate profiles...\n');
  
  // Update all profiles to be active and complete
  const { data, error } = await supabase
    .from('candidate_profiles')
    .update({
      is_active: true,
      profile_completed: true,
      updated_at: new Date().toISOString()
    })
    .neq('id', '00000000-0000-0000-0000-000000000000') // This will match all records
    .select('id, user_id');
    
  if (error) {
    console.error('Error updating profiles:', error);
    return;
  }
  
  console.log(`✅ Activated ${data?.length || 0} profiles`);
  
  // Verify the results
  const { data: activeProfiles, error: countError } = await supabase
    .from('candidate_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('profile_completed', true);
    
  if (!countError) {
    console.log(`\nAll ${activeProfiles?.length || 0} profiles are now active and will appear in search!`);
  }
}

activateAllProfiles().catch(console.error);