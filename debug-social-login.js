// Debug script to test social login API endpoint
// Run this in the browser console or as a separate script

const BASEURL = 'https://api.chekdin.com/api/v1';

// Test social login endpoint with mock data
async function testSocialLogin(provider = 'google') {
  try {
    const mockData = {
      token: 'mock-firebase-token',
      email: 'test@example.com',
      name: 'Test User',
      provider: provider,
      provider_id: 'mock-provider-id'
    };

    console.log('Testing social login with data:', mockData);

    const response = await fetch(`${BASEURL}/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData)
    });
    
    const data = await response.json();
    console.log('Social login response:', data);
    return data;
  } catch (error) {
    console.error('Social login error:', error);
  }
}

// Test with different providers
async function testAllProviders() {
  console.log('Testing Google social login...');
  await testSocialLogin('google');
  
  console.log('Testing Facebook social login...');
  await testSocialLogin('facebook');
  
  console.log('Testing Apple social login...');
  await testSocialLogin('apple');
}

// Test Firebase token validation
async function testFirebaseToken(token) {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=YOUR_FIREBASE_API_KEY`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: token
      })
    });
    
    const data = await response.json();
    console.log('Firebase token validation response:', data);
    return data;
  } catch (error) {
    console.error('Firebase token validation error:', error);
  }
}

// Export for use in React Native
if (typeof global !== 'undefined') {
  global.testSocialLogin = testSocialLogin;
  global.testAllProviders = testAllProviders;
  global.testFirebaseToken = testFirebaseToken;
}

console.log('Social login debug functions loaded.');
console.log('Use testSocialLogin(provider) to test specific provider');
console.log('Use testAllProviders() to test all providers');
console.log('Use testFirebaseToken(token) to validate Firebase token'); 