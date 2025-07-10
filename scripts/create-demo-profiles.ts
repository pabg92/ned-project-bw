import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createDemoProfiles() {
  console.log('🎯 Creating high-quality demo profiles for MD presentation...\n');

  const profiles = [
    {
      // Profile 1: PE-focused Chair
      firstName: 'Catherine',
      lastName: 'Blackwell',
      email: `catherine.blackwell.${Date.now()}@example.com`,
      title: 'Chair & PE Operating Partner',
      summary: 'Accomplished board chair with 25+ years in private equity and FTSE leadership. Currently Chair at 3 PE-backed companies and Operating Partner at Apex Capital (£5B AUM). Led 40+ successful exits with combined value exceeding £12B. Specialist in digital transformation and ESG implementation in portfolio companies.',
      boardExperienceTypes: ['private-equity', 'ftse100', 'ftse250'],
      boardCommittees: ['audit', 'esg', 'investment', 'nomination'],
      dealExperiences: [
        {
          dealType: 'exit',
          dealValue: '2800',
          dealCurrency: 'GBP',
          companyName: 'TechCorp International',
          role: 'board-oversight',
          year: '2023',
          description: 'Led board through strategic sale to Microsoft. Achieved 5.2x return for PE investors.',
          sector: 'Technology'
        }
      ]
    },
    {
      // Profile 2: FinTech specialist
      firstName: 'Marcus',
      lastName: 'Chen',
      email: `marcus.chen.${Date.now()}@example.com`,
      title: 'NED & FinTech Innovation Expert',
      summary: 'Former CEO of unicorn FinTech, now serving on 4 boards including 2 FTSE 250 companies. Deep expertise in digital banking, payments, and regulatory compliance. Track record of scaling businesses from startup to £1B+ valuations. Active angel investor with 30+ portfolio companies.',
      boardExperienceTypes: ['ftse250', 'unicorn', 'startup'],
      boardCommittees: ['technology', 'risk', 'audit'],
      dealExperiences: [
        {
          dealType: 'ipo',
          dealValue: '1500',
          dealCurrency: 'GBP',
          companyName: 'PayTech Global',
          role: 'led-transaction',
          year: '2022',
          description: 'CEO through successful IPO on LSE. Market cap reached £3B within first year.',
          sector: 'FinTech'
        }
      ]
    },
    {
      // Profile 3: ESG & Sustainability expert
      firstName: 'Sarah',
      lastName: 'Williams-Green',
      email: `sarah.williams.${Date.now()}@example.com`,
      title: 'ESG Board Specialist & SID',
      summary: 'Leading authority on ESG governance and sustainable business transformation. Currently SID at FTSE 100 energy company and Chair of ESG Committee at 3 boards. Former Partner at McKinsey Sustainability Practice. Author of "The Sustainable Board" and frequent speaker at WEF.',
      boardExperienceTypes: ['ftse100', 'ftse250', 'charity'],
      boardCommittees: ['esg', 'audit', 'remuneration'],
      dealExperiences: [
        {
          dealType: 'restructuring',
          dealValue: '500',
          dealCurrency: 'GBP',
          companyName: 'GreenEnergy Ltd',
          role: 'advisor',
          year: '2023',
          description: 'Led ESG transformation resulting in B-Corp certification and 40% carbon reduction.',
          sector: 'Energy'
        }
      ]
    }
  ];

  // Create each profile
  for (const profileData of profiles) {
    const adminNotes = {
      boardExperience: true,
      boardPositions: 4,
      boardExperienceTypes: profileData.boardExperienceTypes,
      boardCommittees: profileData.boardCommittees,
      dealExperiences: profileData.dealExperiences,
      compensationMin: '150000',
      compensationMax: '200000',
      activelySeeking: true,
      availability: 'immediately'
    };

    const apiPayload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      title: profileData.title,
      summary: profileData.summary,
      experience: 'executive',
      location: 'London, UK',
      linkedinUrl: `https://linkedin.com/in/${profileData.firstName.toLowerCase()}-${profileData.lastName.toLowerCase()}`,
      adminNotes: JSON.stringify(adminNotes)
    };

    try {
      const response = await fetch('http://localhost:3000/api/v1/candidates/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ Created: ${profileData.firstName} ${profileData.lastName}`);
        console.log(`   ID: ${result.data.profileId}`);
        console.log(`   Title: ${profileData.title}`);
      } else {
        console.error(`❌ Failed to create ${profileData.firstName}:`, result.message);
      }
    } catch (error) {
      console.error(`❌ Error creating ${profileData.firstName}:`, error);
    }
  }

  console.log('\n📋 IMPORTANT: These profiles need admin approval!');
  console.log('1. Go to: http://localhost:3000/admin/candidates');
  console.log('2. Approve all 3 profiles');
  console.log('3. They will then appear in search results');
  console.log('\n✨ These profiles showcase:');
  console.log('- PE/M&A experience');
  console.log('- Board committee expertise');
  console.log('- Different industry backgrounds');
  console.log('- High-caliber executive experience');
}

createDemoProfiles().catch(console.error);