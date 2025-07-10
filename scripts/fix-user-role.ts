import * as dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';

dotenv.config({ path: '.env.local' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
});

async function fixUserRole() {
  const email = 'it@championsukplc.com';
  
  console.log(`🔧 Fixing user role for ${email}...\n`);
  
  try {
    // 1. Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [email]
    });
    
    if (!users.data.length) {
      console.error('❌ User not found');
      return;
    }
    
    const user = users.data[0];
    console.log('Found user:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Current role in metadata: ${user.publicMetadata?.role || 'not set'}`);
    console.log(`- Credits: ${user.publicMetadata?.credits || 0}`);
    
    // 2. Update the role to 'company'
    console.log('\n🔄 Updating role to company...');
    
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'company', // This is the key fix!
        credits: user.publicMetadata?.credits || 10,
        unlockedProfiles: user.publicMetadata?.unlockedProfiles || [],
        companyName: user.publicMetadata?.companyName || 'Champions UK PLC',
        onboardingCompleted: true
      }
    });
    
    // 3. Verify the update
    const updatedUser = await clerkClient.users.getUser(user.id);
    
    console.log('\n✅ Role updated successfully!');
    console.log(`- New role: ${updatedUser.publicMetadata?.role}`);
    console.log(`- Credits: ${updatedUser.publicMetadata?.credits}`);
    console.log(`- Company: ${updatedUser.publicMetadata?.companyName}`);
    
    console.log('\n🎯 Now you can:');
    console.log('1. Access the search page as a company user');
    console.log('2. View your credits in the navbar');
    console.log('3. Unlock profiles with credits');
    console.log('\n💡 Refresh your browser to see the changes!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixUserRole().catch(console.error);