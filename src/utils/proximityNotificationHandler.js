import messaging from '@react-native-firebase/messaging';
import { store } from '../store';
import { addNearbyCoupon } from '../slices/proximityNotificationSlice';

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  return distance;
};

// Check if a location is within the specified radius
export const isWithinRadius = (userLat, userLon, targetLat, targetLon, radiusMiles = 20) => {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  return distance <= radiusMiles;
};

// Handle proximity-based notification
export const handleProximityNotification = async (notificationData, userLocation) => {
  try {
    const { coupon, merchant } = notificationData;
    
    if (!userLocation || !coupon || !merchant) {
      console.log('Missing required data for proximity notification');
      return;
    }

    // Check if the coupon location is within 20 miles
    const isNearby = isWithinRadius(
      userLocation.latitude,
      userLocation.longitude,
      merchant.latitude,
      merchant.longitude,
      20
    );

    if (isNearby) {
      // Add to Redux store for tracking
      store.dispatch(addNearbyCoupon({
        ...coupon,
        merchant,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          merchant.latitude,
          merchant.longitude
        )
      }));

      // Show local notification
      await showProximityNotification(coupon, merchant);
    }
  } catch (error) {
    console.error('Error handling proximity notification:', error);
  }
};

// Show local notification for nearby coupon
export const showProximityNotification = async (coupon, merchant) => {
  try {
    // Create notification content
    const notification = {
      title: 'New Coupon Nearby! 🎉',
      body: `${coupon.offer_title || 'Special Offer'} at ${merchant.name}`,
      data: {
        type: 'proximity_coupon',
        couponId: coupon.id,
        merchantId: merchant.id,
        screen: 'CouponDetails'
      },
      android: {
        channelId: 'proximity-coupons',
        priority: 'high',
        sound: 'default',
        vibrate: [0, 250, 250, 250],
        color: '#02676C',
        largeIcon: merchant.logo_url || 'default_merchant_icon',
        smallIcon: 'ic_notification',
        actions: [
          {
            title: 'View Coupon',
            pressAction: {
              id: 'view_coupon',
            },
          },
          {
            title: 'Dismiss',
            pressAction: {
              id: 'dismiss',
            },
          },
        ],
      },
      ios: {
        sound: 'default',
        badge: 1,
        categoryId: 'proximity-coupon',
        attachments: merchant.logo_url ? [{ url: merchant.logo_url }] : undefined,
      },
    };

    // Send notification using Firebase Messaging
    await messaging().send(notification);
    
    console.log('Proximity notification sent successfully');
  } catch (error) {
    console.error('Error showing proximity notification:', error);
  }
};

// Setup proximity notification listeners
export const setupProximityNotificationListeners = (navigation) => {
  // Listen for background messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background proximity message received:', remoteMessage);
    
    if (remoteMessage.data.type === 'proximity_coupon') {
      // Handle proximity coupon notification
      const { couponId, merchantId } = remoteMessage.data;
      
      // Navigate to coupon details when app is opened from notification
      if (navigation) {
        navigation.navigate('CouponDetails', { 
          item: { id: couponId },
          isNotification: true 
        });
      }
    }
  });

  // Listen for foreground messages
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground proximity message received:', remoteMessage);
    
    if (remoteMessage.data.type === 'proximity_coupon') {
      // Handle proximity coupon notification in foreground
      const { couponId, merchantId } = remoteMessage.data;
      
      // You can show a custom in-app notification here
      // For now, we'll navigate to the coupon details
      if (navigation) {
        navigation.navigate('CouponDetails', { 
          item: { id: couponId },
          isNotification: true 
        });
      }
    }
  });

  // Handle notification open
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage && remoteMessage.data.type === 'proximity_coupon') {
      const { couponId } = remoteMessage.data;
      
      if (navigation) {
        navigation.navigate('CouponDetails', { 
          item: { id: couponId },
          isNotification: true 
        });
      }
    }
  });
};

// Register for proximity notifications
export const registerForProximityNotifications = async (token, userLocation) => {
  try {
    // Register with Firebase for proximity notifications
    await messaging().subscribeToTopic('proximity_coupons');
    
    // You can also register with your backend here
    // This would typically involve sending the user's location and FCM token
    
    console.log('Successfully registered for proximity notifications');
    return true;
  } catch (error) {
    console.error('Error registering for proximity notifications:', error);
    return false;
  }
};

// Unregister from proximity notifications
export const unregisterFromProximityNotifications = async () => {
  try {
    // Unsubscribe from Firebase topic
    await messaging().unsubscribeFromTopic('proximity_coupons');
    
    console.log('Successfully unregistered from proximity notifications');
    return true;
  } catch (error) {
    console.error('Error unregistering from proximity notifications:', error);
    return false;
  }
}; 