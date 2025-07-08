import { config } from 'dotenv';
import path from 'path';
import { supabaseAdmin } from '../lib/supabase/client';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixPabloCompleteProfile() {
  try {
    const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
    
    console.log('Updating Pablo profile with complete CV data...');
    
    // 1. Update profile with proper bio and details
    const { error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .update({
        summary: `Accomplished CFO with 25+ years of experience leading financial strategy and transformation in FTSE 100 companies. Proven track record of driving growth through M&A, implementing digital finance transformation, and building high-performing teams. Passionate about sustainable finance and ESG integration.`,
        experience: 'executive', // 25+ years
        location: 'London, UK',
        availability: 'immediately',
        remote_preference: 'hybrid',
        salary_min: '350000',
        salary_max: '450000',
        salary_currency: 'GBP',
        title: 'Former CFO - FTSE 100',
        linkedin_url: 'https://linkedin.com/in/pablogarner',
        is_anonymized: false,
        profile_completed: true
      })
      .eq('id', profileId);
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }
    
    // 2. Update user details
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        first_name: 'Sarah',
        last_name: 'Thompson',
        image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
      })
      .eq('id', (await supabaseAdmin.from('candidate_profiles').select('user_id').eq('id', profileId).single()).data?.user_id);
    
    if (userError) {
      console.error('Error updating user:', userError);
    }
    
    // 3. Clear and add Board Experience
    await supabaseAdmin
      .from('work_experiences')
      .delete()
      .eq('candidate_id', profileId);
    
    const boardExperiences = [
      {
        candidate_id: profileId,
        company_name: 'TechCorp PLC',
        position: 'Non-Executive Director & Audit Chair',
        start_date: '2020-01-01',
        end_date: null,
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
        end_date: null,
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
        end_date: null,
        is_current: true,
        description: 'Championing ESG integration in financial services sector.',
        location: 'London, UK',
        is_board_position: true
      }
    ];
    
    // 4. Add Executive Experience
    const executiveExperiences = [
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
        end_date: '2014-12-31',
        is_current: false,
        description: 'Managed £2bn balance sheet transformation and regulatory compliance during major industry changes.',
        location: 'London, UK',
        is_board_position: false
      }
    ];
    
    const { error: workError } = await supabaseAdmin
      .from('work_experiences')
      .insert([...boardExperiences, ...executiveExperiences]);
    
    if (workError) {
      console.error('Error adding work experiences:', workError);
    }
    
    // 5. Update Education
    await supabaseAdmin
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
    
    const { error: eduError } = await supabaseAdmin
      .from('education')
      .insert(education);
    
    if (eduError) {
      console.error('Error adding education:', eduError);
    }
    
    // 6. Add Skills and Sectors
    const skillNames = [
      'Financial Strategy',
      'M&A & Corporate Finance',
      'Digital Transformation',
      'Risk Management',
      'ESG & Sustainability',
      'Audit & Compliance'
    ];
    
    const functionalExpertise = [
      'CFO Leadership',
      'Strategic Planning',
      'Investor Relations',
      'Treasury Management',
      'Financial Reporting',
      'Cost Optimization'
    ];
    
    // Create tags if they don't exist
    for (const skill of skillNames) {
      await supabaseAdmin
        .from('tags')
        .upsert({ name: skill, category: 'skill' }, { onConflict: 'name' });
    }
    
    for (const expertise of functionalExpertise) {
      await supabaseAdmin
        .from('tags')
        .upsert({ name: expertise, category: 'sector' }, { onConflict: 'name' });
    }
    
    // Get all tags
    const { data: allTags } = await supabaseAdmin
      .from('tags')
      .select('*')
      .in('name', [...skillNames, ...functionalExpertise]);
    
    // Clear existing tags
    await supabaseAdmin
      .from('candidate_tags')
      .delete()
      .eq('candidate_id', profileId);
    
    // Add candidate tags
    if (allTags) {
      const candidateTags = allTags.map(tag => ({
        candidate_id: profileId,
        tag_id: tag.id
      }));
      
      const { error: tagError } = await supabaseAdmin
        .from('candidate_tags')
        .insert(candidateTags);
      
      if (tagError) {
        console.error('Error adding tags:', tagError);
      }
    }
    
    // 7. Add Key Achievements (these would normally be stored in a separate table)
    // For now, they're hardcoded in the UI
    
    console.log('Profile updated successfully with complete CV data!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
fixPabloCompleteProfile();