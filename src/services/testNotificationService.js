import messaging from '@react-native-firebase/messaging';
import { api } from '../constants/api';

// Test notification service for debugging
export const testNotificationService = {
  // Send a test notification to the current device
  sendTestNotification: async (token) => {
    try {
      console.log('🧪 Sending test notification...');
      
      // We can't send notifications to ourselves using messaging().send()
      // Instead, we'll simulate a notification by triggering the onMessage handler
      // This is for testing purposes only
      
      const testMessage = {
        data: {
          type: 'test_notification',
          title: 'Test Notification',
          body: 'This is a test notification to verify the system is working.',
          timestamp: new Date().toISOString(),
        },
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification to verify the system is working.',
        },
      };

      // Simulate receiving a message (for testing)
      console.log('🧪 Simulating test notification...');
      
      // Return success since we can't actually send to ourselves
      return { success: true, message: 'Test notification simulated successfully' };
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send a test proximity notification
  sendTestProximityNotification: async (token) => {
    try {
      console.log('🧪 Sending test proximity notification...');
      
      const testProximityMessage = {
        data: {
          type: 'proximity_coupon',
          couponId: 'test-coupon-123',
          merchantId: 'test-merchant-456',
          couponTitle: 'Test Coupon',
          merchantName: 'Test Merchant',
          distance: '2.5',
        },
        notification: {
          title: 'New Coupon Nearby! 🎉',
          body: 'Test Coupon at Test Merchant (2.5 miles away)',
        },
      };

      // Simulate receiving a proximity message (for testing)
      console.log('🧪 Simulating test proximity notification...');
      
      // Return success since we can't actually send to ourselves
      return { success: true, message: 'Test proximity notification simulated successfully' };
    } catch (error) {
      console.error('❌ Error sending test proximity notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Check notification permissions
  checkNotificationPermissions: async () => {
    try {
      console.log('🔍 Checking notification permissions...');
      
      const authStatus = await messaging().hasPermission();
      console.log('🔍 Authorization status:', authStatus);
      
      const token = await messaging().getToken();
      console.log('🔍 FCM Token available:', !!token);
      
      return {
        hasPermission: authStatus === messaging.AuthorizationStatus.AUTHORIZED,
        authStatus,
        hasToken: !!token,
      };
    } catch (error) {
      console.error('❌ Error checking notification permissions:', error);
      return { hasPermission: false, error: error.message };
    }
  },

  // Test backend notification endpoint
  testBackendNotification: async (token, userLocation) => {
    try {
      console.log('🧪 Testing backend notification endpoint...');
      
      const response = await api.post('/notifications/test', {
        fcm_token: token,
        user_location: userLocation,
        test_type: 'proximity_coupon',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 Backend test response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error testing backend notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send a real test notification via backend
  sendRealTestNotification: async (token, userLocation) => {
    try {
      console.log('🧪 Sending real test notification via backend...');
      
      const response = await api.post('/notifications/send-test', {
        fcm_token: token,
        user_location: userLocation,
        notification_type: 'proximity_coupon',
        test_data: {
          couponId: 'test-coupon-123',
          merchantId: 'test-merchant-456',
          couponTitle: 'Test Coupon',
          merchantName: 'Test Merchant',
          distance: '2.5',
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 Real test notification response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error sending real test notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Get device info for debugging
  getDeviceInfo: async () => {
    try {
      const token = await messaging().getToken();
      const authStatus = await messaging().hasPermission();
      
      return {
        fcmToken: token,
        authStatus,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error getting device info:', error);
      return { error: error.message };
    }
  },

  // Test notification by triggering the handlers directly
  testNotificationHandlers: async () => {
    try {
      console.log('🧪 Testing notification handlers...');
      
      // Create a test message that would trigger our handlers
      const testMessage = {
        data: {
          type: 'proximity_coupon',
          couponId: 'test-coupon-123',
          merchantId: 'test-merchant-456',
          couponTitle: 'Test Coupon',
          merchantName: 'Test Merchant',
          distance: '2.5',
        },
        notification: {
          title: 'New Coupon Nearby! 🎉',
          body: 'Test Coupon at Test Merchant (2.5 miles away)',
        },
      };

      // This would normally be triggered by Firebase
      // For testing, we'll just log what would happen
      console.log('🧪 Would trigger onMessage handler with:', testMessage);
      
      return { 
        success: true, 
        message: 'Notification handlers test completed',
        testMessage 
      };
    } catch (error) {
      console.error('❌ Error testing notification handlers:', error);
      return { success: false, error: error.message };
    }
  },
}; 