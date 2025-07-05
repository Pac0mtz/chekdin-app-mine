// Debug script to test API endpoints
// Run this in the browser console or as a separate script

const BASEURL = 'https://api.chekdin.com/api/v1';

// Test signup endpoint
async function testSignup() {
  try {
    const response = await fetch(`${BASEURL}/auth/customer-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'TestPass123!'
      })
    });
    
    const data = await response.json();
    console.log('Signup response:', data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
  }
}

// Test verification endpoint
async function testVerification(email, otp) {
  try {
    const response = await fetch(`${BASEURL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp
      })
    });
    
    const data = await response.json();
    console.log('Verification response:', data);
    return data;
  } catch (error) {
    console.error('Verification error:', error);
  }
}

// Export for use in React Native
if (typeof global !== 'undefined') {
  global.testSignup = testSignup;
  global.testVerification = testVerification;
}

console.log('Debug API functions loaded. Use testSignup() and testVerification(email, otp) to test endpoints.'); 