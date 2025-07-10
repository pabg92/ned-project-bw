import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createTestProfile() {
  console.log('🚀 Creating test profile for approval flow...\n');

  // Create James Montgomery - PE veteran
  const signupData = {
    firstName: 'James',
    lastName: 'Montgomery',
    email: `james.montgomery.${Date.now()}@example.com`,
    phone: '+44 7700 900222',
    location: 'London, UK',
    linkedinUrl: 'https://linkedin.com/in/james-montgomery-pe',
    
    currentRole: 'Managing Partner & Board Director',
    roleTypes: ['ned', 'chair', 'advisor'],
    company: 'Montgomery Partners LLP',
    industry: 'Private Equity',
    yearsOfExperience: '28',
    summary: 'Accomplished PE professional and board director with 28 years of experience across European and US markets. Currently Managing Partner at Montgomery Partners (€3B AUM) and serving on 5 portfolio company boards. Led 60+ transactions with combined enterprise value exceeding €20B. Specialist in technology sector transformations, roll-up strategies, and operational value creation. Track record includes 15 successful exits with average 3.5x MOIC.',
    
    boardExperience: true,
    boardPositions: 5,
    boardExperienceTypes: ['private-equity', 'ftse250', 'unicorn', 'startup'],
    boardCommittees: ['audit', 'remuneration', 'investment', 'risk', 'technology'],
    boardDetails: 'Deep expertise in PE governance, particularly in technology and healthcare sectors. Known for hands-on approach to value creation and strong relationships with management teams.',
    
    workExperiences: [
      {
        companyName: 'TechScale Europe',
        title: 'Chair of the Board',
        location: 'London, UK',
        startDate: '2022-03',
        endDate: '',
        isCurrent: true,
        description: 'PE-backed B2B SaaS platform (€2.5B valuation). Leading buy-and-build strategy, completed 4 add-on acquisitions. ARR grown from €150M to €400M.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'HealthTech International',
        title: 'Non-Executive Director',
        location: 'London, UK',
        startDate: '2021-01',
        endDate: '',
        isCurrent: true,
        description: 'PE-backed healthcare technology leader. Chair of Technology Committee. Overseeing AI implementation in diagnostic tools.',
        isBoardPosition: true,
        companyType: 'private-equity'
      },
      {
        companyName: 'DataAnalytics PLC',
        title: 'Senior Independent Director',
        location: 'London, UK',
        startDate: '2020-06',
        endDate: '',
        isCurrent: true,
        description: 'FTSE 250 data analytics company. Chair of Audit Committee, member of Risk. Led strategic review resulting in PE take-private.',
        isBoardPosition: true,
        companyType: 'ftse250'
      },
      {
        companyName: 'Montgomery Partners LLP',
        title: 'Managing Partner',
        location: 'London, UK',
        startDate: '2018-01',
        endDate: '',
        isCurrent: true,
        description: 'Lead €3B mid-market PE fund focused on technology and healthcare. IC member, portfolio board positions.',
        isBoardPosition: false,
        companyType: 'private-equity'
      }
    ],
    
    dealExperiences: [
      {
        dealType: 'leveraged-buyout',
        dealValue: '1800',
        dealCurrency: 'EUR',
        companyName: 'CloudPlatform AG',
        role: 'led-transaction',
        year: '2023',
        description: 'Led €1.8B LBO of leading European cloud infrastructure provider. Complex carve-out from US parent. Achieved 2.8x leverage, 40% equity. Management rolled 15%.',
        sector: 'Cloud Infrastructure'
      },
      {
        dealType: 'acquisition',
        dealValue: '950',
        dealCurrency: 'EUR',
        companyName: 'MedTech Innovations',
        role: 'board-oversight',
        year: '2023',
        description: 'Platform acquisition for healthcare portfolio. Synergies delivered €120M EBITDA uplift within 12 months.',
        sector: 'Healthcare Technology'
      },
      {
        dealType: 'exit',
        dealValue: '2400',
        dealCurrency: 'EUR',
        companyName: 'Digital Marketing Group',
        role: 'led-transaction',
        year: '2022',
        description: 'Led exit to strategic buyer at €2.4B valuation. 4.2x MOIC, 38% IRR over 4-year hold. Retained 20% for continued upside.',
        sector: 'Marketing Technology'
      },
      {
        dealType: 'restructuring',
        dealValue: '600',
        dealCurrency: 'EUR',
        companyName: 'RetailTech Solutions',
        role: 'advisor',
        year: '2021',
        description: 'Crisis management during COVID. Pivoted business model, renegotiated debt. Now valued at €1.8B.',
        sector: 'Retail Technology'
      },
      {
        dealType: 'ipo',
        dealValue: '3200',
        dealCurrency: 'EUR',
        companyName: 'FinTech Unicorn',
        role: 'board-oversight',
        year: '2021',
        description: 'Board member through successful NYSE listing. Market cap reached $5B on day one. Oversubscribed 5x.',
        sector: 'Financial Technology'
      }
    ],
    
    education: [
      {
        institution: 'London Business School',
        degree: 'MBA',
        fieldOfStudy: 'Finance & Strategy',
        graduationDate: '1998'
      },
      {
        institution: 'University of Edinburgh',
        degree: 'MA (Hons)',
        fieldOfStudy: 'Economics & Mathematics',
        graduationDate: '1995'
      }
    ],
    
    keySkills: ['Leveraged Buyouts', 'Value Creation', 'Board Governance', 'M&A Execution', 'Portfolio Management'],
    functionalExpertise: ['Investment Committee', 'Audit Chair', 'Deal Structuring', 'Exit Planning', 'LP Relations'],
    industryExpertise: ['Technology', 'Healthcare', 'B2B SaaS', 'FinTech', 'Data Analytics'],
    
    activelySeeking: true,
    availability: '3months',
    remotePreference: 'hybrid',
    willingToRelocate: false,
    compensationMin: '200000',
    compensationMax: '300000',
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
    console.log('📤 Creating James Montgomery profile...');
    console.log('This profile includes:');
    console.log('- 5 PE deal experiences (€8.95B total)');
    console.log('- 5 board committees');
    console.log('- 4 board experience types');
    console.log('- 4 work experiences (3 board positions)');
    console.log('- Deep PE sector expertise\n');
    
    const response = await fetch('http://localhost:3000/api/v1/candidates/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Profile created successfully!');
      console.log('Profile ID:', result.data.profileId);
      console.log('Email:', signupData.email);
      
      console.log('\n📋 TO TEST THE APPROVAL FLOW:');
      console.log('1. Go to admin panel: http://localhost:3000/admin/candidates');
      console.log('2. Find "James Montgomery" in the list');
      console.log('3. Click the "Approve" button');
      console.log('\n🔍 WATCH FOR THESE IN THE SERVER LOGS:');
      console.log('[PROCESSOR] Found private_metadata, extracting signup data');
      console.log('[PROCESSOR] Processing 5 deal experiences');
      console.log('[PROCESSOR] Processing 5 board committees');
      console.log('[PROCESSOR] Processing 4 board experience types');
      console.log('\n✨ After approval, view the complete PE-optimized CV at:');
      console.log(`http://localhost:3000/search/${result.data.profileId}`);
      
      // Store profile ID for easy access
      console.log('\n📝 Profile ID for reference:', result.data.profileId);
    } else {
      console.error('❌ Failed to create profile:', result.message);
      if (result.errors) {
        console.error('Errors:', result.errors);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestProfile().catch(console.error);