import { config } from 'dotenv';
import { createClerkClient } from '@clerk/backend';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testUnlockProfile() {
  try {
    const userEmail = 'pablogarner@outlook.com';
    const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
    
    console.log(`Testing unlock for profile: ${profileId}`);
    
    // Get Clerk client
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });
    
    // Find user by email
    const users = await client.users.getUserList({
      emailAddress: [userEmail]
    });
    
    if (users.totalCount === 0) {
      console.error('User not found');
      return;
    }
    
    const user = users.data[0];
    console.log('Found user:', user.id);
    
    // Get current metadata
    const currentCredits = user.publicMetadata?.credits as number || 0;
    const unlockedProfiles = user.publicMetadata?.unlockedProfiles as string[] || [];
    
    console.log('Current credits:', currentCredits);
    console.log('Currently unlocked profiles:', unlockedProfiles);
    
    // Simulate unlocking the profile
    if (!unlockedProfiles.includes(profileId)) {
      console.log('Unlocking profile...');
      
      const updatedUser = await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          credits: currentCredits - 1,
          unlockedProfiles: [...unlockedProfiles, profileId]
        }
      });
      
      console.log('Profile unlocked successfully!');
      console.log('New credit balance:', updatedUser.publicMetadata?.credits);
      console.log('Unlocked profiles:', updatedUser.publicMetadata?.unlockedProfiles);
    } else {
      console.log('Profile is already unlocked!');
    }
    
  } catch (error) {
    console.error('Error testing unlock:', error);
  }
}

// Run the script
testUnlockProfile();