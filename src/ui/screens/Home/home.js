import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Animated,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  RefreshControl,
  AppState,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getCouponStats } from '../../../slices/couponSlice';
import { getMerchentList } from '../../../slices/merchentSlice';
import { registerForProximityNotifications, updateProximityLocation } from '../../../slices/proximityNotificationSlice';
import messaging from '@react-native-firebase/messaging';
import LottieView from 'lottie-react-native';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import RadialChart from './RadialChart';
import Svg, {
  Path,
  Text as SvgText,
  TextPath,
  Defs,
  Circle,
} from 'react-native-svg';
import UserIcon from '../../../assets/icons/user.png';
import MerchantIcon from '../../../assets/icons/merchant-icon.png';
import PermissionHandler from '../../../utils/permissionHandler';
import Toast from 'react-native-toast-message';
import { setupProximityNotificationListeners, registerForProximityNotifications as registerProximity } from '../../../utils/proximityNotificationHandler';
import CouponsIcon from '../../../assets/icons/coupons.png';
import SearchIcon from '../../../assets/icons/search.png';
import { useFocusEffect } from '@react-navigation/native';
import ActionBar from '../../components/ActionBar';
import SearchResultsModal from './SearchResultsModal';
import NavigationBar from '../../components/NavigationBar';
import QRCodeComponent from '../../components/QRCodeComponent';
import NearbyCouponsBanner from '../../components/NearbyCouponsBanner';

const screenHeight = Dimensions.get('window').height;
const smallScreenThreshold = 720;
const mediumScreenThreshold = 760;
const LargeScreenThreshold = 820;
const ExtraLargeScreenThreshold = 1200;

const containerStyle = screenHeight <= smallScreenThreshold;
const containerStyle2 = screenHeight <= mediumScreenThreshold;
const containerStyle3 = screenHeight <= LargeScreenThreshold;
const containerStyle4 = screenHeight >= ExtraLargeScreenThreshold;

const HomePage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showCross, setShowCross] = useState(false);
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const appState = useRef(AppState.currentState);

  const dispatch = useDispatch();

  useEffect(() => {
    requestUserPermission();
    createNotificationListeners();
    setupProximityNotificationListeners(navigation);
  }, [dispatch, navigation]);

  const createNotificationListeners = () => {
    console.log('🔔 Setting up notification listeners...');
    
    // Handle initial notification (app opened from notification)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('🔔 Initial notification:', remoteMessage);
        if (remoteMessage) {
          let item = {
            id: remoteMessage.data.id,
          };
          navigation.navigate('CouponDetails', { item, isNotification: true });
          setTimeout(() => {
            fetchData();
          }, 1000);
        }
      })
      .catch(error => {
        console.error('❌ Error getting initial notification:', error);
      });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('🔔 Background message received:', remoteMessage);
      
      // Handle different types of notifications
      if (remoteMessage.data.type === 'proximity_coupon') {
        console.log('🔔 Proximity coupon notification received');
        // Handle proximity notification
        const { couponId, merchantId } = remoteMessage.data;
        // You can add custom logic here for proximity notifications
      } else {
        // Handle regular coupon notifications
        let item = {
          id: remoteMessage.data.id,
        };
        navigation.navigate('CouponDetails', { item, isNotification: true });
      }
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground message received:', remoteMessage);
      
      // Handle different types of notifications
      if (remoteMessage.data.type === 'proximity_coupon') {
        console.log('🔔 Proximity coupon notification in foreground');
        // Show custom in-app notification for proximity
        Toast.show({
          type: 'success',
          text1: 'New Coupon Nearby! 🎉',
          text2: `${remoteMessage.data.couponTitle || 'Special Offer'} at ${remoteMessage.data.merchantName || 'Nearby Merchant'}`,
          onPress: () => {
            navigation.navigate('CouponDetails', { 
              item: { id: remoteMessage.data.couponId },
              isNotification: true 
            });
          }
        });
      } else {
        // Handle regular coupon notifications
        let item = {
          id: remoteMessage.data.id,
        };
        navigation.navigate('CouponDetails', { item, isNotification: true });
      }
      
      setTimeout(() => {
        fetchData();
      }, 1000);
    });

    // Listen for token refresh
    messaging().onTokenRefresh(token => {
      console.log('🔔 FCM token refreshed:', token ? 'YES' : 'NO');
      setFcmToken(token);
    });

    console.log('🔔 Notification listeners setup complete');
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function requestUserPermission() {
    try {
      console.log('🔔 Requesting notification permissions...');
      
      // Request permission for iOS
      const authStatus = await messaging().requestPermission();
      console.log('🔔 Authorization status:', authStatus);
      
      // Register device for remote messages
      await messaging().registerDeviceForRemoteMessages();
      console.log('🔔 Device registered for remote messages');
      
      // Get FCM token
      const token = await messaging().getToken();
      console.log('🔔 FCM Token received:', token ? 'YES' : 'NO');
      setFcmToken(token);
      
      // Subscribe to general topic
      await messaging().subscribeToTopic('all_users');
      console.log('🔔 Subscribed to "all_users" topic');
      
      // Subscribe to proximity topic
      await messaging().subscribeToTopic('proximity_coupons');
      console.log('🔔 Subscribed to "proximity_coupons" topic');
      
      Toast.show({
        type: 'success',
        text1: 'Notifications Enabled',
        text2: 'You will now receive notifications for nearby coupons.',
      });
      
    } catch (error) {
      console.error('❌ Error requesting user permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Notification Error',
        text2: 'Unable to set up notifications. Please check your settings.',
      });
    }
  }

  const fetchData = useCallback(async (showLoading = true) => {
    if (location && fcmToken) {
      try {
        if (showLoading) setLoading(true);
        await dispatch(
          getCouponStats({
            lat: location.latitude,
            long: location.longitude,
            fcm_token: fcmToken,
          }),
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        Toast.show({
          type: 'error',
          text1: 'Data Error',
          text2: 'Unable to fetch coupon statistics.',
        });
      } finally {
        if (showLoading) setLoading(false);
      }
    }
  }, [location, fcmToken, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false).finally(() => setRefreshing(false));
  }, [fetchData]);

  const getCurrentLocation = async () => {
    try {
      const hasPermission =
        await PermissionHandler.requestLocationWithGeolocation();
      if (hasPermission) {
        const position = await PermissionHandler.getCurrentLocation();
        setLocation(position);
        
        // Register for proximity notifications when location is available
        if (user?.token) {
          try {
            await dispatch(registerForProximityNotifications({
              token: user.token,
              userLocation: position,
              radius: 20
            }));
            
            // Also register with Firebase for proximity notifications
            await registerProximity(user.token, position);
            
            console.log('Successfully registered for proximity notifications');
          } catch (error) {
            console.error('Error registering for proximity notifications:', error);
          }
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Location Permission Required',
          text2: 'Please enable location permission to use this feature.',
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your current location.',
      });
    }
  };

  const checkPermission = async () => {
    try {
      const hasPermission = await PermissionHandler.requestCameraPermission();
      if (hasPermission) {
        navigation.navigate('Scanner');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Camera Permission Required',
          text2: 'Please enable camera permission to scan QR codes.',
        });
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Unable to access camera.',
      });
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      setShowSearchModal(true);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setShowCross(false);
  };

  const handleTextChange = text => {
    setSearchText(text);
    setShowCross(text.length > 0);
    
    // Open search modal as soon as user starts typing
    if (text.length === 1) {
      setShowSearchModal(true);
    }
  };

  const handleBottomSearch = () => {
    navigation.navigate('AroundMe', {filter: false, filter50: true});
  };

  const handleCouponSearch = () => {
    navigation.navigate('MyCoupons');
  };

  const handleBecomeMerchant = () => {
    Linking.openURL(`https://chekdin.com/become-a-merchant/`)
  };



  const stats = useSelector(state => state.coupon.couponStats);
  const data = stats?.data;

  const totalCoupons =
    (data?.checkdin_coupons || 0) +
    (data?.redeemed_coupons || 0) +
    (data?.user_coupons || 0);

  console.log('HomePage navigation:', navigation);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        fetchData();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [fetchData]);

  return (
    <View style={{ flex: 1, backgroundColor: '#E8F0F9', }}>
      {/* Custom Navigation Bar */}
      <NavigationBar
        navigation={navigation}
        title="Chekdin"
        showMenu={true}
        showProfile={true}
        backgroundColor="#E8F0F9"
        textColor="black"
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#02676C" />
        </View>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.mainContainer}>


          {/* Nearby Coupons Banner */}
          <NearbyCouponsBanner 
            onPress={() => {
              // The component will handle the navigation internally
            }}
          />

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Image source={SearchIcon} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search merchants"
                placeholderTextColor="#707070"
                value={searchText}
                onChangeText={handleTextChange}
                onSubmitEditing={handleSearch}
              />
              {showCross && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSearch}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Charts Section */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyCoupons', {
                  checkdin_coupons: data?.checkdin_coupons_list,
                })
              }
              style={styles.outcircle}>
              <RadialChart
                series={[data?.checkdin_coupons || 0]}
                labels={['Chekdin']}
                maxValue={10}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyCoupons', {
                  redeemed_coupons: data?.redeemed_coupons_list,
                })
              }
              style={styles.outcircle}>
              <RadialChart
                series={[data?.redeemed_coupons || 0]}
                labels={['Redeemed']}
                maxValue={10}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outcircle}
              onPress={() =>
                navigation.navigate('MyCoupons', {
                  user_coupons: data?.user_coupons_list,
                })
              }>
              <RadialChart
                series={[data?.user_coupons || 0]}
                labels={['Viewer']}
                maxValue={10}
              />
            </TouchableOpacity>
          </View>

          {/* QR Code Section - Centered in remaining space */}
          <View style={styles.qrSection}>
            <QRCodeComponent onPress={checkPermission} />
          </View>
        </View>
      </ScrollView>
      <ActionBar
        onBecomeMerchant={handleBecomeMerchant}
        onSearch={handleBottomSearch}
        onCoupons={handleCouponSearch}
        showPulseEffect={true}
      />
      

      
      {/* Search Results Modal */}
      <SearchResultsModal
        visible={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setSearchText('');
          setShowCross(false);
        }}
        initialSearchText={searchText}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#E8F0F9',
    paddingHorizontal: 20, // Reduced to give more space for content
    justifyContent: 'space-between',
    paddingTop: 10, // Reduced since we now have NavigationBar
    paddingBottom: 160,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    flex: 0,
    paddingHorizontal: 0, // Ensure no extra horizontal padding
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 0,
    marginVertical: 20,
    paddingHorizontal: 0, // Ensure no extra horizontal padding
  },
  outcircle: {
    alignItems: 'center',
  },



  checkInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000000',
    margin: containerStyle ? 0 : 20,
    marginBottom: 15,
  },
  checkInButtonText: {
    color: '#707070',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  arcContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    zIndex: 1,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: '#707070',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707070',
  },
  filterButton: {
    backgroundColor: '#02676C',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  qrSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // Match the mainContainer padding for alignment with charts and search
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



export default HomePage;
