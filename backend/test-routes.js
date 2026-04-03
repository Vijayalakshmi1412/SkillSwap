const fetch = require('node-fetch');

// Test the server
async function testRoutes() {
  const baseURL = 'http://localhost:5000';
  
  try {
    // Test basic server connection
    console.log('Testing server connection...');
    const testResponse = await fetch(`${baseURL}/api/test`);
    const contentType = testResponse.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const htmlText = await testResponse.text();
      console.log('❌ Server returned HTML instead of JSON. Response:');
      console.log(htmlText.substring(0, 200) + '...');
      console.log('\nThis usually means:');
      console.log('1. The server is not running');
      console.log('2. The /api/test route does not exist');
      console.log('3. There is an error in the server');
      return;
    }
    
    const testData = await testResponse.json();
    console.log('✅ Server response:', testData);
    
    // Test if swaps route exists
    console.log('\nTesting swaps route...');
    try {
      const swapsResponse = await fetch(`${baseURL}/api/swaps/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Swaps route status:', swapsResponse.status);
      
      if (swapsResponse.status === 401) {
        console.log('✅ Swaps route exists (returns 401 as expected without auth)');
      } else {
        const swapsData = await swapsResponse.text();
        console.log('Swaps route response:', swapsData.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ Error testing swaps route:', error.message);
    }
    
    // Test the schedule route (will fail without auth, but should return 401)
    console.log('\nTesting schedule route (without auth)...');
    try {
      const swapId = '69cfec0a6d2511ef105e6c36';
      const scheduleResponse = await fetch(`${baseURL}/api/swaps/${swapId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposedTime: '2024-01-15T10:00:00'
        })
      });
      
      console.log('Schedule route status:', scheduleResponse.status);
      
      if (scheduleResponse.status === 401) {
        console.log('✅ Schedule route exists (returns 401 as expected without auth)');
      } else {
        const scheduleData = await scheduleResponse.text();
        console.log('Schedule route response:', scheduleData.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ Error testing schedule route:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
console.log('🧪 Running route tests...');
console.log('Make sure your server is running on http://localhost:5000');
console.log('');
testRoutes();