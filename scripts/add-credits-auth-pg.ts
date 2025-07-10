import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCreditsToAuthPG() {
  const COMPANY_EMAIL = 'auth.pg@gmail.com';
  const CREDITS_TO_ADD = 10;
  
  console.log('🏢 Adding credits to auth.pg@gmail.com...\n');
  
  try {
    // 1. Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', COMPANY_EMAIL)
      .single();
      
    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('   Role:', user.role);
    console.log('   User ID:', user.id);
    
    // 2. Check if user_credits record exists
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
    
    // 3. Create a credit purchase record
    const { error: purchaseError } = await supabase
      .from('credit_purchases')
      .insert({
        user_id: user.id,
        package_name: 'Demo Credits',
        credits: CREDITS_TO_ADD,
        amount: 0,
        currency: 'GBP',
        payment_status: 'completed',
        payment_method: 'manual',
        created_at: new Date().toISOString()
      });
      
    if (purchaseError) {
      console.warn('⚠️ Could not create purchase record:', purchaseError);
    }
    
    console.log('\n🎯 Credits added to auth.pg@gmail.com!');
    console.log('\n📋 Next Steps:');
    console.log('1. Log in as: auth.pg@gmail.com');
    console.log('2. Go to: http://localhost:3000/search');
    console.log('3. You can now unlock up to 10 profiles');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addCreditsToAuthPG().catch(console.error);