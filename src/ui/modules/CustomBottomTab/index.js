import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  Linking,
} from 'react-native';
import UserIcon from '../../../assets/icons/user.png';
import CheckIcon from '../../../assets/icons/check.png';
import SearchIcon from '../../../assets/icons/search.png';
import CouponsIcon from '../../../assets/icons/coupons.png';
import BecomeaMechant from '../../../assets/icons/BecomeaMechant.png';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const CustomTabBar = () => {
  const navigation = useNavigation();
  const stats = useSelector(state => state.coupon.couponStats);

  const data = stats?.data;
  return (
    <View style={styles.tabBarContainer}>
      {/* Profile Tab */}
      <TouchableOpacity
        style={[styles.tabItem]}
        onPress={() => Linking.openURL('https://chekdin.com/signup/')}>
        <Image style={{height: 40, width: 40}} source={BecomeaMechant} />
        <Text style={[styles.names, {fontSize: 12}]}>Become a Merchant</Text>
      </TouchableOpacity>

      {/* Search Icon (centered) */}
      <View style={styles.centerTabItem}>
        <TouchableOpacity
          style={styles.centerTabButton}
          onPress={() =>
            navigation.navigate('AroundMe', {filter: false, filter50: true})
          }>
          <Image style={{height: 45, width: 45}} source={SearchIcon} />
        </TouchableOpacity>
      </View>

      {/* My Coupons Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Profile')}>
        <Image style={{height: 40, width: 40}} source={UserIcon} />
        <Text style={styles.names}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};
const screenHeight = Dimensions.get('window').height;
const smallScreenThreshold = 759; // Adjust this value as needed

const containerStyle = screenHeight <= smallScreenThreshold;
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#125E62',
    paddingHorizontal: 16,
    paddingVertical: containerStyle ? 10 : 27,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  centerTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: -60, // Adjust this value for the desired overlap
  },
  centerTabButton: {
    backgroundColor: '#125E62',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  names: {
    fontSize: 12,
    fontWeight: '400',
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default CustomTabBar;
