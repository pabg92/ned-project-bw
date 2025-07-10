import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserUpdate() {
  const userId = 'user_2zgX1opIYbGFN9z1ZiUWTLuayft';
  
  console.log('🧪 Testing user update for:', userId);
  
  try {
    // First, get the current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return;
    }
    
    console.log('\nCurrent user:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- First Name:', user.first_name);
    
    // List all columns
    console.log('\nAll user fields:');
    Object.keys(user).forEach(key => {
      console.log(`- ${key}: ${user[key]}`);
    });
    
    // Now try to update just the role
    console.log('\n🔄 Attempting to update role to company...');
    const { error: updateError1 } = await supabase
      .from('users')
      .update({ role: 'company' })
      .eq('id', userId);
      
    if (updateError1) {
      console.error('Error updating role only:', updateError1);
    } else {
      console.log('✅ Role update successful');
    }
    
    // Try to update with all fields from the API
    console.log('\n🔄 Attempting full update...');
    const { error: updateError2 } = await supabase
      .from('users')
      .update({
        first_name: 'Test Company Name',
        role: 'company',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
      
    if (updateError2) {
      console.error('❌ Error with full update:', updateError2);
    } else {
      console.log('✅ Full update successful');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testUserUpdate().catch(console.error);