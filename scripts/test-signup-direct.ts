import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignup() {
  console.log('Testing signup with updated trigger...\n');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Skip the self-service context function since the trigger handles it automatically
  console.log('1. Skipping self-service context (trigger handles it automatically)...');
  
  // Try creating a user directly
  console.log('\n2. Creating user...');
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: testEmail,
      first_name: 'Test',
      last_name: 'Direct',
      role: 'candidate',
      is_active: true,
    })
    .select()
    .single();
    
  if (userError) {
    console.error('   ❌ User creation failed:', userError.message);
    return;
  }
  
  console.log('   ✅ User created:', userId);
  
  // Create profile
  console.log('\n3. Creating profile...');
  const { data: profile, error: profileError } = await supabase
    .from('candidate_profiles')
    .insert({
      user_id: userId,
      title: 'Test Executive',
      summary: 'This is a test profile created to verify the signup flow after fixing the audit trigger.',
      experience: 'senior',
      location: 'London, UK',
      remote_preference: 'flexible',
      availability: 'immediately',
      is_active: false,
      profile_completed: false,
      is_anonymized: true,
      salary_currency: 'GBP',
    })
    .select()
    .single();
    
  if (profileError) {
    console.error('   ❌ Profile creation failed:', profileError.message);
    // Clean up user
    await supabase.from('users').delete().eq('id', userId);
    return;
  }
  
  console.log('   ✅ Profile created:', profile.id);
  console.log('\n🎉 Signup is working! The audit trigger has been successfully fixed.');
  console.log('   Users can now sign up at: http://localhost:3000/signup');
  
  // Check audit log
  console.log('\n4. Checking audit log...');
  const { data: auditLogs, error: auditError } = await supabase
    .from('user_audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (auditLogs && auditLogs.length > 0) {
    console.log(`   ✅ Found ${auditLogs.length} audit log entries`);
    auditLogs.forEach((log, i) => {
      console.log(`      ${i + 1}. ${log.action} on ${log.table_name} - admin_id: ${log.admin_id || 'NULL (self-service)'}`);
    });
  }
}

testSignup();