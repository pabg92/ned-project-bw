import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
});

async function checkUnlockedProfiles(userId: string) {
  try {
    console.log(`Checking unlocked profiles for user: ${userId}`);

    const user = await clerkClient.users.getUser(userId);
    
    console.log('\nUser metadata:');
    console.log('Credits:', user.publicMetadata?.credits || 0);
    console.log('Role:', user.publicMetadata?.role || 'user');
    
    const unlockedProfiles = (user.publicMetadata?.unlockedProfiles as string[]) || [];
    console.log('\nUnlocked profiles count:', unlockedProfiles.length);
    
    if (unlockedProfiles.length > 0) {
      console.log('\nProfile IDs:');
      unlockedProfiles.forEach((profileId, index) => {
        console.log(`${index + 1}. ${profileId}`);
      });
    }

    // Check credit history
    const creditHistory = (user.privateMetadata?.creditHistory as any[]) || [];
    console.log('\nCredit history entries:', creditHistory.length);
    
    // Show recent unlock transactions
    const unlockTransactions = creditHistory.filter(t => t.type === 'profile_unlock');
    console.log('\nProfile unlock transactions:', unlockTransactions.length);
    
    if (unlockTransactions.length > 0) {
      console.log('\nRecent unlocks:');
      unlockTransactions.slice(-5).forEach(t => {
        console.log(`- ${t.profileTitle || 'Unknown'} (${t.profileId}) on ${new Date(t.timestamp).toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get user ID from command line
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID');
  console.error('Usage: npx tsx scripts/check-unlocked-profiles.ts <user-id>');
  process.exit(1);
}

checkUnlockedProfiles(userId);