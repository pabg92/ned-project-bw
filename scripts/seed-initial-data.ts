import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Your hardcoded admin user ID
const ADMIN_USER_ID = 'user_2xxPM7cYdgriSxF3cvcAuTMpiCM';

async function seedData() {
  try {
    console.log('🌱 Starting seed process...');

    // 1. Create tags
    console.log('\n📌 Creating tags...');
    const skillTags = [
      'Digital Transformation',
      'Risk Management',
      'ESG',
      'AI/ML',
      'Cybersecurity',
      'Financial Planning',
      'Strategic Leadership',
      'M&A',
      'Corporate Governance',
      'Change Management'
    ];

    const industryTags = [
      'Financial Services',
      'Technology',
      'Healthcare',
      'Retail',
      'Energy',
      'Manufacturing',
      'Telecommunications',
      'Real Estate',
      'Education',
      'Government'
    ];

    const roleTags = [
      'Chair',
      'NED',
      'Senior Independent Director',
      'Advisor',
      'Trustee',
      'Board Member',
      'Executive Director',
      'Committee Chair'
    ];

    const createdTags: any[] = [];

    // Insert skill tags
    for (const tagName of skillTags) {
      const { data, error } = await supabase
        .from('tags')
        .upsert({ name: tagName, type: 'skill' }, { onConflict: 'name' })
        .select()
        .single();
      
      if (data) createdTags.push(data);
      if (error && !error.message.includes('duplicate')) console.error('Error creating tag:', error);
    }

    // Insert industry tags
    for (const tagName of industryTags) {
      const { data, error } = await supabase
        .from('tags')
        .upsert({ name: tagName, type: 'industry' }, { onConflict: 'name' })
        .select()
        .single();
      
      if (data) createdTags.push(data);
      if (error && !error.message.includes('duplicate')) console.error('Error creating tag:', error);
    }

    // Insert role tags
    for (const tagName of roleTags) {
      const { data, error } = await supabase
        .from('tags')
        .upsert({ name: tagName, type: 'role' }, { onConflict: 'name' })
        .select()
        .single();
      
      if (data) createdTags.push(data);
      if (error && !error.message.includes('duplicate')) console.error('Error creating tag:', error);
    }

    console.log(`✅ Created ${createdTags.length} tags`);

    // 2. First, check if we need to create your admin user
    console.log('\n👤 Checking admin user...');
    
    // Try to create the admin user first (in case webhook hasn't fired yet)
    const { error: adminUserError } = await supabase
      .from('users')
      .upsert({
        id: ADMIN_USER_ID,
        email: 'pablogarner@outlook.com',
        role: 'company',
        first_name: 'Pablo',
        last_name: 'Garner',
        is_active: true
      }, { onConflict: 'id' });

    if (!adminUserError) {
      console.log('✅ Admin user ensured');
    }

    // 3. Create test users and candidates (without triggering audit logs)
    console.log('\n👥 Creating test candidates...');
    
    const testCandidates = [
      {
        email: 'sarah.johnson@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'Former CFO - FTSE 100',
        summary: 'Experienced financial executive with 20+ years in senior leadership roles. Specializes in financial transformation and risk management.',
        experience: 'executive',
        location: 'London, UK',
        salaryMin: '150000',
        salaryMax: '200000',
        availability: 'immediately',
        skills: ['Financial Planning', 'Risk Management', 'Strategic Leadership'],
        industries: ['Financial Services', 'Technology'],
        roles: ['NED', 'Board Member']
      },
      {
        email: 'michael.chen@example.com',
        firstName: 'Michael',
        lastName: 'Chen',
        title: 'Technology Executive & Digital Transformation Leader',
        summary: 'Former CTO with expertise in digital transformation, AI/ML, and cybersecurity. Board experience with tech startups and scale-ups.',
        experience: 'executive',
        location: 'Manchester, UK',
        salaryMin: '120000',
        salaryMax: '180000',
        availability: '1month',
        skills: ['Digital Transformation', 'AI/ML', 'Cybersecurity'],
        industries: ['Technology', 'Telecommunications'],
        roles: ['Advisor', 'NED']
      },
      {
        email: 'amanda.williams@example.com',
        firstName: 'Amanda',
        lastName: 'Williams',
        title: 'Healthcare Industry Leader',
        summary: 'Former CEO of NHS Trust with deep experience in healthcare transformation and governance. Passionate about improving patient outcomes.',
        experience: 'executive',
        location: 'Edinburgh, Scotland',
        salaryMin: '140000',
        salaryMax: '180000',
        availability: '3months',
        skills: ['Change Management', 'Corporate Governance', 'Strategic Leadership'],
        industries: ['Healthcare', 'Government'],
        roles: ['Chair', 'Senior Independent Director']
      },
      {
        email: 'james.taylor@example.com',
        firstName: 'James',
        lastName: 'Taylor',
        title: 'ESG & Sustainability Expert',
        summary: 'Sustainability leader with experience implementing ESG strategies at Fortune 500 companies. Focus on climate risk and sustainable finance.',
        experience: 'senior',
        location: 'Bristol, UK',
        salaryMin: '100000',
        salaryMax: '150000',
        availability: 'immediately',
        skills: ['ESG', 'Risk Management', 'Corporate Governance'],
        industries: ['Energy', 'Financial Services'],
        roles: ['NED', 'Committee Chair']
      },
      {
        email: 'priya.patel@example.com',
        firstName: 'Priya',
        lastName: 'Patel',
        title: 'Retail & E-commerce Strategist',
        summary: 'Former CMO with expertise in retail transformation, customer experience, and digital commerce. Board advisor to several retail brands.',
        experience: 'senior',
        location: 'Birmingham, UK',
        salaryMin: '110000',
        salaryMax: '160000',
        availability: '2weeks',
        skills: ['Digital Transformation', 'Strategic Leadership', 'Change Management'],
        industries: ['Retail', 'Technology'],
        roles: ['Advisor', 'Board Member']
      },
      {
        email: 'robert.davies@example.com',
        firstName: 'Robert',
        lastName: 'Davies',
        title: 'M&A and Corporate Finance Expert',
        summary: 'Investment banker turned board advisor with extensive M&A experience. Specializes in corporate restructuring and growth strategies.',
        experience: 'executive',
        location: 'London, UK',
        salaryMin: '180000',
        salaryMax: '250000',
        availability: '1month',
        skills: ['M&A', 'Financial Planning', 'Strategic Leadership'],
        industries: ['Financial Services', 'Real Estate'],
        roles: ['NED', 'Committee Chair']
      },
      {
        email: 'lisa.morgan@example.com',
        firstName: 'Lisa',
        lastName: 'Morgan',
        title: 'Manufacturing & Operations Leader',
        summary: 'Former COO with expertise in lean manufacturing, supply chain optimization, and operational excellence. Board experience in industrial sectors.',
        experience: 'senior',
        location: 'Sheffield, UK',
        salaryMin: '95000',
        salaryMax: '140000',
        availability: 'immediately',
        skills: ['Change Management', 'Strategic Leadership', 'Risk Management'],
        industries: ['Manufacturing', 'Energy'],
        roles: ['NED', 'Board Member']
      },
      {
        email: 'david.thompson@example.com',
        firstName: 'David',
        lastName: 'Thompson',
        title: 'Cybersecurity & Risk Management Expert',
        summary: 'Former CISO with deep expertise in cybersecurity, data protection, and enterprise risk management. Advisor to financial services boards.',
        experience: 'executive',
        location: 'London, UK',
        salaryMin: '150000',
        salaryMax: '200000',
        availability: '1month',
        skills: ['Cybersecurity', 'Risk Management', 'Corporate Governance'],
        industries: ['Financial Services', 'Technology'],
        roles: ['Advisor', 'Committee Chair']
      },
      {
        email: 'emma.wilson@example.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        title: 'Education Sector Leader',
        summary: 'Former Vice-Chancellor with experience in higher education governance and transformation. Trustee of several educational charities.',
        experience: 'executive',
        location: 'Oxford, UK',
        salaryMin: '120000',
        salaryMax: '170000',
        availability: '3months',
        skills: ['Corporate Governance', 'Strategic Leadership', 'Change Management'],
        industries: ['Education', 'Government'],
        roles: ['Trustee', 'Chair']
      },
      {
        email: 'thomas.brown@example.com',
        firstName: 'Thomas',
        lastName: 'Brown',
        title: 'Real Estate & Infrastructure Expert',
        summary: 'Property developer and infrastructure investment specialist. Board experience with REITs and development companies.',
        experience: 'senior',
        location: 'Leeds, UK',
        salaryMin: '130000',
        salaryMax: '180000',
        availability: '2weeks',
        skills: ['M&A', 'Financial Planning', 'Risk Management'],
        industries: ['Real Estate', 'Financial Services'],
        roles: ['NED', 'Board Member']
      }
    ];

    const createdCandidates = [];

    for (const candidate of testCandidates) {
      // Create user first
      const userId = `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: candidate.email,
          role: 'candidate',
          first_name: candidate.firstName,
          last_name: candidate.lastName,
          is_active: true
        });

      if (userError) {
        console.error(`Error creating user ${candidate.email}:`, userError);
        continue;
      }

      // Create candidate profile
      const { data: profile, error: profileError } = await supabase
        .from('candidate_profiles')
        .insert({
          user_id: userId,
          title: candidate.title,
          summary: candidate.summary,
          experience: candidate.experience,
          location: candidate.location,
          salary_min: candidate.salaryMin,
          salary_max: candidate.salaryMax,
          salary_currency: 'GBP',
          availability: candidate.availability,
          is_active: true,
          is_public: true,
          profile_completed: true,
          is_anonymized: false,
          remote_preference: 'hybrid'
        })
        .select()
        .single();

      if (profileError) {
        console.error(`Error creating profile for ${candidate.email}:`, profileError);
        continue;
      }

      if (profile) {
        createdCandidates.push(profile);

        // Add tags
        const tagLinks = [];
        
        // Add skill tags
        for (const skillName of candidate.skills) {
          const tag = createdTags.find(t => t.name === skillName && t.type === 'skill');
          if (tag) {
            tagLinks.push({
              candidate_id: profile.id,
              tag_id: tag.id
            });
          }
        }

        // Add industry tags
        for (const industryName of candidate.industries) {
          const tag = createdTags.find(t => t.name === industryName && t.type === 'industry');
          if (tag) {
            tagLinks.push({
              candidate_id: profile.id,
              tag_id: tag.id
            });
          }
        }

        // Add role tags
        for (const roleName of candidate.roles) {
          const tag = createdTags.find(t => t.name === roleName && t.type === 'role');
          if (tag) {
            tagLinks.push({
              candidate_id: profile.id,
              tag_id: tag.id
            });
          }
        }

        if (tagLinks.length > 0) {
          const { error: tagError } = await supabase
            .from('candidate_tags')
            .insert(tagLinks);
          
          if (tagError) {
            console.error(`Error adding tags for ${candidate.email}:`, tagError);
          }
        }

        // Add work experience
        const { error: workError } = await supabase
          .from('work_experiences')
          .insert({
            candidate_id: profile.id,
            company_name: 'Previous Company',
            position: candidate.title.split(' - ')[0] || candidate.title,
            description: 'Senior leadership role with significant achievements in the industry.',
            start_date: '2015-01-01',
            end_date: '2023-12-31',
            is_current: false
          });

        if (workError) {
          console.error(`Error adding work experience for ${candidate.email}:`, workError);
        }
      }
    }

    console.log(`✅ Created ${createdCandidates.length} test candidates`);

    // 3. Create a company and add credits for the admin user
    console.log('\n🏢 Setting up admin user with company and credits...');

    // Check if admin user exists
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', ADMIN_USER_ID)
      .single();

    if (!adminUser) {
      console.log('⚠️  Admin user not found. They will be created when they sign in via Clerk webhook.');
    } else {
      // Update admin role to company (so they can search)
      await supabase
        .from('users')
        .update({ role: 'company' })
        .eq('id', ADMIN_USER_ID);

      // Create user_credits record
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', ADMIN_USER_ID)
        .single();

      if (!existingCredits) {
        const { error: creditError } = await supabase
          .from('user_credits')
          .insert({
            user_id: ADMIN_USER_ID,
            credits: 100,
            total_purchased: 100
          });

        if (creditError) {
          console.error('Error creating credits:', creditError);
        } else {
          // Log the credit transaction
          await supabase
            .from('credit_transactions')
            .insert({
              user_id: ADMIN_USER_ID,
              amount: 100,
              type: 'bonus',
              description: 'Initial credits for testing'
            });

          console.log('✅ Added 100 credits to admin account');
        }
      } else {
        console.log('ℹ️  Admin already has credits');
      }
    }

    console.log('\n🎉 Seed process complete!');
    console.log('\nYou can now:');
    console.log('1. Visit /admin/candidates to manage candidates');
    console.log('2. Visit /search to search for candidates');
    console.log('3. Use credits to unlock candidate profiles');

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();