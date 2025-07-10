import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDemoCredits() {
  const email = 'it@championsukplc.com';
  const creditsToAdd = 10; // Enough for the demo
  
  console.log(`💳 Adding ${creditsToAdd} credits to ${email}...\n`);
  
  try {
    // 1. Find the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, first_name')
      .eq('email', email)
      .single();
      
    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return;
    }
    
    console.log('Found user:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Company: ${user.first_name}`);
    console.log(`- Role: ${user.role}`);
    
    // 2. Check current credits
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('credits, total_purchased')
      .eq('user_id', user.id)
      .single();
      
    const currentBalance = currentCredits?.credits || 0;
    console.log(`\nCurrent credit balance: ${currentBalance}`);
    
    // 3. Update or insert credits
    if (currentCredits) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: currentBalance + creditsToAdd,
          total_purchased: (currentCredits.total_purchased || 0) + creditsToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('❌ Error updating credits:', updateError);
        return;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          credits: creditsToAdd,
          total_purchased: creditsToAdd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (insertError) {
        console.error('❌ Error inserting credits:', insertError);
        return;
      }
    }
    
    // 4. Add transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: creditsToAdd,
        type: 'bonus',
        description: `Demo credits for MD presentation`,
        created_at: new Date().toISOString(),
      });
      
    if (transactionError) {
      console.error('⚠️ Warning: Could not create transaction record:', transactionError);
    }
    
    // 5. Verify new balance
    const { data: newCredits } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();
      
    console.log(`\n✅ Credits added successfully!`);
    console.log(`New balance: ${newCredits?.credits || 0} credits`);
    console.log(`\n🎯 Ready for MD demo!`);
    console.log(`The company "${user.first_name}" can now unlock ${creditsToAdd} profiles.`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addDemoCredits().catch(console.error);