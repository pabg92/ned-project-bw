import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Your hardcoded admin user ID
const ADMIN_USER_ID = 'user_2xxPM7cYdgriSxF3cvcAuTMpiCM';

async function seedData() {
  try {
    console.log('🌱 Starting simplified seed process...');

    // 1. Ensure admin user exists and has credits
    console.log('\n💳 Setting up admin credits...');

    // Check if admin user exists
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', ADMIN_USER_ID)
      .single();

    if (!adminUser) {
      console.log('⚠️  Admin user not found. Please sign in first to create your user record.');
      console.log('After signing in, run this script again.');
      return;
    }

    // Update admin to company role
    await supabase
      .from('users')
      .update({ role: 'company' })
      .eq('id', ADMIN_USER_ID);

    // Check/create user_credits
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', ADMIN_USER_ID)
      .single();

    if (!existingCredits) {
      const { error: creditError } = await supabase
        .from('user_credits')
        .insert({
          user_id: ADMIN_USER_ID,
          credits: 100,
          total_purchased: 100
        });

      if (!creditError) {
        // Log the credit transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: ADMIN_USER_ID,
            amount: 100,
            type: 'bonus',
            description: 'Initial credits for testing'
          });

        console.log('✅ Added 100 credits to your account');
      }
    } else {
      console.log(`ℹ️  You already have ${existingCredits.credits} credits`);
    }

    // 2. Create basic tags
    console.log('\n📌 Creating essential tags...');
    
    const essentialTags = [
      { name: 'Digital Transformation', type: 'skill' },
      { name: 'Risk Management', type: 'skill' },
      { name: 'ESG', type: 'skill' },
      { name: 'Strategic Leadership', type: 'skill' },
      { name: 'Financial Services', type: 'industry' },
      { name: 'Technology', type: 'industry' },
      { name: 'Healthcare', type: 'industry' },
      { name: 'Chair', type: 'role' },
      { name: 'NED', type: 'role' },
      { name: 'Advisor', type: 'role' }
    ];

    for (const tag of essentialTags) {
      await supabase
        .from('tags')
        .upsert(tag, { onConflict: 'name' });
    }

    console.log('✅ Essential tags created');

    // 3. Check existing candidates
    const { data: existingCandidates, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('*, users!inner(*)')
      .limit(5);

    if (existingCandidates && existingCandidates.length > 0) {
      console.log(`\n📊 Found ${existingCandidates.length} existing candidates:`);
      existingCandidates.forEach((candidate) => {
        console.log(`  - ${candidate.users.first_name} ${candidate.users.last_name}: ${candidate.title || 'No title'}`);
      });
    } else {
      console.log('\n⚠️  No candidates found in the database.');
      console.log('To create test candidates:');
      console.log('1. Use the admin portal at /admin/candidates to manually create candidates');
      console.log('2. Or check if there are any database triggers preventing candidate creation');
    }

    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000/admin to access the admin portal');
    console.log('2. Go to /admin/candidates to manually create test candidates');
    console.log('3. Then visit /search to test the search functionality');
    console.log(`4. You have ${existingCredits?.credits || 100} credits to unlock profiles`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the seed function
seedData();