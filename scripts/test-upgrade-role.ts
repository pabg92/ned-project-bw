import { createClerkClient } from "@clerk/backend";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function testUpgradeRole() {
  const userId = 'user_2xxPM7cYdgriSxF3cvcAuTMpiCM'; // Your user ID from middleware
  
  try {
    // Get current user
    const user = await clerkClient.users.getUser(userId);
    console.log('Current user metadata:', {
      publicMetadata: user.publicMetadata,
      email: user.emailAddresses[0]?.emailAddress
    });
    
    // Check current role
    const currentRole = user.publicMetadata?.role || 'user';
    console.log('Current role:', currentRole);
    
    if (currentRole !== 'company') {
      console.log('Upgrading to company role...');
      
      // Update to company role
      const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          role: 'company',
          credits: 0,
          unlockedProfiles: []
        }
      });
      
      console.log('User upgraded successfully:', {
        newRole: updatedUser.publicMetadata?.role,
        publicMetadata: updatedUser.publicMetadata
      });
    } else {
      console.log('User already has company role');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpgradeRole();