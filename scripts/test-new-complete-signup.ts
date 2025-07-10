import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testNewCompleteSignup() {
  console.log('Creating new comprehensive signup through API...\n');

  // Prepare comprehensive signup data for a PE-experienced board member
  const signupData = {
    // Personal Information
    firstName: 'Victoria',
    lastName: 'Ashworth',
    email: `victoria.ashworth.${Date.now()}@example.com`,
    phone: '+44 7700 900888',
    location: 'London, UK',
    linkedinUrl: 'https://linkedin.com/in/victoria-ashworth-pe',
    
    // Professional Background
    currentRole: 'Senior Independent Director & PE Advisor',
    roleTypes: ['sid', 'ned', 'advisor'],
    company: 'Ashworth Capital Advisory',
    industry: 'Private Equity & Technology',
    yearsOfExperience: '25',
    summary: 'Accomplished board director with 25 years spanning FTSE 100, PE-backed unicorns, and successful exits. Deep expertise in technology sector transformations, ESG implementation, and value creation through M&A. Portfolio includes 30+ transactions totaling £8B+ in enterprise value. Currently serving on 5 boards including 3 PE-backed companies.',
    
    // Board Experience
    boardExperience: true,
    boardPositions: 5,
    boardExperienceTypes: ['ftse100', 'ftse250', 'private-equity', 'aim', 'startup'],
    boardCommittees: ['audit', 'remuneration', 'risk', 'esg', 'technology'],
    boardDetails: 'Specialist in technology sector governance, digital transformation oversight, and ESG framework implementation. Track record of leading boards through IPOs, trade sales, and complex restructurings.',
    
    // Work Experience - Mix of current and past board positions
    workExperiences: [
      {
        companyName: 'DataCore Technologies',
        title: 'Chair of the Board',
        location: 'London, UK',
        startDate: '2021-09',
        endDate: '',
        isCurrent: true,
        description: 'PE-backed data analytics unicorn (£3.2B valuation). Leading transformation to AI-first platform. Chair of Technology Committee, member of Remuneration. Preparing for 2025 IPO.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'FinanceHub PLC',
        title: 'Senior Independent Director',
        location: 'London, UK',
        startDate: '2020-03',
        endDate: '',
        isCurrent: true,
        description: 'FTSE 100 financial services leader. Chair of Risk & Compliance Committee, member of Audit. Led digital banking transformation increasing customer base by 40%.',
        isBoardPosition: true,
        companyType: 'ftse100'
      },
      {
        companyName: 'GreenTech Innovations',
        title: 'Non-Executive Director',
        location: 'London, UK',
        startDate: '2019-06',
        endDate: '',
        isCurrent: true,
        description: 'AIM-listed cleantech pioneer. Chair of ESG Committee. Implemented sustainability framework achieving B-Corp certification and 50% carbon reduction.',
        isBoardPosition: true,
        companyType: 'aim'
      },
      {
        companyName: 'Velocity Ventures Portfolio',
        title: 'Operating Partner',
        location: 'London, UK',
        startDate: '2018-01',
        endDate: '',
        isCurrent: true,
        description: 'Mid-market PE firm (£2B AUM). Board advisor to 6 portfolio companies. Focus on operational improvements and exit readiness in B2B SaaS sector.',
        isBoardPosition: false,
        companyType: 'private-equity'
      }
    ],
    
    // Transaction/Deal Experience - Comprehensive PE track record
    dealExperiences: [
      {
        dealType: 'acquisition',
        dealValue: '2100',
        dealCurrency: 'GBP',
        companyName: 'Enterprise Cloud Solutions',
        role: 'board-oversight',
        year: '2023',
        description: 'Led board through £2.1B acquisition by Blackstone. Complex carve-out from FTSE 250 parent. Negotiated 45% premium and retention packages for key talent.',
        sector: 'Enterprise Software'
      },
      {
        dealType: 'ipo',
        dealValue: '1500',
        dealCurrency: 'GBP',
        companyName: 'DigitalPay International',
        role: 'led-transaction',
        year: '2022',
        description: 'Chaired IPO committee for premium London listing. Oversubscribed 4.5x, market cap £4.2B on day one. Share price +120% in first year.',
        sector: 'Fintech'
      },
      {
        dealType: 'leveraged-buyout',
        dealValue: '750',
        dealCurrency: 'GBP',
        companyName: 'MediaTech Group',
        role: 'board-oversight',
        year: '2021',
        description: 'Board oversight of £750M LBO by Apollo. Restructured operations, divested non-core assets. Achieved 4.2x return on exit after 3 years.',
        sector: 'Media Technology'
      },
      {
        dealType: 'divestiture',
        dealValue: '450',
        dealCurrency: 'GBP',
        companyName: 'Legacy Systems Division',
        role: 'advisor',
        year: '2020',
        description: 'Advised on strategic divestiture to focus on cloud-native products. Maximized value through competitive auction process with 6 bidders.',
        sector: 'Technology Services'
      },
      {
        dealType: 'restructuring',
        dealValue: '300',
        dealCurrency: 'GBP',
        companyName: 'RetailTech Solutions',
        role: 'led-transaction',
        year: '2019',
        description: 'Led board through COVID-19 restructuring. Renegotiated debt, pivoted to e-commerce. Company now valued at £1.2B post-recovery.',
        sector: 'Retail Technology'
      }
    ],
    
    // Education & Skills
    education: [
      {
        institution: 'Stanford Graduate School of Business',
        degree: 'MBA',
        fieldOfStudy: 'Finance & Technology Management',
        graduationDate: '1999'
      },
      {
        institution: 'Oxford University',
        degree: 'BA (Hons)',
        fieldOfStudy: 'Philosophy, Politics and Economics',
        graduationDate: '1995'
      }
    ],
    keySkills: ['Private Equity', 'M&A Strategy', 'Digital Transformation', 'ESG Governance', 'Risk Management'],
    functionalExpertise: ['Board Leadership', 'Audit & Compliance', 'Executive Compensation', 'Technology Strategy', 'Value Creation'],
    industryExpertise: ['Technology', 'Financial Services', 'SaaS', 'Fintech', 'Clean Technology'],
    
    // Availability
    activelySeeking: true,
    availability: '3months',
    remotePreference: 'hybrid',
    willingToRelocate: false,
    compensationMin: '120000',
    compensationMax: '180000',
    termsAccepted: true
  };

  // Convert to the format expected by the API
  const adminNotes = {
    phone: signupData.phone,
    company: signupData.company,
    industry: signupData.industry,
    boardExperience: signupData.boardExperience,
    boardPositions: signupData.boardPositions,
    boardExperienceTypes: signupData.boardExperienceTypes,
    boardCommittees: signupData.boardCommittees,
    boardDetails: signupData.boardDetails,
    roleTypes: signupData.roleTypes,
    workExperiences: signupData.workExperiences,
    dealExperiences: signupData.dealExperiences,
    education: signupData.education,
    tags: [
      ...signupData.keySkills.map(skill => ({ name: skill, category: 'skill' })),
      ...signupData.functionalExpertise.map(exp => ({ name: exp, category: 'expertise' })),
      ...signupData.industryExpertise.map(ind => ({ name: ind, category: 'industry' }))
    ],
    activelySeeking: signupData.activelySeeking,
    availability: signupData.availability,
    remotePreference: signupData.remotePreference,
    willingToRelocate: signupData.willingToRelocate,
    compensationMin: signupData.compensationMin,
    compensationMax: signupData.compensationMax,
    yearsExperience: parseInt(signupData.yearsOfExperience)
  };

  const apiPayload = {
    firstName: signupData.firstName,
    lastName: signupData.lastName,
    email: signupData.email,
    title: signupData.currentRole,
    summary: signupData.summary,
    experience: 'executive',
    location: signupData.location,
    linkedinUrl: signupData.linkedinUrl,
    adminNotes: JSON.stringify(adminNotes)
  };

  try {
    console.log('📤 Sending comprehensive signup to API...');
    console.log('Profile includes:');
    console.log('- 5 board positions across FTSE 100, PE-backed, and AIM companies');
    console.log('- 5 deal experiences totaling £5.1B');
    console.log('- 5 committee memberships including ESG and Technology');
    console.log('- Stanford MBA + Oxford PPE education');
    console.log('- 15 skills and expertise areas\n');
    
    const response = await fetch('http://localhost:3000/api/v1/candidates/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Signup successful!');
      console.log('Profile ID:', result.data.profileId);
      console.log('Email:', signupData.email);
      
      console.log('\n📋 Next steps to test the full flow:');
      console.log('1. Go to admin panel: http://localhost:3000/admin/candidates');
      console.log('2. Find Victoria Ashworth and click "Approve"');
      console.log('3. This will trigger processProfileOnApproval which should:');
      console.log('   - Process all 5 deal experiences into deal_experiences table');
      console.log('   - Store all 5 committees in board_committees table');
      console.log('   - Save all 5 board types in board_experience_types table');
      console.log('   - Create work experiences with proper board position flags');
      console.log('   - Tag the profile with all skills and expertise');
      console.log('4. View the complete CV at:');
      console.log(`   http://localhost:3000/search/${result.data.profileId}`);
      console.log('\n✨ The profile should display with full richness automatically!');
    } else {
      console.error('❌ Signup failed:', result.message);
      if (result.errors) {
        console.error('Errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('❌ Error calling API:', error);
  }
}

testNewCompleteSignup().catch(console.error);