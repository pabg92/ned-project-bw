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

// Use existing user IDs
const candidateProfiles = [
  {
    user_id: 'test',
    title: 'Former CFO - FTSE 100',
    summary: 'Experienced CFO with 25+ years in financial leadership roles across FTSE 100 companies. Specialized in digital transformation and sustainable finance strategies.',
    experience: 'executive',
    location: 'London',
    remote_preference: 'hybrid',
    salary_min: '250000',
    salary_max: '400000',
    salary_currency: 'GBP',
    availability: 'immediately',
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
    user_id: 'test-1748952472892',
    title: 'Independent Director - Healthcare',
    summary: 'Healthcare industry veteran with deep expertise in clinical governance and pharmaceutical R&D. Board experience includes listed biotechs and NHS trusts.',
    experience: 'senior',
    location: 'Cambridge',
    remote_preference: 'onsite',
    salary_min: '150000',
    salary_max: '250000',
    salary_currency: 'GBP',
    availability: '1month',
    linkedin_url: 'https://linkedin.com/in/michael-chen',
    public_metadata: {
      boardPositions: 4,
      rating: 4.7,
      profileViews: 156
    },
    sectors: ['Healthcare', 'Biotech', 'Pharmaceuticals'],
    skills: ['Clinical Governance', 'R&D Strategy', 'Regulatory', 'Innovation', 'Board Governance']
  }
]

async function seedCandidates() {
  console.log('Starting to seed candidate profiles...')

  try {
    for (const profile of candidateProfiles) {
      // Delete existing profile if any
      await supabase
        .from('candidate_profiles')
        .delete()
        .eq('user_id', profile.user_id)

      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('candidate_profiles')
        .insert({
          user_id: profile.user_id,
          title: profile.title,
          summary: profile.summary,
          experience: profile.experience,
          location: profile.location,
          remote_preference: profile.remote_preference,
          salary_min: profile.salary_min,
          salary_max: profile.salary_max,
          salary_currency: profile.salary_currency,
          availability: profile.availability,
          linkedin_url: profile.linkedin_url,
          public_metadata: profile.public_metadata,
          is_active: true,
          is_public: true,
          profile_completed: true,
          is_anonymized: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error(`Error creating profile for user ${profile.user_id}:`, insertError)
        continue
      }

      console.log(`✓ Created profile for user ${profile.user_id}`)

      // Add tags (skills and sectors)
      const allTags = [...profile.skills, ...profile.sectors]
      
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
              type: profile.skills.includes(tagName) ? 'skill' : 'sector',
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

        if (relationError && !relationError.message.includes('duplicate')) {
          console.error(`Error adding tag ${tagName} to candidate:`, relationError)
        }
      }
    }

    console.log('\n✓ Seeding completed successfully!')
    
  } catch (error) {
    console.error('Error seeding candidates:', error)
    process.exit(1)
  }
}

// Run the seed function
seedCandidates()