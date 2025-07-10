import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enrichProfileWithPEData() {
  console.log('Enriching profile with PE-relevant data...\n');
  
  const profileId = '333590b2-2672-45a8-a560-cce2d1faf3db';
  
  // Get current profile data
  const { data: profile, error } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', profileId)
    .single();
  
  if (error || !profile) {
    console.error('Error fetching profile:', error);
    return;
  }
  
  // Parse existing admin notes
  let adminData = {};
  try {
    adminData = JSON.parse(profile.admin_notes || '{}');
  } catch (e) {
    console.log('Could not parse admin notes');
  }
  
  // Add sample deal experiences (as would come from new signup form)
  const dealExperiences = [
    {
      dealType: "acquisition",
      dealValue: "450",
      dealCurrency: "GBP",
      companyName: "StreamTech Media",
      role: "board-oversight",
      year: "2023",
      description: "Led board oversight of £450M acquisition of StreamTech Media by private equity consortium. Negotiated key terms including management incentive plans and governance structure. Deal resulted in successful integration and 35% EBITDA growth within 18 months.",
      sector: "Media & Technology"
    },
    {
      dealType: "leveraged-buyout",
      dealValue: "280",
      dealCurrency: "GBP",
      companyName: "Digital Content Studios",
      role: "led-transaction",
      year: "2022",
      description: "As CEO, led management buyout backed by PE firm. Structured deal to retain key talent and accelerate digital transformation. Achieved 3.2x return for investors upon exit to strategic buyer after 3 years.",
      sector: "Digital Media"
    },
    {
      dealType: "divestiture",
      dealValue: "120",
      dealCurrency: "GBP",
      companyName: "Legacy Print Division",
      role: "advisor",
      year: "2021",
      description: "Advised on divestiture of non-core print assets to focus on digital growth. Maximized value through competitive process and strategic positioning. Proceeds reinvested in high-growth streaming platform acquisition.",
      sector: "Publishing"
    }
  ];
  
  // Add board committee experience
  const boardCommittees = ['audit', 'remuneration', 'strategy'];
  
  // Update admin notes with enriched data
  const enrichedAdminNotes = {
    ...adminData,
    dealExperiences,
    boardCommittees,
    boardExperienceTypes: ['ftse250', 'private-equity', 'startup'],
    // Add more board positions to show variety
    boardPositionsData: [
      ...(adminData.boardPositionsData || []),
      {
        title: "Non-Executive Director",
        companyName: "Apex Digital Holdings",
        companyType: "private-equity",
        location: "London, UK",
        startDate: "2021-01",
        endDate: null,
        isCurrent: true,
        description: "Chair of Audit Committee. PE-backed digital transformation specialist. Led governance improvements resulting in successful £800M exit to strategic buyer.",
        isBoardPosition: true
      },
      {
        title: "Senior Independent Director",
        companyName: "MediaTech Innovation PLC",
        companyType: "aim",
        location: "Manchester, UK", 
        startDate: "2020-03",
        endDate: null,
        isCurrent: true,
        description: "Chair of Remuneration Committee. AIM-listed martech company. Guided strategic pivot to SaaS model, increasing ARR by 250% over 3 years.",
        isBoardPosition: true
      }
    ]
  };
  
  // Update the profile
  const { error: updateError } = await supabase
    .from('candidate_profiles')
    .update({
      admin_notes: JSON.stringify(enrichedAdminNotes)
    })
    .eq('id', profileId);
  
  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }
  
  // Also update private metadata with the committee data
  const updatedMetadata = {
    ...profile.private_metadata,
    boardCommittees,
    dealExperiences,
    boardExperienceTypes: ['ftse250', 'private-equity', 'startup']
  };
  
  await supabase
    .from('candidate_profiles')
    .update({
      private_metadata: updatedMetadata
    })
    .eq('id', profileId);
  
  // Insert the new board positions as work experiences
  const newWorkExperiences = enrichedAdminNotes.boardPositionsData
    .filter((pos: any) => pos.companyName !== 'Champions UK PLC') // Skip existing
    .map((pos: any) => ({
      candidate_id: profileId,
      company_name: pos.companyName,
      position: pos.title,
      location: pos.location,
      start_date: pos.startDate ? `${pos.startDate}-01` : null,
      end_date: pos.endDate ? `${pos.endDate}-01` : null,
      is_current: pos.isCurrent || false,
      description: pos.description,
      is_board_position: true,
      company_type: pos.companyType
    }));
  
  if (newWorkExperiences.length > 0) {
    const { error: workExpError } = await supabase
      .from('work_experiences')
      .insert(newWorkExperiences);
    
    if (workExpError) {
      console.error('Error inserting work experiences:', workExpError);
    } else {
      console.log(`Added ${newWorkExperiences.length} new board positions`);
    }
  }
  
  console.log('\n✅ Profile enriched with PE-relevant data!');
  console.log('\nAdded:');
  console.log(`- ${dealExperiences.length} deal experiences`);
  console.log(`- ${boardCommittees.length} committee memberships`);
  console.log(`- ${newWorkExperiences.length} additional board positions`);
  console.log('\nView the enriched profile at: http://localhost:3000/search/333590b2-2672-45a8-a560-cce2d1faf3db');
}

enrichProfileWithPEData();