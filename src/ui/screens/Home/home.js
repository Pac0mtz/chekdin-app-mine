import React, {useEffect, useState, useRef, useCallback} from 'react';
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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getCouponStats} from '../../../slices/couponSlice';
import {getMerchentList} from '../../../slices/merchentSlice';
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
import MerchantIcon from '../../../assets/icons/BecomeaMechant.png';
import PermissionHandler from '../../../utils/permissionHandler';
import Toast from 'react-native-toast-message';
import CouponsIcon from '../../../assets/icons/coupons.png';
import SearchIcon from '../../../assets/icons/search.png';
import {useFocusEffect} from '@react-navigation/native';

const screenHeight = Dimensions.get('window').height;
const smallScreenThreshold = 720;
const mediumScreenThreshold = 760;
const LargeScreenThreshold = 820;
const ExtraLargeScreenThreshold = 1200;

const containerStyle = screenHeight <= smallScreenThreshold;
const containerStyle2 = screenHeight <= mediumScreenThreshold;
const containerStyle3 = screenHeight <= LargeScreenThreshold;
const containerStyle4 = screenHeight >= ExtraLargeScreenThreshold;

const HomePage = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showCross, setShowCross] = useState(false);
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);

  const dispatch = useDispatch();

  useEffect(() => {
    requestUserPermission();
    createNotificationListeners();
  }, [dispatch, navigation]);

  const createNotificationListeners = () => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          let item = {
            id: remoteMessage.data.id,
          };
          navigation.navigate('CouponDetails', {item, isNotification: true});
          setTimeout(() => {
            fetchData();
          }, 1000);
        }
      });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      let item = {
        id: remoteMessage.data.id,
      };
      navigation.navigate('CouponDetails', {item, isNotification: true});
      setTimeout(() => {
        fetchData();
      }, 1000);
    });

    messaging().onMessage(async remoteMessage => {
      let item = {
        id: remoteMessage.data.id,
      };
      navigation.navigate('CouponDetails', {item, isNotification: true});
      setTimeout(() => {
        fetchData();
      }, 1000);
    });
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function requestUserPermission() {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      setFcmToken(token);
    } catch (error) {
      console.error('Error requesting user permission:', error);
      Toast.show({
        type: 'error',
        text1: 'Notification Error',
        text2: 'Unable to set up notifications.',
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
      navigation.navigate('AroundMe', {searchData: searchText.trim()});
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setShowCross(false);
  };

  const handleTextChange = text => {
    setSearchText(text);
    setShowCross(text.length > 0);
  };

  const handleBottomSearch = () => {
    navigation.navigate('AroundMe');
  };

  const handleCouponSearch = () => {
    navigation.navigate('MyCoupons');
  };

  const handleBecomeMerchant = () => {
    navigation.navigate('BecomeMerchant');
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
    <SafeAreaView style={{flex: 1,  backgroundColor: '#E8F0F9',}}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#02676C" />
        </View>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{flexGrow: 1}}
      >
        <View style={styles.mainContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Image source={SearchIcon} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search merchants or coupons..."
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
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => navigation.navigate('Filter')}>
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
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
            <View style={styles.qrContainer}>
              <View style={styles.qrCircleContainer}>
                {/* Circular text around the QR circle */}
                <Svg
                  width={300}
                  height={300}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: [{translateX: -150}, {translateY: -150}],
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}>
                  <Defs>
                    <Path
                      id="qrCircleTextPath"
                      d="M150,150 m-100,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0"
                    />
                  </Defs>
                  <SvgText
                    fill="#02676C"
                    fontSize={12}
                    fontFamily="Poppins-Regular"
                    textAnchor="middle">
                    <TextPath
                      href="#qrCircleTextPath"
                      startOffset="0%"
                      textAnchor="middle">
                      TAP ON QR CODE TO CHECK IN • TAP ON QR CODE TO CHECK IN •
                    </TextPath>
                  </SvgText>
                </Svg>

                <TouchableOpacity onPress={checkPermission} style={styles.qrCircle}>
                  {Platform.OS === 'android' ? (
                    <Image
                      style={{width: 140, height: 140}}
                      source={require('../../../assets/images/homeqr1.gif')}
                    />
                  ) : (
                    <LottieView
                      source={require('../../../assets/lottie-files/qrhome.json')}
                      style={{width: 150, height: 150}}
                      autoPlay
                      loop
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Arched SVG background behind the action bar, now precisely matches icon positions */}
      <View style={styles.archedBgContainer} pointerEvents="none">
        <Svg
          width="100%"
          height={220}
          viewBox="0 0 400 220"
          style={{position: 'absolute', bottom: 0}}>
          <Path
            d="M0,160 Q80,80 200,120 Q320,160 400,100 L400,220 L0,220 Z"
            fill="#60C0B1"
            opacity={0.18}
          />
        </Svg>
      </View>
      {/* Arc SVG at the bottom */}
      <View style={styles.arcContainer} pointerEvents="none">
        <Svg
          width="100%"
          height={80}
          viewBox="0 0 400 80"
          style={{position: 'absolute', bottom: 0}}>
          <Path
            d="M0,80 Q200,0 400,80 L400,80 L0,80 Z"
            fill="#E8F0F9" // Use your brand color here
          />
        </Svg>
      </View>
      {/* Bottom action bar with search (left), profile and merchant (right) */}
      <View style={styles.bottomActionBar}>
        {/* Coupon Button with circular text (left) */}
        <View style={{alignItems: 'center', marginTop: 100}}>
          <TouchableOpacity
            onPress={handleCouponSearch}
            activeOpacity={0.7}
            style={{alignItems: 'center', justifyContent: 'center', width: 100, height: 100}}
          >
            <Svg width={100} height={100}>
              <Defs>
                <Path
                  id="couponCircle"
                  d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"
                />
              </Defs>
              <SvgText
                fill="#222"
                fontSize="10"
                fontFamily="Poppins-Regular"
                textAnchor="middle">
                <TextPath
                  href="#couponCircle"
                  startOffset="25%"
                  textAnchor="middle">
                  COUPONS
                </TextPath>
              </SvgText>
              <Circle cx={50} cy={50} r={28} fill="#60C0B1" />
            </Svg>
            <Image
              source={CouponsIcon}
              style={[
                styles.fabIcon,
                {position: 'absolute', left: 36, top: 36},
              ]}
            />
          </TouchableOpacity>
        </View>
        {/* Merchant Button with circular text (center, regular size, teal) */}
        <View style={{alignItems: 'center', marginTop: 80}}>
          <TouchableOpacity
            onPress={handleBecomeMerchant}
            activeOpacity={0.7}
            style={{alignItems: 'center', justifyContent: 'center', width: 100, height: 100}}
          >
            <Svg width={100} height={100}>
              <Defs>
                <Path
                  id="merchantCircle"
                  d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"
                />
              </Defs>
              <SvgText
                fill="#222"
                fontSize="10"
                fontFamily="Poppins-Regular"
                textAnchor="middle">
                <TextPath
                  href="#merchantCircle"
                  startOffset="25%"
                  textAnchor="middle">
                  BECOME A MERCHANT
                </TextPath>
              </SvgText>
              <Circle cx={50} cy={50} r={28} fill="#60C0B1" />
            </Svg>
            <Image
              source={MerchantIcon}
              style={[
                styles.fabIcon,
                {position: 'absolute', left: 36, top: 36},
              ]}
            />
          </TouchableOpacity>
        </View>
        {/* Search Button with circular text (right, largest, dark green, white icon) */}
        <View
          style={{
            alignItems: 'center',
            marginTop: 60,
            width: 144,
            height: 144,
            justifyContent: 'center',
          }}>
          {/* Pulse Effect */}
          <PulseCircle />
          <Svg
            width={144}
            height={144}
            style={{position: 'absolute', left: 0, top: 0}}>
            <Defs>
              <Path
                id="searchCircle"
                d="M72,72 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0"
              />
            </Defs>
            <SvgText
              fill="#222"
              fontSize="10"
              fontFamily="Poppins-Regular"
              textAnchor="middle">
              <TextPath
                href="#searchCircle"
                startOffset="25%"
                textAnchor="middle">
                SEARCH
              </TextPath>
            </SvgText>
            <Circle cx={72} cy={72} r={43} fill="#02676C" />
          </Svg>
          <Image
            source={SearchIcon}
            style={[
              styles.fabIcon,
              styles.searchIconBig,
              {
                position: 'absolute',
                left: 50,
                top: 50,
                tintColor: '#fff',
                width: 44,
                height: 44,
              },
            ]}
          />
          {/* Touchable for navigation */}
          <TouchableOpacity
            style={styles.searchButtonTouchable}
            onPress={handleBottomSearch}
            activeOpacity={0.7}
            pressRetentionOffset={{top: 20, left: 20, right: 20, bottom: 20}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#E8F0F9',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 160,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    flex: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 0,
    marginVertical: 20,
  },
  outcircle: {
    alignItems: 'center',
  },
  fabIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  searchIconBig: {
    width: 44,
    height: 44,
  },
  searchButtonTouchable: {
    position: 'absolute',
    left: 50,
    top: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  qrCircle: {
    height: containerStyle ? responsiveHeight(22) : responsiveHeight(29),
    width: containerStyle ? responsiveWidth(40) : responsiveWidth(62),
    borderRadius: containerStyle ? 100 : 300,
    backgroundColor: 'rgba(96, 192, 177, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: containerStyle ? 5 : 10,
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
  archedBgContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    zIndex: 2,
  },
  bottomActionBar: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  fabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff', // fallback, will be overridden
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 4,
  },
  searchBg: {
    backgroundColor: '#60C0B1', // Example brand color for search
  },
  profileBg: {
    backgroundColor: '#60C0B1', // Example brand color for profile
    marginRight: 12,
  },
  merchantBg: {
    backgroundColor: '#02676C', // Example brand color for merchant
  },
  searchBig: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  fabLabel: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  labelTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    textAlign: 'center',
  },
  labelRight: {
    position: 'absolute',
    top: 50,
    right: -60,
    width: 60,
    textAlign: 'left',
  },
  labelBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 120,
    textAlign: 'center',
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

const PulseCircle = () => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse1 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale1, {
              toValue: 1.8,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scale1, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity1, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity1, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    const pulse2 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale2, {
              toValue: 2.2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scale2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity2, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity2, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    pulse1();
    pulse2();
  }, [scale1, opacity1, scale2, opacity2]);

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: 22,
          top: 22,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#02676C',
          opacity: opacity1,
          transform: [{scale: scale1}],
          zIndex: 0,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: 22,
          top: 22,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#60C0B1',
          opacity: opacity2,
          transform: [{scale: scale2}],
          zIndex: 0,
        }}
      />
    </>
  );
};

export default HomePage;
