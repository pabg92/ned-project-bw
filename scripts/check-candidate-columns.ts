import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCandidateColumns() {
  console.log('Checking candidate_profiles columns...\n');

  // Get one profile to see all columns
  const { data, error } = await supabase
    .from('candidate_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    const profile = data[0];
    console.log('Available columns in candidate_profiles:');
    Object.keys(profile).forEach(column => {
      console.log(`- ${column}: ${typeof profile[column]}`);
    });
  }
}

checkCandidateColumns().catch(console.error);