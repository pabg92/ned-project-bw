import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCreditsToP() {
  const CREDITS_TO_ADD = 10;
  
  console.log('🏢 Looking for user "P" to add credits...\n');
  
  try {
    // Find users with first_name "P" and role "company"
    const { data: users, error: searchError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('first_name', 'P')
      .eq('role', 'company')
      .order('created_at', { ascending: false });
      
    if (searchError || !users || users.length === 0) {
      console.log('❌ No company users found with first name "P"');
      
      // Let's also search by email pattern
      const { data: gmailUsers } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, created_at')
        .like('email', '%@gmail.com')
        .eq('role', 'company')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (gmailUsers && gmailUsers.length > 0) {
        console.log('\nFound recent company users with Gmail:');
        gmailUsers.forEach(u => {
          console.log(`- ${u.email} (${u.first_name || 'No name'}) - Role: ${u.role}`);
        });
        console.log('\nPlease update the script with the exact email address.');
      }
      return;
    }
    
    // Use the most recent user named "P"
    const user = users[0];
    console.log('✅ Found user:', user.email);
    console.log('   Name:', user.first_name, user.last_name || '');
    console.log('   Role:', user.role);
    console.log('   User ID:', user.id);
    
    // Check if user_credits record exists
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (existingCredits) {
      // Update existing credits
      const newTotal = existingCredits.credits + CREDITS_TO_ADD;
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: newTotal,
          total_purchased: existingCredits.total_purchased + CREDITS_TO_ADD,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('❌ Error updating credits:', updateError);
        return;
      }
      
      console.log(`\n✅ Credits updated successfully!`);
      console.log(`   Previous balance: ${existingCredits.credits}`);
      console.log(`   Added: ${CREDITS_TO_ADD}`);
      console.log(`   New balance: ${newTotal}`);
    } else {
      // Create new credits record
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits: CREDITS_TO_ADD,
          total_purchased: CREDITS_TO_ADD,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('❌ Error creating credits record:', insertError);
        return;
      }
      
      console.log(`\n✅ Credits added successfully!`);
      console.log(`   Initial balance: ${CREDITS_TO_ADD}`);
    }
    
    console.log('\n🎯 Credits added!');
    console.log(`\n📋 User ${user.email} now has ${CREDITS_TO_ADD} credits`);
    console.log('\nThey can now:');
    console.log('1. Go to: http://localhost:3000/search');
    console.log('2. Browse profiles');
    console.log('3. Unlock up to 10 profiles with full details');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addCreditsToP().catch(console.error);