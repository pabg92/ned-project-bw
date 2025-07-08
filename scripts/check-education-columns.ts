import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEducationColumns() {
  console.log('Checking education table structure...\n');

  // Check table structure using information_schema
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'education' });

  if (error) {
    console.log('Using alternative method...');
    // Try getting a sample row
    const { data: sample, error: sampleError } = await supabase
      .from('education')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Error:', sampleError);
    } else if (sample && sample.length > 0) {
      console.log('Education table columns:');
      Object.keys(sample[0]).forEach(col => {
        console.log(`- ${col}`);
      });
    } else {
      console.log('No education records found');
    }
  } else {
    console.log('Education table columns:', data);
  }

  // Also check from databasedoc.md
  console.log('\nFrom documentation, education table should have:');
  console.log('- id, candidate_id, institution, degree, field_of_study, start_year, end_year, achievements, created_at, updated_at');
}

checkEducationColumns().catch(console.error);