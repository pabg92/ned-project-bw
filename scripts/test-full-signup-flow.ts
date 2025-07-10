import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFullSignupFlow() {
  console.log('Testing full signup flow with PE-relevant data...\n');
  
  // 1. Create a test user
  const testEmail = `test-pe-${Date.now()}@example.com`;
  const userId = `user_${Date.now()}_test`;
  
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: testEmail,
      first_name: 'Sarah',
      last_name: 'Thompson',
      role: 'candidate',
      is_active: true,
    })
    .select()
    .single();

  if (userError) {
    console.error('Failed to create user:', userError);
    return;
  }

  console.log('✅ Created test user:', testEmail);

  // 2. Create candidate profile with rich admin_notes (simulating signup data)
  const signupData = {
    phone: '+44 7700 900123',
    company: 'PE Capital Partners',
    industry: 'Private Equity',
    boardExperience: true,
    boardPositions: 4,
    boardExperienceTypes: ['ftse250', 'private-equity', 'aim'],
    boardCommittees: ['audit', 'remuneration', 'strategy'],
    boardDetails: 'Extensive PE experience with focus on tech sector exits',
    roleTypes: ['ned', 'chair', 'advisor'],
    workExperiences: [
      {
        companyName: 'TechScale Holdings',
        title: 'Non-Executive Director',
        location: 'London, UK',
        startDate: '2021-03',
        endDate: null,
        isCurrent: true,
        description: 'PE-backed scaling tech company. Chair of Remuneration Committee.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'Digital Commerce PLC',
        title: 'Senior Independent Director',
        location: 'London, UK',
        startDate: '2019-06',
        endDate: null,
        isCurrent: true,
        description: 'FTSE 250 e-commerce leader. Member of Audit and Risk Committees.',
        isBoardPosition: true,
        companyType: 'ftse250'
      }
    ],
    dealExperiences: [
      {
        dealType: 'acquisition',
        dealValue: '850',
        dealCurrency: 'GBP',
        companyName: 'CloudTech Solutions',
        role: 'board-oversight',
        year: '2023',
        description: 'Led board oversight of £850M acquisition by Vista Equity Partners. Negotiated management incentive plans and governance structure.',
        sector: 'Enterprise Software'
      },
      {
        dealType: 'ipo',
        dealValue: '1200',
        dealCurrency: 'GBP',
        companyName: 'FinTech Innovations',
        role: 'led-transaction',
        year: '2022',
        description: 'Chaired IPO committee for successful £1.2B London listing. Achieved 40% first-day gains.',
        sector: 'Financial Technology'
      }
    ],
    education: [
      {
        institution: 'Harvard Business School',
        degree: 'MBA',
        fieldOfStudy: 'Finance & Strategy',
        graduationDate: '2005'
      }
    ],
    tags: [
      { name: 'Private Equity', category: 'skill' },
      { name: 'M&A Strategy', category: 'skill' },
      { name: 'Board Governance', category: 'skill' },
      { name: 'Exit Planning', category: 'expertise' },
      { name: 'Technology', category: 'industry' },
      { name: 'Financial Services', category: 'industry' }
    ],
    activelySeeking: true,
    availability: '3months',
    remotePreference: 'hybrid',
    willingToRelocate: false,
    compensationMin: '80000',
    compensationMax: '120000',
    yearsExperience: 18
  };

  const { data: newProfile, error: profileError } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: userId,
      title: 'Senior NED & PE Advisor',
      summary: 'Experienced board director with 18+ years in private equity and public company governance. Specializing in technology sector investments, exits, and value creation strategies. Track record includes 15+ successful exits with average 3.5x returns.',
      experience: 'senior',
      location: 'London, UK',
      remote_preference: 'hybrid',
      availability: '3months',
      linkedin_url: 'https://linkedin.com/in/sarah-thompson-pe',
      is_active: false, // Requires admin approval
      profile_completed: false,
      is_anonymized: true,
      salary_min: 80000,
      salary_max: 120000,
      salary_currency: 'GBP',
      admin_notes: JSON.stringify(signupData),
      private_metadata: {
        signupDate: new Date().toISOString(),
        verificationStatus: 'unverified',
        ...signupData
      }
    })
    .select()
    .single();

  if (profileError) {
    console.error('Failed to create profile:', profileError);
    return;
  }

  console.log('✅ Created candidate profile with PE data');
  console.log('Profile ID:', newProfile.id);

  // 3. Simulate admin approval to trigger processProfileOnApproval
  console.log('\n📋 Simulating admin approval...');
  
  // Import and call processProfileOnApproval directly
  const { processProfileOnApproval } = await import('../lib/services/admin-profile-processor');
  
  const result = await processProfileOnApproval(newProfile.id, 'test-admin');
  
  if (result.success) {
    console.log('✅ Profile processed successfully');
  } else {
    console.error('❌ Profile processing failed:', result.error);
    return;
  }

  // 4. Verify data was properly stored in new tables
  console.log('\n🔍 Verifying data storage...');

  // Check deal experiences
  const { data: deals } = await supabase
    .from('deal_experiences')
    .select('*')
    .eq('candidate_id', newProfile.id);
  
  console.log(`✅ Deal experiences stored: ${deals?.length || 0}`);
  if (deals && deals.length > 0) {
    console.log('  Sample deal:', deals[0].company_name, '-', deals[0].deal_value, deals[0].deal_currency);
  }

  // Check board committees
  const { data: committees } = await supabase
    .from('board_committees')
    .select('*')
    .eq('candidate_id', newProfile.id);
  
  console.log(`✅ Board committees stored: ${committees?.length || 0}`);
  if (committees && committees.length > 0) {
    console.log('  Committees:', committees.map(c => c.committee_type).join(', '));
  }

  // Check board experience types
  const { data: experienceTypes } = await supabase
    .from('board_experience_types')
    .select('*')
    .eq('candidate_id', newProfile.id);
  
  console.log(`✅ Board experience types stored: ${experienceTypes?.length || 0}`);
  if (experienceTypes && experienceTypes.length > 0) {
    console.log('  Types:', experienceTypes.map(t => t.experience_type).join(', '));
  }

  // Check work experiences
  const { data: workExp } = await supabase
    .from('work_experiences')
    .select('*')
    .eq('candidate_id', newProfile.id);
  
  console.log(`✅ Work experiences stored: ${workExp?.length || 0}`);

  // Check tags
  const { data: candidateTags } = await supabase
    .from('candidate_tags')
    .select('*, tags(*)')
    .eq('candidate_id', newProfile.id);
  
  console.log(`✅ Tags stored: ${candidateTags?.length || 0}`);

  console.log('\n🎯 Test complete!');
  console.log(`View the profile at: http://localhost:3000/search/${newProfile.id}`);
  console.log('\nTo fully test:');
  console.log('1. Visit the profile URL above');
  console.log('2. Check that all sections display correctly:');
  console.log('   - Deal experiences in Transaction & Deal Experience section');
  console.log('   - Board committees in Committee Experience section');
  console.log('   - Board experience types (FTSE 250, Private Equity, AIM)');
  console.log('   - Skills in Core Competencies section');
  console.log('   - Work experiences as board positions');
}

testFullSignupFlow().catch(console.error);