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

async function activatePabloProfiles() {
  console.log('Activating Pablo profiles...');
  
  try {
    // Find all profiles with Pablo in the name
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        is_active,
        profile_completed,
        users!candidate_profiles_user_id_fkey(
          first_name,
          last_name,
          email
        )
      `);
    
    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return;
    }
    
    console.log(`Found ${profiles?.length || 0} total profiles`);
    
    // Filter for Pablo profiles
    const pabloProfiles = profiles?.filter(profile => {
      const firstName = profile.users?.first_name?.toLowerCase() || '';
      const lastName = profile.users?.last_name?.toLowerCase() || '';
      return firstName.includes('pablo') || lastName.includes('pablo');
    }) || [];
    
    console.log(`Found ${pabloProfiles.length} Pablo profiles`);
    
    if (pabloProfiles.length > 0) {
      for (const profile of pabloProfiles) {
        console.log(`\nProfile ${profile.id}:`);
        console.log(`  Name: ${profile.users?.first_name} ${profile.users?.last_name}`);
        console.log(`  Email: ${profile.users?.email}`);
        console.log(`  Current status: active=${profile.is_active}, completed=${profile.profile_completed}`);
        
        // Update to be active and complete
        const { error: updateError } = await supabaseAdmin
          .from('candidate_profiles')
          .update({
            is_active: true,
            profile_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`  Error updating profile: ${updateError.message}`);
        } else {
          console.log(`  ✓ Successfully activated profile`);
        }
      }
    } else {
      console.log('No Pablo profiles found to update');
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Script error:', error);
  }
}

activatePabloProfiles();