const axios = require('axios');

// Create a test axios instance with the same logic as our client
const testClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add the same response interceptor as in our client
testClient.interceptors.response.use(
  (response) => {
    // Check if response data has the backend's standardized format
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      // If success is false, treat as an error
      if (!response.data.success) {
        const error = new Error(response.data.message || 'Request failed');
        return Promise.reject(error);
      }
      
      // Unwrap the data from the backend's standardized format
      response.data = response.data.data;
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Test the login endpoint
async function testLogin() {
  try {
    console.log('🧪 Testing axios response unwrapping...');
    
    const response = await testClient.post('auth/login', {
      email: 'test.client.basic@mentaratest.dev',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('📦 Response data structure:');
    console.log(`- response.data.user.email: ${response.data.user.email}`);
    console.log(`- response.data.token: ${response.data.token ? 'Present' : 'Missing'}`);
    console.log(`- response.data.message: ${response.data.message}`);
    
    // Verify we can access data directly without double nesting
    if (response.data.user && response.data.token) {
      console.log('🎉 SUCCESS: Response unwrapping works correctly!');
      console.log('   - No need for response.data.data.user');
      console.log('   - Can access response.data.user directly');
    } else {
      console.log('❌ FAILED: Response unwrapping did not work');
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
}

testLogin();