import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkExpError() {
  // Try to insert a work experience
  const { data, error } = await supabase
    .from('work_experiences')
    .insert({
      candidate_id: '58842d98-0fd7-4819-93fd-b5c49381a297',
      company_name: 'Test Company',
      position: 'Test Position',
      start_date: '2020-01-01',
      is_current: true,
      is_board_position: false
    })
    .select();
  
  if (error) {
    console.error('Work experience insert error:', error);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
  } else {
    console.log('Success:', data);
  }
}

checkWorkExpError();