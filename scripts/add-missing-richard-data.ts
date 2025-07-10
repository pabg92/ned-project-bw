import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingData() {
  const profileId = '5f33a969-36c0-4402-84e7-0fffa0577104';
  
  console.log('Adding missing data for Richard Sterling...\n');
  
  // Add deal experiences that were in the original signup
  const dealExperiences = [
    {
      candidate_id: profileId,
      deal_type: 'acquisition',
      deal_value: 1250,
      deal_currency: 'GBP',
      company_name: 'European Tech Holdings',
      role: 'board-oversight',
      year: 2023,
      description: 'Led board oversight of £1.25B acquisition by KKR. Complex cross-border transaction with significant regulatory hurdles. Achieved 25% premium for shareholders.',
      sector: 'Technology'
    },
    {
      candidate_id: profileId,
      deal_type: 'ipo',
      deal_value: 800,
      deal_currency: 'GBP',
      company_name: 'CloudServices International',
      role: 'led-transaction',
      year: 2022,
      description: 'Chaired IPO committee for successful London listing. Oversubscribed by 3x, raised £800M for growth capital. Share price up 65% since listing.',
      sector: 'Cloud Computing'
    },
    {
      candidate_id: profileId,
      deal_type: 'leveraged-buyout',
      deal_value: 550,
      deal_currency: 'GBP',
      company_name: 'Retail Tech Solutions',
      role: 'advisor',
      year: 2021,
      description: 'Senior advisor on £550M LBO by Permira. Structured management incentive plan and post-acquisition integration strategy.',
      sector: 'Retail Technology'
    }
  ];
  
  const { error: dealError } = await supabase
    .from('deal_experiences')
    .insert(dealExperiences);
    
  if (dealError) {
    console.error('Error inserting deals:', dealError);
  } else {
    console.log(`✅ Added ${dealExperiences.length} deal experiences`);
  }
  
  // Add board committees
  const committees = ['audit', 'remuneration', 'risk', 'nomination'].map(c => ({
    candidate_id: profileId,
    committee_type: c
  }));
  
  const { error: committeeError } = await supabase
    .from('board_committees')
    .insert(committees);
    
  if (committeeError) {
    console.error('Error inserting committees:', committeeError);
  } else {
    console.log(`✅ Added ${committees.length} board committees`);
  }
  
  // Add work experiences from private metadata
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('private_metadata')
    .eq('id', profileId)
    .single();
    
  if (profile?.private_metadata?.boardPositionsData) {
    const workExps = profile.private_metadata.boardPositionsData.map((exp: any) => ({
      candidate_id: profileId,
      company_name: exp.companyName,
      position: exp.title,
      location: exp.location || null,
      start_date: exp.startDate ? `${exp.startDate}-01` : null,
      end_date: exp.endDate && exp.endDate !== '' ? `${exp.endDate}-01` : null,
      is_current: exp.isCurrent || false,
      description: exp.description || null,
      is_board_position: true,
      company_type: exp.companyType || null
    }));
    
    const { error: workError } = await supabase
      .from('work_experiences')
      .insert(workExps);
      
    if (workError) {
      console.error('Error inserting work experiences:', workError);
    } else {
      console.log(`✅ Added ${workExps.length} work experiences`);
    }
  }
  
  console.log('\n🎯 Data complete! View the fully populated profile at:');
  console.log(`http://localhost:3000/search/${profileId}`);
}

addMissingData();