import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNewSignupFlow() {
  try {
    const testEmail = `test${Date.now()}@example.com`;
    
    console.log('Testing new signup flow...');
    console.log('Test email:', testEmail);
    
    // Simulate signup data
    const signupData = {
      email: testEmail,
      firstName: 'Jane',
      lastName: 'Smith',
      title: 'Former CEO - Tech Startup',
      summary: 'Experienced CEO with 20+ years leading technology companies through growth and transformation. Expertise in digital innovation, M&A, and building high-performance teams.',
      experience: 'executive',
      location: 'Manchester, UK',
      linkedinUrl: 'https://linkedin.com/in/janesmith',
      adminNotes: JSON.stringify({
        phone: '+44 7700 123456',
        company: 'Tech Innovations Ltd',
        industry: 'Technology',
        boardExperience: true,
        boardPositions: 2,
        boardDetails: 'Passionate about supporting tech startups',
        workExperiences: [
          {
            companyName: 'FinTech Solutions PLC',
            title: 'Non-Executive Director',
            location: 'London, UK',
            startDate: '2021-03-01',
            endDate: '',
            isCurrent: true,
            description: 'Chair of the Risk Committee, focusing on cybersecurity and regulatory compliance.',
            isBoardPosition: true
          },
          {
            companyName: 'HealthTech Innovations',
            title: 'Independent Director',
            location: 'Manchester, UK',
            startDate: '2019-06-01',
            endDate: '',
            isCurrent: true,
            description: 'Member of Audit and Remuneration committees.',
            isBoardPosition: true
          },
          {
            companyName: 'Tech Innovations Ltd',
            title: 'Chief Executive Officer',
            location: 'Manchester, UK',
            startDate: '2015-01-01',
            endDate: '2021-12-31',
            isCurrent: false,
            description: 'Led company through successful exit to PE firm for £150M.',
            isBoardPosition: false
          }
        ],
        education: [
          {
            institution: 'University of Manchester',
            degree: 'MBA',
            fieldOfStudy: 'Business Administration',
            graduationDate: '2000'
          },
          {
            institution: 'Imperial College London',
            degree: 'BSc Computer Science',
            fieldOfStudy: 'Computer Science',
            graduationDate: '1995'
          }
        ],
        tags: [
          { name: 'Digital Transformation', category: 'skill' },
          { name: 'M&A', category: 'skill' },
          { name: 'Leadership', category: 'skill' },
          { name: 'Technology', category: 'industry' },
          { name: 'Financial Services', category: 'industry' }
        ],
        activelySeeking: true,
        availability: '3months',
        remotePreference: 'hybrid',
        willingToRelocate: false,
        compensationMin: '80000',
        compensationMax: '120000',
        yearsExperience: 20
      })
    };
    
    // Call the signup API
    const response = await fetch('http://localhost:3000/api/v1/candidates/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Signup failed:', result);
      return;
    }
    
    console.log('✅ Signup successful!');
    console.log('Profile ID:', result.data.profileId);
    console.log('User ID:', result.data.userId);
    
    // Check what was created
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', result.data.profileId)
      .single();
    
    console.log('\n📋 Profile created:');
    console.log('- Title:', profile?.title);
    console.log('- Location:', profile?.location);
    console.log('- Availability:', profile?.availability);
    console.log('- Remote preference:', profile?.remote_preference);
    console.log('- Salary range:', profile?.salary_min, '-', profile?.salary_max, profile?.salary_currency);
    
    // Check work experiences
    const { data: workExperiences } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('candidate_id', result.data.profileId)
      .order('start_date', { ascending: false });
    
    console.log('\n💼 Work experiences created:', workExperiences?.length);
    workExperiences?.forEach(exp => {
      console.log(`- ${exp.position} at ${exp.company_name} (Board: ${exp.is_board_position})`);
    });
    
    // Check education
    const { data: education } = await supabase
      .from('education')
      .select('*')
      .eq('candidate_id', result.data.profileId);
    
    console.log('\n🎓 Education created:', education?.length);
    education?.forEach(edu => {
      console.log(`- ${edu.degree} from ${edu.institution}`);
    });
    
    // Check tags
    const { data: tags } = await supabase
      .from('candidate_tags')
      .select(`
        tags (
          name,
          type
        )
      `)
      .eq('candidate_id', result.data.profileId);
    
    console.log('\n🏷️ Tags created:', tags?.length);
    tags?.forEach(t => {
      console.log(`- ${t.tags?.name} (${t.tags?.type})`);
    });
    
    console.log('\n✨ New signup flow test complete!');
    console.log('Profile URL: http://localhost:3000/search/' + result.data.profileId);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  process.exit(0);
}

testNewSignupFlow();