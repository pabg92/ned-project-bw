import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const baseUrl = 'http://localhost:3000';

async function approvePabloProfiles() {
  console.log('Approving Pablo profiles via API...');
  
  const profileIds = [
    '5901c9ba-e1d4-4788-addb-b26fe7ff0ba6', // Pablo Garner (pablo@championsukplc.com)
    '0487cc77-af64-4c69-b8cb-a670c1243810'  // Pablo Garner (pablo.garner@championsukplc.com)
  ];
  
  for (const profileId of profileIds) {
    console.log(`\nApproving profile ${profileId}...`);
    
    try {
      const response = await fetch(`${baseUrl}/api/admin/candidates/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: true,
          profileCompleted: true,
          verificationStatus: 'verified'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✓ Profile approved successfully');
        console.log('  Response:', data.message);
      } else {
        const error = await response.text();
        console.error('✗ Failed to approve profile');
        console.error('  Status:', response.status);
        console.error('  Error:', error);
      }
    } catch (error) {
      console.error('✗ Request failed:', error);
    }
  }
  
  console.log('\nDone!');
}

approvePabloProfiles();