import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCreditsToCompany() {
  // IMPORTANT: Replace this with the actual company email after signup
  const COMPANY_EMAIL = 'your-company@example.com'; // <-- UPDATE THIS
  const CREDITS_TO_ADD = 20; // Enough for a good demo
  
  console.log('🏢 Adding credits to company account...\n');
  
  try {
    // 1. Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', COMPANY_EMAIL)
      .single();
      
    if (userError || !user) {
      console.error('❌ User not found. Make sure to update COMPANY_EMAIL with the actual email used during signup.');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('   Role:', user.role);
    console.log('   User ID:', user.id);
    
    if (user.role !== 'company') {
      console.error('⚠️ Warning: User role is not "company". Current role:', user.role);
    }
    
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
    
    // 3. Create a credit purchase record for tracking
    const { error: purchaseError } = await supabase
      .from('credit_purchases')
      .insert({
        user_id: user.id,
        package_name: 'Demo Credits',
        credits: CREDITS_TO_ADD,
        amount: 0, // Free for demo
        currency: 'GBP',
        payment_status: 'completed',
        payment_method: 'manual',
        created_at: new Date().toISOString()
      });
      
    if (purchaseError) {
      console.warn('⚠️ Could not create purchase record:', purchaseError);
      // This is not critical, continue
    }
    
    console.log('\n🎯 Demo Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Log in as:', COMPANY_EMAIL);
    console.log('2. Go to: http://localhost:3000/search');
    console.log('3. Browse anonymized profiles');
    console.log('4. Click "Unlock Profile (1 Credit)" on any profile');
    console.log('5. Profile will show full details including:');
    console.log('   - Full name and contact info');
    console.log('   - Complete work history');
    console.log('   - PE deal experiences');
    console.log('   - Board committees');
    console.log('   - LinkedIn profile');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addCreditsToCompany().catch(console.error);