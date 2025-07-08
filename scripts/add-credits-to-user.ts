import { config } from 'dotenv';
import { createClerkClient } from '@clerk/backend';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function addCreditsToUser() {
  try {
    const userEmail = 'pablo.garner@championsukplc.com';
    const creditsToAdd = 10;
    
    console.log(`Adding ${creditsToAdd} credits to user: ${userEmail}`);
    
    // Get Clerk client
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });
    
    // Find user by email or list all users
    console.log('Searching for user...');
    let users = await client.users.getUserList({
      emailAddress: [userEmail]
    });
    
    if (users.totalCount === 0) {
      console.log('User not found by email, listing all users:');
      const allUsers = await client.users.getUserList({ limit: 10 });
      console.log('Total users:', allUsers.totalCount);
      allUsers.data.forEach(u => {
        console.log(`- ${u.id}: ${u.emailAddresses.map(e => e.emailAddress).join(', ')}`);
      });
      
      // Try to find the user in the list
      const targetUser = allUsers.data.find(u => 
        u.emailAddresses.some(e => e.emailAddress.includes('pablo'))
      );
      
      if (!targetUser) {
        console.error('Could not find user');
        return;
      }
      
      users = { data: [targetUser], totalCount: 1 };
    }
    
    const user = users.data[0];
    console.log('Found user:', user.id);
    
    // Get current credits
    const currentCredits = user.publicMetadata?.credits as number || 0;
    console.log('Current credits:', currentCredits);
    
    // Update user metadata with new credits
    const updatedUser = await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        credits: currentCredits + creditsToAdd,
      }
    });
    
    console.log('Credits updated successfully!');
    console.log('New credit balance:', updatedUser.publicMetadata?.credits);
    
  } catch (error) {
    console.error('Error adding credits:', error);
  }
}

// Run the script
addCreditsToUser();