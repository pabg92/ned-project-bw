import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfile() {
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('id, admin_notes')
    .eq('id', '333590b2-2672-45a8-a560-cce2d1faf3db')
    .single();
  
  if (profile?.admin_notes) {
    const adminNotes = JSON.parse(profile.admin_notes);
    console.log('Tags in admin_notes:', adminNotes.tags?.length || 0);
    console.log('Sample tags:', adminNotes.tags?.slice(0, 3));
    
    // Check candidate_tags table
    const { data: candidateTags } = await supabase
      .from('candidate_tags')
      .select('tag_id, tags(name, category)')
      .eq('candidate_id', '333590b2-2672-45a8-a560-cce2d1faf3db');
    
    console.log('Tags in candidate_tags table:', candidateTags?.length || 0);
  }
}

checkProfile();