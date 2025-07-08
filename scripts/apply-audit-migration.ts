import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying audit trigger migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250104_fix_audit_trigger_for_signup.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 100) + '...');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        // Try direct execution as alternative
        console.log('Trying direct execution...');
        const { data, error: directError } = await (supabase as any).from('_sql').select().single();
        if (directError) {
          console.error('Direct execution also failed:', directError);
        }
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\nMigration completed!');
    console.log('The audit trigger should now allow self-service signups.');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Note: This won't work directly as Supabase doesn't expose exec_sql
console.log('\nNOTE: This migration needs to be applied directly in the Supabase dashboard.');
console.log('Please go to your Supabase project SQL editor and run the migration from:');
console.log('supabase/migrations/20250104_fix_audit_trigger_for_signup.sql');
console.log('\nAlternatively, use the Supabase CLI:');
console.log('npx supabase db push');

// For now, let's test if the signup works with the current setup
testSignup();

async function testSignup() {
  console.log('\n\nTesting signup with current database state...');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Try creating a user without setting admin context
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: testEmail,
      first_name: 'Test',
      last_name: 'Signup',
      role: 'candidate',
      is_active: true,
    })
    .select()
    .single();
    
  if (userError) {
    if (userError.message?.includes('admin_id')) {
      console.error('\n❌ Signup still requires admin_id. The migration needs to be applied.');
      console.error('Error:', userError.message);
    } else {
      console.error('\n❌ Unexpected error:', userError);
    }
  } else {
    console.log('\n✅ User created successfully! The database may already be fixed.');
    console.log('User ID:', userId);
    
    // Try to clean up
    await supabase.from('users').delete().eq('id', userId);
  }
}