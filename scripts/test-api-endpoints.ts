import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints...\n');

  // Test search candidates endpoint
  console.log('1️⃣ Testing /api/search/candidates...');
  try {
    const searchResponse = await fetch(`${API_BASE_URL}/search/candidates?page=1&limit=12&sortBy=relevance`);
    const searchData = await searchResponse.json();
    
    console.log(`   Status: ${searchResponse.status}`);
    console.log(`   Success: ${searchData.success}`);
    console.log(`   Total profiles: ${searchData.data?.pagination?.total || 0}`);
    console.log(`   Profiles returned: ${searchData.data?.profiles?.length || 0}`);
    
    if (searchData.data?.profiles?.length > 0) {
      console.log('\n   Sample profile:');
      const profile = searchData.data.profiles[0];
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - Name: ${profile.name}`);
      console.log(`   - Title: ${profile.title}`);
      console.log(`   - Location: ${profile.location}`);
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }

  // Test specific candidate endpoints
  const testIds = [
    'bf6915cc-3b5e-4808-82d3-2467e477f427',
    '0487cc77-af64-4c69-b8cb-a670c1243810'
  ];

  for (const id of testIds) {
    console.log(`\n2️⃣ Testing /api/admin/candidates/${id}...`);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/candidates/${id}`);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${data.success}`);
      
      if (data.success && data.data) {
        console.log(`   Profile found:`);
        console.log(`   - ID: ${data.data.id}`);
        console.log(`   - Title: ${data.data.title || 'Not set'}`);
        console.log(`   - User email: ${data.data.user?.email || 'Not available'}`);
        console.log(`   - User name: ${data.data.user?.firstName || ''} ${data.data.user?.lastName || ''}`);
      } else {
        console.log(`   Error: ${data.error}`);
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }
  }

  // Test all candidates endpoint
  console.log('\n3️⃣ Testing /api/search/all-candidates...');
  try {
    const response = await fetch(`${API_BASE_URL}/search/all-candidates`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Total candidates: ${data.data?.candidates?.length || 0}`);
    
    if (data.data?.candidates?.length > 0) {
      console.log('\n   First few candidates:');
      data.data.candidates.slice(0, 3).forEach((candidate, index) => {
        console.log(`   ${index + 1}. ${candidate.name || 'No name'} - ${candidate.title || 'No title'}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

// Run the tests
console.log('Make sure the development server is running (pnpm dev)\n');
testApiEndpoints()
  .then(() => {
    console.log('\n✅ API tests complete');
  })
  .catch((error) => {
    console.error('Failed to run tests:', error);
  });