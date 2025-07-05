import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const NearbyCouponsBanner = ({ onPress }) => {
  const navigation = useNavigation();
  const nearbyCoupons = useSelector(state => state.proximityNotifications.nearbyCoupons);
  const isEnabled = useSelector(state => state.proximityNotifications.isEnabled);

  if (!isEnabled || nearbyCoupons.length === 0) {
    return null;
  }

  const latestCoupon = nearbyCoupons[0]; // Get the most recent nearby coupon

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default navigation to coupon details
      navigation.navigate('CouponDetails', { 
        item: { id: latestCoupon.id },
        isNotification: true 
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.banner}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎉</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>New Coupon Nearby!</Text>
          <Text style={styles.subtitle}>
            {latestCoupon.offer_title || 'Special Offer'} at {latestCoupon.merchant?.name || 'Nearby Merchant'}
          </Text>
          <Text style={styles.distance}>
            {latestCoupon.distance ? `${latestCoupon.distance.toFixed(1)} miles away` : 'Within 20 miles'}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  banner: {
    backgroundColor: '#02676C',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  distance: {
    fontSize: 12,
    color: '#E8F0F9',
    fontFamily: 'Poppins-Regular',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NearbyCouponsBanner; 