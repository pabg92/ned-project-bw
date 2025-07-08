import { config } from 'dotenv';
import path from 'path';
import { supabaseAdmin } from '../lib/supabase/client';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function updatePabloProfile() {
  try {
    const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
    
    console.log('Updating Pablo profile with sample data...');
    
    // Update profile summary
    const { error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .update({
        summary: `Accomplished CFO with 25+ years of experience leading financial strategy and transformation in FTSE 100 companies. Proven track record of driving growth through M&A, implementing digital finance transformation, and building high-performing teams. Passionate about sustainable finance and ESG integration.`,
        experience: 'senior',
        salary_min: '350000',
        salary_max: '450000',
        salary_currency: 'GBP'
      })
      .eq('id', profileId);
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }
    
    // Add work experiences
    const workExperiences = [
      {
        candidate_id: profileId,
        company_name: 'TechCorp PLC',
        position: 'Chief Financial Officer',
        start_date: '2020-01-01',
        end_date: null,
        is_current: true,
        description: 'Leading financial strategy for £5bn revenue financial services group. Delivered 30% cost reduction through digital transformation while improving service quality.',
        location: 'London, UK'
      },
      {
        candidate_id: profileId,
        company_name: 'Global Finance Corp',
        position: 'Deputy CFO',
        start_date: '2015-06-01',
        end_date: '2019-12-31',
        is_current: false,
        description: 'Managed £2bn balance sheet transformation and regulatory compliance during major industry changes.',
        location: 'London, UK'
      }
    ];
    
    // Delete existing work experiences
    await supabaseAdmin
      .from('work_experiences')
      .delete()
      .eq('candidate_id', profileId);
    
    // Insert new work experiences
    const { error: workError } = await supabaseAdmin
      .from('work_experiences')
      .insert(workExperiences);
    
    if (workError) {
      console.error('Error adding work experiences:', workError);
    }
    
    // Add education
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
        institution: 'University of Cambridge',
        degree: 'BA (Hons)',
        field_of_study: 'Economics',
        graduation_year: '1993'
      },
      {
        candidate_id: profileId,
        institution: 'ICAEW',
        degree: 'ACA - Chartered Accountant',
        field_of_study: 'Accounting',
        graduation_year: '1995'
      }
    ];
    
    // Delete existing education
    await supabaseAdmin
      .from('education')
      .delete()
      .eq('candidate_id', profileId);
    
    // Insert new education
    const { error: eduError } = await supabaseAdmin
      .from('education')
      .insert(education);
    
    if (eduError) {
      console.error('Error adding education:', eduError);
    }
    
    // Add skills and sectors
    // First, get or create tags
    const skillNames = [
      'Financial Strategy',
      'M&A & Corporate Finance', 
      'Digital Transformation',
      'Risk Management',
      'ESG & Sustainability'
    ];
    
    const sectorNames = [
      'Financial Services',
      'Technology',
      'Healthcare'
    ];
    
    // Get existing tags
    const { data: existingTags } = await supabaseAdmin
      .from('tags')
      .select('*')
      .in('name', [...skillNames, ...sectorNames]);
    
    // Create missing tags
    const existingTagNames = existingTags?.map(t => t.name) || [];
    const missingSkills = skillNames.filter(s => !existingTagNames.includes(s));
    const missingSectors = sectorNames.filter(s => !existingTagNames.includes(s));
    
    if (missingSkills.length > 0) {
      await supabaseAdmin
        .from('tags')
        .insert(missingSkills.map(name => ({ name, category: 'skill' })));
    }
    
    if (missingSectors.length > 0) {
      await supabaseAdmin
        .from('tags')
        .insert(missingSectors.map(name => ({ name, category: 'sector' })));
    }
    
    // Get all tags again
    const { data: allTags } = await supabaseAdmin
      .from('tags')
      .select('*')
      .in('name', [...skillNames, ...sectorNames]);
    
    // Delete existing candidate tags
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
    
    console.log('Profile updated successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
updatePabloProfile();