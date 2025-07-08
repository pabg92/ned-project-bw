import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkExpColumns() {
  console.log('Checking work_experiences table columns...\n');

  // Get one work experience to see all columns
  const { data, error } = await supabase
    .from('work_experiences')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    const exp = data[0];
    console.log('Available columns in work_experiences:');
    Object.keys(exp).forEach(column => {
      console.log(`- ${column}: ${typeof exp[column]} = ${exp[column]}`);
    });
  } else {
    console.log('No work experiences found in database');
  }
}

checkWorkExpColumns().catch(console.error);