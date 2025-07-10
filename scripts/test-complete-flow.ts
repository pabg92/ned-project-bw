import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCompleteFlow() {
  console.log('🚀 Testing complete signup → approval → CV flow...\n');

  // Create a test PE professional signup
  const signupData = {
    firstName: 'Alexander',
    lastName: 'Hamilton',
    email: `alexander.hamilton.${Date.now()}@example.com`,
    phone: '+44 7700 900999',
    location: 'Edinburgh, UK',
    linkedinUrl: 'https://linkedin.com/in/alexander-hamilton-pe',
    
    currentRole: 'Managing Director & Board Advisor',
    roleTypes: ['md', 'ned', 'advisor'],
    company: 'Hamilton Capital Partners',
    industry: 'Private Equity',
    yearsOfExperience: '22',
    summary: 'Seasoned PE professional with 22 years experience across European markets. Led 40+ transactions totaling €12B in enterprise value. Currently Managing Director at Hamilton Capital Partners and serving on boards of 4 portfolio companies. Expertise in cross-border M&A, operational transformation, and ESG implementation.',
    
    boardExperience: true,
    boardPositions: 4,
    boardExperienceTypes: ['private-equity', 'ftse250', 'startup'],
    boardCommittees: ['audit', 'investment', 'esg'],
    boardDetails: 'Deep experience in PE-backed board governance, focusing on value creation through operational excellence and strategic M&A.',
    
    workExperiences: [
      {
        companyName: 'TechVentures Portfolio',
        title: 'Non-Executive Director',
        location: 'London, UK',
        startDate: '2022-01',
        endDate: '',
        isCurrent: true,
        description: 'Board member for €800M SaaS platform. Leading digital transformation and international expansion.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'GreenEnergy Holdings',
        title: 'Chair of ESG Committee',
        location: 'London, UK',
        startDate: '2021-06',
        endDate: '',
        isCurrent: true,
        description: 'FTSE 250 renewable energy company. Implemented comprehensive ESG framework achieving top quartile sustainability ratings.',
        isBoardPosition: true,
        companyType: 'ftse250'
      }
    ],
    
    dealExperiences: [
      {
        dealType: 'leveraged-buyout',
        dealValue: '1200',
        dealCurrency: 'EUR',
        companyName: 'Nordic Tech Group',
        role: 'led-transaction',
        year: '2023',
        description: 'Led €1.2B LBO of leading Nordic software company. 3.5x leverage, management rollover, achieved 35% IRR.',
        sector: 'Technology'
      },
      {
        dealType: 'acquisition',
        dealValue: '650',
        dealCurrency: 'EUR',
        companyName: 'DataAnalytics Pro',
        role: 'board-oversight',
        year: '2022',
        description: 'Strategic add-on acquisition to existing portfolio company. Created market leader in analytics space.',
        sector: 'Data & Analytics'
      }
    ],
    
    education: [
      {
        institution: 'INSEAD',
        degree: 'MBA',
        fieldOfStudy: 'Finance',
        graduationDate: '2002'
      }
    ],
    
    keySkills: ['Leveraged Buyouts', 'Value Creation', 'Cross-border M&A'],
    functionalExpertise: ['Board Governance', 'Investment Committee', 'ESG Strategy'],
    industryExpertise: ['Technology', 'Renewable Energy', 'B2B Software'],
    
    activelySeeking: true,
    availability: 'immediately',
    remotePreference: 'hybrid',
    willingToRelocate: true,
    compensationMin: '150000',
    compensationMax: '200000',
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
    console.log('📤 Step 1: Creating signup...');
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
      
      console.log('\n📋 Step 2: Instructions for testing approval flow:');
      console.log('1. Go to admin panel: http://localhost:3000/admin/candidates');
      console.log('2. Find Alexander Hamilton and click "Approve"');
      console.log('3. Watch the server logs for processing output');
      console.log('4. Expected to see:');
      console.log('   - [PROCESSOR] Processing work experiences from private metadata');
      console.log('   - [PROCESSOR] Successfully inserted 2 work experiences');
      console.log('   - Processing status: completed');
      console.log('5. View the complete CV at:');
      console.log(`   http://localhost:3000/search/${result.data.profileId}`);
      console.log('\n✨ The profile should auto-enrich with all data!');
      
      // Store profile ID for verification
      console.log('\n📝 Run this command to verify after approval:');
      console.log(`npx tsx scripts/test-victoria-profile.ts`);
      console.log('(Update the profileId in the script to:', result.data.profileId + ')');
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

testCompleteFlow().catch(console.error);