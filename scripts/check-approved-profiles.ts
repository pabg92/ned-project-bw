import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkApprovedProfiles() {
  console.log('🔍 Checking for approved and enriched profiles...\n');
  
  try {
    // Get all candidate profiles
    const { data: profiles, error } = await supabase
      .from('candidate_profiles')
      .select(`
        id,
        user_id,
        title,
        summary,
        is_active,
        is_anonymized,
        profile_completed,
        created_at,
        users!candidate_profiles_user_id_fkey(
          email,
          first_name,
          last_name
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    
    console.log(`Found ${profiles?.length || 0} active profiles:\n`);
    
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. Profile ID: ${profile.id}`);
        console.log(`   - User: ${profile.users?.email || 'Unknown'}`);
        console.log(`   - Name: ${profile.users?.first_name} ${profile.users?.last_name}`);
        console.log(`   - Title: ${profile.title || 'Not set'}`);
        console.log(`   - Anonymized: ${profile.is_anonymized}`);
        console.log(`   - Completed: ${profile.profile_completed}`);
        console.log(`   - Created: ${new Date(profile.created_at).toLocaleDateString()}`);
        console.log('');
      });
      
      // Check if any have work experiences (indicating enrichment)
      const profileIds = profiles.map(p => p.id);
      const { data: workExperiences } = await supabase
        .from('work_experiences')
        .select('candidate_id')
        .in('candidate_id', profileIds);
        
      const enrichedProfileIds = new Set(workExperiences?.map(we => we.candidate_id) || []);
      
      console.log(`\n📊 Enrichment Status:`);
      console.log(`- Total profiles: ${profiles.length}`);
      console.log(`- Enriched profiles: ${enrichedProfileIds.size}`);
      console.log(`- Need enrichment: ${profiles.length - enrichedProfileIds.size}`);
      
      if (enrichedProfileIds.size > 0) {
        console.log(`\n✅ Enriched profile IDs that can be viewed:`);
        Array.from(enrichedProfileIds).forEach(id => {
          console.log(`   - ${id}`);
        });
      }
    } else {
      console.log('❌ No active profiles found');
      console.log('\nTo create test profiles:');
      console.log('1. Sign up as a candidate at /sign-up');
      console.log('2. Approve the profile in the admin panel');
      console.log('3. The profile will be automatically enriched');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkApprovedProfiles().catch(console.error);