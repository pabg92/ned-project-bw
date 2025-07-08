import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

async function testSearchAPI() {
  const apiUrl = `http://localhost:3000/api/search/candidates`;
  
  console.log('Testing search API...');
  console.log('API URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response success:', data.success);
    
    if (response.ok && data.success) {
      console.log('\n✅ Search API working!');
      console.log('Found profiles:', data.data.profiles.length);
      console.log('Total count:', data.data.pagination.total);
      
      if (data.data.profiles.length > 0) {
        console.log('\nFirst profile:');
        const profile = data.data.profiles[0];
        console.log('- ID:', profile.id);
        console.log('- Name:', profile.name);
        console.log('- Title:', profile.title);
        console.log('- Location:', profile.location);
        console.log('- Board Experience:', profile.boardExperience);
      }
    } else {
      console.log('\n❌ Search API failed');
      console.log('Error:', data.error || data.message);
    }
  } catch (error) {
    console.error('Error calling search API:', error);
  }
}

testSearchAPI().catch(console.error);