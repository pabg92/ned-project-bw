import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testFixedFlow() {
  console.log('🚀 Testing fixed signup → approval → CV flow...\n');

  // Create a test profile with PE data
  const signupData = {
    firstName: 'Elizabeth',
    lastName: 'Windsor',
    email: `elizabeth.windsor.${Date.now()}@example.com`,
    phone: '+44 7700 900111',
    location: 'London, UK',
    linkedinUrl: 'https://linkedin.com/in/elizabeth-windsor-pe',
    
    currentRole: 'Chair & Senior Independent Director',
    roleTypes: ['chair', 'sid', 'ned'],
    company: 'Windsor Capital Advisory',
    industry: 'Private Equity & Investment',
    yearsOfExperience: '30',
    summary: 'Distinguished board leader with 30 years in private equity and corporate governance. Currently chairing 3 PE-backed companies and serving as SID on FTSE 100 board. Track record includes 50+ successful exits totaling £15B+ in value creation. Expertise in cross-border M&A, ESG transformation, and crisis management.',
    
    boardExperience: true,
    boardPositions: 4,
    boardExperienceTypes: ['ftse100', 'ftse250', 'private-equity'],
    boardCommittees: ['audit', 'nomination', 'risk', 'esg'],
    boardDetails: 'Specialist in PE value creation through governance excellence and strategic transformation.',
    
    workExperiences: [
      {
        companyName: 'GlobalTech Holdings',
        title: 'Chair of the Board',
        location: 'London, UK',
        startDate: '2021-01',
        endDate: '',
        isCurrent: true,
        description: 'PE-backed technology leader (£5B valuation). Leading digital transformation and preparing for IPO.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'Sustainable Energy PLC',
        title: 'Senior Independent Director',
        location: 'London, UK',
        startDate: '2019-06',
        endDate: '',
        isCurrent: true,
        description: 'FTSE 100 renewable energy company. Chair of Risk Committee, member of Audit.',
        isBoardPosition: true,
        companyType: 'ftse100'
      }
    ],
    
    dealExperiences: [
      {
        dealType: 'acquisition',
        dealValue: '3200',
        dealCurrency: 'GBP',
        companyName: 'European Infrastructure Partners',
        role: 'led-transaction',
        year: '2023',
        description: 'Led £3.2B acquisition creating largest renewable energy platform in Europe.',
        sector: 'Energy & Infrastructure'
      },
      {
        dealType: 'ipo',
        dealValue: '2500',
        dealCurrency: 'GBP',
        companyName: 'TechUnicorn Ltd',
        role: 'board-oversight',
        year: '2022',
        description: 'Chaired board through successful IPO. Market cap reached £8B within 6 months.',
        sector: 'Technology'
      },
      {
        dealType: 'restructuring',
        dealValue: '800',
        dealCurrency: 'GBP',
        companyName: 'Legacy Manufacturing Group',
        role: 'advisor',
        year: '2021',
        description: 'Led turnaround of distressed asset. Returned to profitability within 18 months.',
        sector: 'Manufacturing'
      }
    ],
    
    education: [
      {
        institution: 'Cambridge University',
        degree: 'MA',
        fieldOfStudy: 'Economics',
        graduationDate: '1994'
      },
      {
        institution: 'Harvard Business School',
        degree: 'AMP',
        fieldOfStudy: 'Advanced Management Program',
        graduationDate: '2005'
      }
    ],
    
    keySkills: ['Board Leadership', 'M&A Strategy', 'Corporate Governance'],
    functionalExpertise: ['Chair', 'Audit Committee', 'Risk Management', 'ESG Strategy'],
    industryExpertise: ['Private Equity', 'Technology', 'Renewable Energy'],
    
    activelySeeking: true,
    availability: 'immediately',
    remotePreference: 'hybrid',
    willingToRelocate: false,
    compensationMin: '180000',
    compensationMax: '250000',
    termsAccepted: true
  };

  // Convert to API format
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
    console.log('📤 Creating signup with comprehensive PE data...');
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
      
      console.log('\n📋 Data included:');
      console.log('- 3 deal experiences (£6.5B total value)');
      console.log('- 4 board committees');
      console.log('- 3 board experience types');
      console.log('- 2 current board positions');
      console.log('- 2 education credentials');
      
      console.log('\n🔍 Next steps:');
      console.log('1. Go to: http://localhost:3000/admin/candidates');
      console.log('2. Find Elizabeth Windsor and click "Approve"');
      console.log('3. Watch server logs for [PROCESSOR] messages');
      console.log('4. Should see:');
      console.log('   - [PROCESSOR] Found private_metadata, extracting signup data');
      console.log('   - [PROCESSOR] Processing 3 deal experiences');
      console.log('   - [PROCESSOR] Processing 4 board committees');
      console.log('5. View complete CV at:');
      console.log(`   http://localhost:3000/search/${result.data.profileId}`);
      
      console.log('\n✨ All data should now process automatically!');
    } else {
      console.error('❌ Signup failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFixedFlow().catch(console.error);