import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addWorkExperiences() {
  try {
    const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
    
    console.log('Adding work experiences for Pablo...');
    
    // Clear existing
    await supabase
      .from('work_experiences')
      .delete()
      .eq('candidate_id', profileId);
    
    const workExperiences = [
      // Board Positions
      {
        candidate_id: profileId,
        company_name: 'TechCorp PLC',
        position: 'Non-Executive Director & Audit Chair',
        start_date: '2020-01-01',
        is_current: true,
        description: 'Leading audit committee through digital transformation and cybersecurity enhancement initiatives.'
      },
      {
        candidate_id: profileId,
        company_name: 'HealthTech Ltd', 
        position: 'Independent Non-Executive Director',
        start_date: '2018-06-01',
        is_current: true,
        description: 'Providing strategic guidance on international expansion and M&A strategy.'
      },
      {
        candidate_id: profileId,
        company_name: 'Sustainable Finance Foundation',
        position: 'Trustee',
        start_date: '2019-03-01',
        is_current: true,
        description: 'Championing ESG integration in financial services sector.'
      },
      // Executive Positions
      {
        candidate_id: profileId,
        company_name: 'Global Finance Corp',
        position: 'Group Chief Financial Officer',
        start_date: '2015-01-01',
        end_date: '2020-12-31',
        is_current: false,
        description: 'Led financial strategy for £5bn revenue financial services group. Delivered 30% cost reduction through digital transformation while improving service quality.'
      },
      {
        candidate_id: profileId,
        company_name: 'Digital Banking PLC',
        position: 'Deputy CFO',
        start_date: '2010-06-01',
        end_date: '2015-01-01',
        is_current: false,
        description: 'Managed £2bn balance sheet transformation and regulatory compliance during major industry changes.'
      }
    ];
    
    const { data, error } = await supabase
      .from('work_experiences')
      .insert(workExperiences)
      .select();
    
    if (error) {
      console.error('Error adding work experiences:', error);
    } else {
      console.log(`✅ Added ${data.length} work experiences!`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  process.exit(0);
}

addWorkExperiences();