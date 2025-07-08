import { supabaseAdmin } from '@/lib/supabase/client';

async function checkActiveProfiles() {
  console.log('Checking for active profiles...\n');

  try {
    // Check total profiles
    const { count: totalCount } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total profiles in database: ${totalCount}`);

    // Check active profiles
    const { count: activeCount } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`Active profiles: ${activeCount}`);

    // Check completed profiles
    const { count: completedCount } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_completed', true);
    
    console.log(`Completed profiles: ${completedCount}`);

    // Check active AND completed profiles
    const { count: activeCompleteCount } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('profile_completed', true);
    
    console.log(`Active AND completed profiles: ${activeCompleteCount}`);

    // Get a sample of active profiles
    const { data: sampleProfiles, error } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        is_active,
        profile_completed,
        created_at,
        users!candidate_profiles_user_id_fkey(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('is_active', true)
      .limit(5);

    if (error) {
      console.error('Error fetching sample profiles:', error);
      return;
    }

    console.log('\nSample active profiles:');
    sampleProfiles?.forEach(profile => {
      console.log(`- ID: ${profile.id}`);
      console.log(`  Title: ${profile.title || 'Not set'}`);
      console.log(`  User: ${profile.users?.first_name} ${profile.users?.last_name} (${profile.users?.email})`);
      console.log(`  Active: ${profile.is_active}, Completed: ${profile.profile_completed}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking profiles:', error);
  }
}

checkActiveProfiles();