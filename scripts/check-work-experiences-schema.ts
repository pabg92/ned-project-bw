import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  // Get a sample work experience to see the columns
  const { data, error } = await supabase
    .from('work_experiences')
    .select('*')
    .limit(1);
  
  console.log('Work experiences columns:', data ? Object.keys(data[0] || {}) : 'No data');
  console.log('Error:', error);
  
  // Also check if we can query with specific columns
  const { data: testData, error: testError } = await supabase
    .from('work_experiences')
    .select('id, candidate_id, company_name, position, description, start_date, end_date, is_current, created_at, updated_at')
    .limit(1);
  
  console.log('Test query result:', testData);
  console.log('Test query error:', testError);
}

checkSchema();