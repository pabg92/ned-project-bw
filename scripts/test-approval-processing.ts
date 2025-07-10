import { getSupabaseAdmin } from '@/lib/supabase/server-client';

async function testApprovalProcessing() {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Find a candidate profile to test with
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id, user_id, private_metadata, admin_notes')
      .limit(1);
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return;
    }
    
    const profile = profiles[0];
    console.log('Testing with profile:', profile.id);
    console.log('Admin notes:', profile.admin_notes);
    console.log('Private metadata:', JSON.stringify(profile.private_metadata, null, 2));
    
    // Test the approval endpoint
    const response = await fetch(`http://localhost:3001/api/admin/candidates/${profile.id}/approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approve',
        reason: 'Test approval processing',
        priority: 'medium',
        notifyCandidate: false
      })
    });
    
    const result = await response.json();
    console.log('Approval response:', JSON.stringify(result, null, 2));
    
    // Check the profile after processing
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id, is_active, profile_completed, private_metadata, salary_min, salary_max')
      .eq('id', profile.id)
      .single();
    
    if (updateError) {
      console.error('Error fetching updated profile:', updateError);
      return;
    }
    
    console.log('Updated profile:', JSON.stringify(updatedProfile, null, 2));
    
    // Check work experiences
    const { data: workExps, error: workError } = await supabaseAdmin
      .from('work_experiences')
      .select('*')
      .eq('candidate_id', profile.id);
    
    if (workError) {
      console.error('Error fetching work experiences:', workError);
    } else {
      console.log('Work experiences created:', workExps?.length || 0);
      if (workExps && workExps.length > 0) {
        console.log('First work experience:', JSON.stringify(workExps[0], null, 2));
      }
    }
    
    // Check education
    const { data: education, error: eduError } = await supabaseAdmin
      .from('education')
      .select('*')
      .eq('candidate_id', profile.id);
    
    if (eduError) {
      console.error('Error fetching education:', eduError);
    } else {
      console.log('Education records created:', education?.length || 0);
    }
    
    // Check tags
    const { data: tags, error: tagError } = await supabaseAdmin
      .from('candidate_tags')
      .select('*, tags(*)')
      .eq('candidate_id', profile.id);
    
    if (tagError) {
      console.error('Error fetching tags:', tagError);
    } else {
      console.log('Tags created:', tags?.length || 0);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApprovalProcessing();