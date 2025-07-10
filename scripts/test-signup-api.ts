import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testSignupAPI() {
  console.log('Testing signup through API endpoint...\n');

  // Prepare comprehensive signup data similar to what the form would send
  const signupData = {
    // Personal Information
    firstName: 'Richard',
    lastName: 'Sterling',
    email: `richard.sterling.${Date.now()}@example.com`,
    phone: '+44 7890 123456',
    location: 'London, UK',
    linkedinUrl: 'https://linkedin.com/in/richard-sterling',
    
    // Professional Background
    currentRole: 'Non-Executive Director & Strategic Advisor',
    roleTypes: ['ned', 'sid', 'chair'],
    company: 'Sterling Advisory Partners',
    industry: 'Private Equity & Financial Services',
    yearsOfExperience: '22',
    summary: 'Seasoned board director with 22+ years experience across FTSE, PE-backed, and high-growth companies. Specializing in digital transformation, M&A strategy, and governance excellence. Track record includes 20+ successful exits with combined value exceeding £5B. Currently serving on 4 boards including 2 PE-backed unicorns.',
    
    // Board Experience
    boardExperience: true,
    boardPositions: 6,
    boardExperienceTypes: ['ftse100', 'ftse250', 'private-equity', 'startup'],
    boardCommittees: ['audit', 'remuneration', 'risk', 'nomination'],
    boardDetails: 'Extensive experience leading boards through complex transformations, IPOs, and PE exits. Specialist in tech sector governance and ESG implementation.',
    
    // Work Experience
    workExperiences: [
      {
        companyName: 'TechUnicorn Ltd',
        title: 'Chair of the Board',
        location: 'London, UK',
        startDate: '2022-01',
        endDate: '',
        isCurrent: true,
        description: 'PE-backed SaaS unicorn ($2.5B valuation). Leading board through international expansion and preparation for IPO. Chair of Nomination Committee.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'GlobalFintech PLC',
        title: 'Senior Independent Director',
        location: 'London, UK',
        startDate: '2020-06',
        endDate: '',
        isCurrent: true,
        description: 'FTSE 250 fintech leader. Chair of Risk Committee, member of Audit. Led board review resulting in governance upgrades and 30% share price improvement.',
        isBoardPosition: true,
        companyType: 'ftse250'
      },
      {
        companyName: 'DataAnalytics Group',
        title: 'Non-Executive Director',
        location: 'London, UK',
        startDate: '2019-03',
        endDate: '2023-12',
        isCurrent: false,
        description: 'AIM-listed data analytics firm. Member of Remuneration and Audit Committees. Oversaw successful £350M exit to US strategic buyer.',
        isBoardPosition: true,
        companyType: 'aim'
      }
    ],
    
    // Transaction/Deal Experience
    dealExperiences: [
      {
        dealType: 'acquisition',
        dealValue: '1250',
        dealCurrency: 'GBP',
        companyName: 'European Tech Holdings',
        role: 'board-oversight',
        year: '2023',
        description: 'Led board oversight of £1.25B acquisition by KKR. Complex cross-border transaction with significant regulatory hurdles. Achieved 25% premium for shareholders.',
        sector: 'Technology'
      },
      {
        dealType: 'ipo',
        dealValue: '800',
        dealCurrency: 'GBP',
        companyName: 'CloudServices International',
        role: 'led-transaction',
        year: '2022',
        description: 'Chaired IPO committee for successful London listing. Oversubscribed by 3x, raised £800M for growth capital. Share price up 65% since listing.',
        sector: 'Cloud Computing'
      },
      {
        dealType: 'leveraged-buyout',
        dealValue: '550',
        dealCurrency: 'GBP',
        companyName: 'Retail Tech Solutions',
        role: 'advisor',
        year: '2021',
        description: 'Senior advisor on £550M LBO by Permira. Structured management incentive plan and post-acquisition integration strategy.',
        sector: 'Retail Technology'
      }
    ],
    
    // Education & Skills
    education: [
      {
        institution: 'INSEAD',
        degree: 'MBA',
        fieldOfStudy: 'Finance & Strategy',
        graduationDate: '2002'
      },
      {
        institution: 'Cambridge University',
        degree: 'MA',
        fieldOfStudy: 'Economics',
        graduationDate: '1998'
      }
    ],
    keySkills: ['M&A Strategy', 'Corporate Governance', 'Digital Transformation', 'Risk Management'],
    functionalExpertise: ['Board Leadership', 'Audit & Risk', 'Executive Compensation', 'ESG Strategy'],
    industryExpertise: ['Technology', 'Financial Services', 'Private Equity', 'SaaS'],
    
    // Availability
    activelySeeking: true,
    availability: 'immediately',
    remotePreference: 'flexible',
    willingToRelocate: false,
    compensationMin: '100000',
    compensationMax: '150000',
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
    experience: 'senior',
    location: signupData.location,
    linkedinUrl: signupData.linkedinUrl,
    adminNotes: JSON.stringify(adminNotes)
  };

  try {
    console.log('📤 Sending signup request to API...');
    
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
      console.log('User ID:', result.data.userId);
      console.log('\n📋 Next steps:');
      console.log('1. Go to admin panel: http://localhost:3000/admin/candidates');
      console.log('2. Find and approve the profile for:', signupData.email);
      console.log('3. Once approved, view the profile at:');
      console.log(`   http://localhost:3000/search/${result.data.profileId}`);
      console.log('\n⚠️  The profile will show as "Executive Profile" until approved');
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

testSignupAPI().catch(console.error);