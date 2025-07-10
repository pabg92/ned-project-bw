import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkExperiencesColumns() {
  console.log('Checking work_experiences table structure...\n');
  
  // Get a sample work experience to see the columns
  const { data: workExp, error } = await supabase
    .from('work_experiences')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching work experiences:', error);
    return;
  }
  
  if (workExp && workExp.length > 0) {
    console.log('Work experiences columns:');
    console.log(Object.keys(workExp[0]));
    console.log('\nSample record:');
    console.log(JSON.stringify(workExp[0], null, 2));
  } else {
    console.log('No work experiences found in the table');
  }
}

checkWorkExperiencesColumns();