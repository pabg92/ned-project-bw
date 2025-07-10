import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCompanyUserManually() {
  const COMPANY_EMAIL = 'auth.pg@gmail.com';
  const CREDITS_TO_ADD = 10;
  
  console.log('🏢 Creating company user manually...\n');
  
  try {
    // Generate a unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 1. Create the user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: COMPANY_EMAIL,
        first_name: 'P', // From Gmail account name
        last_name: '',
        role: 'company', // Important: set as company
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Error creating user:', userError);
      
      // Check if user already exists
      if (userError.code === '23505') {
        console.log('User might already exist, trying to find them...');
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', COMPANY_EMAIL)
          .single();
          
        if (existingUser) {
          console.log('Found existing user:', existingUser);
          userId = existingUser.id;
        }
      } else {
        return;
      }
    } else {
      console.log('✅ User created successfully!');
      console.log('   Email:', COMPANY_EMAIL);
      console.log('   User ID:', userId);
      console.log('   Role: company');
    }
    
    // 2. Create credits record
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits: CREDITS_TO_ADD,
        total_purchased: CREDITS_TO_ADD,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
    if (creditsError) {
      console.error('❌ Error creating credits:', creditsError);
      
      // Try updating if already exists
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits: CREDITS_TO_ADD,
          total_purchased: CREDITS_TO_ADD,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('❌ Error updating credits:', updateError);
      } else {
        console.log(`✅ Credits updated to ${CREDITS_TO_ADD}`);
      }
    } else {
      console.log(`✅ Added ${CREDITS_TO_ADD} credits`);
    }
    
    console.log('\n🎯 Setup complete!');
    console.log('\n📋 auth.pg@gmail.com can now:');
    console.log('1. Log in at: http://localhost:3000/sign-in');
    console.log('2. Skip company onboarding (or complete it)');
    console.log('3. Browse profiles at: http://localhost:3000/search');
    console.log('4. Unlock up to 10 profiles');
    console.log('\n⚠️ Note: Since this was manual creation, they might see onboarding page on first visit.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createCompanyUserManually().catch(console.error);