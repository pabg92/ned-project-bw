import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

async function testApprovalAPI() {
  const candidateId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
  const apiUrl = `http://localhost:3000/api/admin/candidates/${candidateId}/approval`;
  
  console.log('Testing approval API for candidate:', candidateId);
  console.log('API URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approve',
        reason: 'Test approval from script',
        priority: 'medium',
        notifyCandidate: false
      })
    });
    
    const data = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Approval successful!');
    } else {
      console.log('\n❌ Approval failed');
    }
  } catch (error) {
    console.error('Error calling approval API:', error);
  }
}

testApprovalAPI().catch(console.error);