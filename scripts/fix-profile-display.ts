import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfileDisplay() {
  const profileId = '5f33a969-36c0-4402-84e7-0fffa0577104';
  
  // First, set is_anonymized to false so the name shows
  const { error: updateError } = await supabase
    .from('candidate_profiles')
    .update({
      is_anonymized: false
    })
    .eq('id', profileId);
    
  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }
  
  console.log('✅ Set is_anonymized to false - name should now display');
  
  // Get private metadata to check what data we have
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('private_metadata')
    .eq('id', profileId)
    .single();
    
  if (profile?.private_metadata) {
    console.log('\nPrivate metadata contains:');
    console.log('- Deal experiences:', profile.private_metadata.dealExperiences?.length || 0);
    console.log('- Board committees:', profile.private_metadata.boardCommittees?.length || 0);
    console.log('- Work experiences:', profile.private_metadata.workExperiences?.length || 0);
    
    // Process the missing data
    if (profile.private_metadata.dealExperiences?.length > 0) {
      console.log('\n📊 Processing deal experiences...');
      const deals = profile.private_metadata.dealExperiences.map((deal: any) => ({
        candidate_id: profileId,
        deal_type: deal.dealType,
        deal_value: deal.dealValue ? parseFloat(deal.dealValue) : null,
        deal_currency: deal.dealCurrency || 'GBP',
        company_name: deal.companyName,
        role: deal.role,
        year: parseInt(deal.year),
        description: deal.description || null,
        sector: deal.sector || null
      }));
      
      const { error } = await supabase
        .from('deal_experiences')
        .insert(deals);
        
      if (error) {
        console.error('Error inserting deals:', error);
      } else {
        console.log(`✅ Inserted ${deals.length} deal experiences`);
      }
    }
    
    // Process committees
    if (profile.private_metadata.boardCommittees?.length > 0) {
      console.log('\n🏛️ Processing board committees...');
      const committees = profile.private_metadata.boardCommittees.map((committee: string) => ({
        candidate_id: profileId,
        committee_type: committee.toLowerCase()
      }));
      
      const { error } = await supabase
        .from('board_committees')
        .insert(committees);
        
      if (error) {
        console.error('Error inserting committees:', error);
      } else {
        console.log(`✅ Inserted ${committees.length} board committees`);
      }
    }
    
    // Process work experiences
    if (profile.private_metadata.workExperiences?.length > 0) {
      console.log('\n💼 Processing work experiences...');
      const workExps = profile.private_metadata.workExperiences.map((exp: any, index: number) => ({
        candidate_id: profileId,
        company_name: exp.companyName,
        position: exp.title,
        location: exp.location || null,
        start_date: exp.startDate ? `${exp.startDate}-01` : null,
        end_date: exp.endDate ? `${exp.endDate}-01` : null,
        is_current: exp.isCurrent || false,
        description: exp.description || null,
        is_board_position: exp.isBoardPosition || false,
        company_type: exp.companyType || null
      }));
      
      const { error } = await supabase
        .from('work_experiences')
        .insert(workExps);
        
      if (error) {
        console.error('Error inserting work experiences:', error);
      } else {
        console.log(`✅ Inserted ${workExps.length} work experiences`);
      }
    }
  }
  
  console.log('\n🎯 Profile fixed! View at:');
  console.log(`http://localhost:3000/search/${profileId}`);
}

fixProfileDisplay();