import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log(`
=================================================================
AUDIT LOG FIX REQUIRED
=================================================================

The signup is failing because the audit log table expects UUID
but our users table uses TEXT for IDs.

Please run this SQL in your Supabase dashboard:

1. Go to SQL Editor
2. Run the migration from:
   supabase/migrations/20250104_fix_audit_log_constraints.sql

This will:
- Change audit log columns from UUID to TEXT
- Update foreign key constraints
- Fix the trigger to handle TEXT IDs properly

After running this migration, signup will work correctly!
=================================================================
`);

// Test current state
testCurrentState();

async function testCurrentState() {
  console.log('Testing current signup state...\n');
  
  // Check if we can query the audit logs table
  const { data: auditLogs, error: auditError } = await supabase
    .from('user_audit_logs')
    .select('id, user_id, admin_id, action')
    .limit(5);
    
  if (auditError) {
    console.log('❌ Cannot query audit logs:', auditError.message);
  } else {
    console.log(`✅ Found ${auditLogs?.length || 0} audit log entries`);
  }
  
  // Try the signup API
  console.log('\nTesting signup API...');
  const response = await fetch('http://localhost:3000/api/v1/candidates/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: `test_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      title: 'Test Executive',
      summary: 'This is a test profile to verify the signup is working after fixing the audit log constraints.',
      experience: 'senior',
      location: 'London, UK',
      linkedinUrl: 'https://linkedin.com/in/testuser',
      adminNotes: 'Test signup'
    })
  });
  
  const result = await response.json();
  
  if (response.ok && result.data) {
    console.log('✅ Signup successful!');
    console.log('   Profile ID:', result.data.profileId);
    console.log('   User ID:', result.data.userId);
  } else {
    console.log('❌ Signup failed:', result.message || result.error);
    if (result.message?.includes('foreign key constraint')) {
      console.log('\n⚠️  This confirms the UUID/TEXT mismatch issue.');
      console.log('   Please run the migration to fix it!');
    }
  }
}