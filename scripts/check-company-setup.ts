import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCompanySetup() {
  console.log('🏢 Checking complete company setup for auth.pg@gmail.com...\n');
  
  try {
    // 1. Check user record
    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, role, created_at')
      .eq('email', 'auth.pg@gmail.com')
      .single();
      
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User Record:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Name: ${user.first_name || 'Not set'}`);
    console.log(`   - Role: ${user.role}`);
    
    // 2. Check credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('credits, total_purchased, updated_at')
      .eq('user_id', user.id)
      .single();
      
    if (credits) {
      console.log('\n✅ Credits:');
      console.log(`   - Current Balance: ${credits.credits}`);
      console.log(`   - Total Purchased: ${credits.total_purchased}`);
    } else {
      console.log('\n❌ No credits found');
    }
    
    // 3. Check company profile
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (companyProfile) {
      console.log('\n✅ Company Profile:');
      console.log(`   - Company: ${companyProfile.company_name}`);
      console.log(`   - Industry: ${companyProfile.industry || 'Not set'}`);
      console.log(`   - Size: ${companyProfile.company_size || 'Not set'}`);
      console.log(`   - Position: ${companyProfile.position || 'Not set'}`);
      console.log(`   - Website: ${companyProfile.website || 'Not set'}`);
      console.log(`   - Created: ${new Date(companyProfile.created_at).toLocaleString()}`);
    } else {
      console.log('\n❌ No company profile found');
      console.log('   → Need to complete onboarding at /company-onboarding');
    }
    
    // 4. Check if they've unlocked any profiles
    const { data: unlockedProfiles } = await supabase
      .from('unlocked_profiles')
      .select('profile_id, unlocked_at')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });
      
    if (unlockedProfiles && unlockedProfiles.length > 0) {
      console.log(`\n📋 Unlocked Profiles: ${unlockedProfiles.length}`);
      console.log(`   - Credits Used: ${unlockedProfiles.length}`);
      console.log(`   - Credits Remaining: ${credits?.credits || 0}`);
    } else {
      console.log('\n📋 No profiles unlocked yet');
    }
    
    console.log('\n🎯 Summary:');
    if (user && credits && companyProfile) {
      console.log('✅ Complete setup! Ready to unlock profiles.');
    } else {
      console.log('⚠️ Setup incomplete. Missing:', 
        !credits ? 'Credits' : '',
        !companyProfile ? 'Company Profile' : ''
      );
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCompanySetup().catch(console.error);