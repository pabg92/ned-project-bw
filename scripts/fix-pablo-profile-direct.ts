import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Create Supabase client directly with env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixPabloProfile() {
  try {
    const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
    
    console.log('Fixing Pablo profile with complete data...');
    
    // 1. First check current data
    const { data: currentProfile, error: checkError } = await supabase
      .from('candidate_profiles')
      .select('*, users!candidate_profiles_user_id_fkey(*)')
      .eq('id', profileId)
      .single();
    
    if (checkError) {
      console.error('Error checking profile:', checkError);
      return;
    }
    
    console.log('Current summary:', currentProfile?.summary?.substring(0, 50) + '...');
    
    // 2. Update profile with proper bio
    const { error: profileError } = await supabase
      .from('candidate_profiles')
      .update({
        summary: `Accomplished CFO with 25+ years of experience leading financial strategy and transformation in FTSE 100 companies. Proven track record of driving growth through M&A, implementing digital finance transformation, and building high-performing teams. Passionate about sustainable finance and ESG integration.`,
        experience: 'executive',
        location: 'London, UK',
        availability: 'immediately',
        remote_preference: 'flexible',
        salary_min: '350000',
        salary_max: '450000',
        salary_currency: 'GBP',
        title: 'Former CFO - FTSE 100',
        linkedin_url: 'https://linkedin.com/in/sarahthompson',
        is_anonymized: false,
        profile_completed: true
      })
      .eq('id', profileId);
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }
    
    console.log('Profile bio updated!');
    
    // 3. Update user name to Sarah Thompson
    if (currentProfile?.user_id) {
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: 'Sarah',
          last_name: 'Thompson'
        })
        .eq('id', currentProfile.user_id);
      
      if (userError) {
        console.error('Error updating user:', userError);
      } else {
        console.log('User name updated to Sarah Thompson!');
      }
    }
    
    // 4. Add work experiences with is_board_position flag
    // First delete existing ones
    await supabase
      .from('work_experiences')
      .delete()
      .eq('candidate_id', profileId);
    
    // Then add new ones
    const workExperiences = [
      // Board Positions
      {
        candidate_id: profileId,
        company_name: 'TechCorp PLC',
        position: 'Non-Executive Director & Audit Chair',
        start_date: '2020-01-01',
        is_current: true,
        description: 'Leading audit committee through digital transformation and cybersecurity enhancement initiatives.',
        location: 'London, UK',
        is_board_position: true
      },
      {
        candidate_id: profileId,
        company_name: 'HealthTech Ltd',
        position: 'Independent Non-Executive Director',
        start_date: '2018-06-01',
        is_current: true,
        description: 'Providing strategic guidance on international expansion and M&A strategy.',
        location: 'London, UK',
        is_board_position: true
      },
      {
        candidate_id: profileId,
        company_name: 'Sustainable Finance Foundation',
        position: 'Trustee',
        start_date: '2019-03-01',
        is_current: true,
        description: 'Championing ESG integration in financial services sector.',
        location: 'London, UK',
        is_board_position: true
      },
      // Executive Positions
      {
        candidate_id: profileId,
        company_name: 'Global Finance Corp',
        position: 'Group Chief Financial Officer',
        start_date: '2015-01-01',
        end_date: '2020-12-31',
        is_current: false,
        description: 'Led financial strategy for £5bn revenue financial services group. Delivered 30% cost reduction through digital transformation while improving service quality.',
        location: 'London, UK',
        is_board_position: false
      },
      {
        candidate_id: profileId,
        company_name: 'Digital Banking PLC',
        position: 'Deputy CFO',
        start_date: '2010-06-01',
        end_date: '2015-01-01',
        is_current: false,
        description: 'Managed £2bn balance sheet transformation and regulatory compliance during major industry changes.',
        location: 'London, UK',
        is_board_position: false
      }
    ];
    
    const { error: workError } = await supabase
      .from('work_experiences')
      .insert(workExperiences);
    
    if (workError) {
      console.error('Error adding work experiences:', workError);
    } else {
      console.log('Work experiences added!');
    }
    
    // 5. Update education
    await supabase
      .from('education')
      .delete()
      .eq('candidate_id', profileId);
    
    const education = [
      {
        candidate_id: profileId,
        institution: 'London Business School',
        degree: 'MBA',
        field_of_study: 'Finance',
        graduation_year: '1998'
      },
      {
        candidate_id: profileId,
        institution: 'ICAEW',
        degree: 'ACA - Chartered Accountant',
        field_of_study: 'Accounting',
        graduation_year: '1995'
      },
      {
        candidate_id: profileId,
        institution: 'London School of Economics',
        degree: 'BSc Economics',
        field_of_study: 'Economics',
        graduation_year: '1993'
      }
    ];
    
    const { error: eduError } = await supabase
      .from('education')
      .insert(education);
    
    if (eduError) {
      console.error('Error adding education:', eduError);
    } else {
      console.log('Education added!');
    }
    
    // 6. Add skills and tags
    const skills = [
      { name: 'Financial Strategy', category: 'skill' },
      { name: 'M&A & Corporate Finance', category: 'skill' },
      { name: 'Digital Transformation', category: 'skill' },
      { name: 'Risk Management', category: 'skill' },
      { name: 'ESG & Sustainability', category: 'skill' },
      { name: 'Audit & Compliance', category: 'skill' }
    ];
    
    const sectors = [
      { name: 'CFO Leadership', category: 'sector' },
      { name: 'Strategic Planning', category: 'sector' },
      { name: 'Investor Relations', category: 'sector' },
      { name: 'Treasury Management', category: 'sector' },
      { name: 'Financial Reporting', category: 'sector' },
      { name: 'Cost Optimization', category: 'sector' }
    ];
    
    // Upsert tags
    for (const tag of [...skills, ...sectors]) {
      await supabase
        .from('tags')
        .upsert(tag, { onConflict: 'name' });
    }
    
    // Get all tags
    const { data: allTags } = await supabase
      .from('tags')
      .select('*')
      .in('name', [...skills.map(s => s.name), ...sectors.map(s => s.name)]);
    
    // Clear existing candidate tags
    await supabase
      .from('candidate_tags')
      .delete()
      .eq('candidate_id', profileId);
    
    // Add candidate tags
    if (allTags && allTags.length > 0) {
      const candidateTags = allTags.map(tag => ({
        candidate_id: profileId,
        tag_id: tag.id
      }));
      
      const { error: tagError } = await supabase
        .from('candidate_tags')
        .insert(candidateTags);
      
      if (tagError) {
        console.error('Error adding tags:', tagError);
      } else {
        console.log(`Added ${candidateTags.length} tags!`);
      }
    }
    
    console.log('\n✅ Profile completely updated! Please refresh the profile page.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  process.exit(0);
}

// Run the script
fixPabloProfile();