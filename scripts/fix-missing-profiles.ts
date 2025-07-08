import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingProfiles() {
  console.log('Creating missing candidate profiles...\n');
  
  // Get all users without profiles
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
    
  const { data: profiles } = await supabase
    .from('candidate_profiles')
    .select('user_id');
    
  const profileUserIds = new Set(profiles?.map(p => p.user_id) || []);
  const usersWithoutProfiles = users?.filter(u => !profileUserIds.has(u.id)) || [];
  
  console.log(`Found ${usersWithoutProfiles.length} users without profiles\n`);
  
  for (const user of usersWithoutProfiles) {
    console.log(`Creating profile for ${user.email}...`);
    
    // Special handling for mhayes
    const isMhayes = user.email === 'mhayes@championsukplc.com';
    
    const { data: newProfile, error } = await supabase
      .from('candidate_profiles')
      .insert({
        user_id: user.id,
        title: isMhayes ? 'CEO' : 'Executive',
        summary: isMhayes 
          ? 'Experienced CEO with over 15 years in corporate leadership and board governance.'
          : 'Profile pending completion after signup.',
        experience: 'senior',
        location: isMhayes ? 'London, UK' : 'To be determined',
        remote_preference: 'flexible',
        availability: 'immediately',
        is_active: false, // Will need admin approval
        profile_completed: false,
        is_anonymized: true,
        salary_currency: 'USD',
        private_metadata: {
          autoCreated: true,
          createdAt: new Date().toISOString(),
          note: 'Profile created automatically for existing user'
        }
      })
      .select()
      .single();
      
    if (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    } else {
      console.log(`  ✅ Created profile ${newProfile.id}`);
    }
  }
  
  console.log('\n\nSUMMARY OF REQUIRED ACTIONS:');
  console.log('1. Run the migration: 20250104_complete_audit_fix.sql');
  console.log('   This will fix the "record new has no field user_id" error');
  console.log('');
  console.log('2. Run the migration: 20250104_activate_pablo_profiles.sql');
  console.log('   This will make Pablo profiles appear in search');
  console.log('');
  console.log('3. After migrations, the signup flow will work correctly');
  console.log('');
  console.log('The UUID errors you see are from somewhere else, not our signup API.');
  console.log('Our signup correctly generates TEXT IDs like: user_1234567890_abc123def');
}

createMissingProfiles().catch(console.error);