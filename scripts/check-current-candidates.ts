import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCandidates() {
  console.log('Checking current candidates in database...\n');

  // Get all candidate profiles with the correct user relationship
  const { data: candidates, error } = await supabase
    .from('candidate_profiles')
    .select(`
      *,
      users!candidate_profiles_user_id_fkey(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidates:', error);
    return;
  }

  console.log(`Found ${candidates?.length || 0} candidates:\n`);

  candidates?.forEach((candidate, index) => {
    console.log(`${index + 1}. Candidate ID: ${candidate.id}`);
    console.log(`   User ID: ${candidate.user_id}`);
    console.log(`   Email: ${candidate.users?.email || 'No user record'}`);
    console.log(`   Name: ${candidate.users?.first_name || ''} ${candidate.users?.last_name || ''}`);
    console.log(`   Title: ${candidate.title || 'No title'}`);
    console.log(`   Active: ${candidate.is_active}`);
    console.log(`   Profile Completed: ${candidate.profile_completed}`);
    console.log(`   Created: ${new Date(candidate.created_at).toLocaleString()}`);
    
    const privateMetadata = candidate.private_metadata || {};
    console.log(`   Verification Status: ${privateMetadata.verificationStatus || 'unverified'}`);
    console.log(`   Approval Status: ${privateMetadata.approvalStatus || 'pending'}`);
    console.log('---');
  });

  // Check if there are any candidates without user records
  const orphanedCandidates = candidates?.filter(c => !c.users);
  if (orphanedCandidates?.length) {
    console.log(`\n⚠️  Found ${orphanedCandidates.length} candidates without user records!`);
  }
}

checkCandidates().catch(console.error);