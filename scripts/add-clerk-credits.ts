import * as dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';

dotenv.config({ path: '.env.local' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
});

async function addCreditsToUser() {
  const email = 'it@championsukplc.com';
  const creditsToAdd = 10; // Credits for demo
  
  console.log(`💳 Adding ${creditsToAdd} credits to ${email} via Clerk...\n`);
  
  try {
    // 1. Find user by email
    console.log('🔍 Searching for user...');
    const users = await clerkClient.users.getUserList({
      emailAddress: [email]
    });
    
    if (!users.data.length) {
      console.error('❌ User not found with email:', email);
      return;
    }
    
    const user = users.data[0];
    console.log('✅ Found user:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.emailAddresses[0]?.emailAddress}`);
    console.log(`   - Name: ${user.firstName || user.lastName || 'Not set'}`);
    
    // 2. Get current credits
    const currentCredits = (user.publicMetadata?.credits as number) || 0;
    const currentUnlockedProfiles = (user.publicMetadata?.unlockedProfiles as string[]) || [];
    const currentCreditHistory = (user.privateMetadata?.creditHistory as any[]) || [];
    
    console.log(`\n📊 Current status:`);
    console.log(`   - Credits: ${currentCredits}`);
    console.log(`   - Unlocked profiles: ${currentUnlockedProfiles.length}`);
    
    // 3. Update metadata with new credits
    console.log(`\n🔄 Adding ${creditsToAdd} credits...`);
    
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        credits: currentCredits + creditsToAdd,
        // Preserve other metadata
        unlockedProfiles: currentUnlockedProfiles,
      },
      privateMetadata: {
        ...user.privateMetadata,
        creditHistory: [
          ...currentCreditHistory,
          {
            timestamp: new Date().toISOString(),
            amount: creditsToAdd,
            balance: currentCredits + creditsToAdd,
            reason: 'admin_grant',
            description: 'Demo credits for MD presentation',
            grantedBy: 'admin_script'
          }
        ]
      }
    });
    
    // 4. Verify update
    const updatedUser = await clerkClient.users.getUser(user.id);
    const newCredits = updatedUser.publicMetadata?.credits as number;
    
    console.log(`\n✅ Credits added successfully!`);
    console.log(`   - Previous balance: ${currentCredits}`);
    console.log(`   - Added: ${creditsToAdd}`);
    console.log(`   - New balance: ${newCredits}`);
    
    console.log(`\n🎯 Ready for MD demo!`);
    console.log(`The user can now unlock ${newCredits} profiles.`);
    console.log(`\n💡 Note: The user may need to refresh the page to see updated credits.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addCreditsToUser().catch(console.error);