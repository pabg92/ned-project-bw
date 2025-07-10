import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function approveKailum() {
  console.log('Approving Kailum Qualiey...\n');
  
  // Find Kailum's profile
  const { data: profiles, error: profileError } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', 'user_1752067357090_8ze9z96ke')
    .single();

  if (profileError || !profiles) {
    console.error('Error finding Kailum profile:', profileError);
    return;
  }

  console.log('Found profile:', profiles.id, profiles.title);
  console.log('Current status: is_active =', profiles.is_active, ', profile_completed =', profiles.profile_completed);

  // Update the profile to be active and completed
  const { data: updated, error: updateError } = await supabase
    .from('candidate_profiles')
    .update({
      is_active: true,
      profile_completed: true,
      private_metadata: {
        ...profiles.private_metadata,
        approvalStatus: 'approved',
        approvalHistory: [
          ...(profiles.private_metadata?.approvalHistory || []),
          {
            id: `approval_${Date.now()}`,
            action: 'approve',
            reason: 'Approved via script',
            adminId: 'script-admin',
            timestamp: new Date().toISOString(),
            adminName: 'Script Admin'
          }
        ],
        lastUpdatedAt: new Date().toISOString(),
        lastUpdatedBy: 'script-admin'
      }
    })
    .eq('id', profiles.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }

  console.log('\n✅ Successfully approved Kailum Qualiey!');
  console.log('Profile is now active and completed.');
}

approveKailum();