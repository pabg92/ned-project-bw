import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupUser() {
  // CHANGE THIS to the email you want to clean up
  const EMAIL_TO_CLEANUP = 'pablo@championsukplc.com';
  
  console.log(`🧹 Cleaning up user: ${EMAIL_TO_CLEANUP}\n`);
  
  try {
    // 1. Find the user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', EMAIL_TO_CLEANUP)
      .single();
      
    if (findError || !user) {
      console.log('❌ User not found in database');
      console.log('✅ Email is available for re-registration');
      return;
    }
    
    console.log('Found user:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    
    // 2. Check for related data
    console.log('\n🔍 Checking for related data...');
    
    // Check credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();
      
    if (credits) {
      console.log(`- Has ${credits.credits} credits`);
    }
    
    // Check company profile
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('company_name')
      .eq('user_id', user.id)
      .single();
      
    if (companyProfile) {
      console.log(`- Has company profile: ${companyProfile.company_name}`);
    }
    
    // Check candidate profile
    const { data: candidateProfile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (candidateProfile) {
      console.log(`- Has candidate profile`);
    }
    
    // 3. Delete the user (cascades to related tables)
    console.log('\n🗑️ Deleting user and all related data...');
    
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
      
    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError);
      return;
    }
    
    console.log('✅ User deleted successfully!');
    console.log(`\n${EMAIL_TO_CLEANUP} is now available for re-registration`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// For easier testing, let's also create a function to cleanup multiple test emails
async function cleanupTestEmails() {
  const testEmails = [
    'pablo@championsukplc.com',
    'test@example.com',
    'demo@company.com',
    // Add more test emails here as needed
  ];
  
  console.log('🧹 Cleaning up test emails...\n');
  
  for (const email of testEmails) {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (user) {
      await supabase.from('users').delete().eq('id', user.id);
      console.log(`✅ Deleted: ${email}`);
    } else {
      console.log(`⏭️ Not found: ${email}`);
    }
  }
  
  console.log('\n✅ Cleanup complete!');
}

// Run the cleanup
cleanupUser().catch(console.error);

// Uncomment to cleanup multiple test emails:
// cleanupTestEmails().catch(console.error);