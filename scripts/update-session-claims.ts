import * as dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';

dotenv.config({ path: '.env.local' });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
});

async function updateSessionClaims() {
  const email = 'it@championsukplc.com';
  
  console.log(`🔧 Updating session claims for ${email}...\n`);
  
  try {
    // Find user by email
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
    console.log(`- Current role: ${user.publicMetadata?.role || 'not set'}`);
    
    // Update metadata to ensure role is set
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'company',
        credits: user.publicMetadata?.credits || 10,
        unlockedProfiles: user.publicMetadata?.unlockedProfiles || [],
        companyName: user.publicMetadata?.companyName || 'Champions UK PLC'
      }
    });
    
    console.log('\n✅ Metadata updated!');
    console.log('\n🔄 Important: The user needs to sign out and sign back in for session claims to update.');
    console.log('\nAlternatively, you can:');
    console.log('1. Clear browser cookies for localhost:3000');
    console.log('2. Use incognito mode');
    console.log('3. Or wait for the session to refresh (usually within a few minutes)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateSessionClaims().catch(console.error);