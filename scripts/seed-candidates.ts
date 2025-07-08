import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const candidates = [
  {
    user_id: 'exec-sarah-thompson',
    first_name: 'Sarah',
    last_name: 'Thompson',
    email: 'sarah.thompson@example.com',
    title: 'Former CFO - FTSE 100',
    summary: 'Experienced CFO with 25+ years in financial leadership roles across FTSE 100 companies. Specialized in digital transformation and sustainable finance strategies.',
    experience: 'executive',
    location: 'London',
    remote_preference: 'hybrid',
    salary_min: '250000',
    salary_max: '400000',
    salary_currency: 'GBP',
    availability: 'immediate',
    linkedin_url: 'https://linkedin.com/in/sarah-thompson',
    public_metadata: {
      boardPositions: 3,
      rating: 4.8,
      profileViews: 234
    },
    sectors: ['Financial Services', 'Technology', 'Healthcare'],
    skills: ['Financial Strategy', 'M&A', 'Risk Management', 'Digital Transformation', 'ESG']
  },
  {
    user_id: 'exec-michael-chen',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    title: 'Independent Director - Healthcare',
    summary: 'Healthcare industry veteran with deep expertise in clinical governance and pharmaceutical R&D. Board experience includes listed biotechs and NHS trusts.',
    experience: 'senior',
    location: 'Cambridge',
    remote_preference: 'onsite',
    salary_min: '150000',
    salary_max: '250000',
    salary_currency: 'GBP',
    availability: '1_month',
    linkedin_url: 'https://linkedin.com/in/michael-chen',
    public_metadata: {
      boardPositions: 4,
      rating: 4.7,
      profileViews: 156
    },
    sectors: ['Healthcare', 'Biotech', 'Pharmaceuticals'],
    skills: ['Clinical Governance', 'R&D Strategy', 'Regulatory', 'Innovation', 'Board Governance']
  },
  {
    user_id: 'exec-emma-wilson',
    first_name: 'Emma',
    last_name: 'Wilson',
    email: 'emma.wilson@example.com',
    title: 'CEO - Technology Sector',
    summary: 'Technology sector CEO with proven track record of scaling businesses from startup to IPO. Expert in digital transformation and innovation strategy.',
    experience: 'executive',
    location: 'Manchester',
    remote_preference: 'remote',
    salary_min: '300000',
    salary_max: '500000',
    salary_currency: 'GBP',
    availability: '3_months',
    linkedin_url: 'https://linkedin.com/in/emma-wilson',
    public_metadata: {
      boardPositions: 2,
      rating: 4.9,
      profileViews: 189
    },
    sectors: ['Technology', 'SaaS', 'Fintech'],
    skills: ['Strategy', 'Growth', 'Leadership', 'Innovation', 'Digital']
  },
  {
    user_id: 'exec-james-patel',
    first_name: 'James',
    last_name: 'Patel',
    email: 'james.patel@example.com',
    title: 'CMO - Retail & Consumer',
    summary: 'Award-winning CMO with extensive experience in retail transformation and omnichannel strategy. Led marketing for several major UK retail brands.',
    experience: 'senior',
    location: 'Birmingham',
    remote_preference: 'hybrid',
    salary_min: '180000',
    salary_max: '280000',
    salary_currency: 'GBP',
    availability: 'immediate',
    linkedin_url: 'https://linkedin.com/in/james-patel',
    public_metadata: {
      boardPositions: 1,
      rating: 4.6,
      profileViews: 145
    },
    sectors: ['Retail', 'E-commerce', 'Consumer Goods'],
    skills: ['Brand Strategy', 'Digital Marketing', 'Customer Experience', 'Data Analytics', 'Transformation']
  },
  {
    user_id: 'exec-lisa-johnson',
    first_name: 'Lisa',
    last_name: 'Johnson',
    email: 'lisa.johnson@example.com',
    title: 'CHRO - Financial Services',
    summary: 'Transformational HR leader with expertise in culture change and diversity initiatives. Proven track record in highly regulated financial services environments.',
    experience: 'executive',
    location: 'Edinburgh',
    remote_preference: 'hybrid',
    salary_min: '200000',
    salary_max: '350000',
    salary_currency: 'GBP',
    availability: '6_months',
    linkedin_url: 'https://linkedin.com/in/lisa-johnson',
    public_metadata: {
      boardPositions: 2,
      rating: 4.8,
      profileViews: 178
    },
    sectors: ['Financial Services', 'Insurance', 'Banking'],
    skills: ['HR Strategy', 'Culture Change', 'D&I', 'Talent Management', 'Organizational Design']
  },
  {
    user_id: 'exec-robert-davies',
    first_name: 'Robert',
    last_name: 'Davies',
    email: 'robert.davies@example.com',
    title: 'COO - Manufacturing',
    summary: 'Operations excellence expert with three decades of experience in global manufacturing. Specialist in sustainable operations and supply chain resilience.',
    experience: 'executive',
    location: 'Leeds',
    remote_preference: 'onsite',
    salary_min: '220000',
    salary_max: '380000',
    salary_currency: 'GBP',
    availability: '3_months',
    linkedin_url: 'https://linkedin.com/in/robert-davies',
    public_metadata: {
      boardPositions: 5,
      rating: 4.9,
      profileViews: 267
    },
    sectors: ['Manufacturing', 'Supply Chain', 'Automotive'],
    skills: ['Operations', 'Lean Six Sigma', 'Supply Chain', 'Sustainability', 'Cost Optimization']
  }
]

async function seedCandidates() {
  console.log('Starting to seed candidates...')

  try {
    // First check if we can use existing users or create without audit logs
    for (const candidate of candidates) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', candidate.email)
        .single()

      let userId = candidate.user_id
      
      if (existingUser) {
        userId = existingUser.id
        console.log(`Using existing user for ${candidate.email}`)
      }

      // Create or update candidate profile
      const { data: existingProfile } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      const profileData = {
        user_id: userId,
        title: candidate.title,
        summary: candidate.summary,
        experience: candidate.experience,
        location: candidate.location,
        remote_preference: candidate.remote_preference,
        salary_min: candidate.salary_min,
        salary_max: candidate.salary_max,
        salary_currency: candidate.salary_currency,
        availability: candidate.availability,
        linkedin_url: candidate.linkedin_url,
        public_metadata: candidate.public_metadata,
        is_active: true,
        is_public: true,
        profile_completed: true,
        is_anonymized: false,
        updated_at: new Date().toISOString()
      }

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('candidate_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)

        if (updateError) {
          console.error(`Error updating profile for ${candidate.email}:`, updateError)
          continue
        }
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from('candidate_profiles')
          .insert({
            ...profileData,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          console.error(`Error creating profile for ${candidate.email}:`, insertError)
          continue
        }

        // Add tags (skills and sectors)
        const allTags = [...candidate.skills, ...candidate.sectors]
        
        for (const tagName of allTags) {
          // First ensure tag exists
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single()

          let tagId: string
          
          if (existingTag) {
            tagId = existingTag.id
          } else {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({
                name: tagName,
                type: candidate.skills.includes(tagName) ? 'skill' : 'sector',
                created_at: new Date().toISOString()
              })
              .select()
              .single()

            if (tagError) {
              console.error(`Error creating tag ${tagName}:`, tagError)
              continue
            }
            
            tagId = newTag.id
          }

          // Add candidate_tag relationship
          const { error: relationError } = await supabase
            .from('candidate_tags')
            .insert({
              candidate_id: newProfile.id,
              tag_id: tagId,
              created_at: new Date().toISOString()
            })

          if (relationError) {
            console.error(`Error adding tag ${tagName} to candidate:`, relationError)
          }
        }
      }

      console.log(`✓ Seeded candidate: ${candidate.first_name} ${candidate.last_name}`)
    }

    console.log('\n✓ Seeding completed successfully!')
    
  } catch (error) {
    console.error('Error seeding candidates:', error)
    process.exit(1)
  }
}

// Run the seed function
seedCandidates()