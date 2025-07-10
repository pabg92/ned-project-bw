import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const clerkSecretKey = process.env.CLERK_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

async function createUserInDatabase() {
  // CHANGE THIS to the Clerk user ID from your console
  const CLERK_USER_ID = 'user_2zgX1opIYbGFN9z1ZiUWTLuayft';
  
  console.log(`📝 Creating user in database for Clerk ID: ${CLERK_USER_ID}\n`);
  
  try {
    // 1. Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(CLERK_USER_ID);
    
    if (!clerkUser) {
      console.error('❌ User not found in Clerk');
      return;
    }
    
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const imageUrl = clerkUser.imageUrl || '';
    
    console.log('Found Clerk user:');
    console.log(`- Email: ${email}`);
    console.log(`- Name: ${firstName} ${lastName}`);
    console.log(`- Created: ${new Date(clerkUser.createdAt).toLocaleString()}`);
    
    // 2. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', CLERK_USER_ID)
      .single();
      
    if (existingUser) {
      console.log('\n✅ User already exists in database');
      return;
    }
    
    // 3. Create user in database
    console.log('\n🔄 Creating user in database...');
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: CLERK_USER_ID,
        email: email,
        first_name: firstName,
        last_name: lastName,
        image_url: imageUrl,
        role: 'company', // Set as company user
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }
    
    console.log('✅ User created successfully!');
    console.log(`- Database ID: ${newUser.id}`);
    console.log(`- Role: ${newUser.role}`);
    
    // 4. Initialize credits for company user
    console.log('\n💳 Initializing credits...');
    
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: CLERK_USER_ID,
        credits: 0,
        total_purchased: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
    if (creditsError) {
      console.error('❌ Error creating credits:', creditsError);
    } else {
      console.log('✅ Credits initialized (0 credits)');
    }
    
    console.log('\n🎉 User setup complete!');
    console.log('Next steps:');
    console.log('1. Complete company onboarding at /company-onboarding');
    console.log('2. Add credits using: npx tsx scripts/assign-credits.ts');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createUserInDatabase().catch(console.error);