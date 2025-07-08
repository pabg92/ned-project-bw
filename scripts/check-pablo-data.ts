import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPabloData() {
  const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
  
  console.log('Checking where Pablo\'s profile data comes from...\n');
  
  // 1. Check profile summary
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('summary, title')
    .eq('id', profileId)
    .single();
  
  console.log('📝 Profile Summary (from candidate_profiles table):');
  console.log(`Title: ${profile?.title}`);
  console.log(`Bio: ${profile?.summary?.substring(0, 100)}...\n`);
  
  // 2. Check work experiences
  const { data: workExperiences } = await supabase
    .from('work_experiences')
    .select('*')
    .eq('candidate_id', profileId)
    .order('start_date', { ascending: false });
  
  console.log('💼 Work Experiences (from work_experiences table):');
  workExperiences?.forEach(exp => {
    console.log(`- ${exp.position} at ${exp.company_name}`);
    console.log(`  ${exp.start_date} to ${exp.end_date || 'Present'}`);
    console.log(`  "${exp.description}"\n`);
  });
  
  // 3. Check education
  const { data: education } = await supabase
    .from('education')
    .select('*')
    .eq('candidate_id', profileId)
    .order('end_date', { ascending: false });
  
  console.log('🎓 Education (from education table):');
  education?.forEach(edu => {
    console.log(`- ${edu.degree} from ${edu.institution}`);
    console.log(`  Field: ${edu.field_of_study}, Graduated: ${edu.end_date ? new Date(edu.end_date).getFullYear() : 'N/A'}\n`);
  });
  
  // 4. Check tags/skills
  const { data: tags } = await supabase
    .from('candidate_tags')
    .select(`
      tags (
        name,
        type
      )
    `)
    .eq('candidate_id', profileId);
  
  console.log('🏷️ Skills & Expertise (from tags/candidate_tags tables):');
  const skills = tags?.filter(t => t.tags?.type === 'skill').map(t => t.tags?.name);
  const sectors = tags?.filter(t => t.tags?.type === 'industry').map(t => t.tags?.name);
  console.log(`Skills: ${skills?.join(', ')}`);
  console.log(`Sectors: ${sectors?.join(', ')}`);
  
  console.log('\n📌 Summary: All this data is stored in the Supabase database');
  console.log('When a new user signs up, they would provide this information in the signup form');
  console.log('and it would be stored in these same database tables.');
}

checkPabloData();