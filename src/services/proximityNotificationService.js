import { api } from '../constants/api';

// Service for handling proximity-based coupon notifications
export const proximityNotificationService = {
  // Register user for proximity notifications
  registerForProximityNotifications: async (token, userLocation, radius = 20) => {
    try {
      const response = await api.post('/notifications/register-proximity', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius_miles: radius,
        notification_type: 'coupon_proximity'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error registering for proximity notifications:', error);
      throw new Error(error.message);
    }
  },

  // Update user location for proximity notifications
  updateProximityLocation: async (token, userLocation, radius = 20) => {
    try {
      const response = await api.put('/notifications/update-proximity-location', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius_miles: radius
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating proximity location:', error);
      throw new Error(error.message);
    }
  },

  // Get nearby coupons within specified radius
  getNearbyCoupons: async (token, userLocation, radius = 20) => {
    try {
      const response = await api.get('/coupons/nearby', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius_miles: radius
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby coupons:', error);
      throw new Error(error.message);
    }
  },

  // Unregister from proximity notifications
  unregisterFromProximityNotifications: async (token) => {
    try {
      const response = await api.delete('/notifications/unregister-proximity', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error unregistering from proximity notifications:', error);
      throw new Error(error.message);
    }
  },

  // Check if user has proximity notifications enabled
  checkProximityNotificationStatus: async (token) => {
    try {
      const response = await api.get('/notifications/proximity-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error checking proximity notification status:', error);
      throw new Error(error.message);
    }
  }
}; 