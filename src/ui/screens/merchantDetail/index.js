import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  Toast,
} from 'react-native';
import resturent from '../../../assets/images/Res.png';
import logo from '../../../assets/images/logo.png';
import pin from '../../../assets/icons/Vector.png';
import coupan from '../../../assets/pattern/couponPatren.png';
import BackIcon from '../../../assets/icons/back.png';
import {useDispatch, useSelector} from 'react-redux';
import {getMerchantDetails} from '../../../slices/merchentSlice';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import PhoneIcons from '../../../assets/svgs/phone-icon';
import LocationIcon from '../../../assets/svgs/location-icon';
import WebsiteIcon from '../../../assets/svgs/web-icon';
import FacebookIcon from '../../../assets/svgs/facebook-icon';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');
const BASE_HEADER_HEIGHT = SCREEN_HEIGHT < 700 ? 200 : 240;
const HEADER_HEIGHT = Math.round(BASE_HEADER_HEIGHT * 1.2);
const PARALLAX_FACTOR = 0.5;

const DetailMerchantScreen = ({route, navigation}) => {
  const data = route.params?.item;
  const merchantId = data?.id;
  const [latLong, setLatLong] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const dispatch = useDispatch();

  const getCurrentLocation = async () => {
    try {
      // You can add your geolocation logic here if needed
      // For now, this is a safe placeholder that does nothing
      return;
    } catch (e) {
      console.warn('getCurrentLocation error:', e);
    }
  };

  useEffect(() => {
    if (merchantId) {
      dispatch(getMerchantDetails(merchantId));
    }
    getCurrentLocation();
  }, [merchantId, dispatch]);
  const merchantList = useSelector(state => state.merchent.merchantDetails);
  const merchantStatus = useSelector(state => state.merchent.status);
  const item = merchantList?.data;
  
  if (merchantStatus === 'loading') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading merchant details...</Text>
      </View>
    );
  }
  
  if (merchantStatus === 'failed' || !item) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Unable to load merchant details</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10, backgroundColor: '#02676C', borderRadius: 8 }}
          onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const MENU_LINKS = [
    {
      id: 1,
      title: 'Phone',
      onClick: () => {
        if (item?.contact_number) {
          Linking.openURL(`tel://${item.contact_number}`);
        } else {
          Toast.show({
            type: 'info',
            text1: 'Phone number not available',
            text2: 'Please contact the merchant directly',
          });
        }
      },
      icon: <PhoneIcons />,
    },
    {
      id: 2,
      title: 'Location',
      onClick: () => openMapDirection(),
      icon: <LocationIcon />,
    },
    {
      id: 3,
      title: 'Website',
      onClick: () => {
        if (item?.website) {
          Linking.openURL(`${item.website}`);
        } else {
          Toast.show({
            type: 'info',
            text1: 'Website not available',
            text2: 'Please contact the merchant directly',
          });
        }
      },
      icon: <WebsiteIcon />,
    },
    // {
    //   id:4,
    //   title:'Facebook',
    //   onClick:()=>{Linking.openURL(`${item.website}`)},
    //   icon:<FacebookIcon/>
    // },
  ];
  const handleWebsitePress = async url => {
    try {
      // Check if the URL includes a protocol, if not, add 'http://' as a default
      if (!/^https?:\/\//i.test(url)) {
        url = `http://${url}`;
      }

      await Linking.openURL(url);
    } catch (error) {
      // Handle the error here
      if (Platform.OS === 'web') {
        // On web, you can open a "Page Not Found" URL
        window.open('https://example.com/page-not-found', '_blank');
      } else {
        // On mobile, you can display an error message to the user
        alert('Page Not Found');
      }
    }
  };
  const openMapDirection = () => {
    // Check if we have coordinates for the merchant
    if (!item?.latitude || !item?.longitude) {
      // If no coordinates, show a message or try to open maps with address
      Toast.show({
        type: 'info',
        text1: 'Location not available',
        text2: 'Please contact the merchant for directions',
      });
      return;
    }

    console.warn('latLong', item.latitude);

    const googleMapUrl = 'http://maps.google.com/maps?saddr=';
    let pick = '&daddr=' + item.latitude + ',' + item.longitude;
    let f = Platform.select({
      ios: () => {
        Linking.openURL(googleMapUrl + pick);
      },
      android: () => {
        console.log('ANDROID');
        Linking.openURL(googleMapUrl + pick).catch(err =>
          console.error('Please Install Map From Store', err),
        );
      },
    });
    f();
  };
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
  const distance = item?.latitude && item?.longitude && latLong?.latitude && latLong?.longitude 
    ? calculateDistance(
        latLong.latitude,
        latLong.longitude,
        item.latitude,
        item.longitude,
      )
    : null;
  return (
    <View style={styles.container}>
      <View style={styles.parallaxContainer}>
        <Animated.Image
          source={item?.profile_img_url ? {uri: item?.profile_img_url} : resturent}
          style={[
            styles.parallaxImage,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, HEADER_HEIGHT],
                    outputRange: [0, -HEADER_HEIGHT * PARALLAX_FACTOR],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={styles.backButton} />
        </TouchableOpacity>
      </View>
      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true}
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View style={styles.merchantDetailsContainer}>
          <View style={styles.restaurantInfoContainer}>
            <Text style={styles.restaurantName}>{item?.name}</Text>
            <View style={styles.restaurantDestinationContainer}>
              <Text style={styles.restaurantDestinationText}>
                {distance ? distance.toFixed(0) + ' mi' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          {/* {item?.address && (
            <>
              <TouchableOpacity
                style={styles.detailContainer}
                onPress={() =>
                  openMapDirection()
                }
              // onPress={() => navigation.navigate('Map', { address: item })}
              >
                <Text style={styles.detailText}>{item?.address}</Text>
                <View style={{ position: 'absolute', right: 0, top: 6 }}>
                  <Image source={pin} />

                </View>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )} */}
          {/* {item?.contact_number &&
            <>
              <View style={styles.detailContainer}>
                <Text style={styles.detailText}>{item?.contact_number}</Text>
              </View>
              <View style={styles.divider} />
            </>
          } */}

          <>
            <View style={{flexDirection: 'row'}}>
              {MENU_LINKS.map(link => (
                <TouchableOpacity
                  key={link.id}
                  onPress={link.onClick}
                  style={styles.circleIcon}>
                  {link.icon}
                </TouchableOpacity>
              ))}
            </View>
            {/* <TouchableOpacity style={styles.detailContainer} activeOpacity={0.7} onPress={() => handleWebsitePress(item?.website)}>
                <Text style={styles.urlTest}>{item?.website}</Text>
              </TouchableOpacity> */}
            <View style={styles.divider} />
          </>

          {item?.description && (
            <>
              <View style={styles.descriptionContainer}>
                <Text style={styles.heading}>Description</Text>
                <Text style={styles.descriptionText}>{item?.description}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}
          <View style={styles.descriptionContainer}>
            <Text style={styles.heading}>Current Check-in Offer</Text>
            {item?.coupon && Array.isArray(item.coupon) && item.coupon.length > 0 ? (
              item.coupon.map((item, index) => {
                const textHeight = item.offer_title.length * 1.3; // Adjust as needed
                return (
                  <View key={index}>
                    <View style={{padding: 0}}>
                      <Text style={{fontSize: 18, marginTop: 8, color: 'black'}}>
                        {item.coupon_type}{' '}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        ...styles.coupanImageContainer,
                        // height: 80 + textHeight, // Initial height + text height
                      }}
                      onPress={() =>
                        navigation.navigate('CouponDetails', {
                          item,
                          isMerchant: true,
                        })
                      }>
                      <Image source={coupan} style={styles.coupanImage} />
                      <Image source={logo} style={styles.logostyle} />
                      <View style={styles.couponDetail}>
                        <Text style={styles.couponDetailMain}>
                          {item?.offer_title}
                        </Text>
                        <Text style={styles.couponDetailSub}>
                          {item?.coupon_code}
                        </Text>
                        <Text style={styles.couponDetailSub}>
                          Exp {item?.expiry_date}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noCouponsText}>No coupons available at this time.</Text>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  parallaxContainer: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  parallaxImage: {
    width: '100%',
    height: HEADER_HEIGHT,
    alignSelf: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    zIndex: 10,
  },
  backButton: {
    width: 25,
    height: 22,
  },
  merchantDetailsContainer: {
    padding: 20,
  },
  restaurantInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    color: 'black',
    width: '85%',
  },
  restaurantDestinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantDestinationText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 0,
  },
  detailContainer: {
    paddingVertical: 8,
  },
  detailText: {
    fontSize: 12,
    color: 'black',
  },
  urlTest: {
    fontSize: 12,
    color: 'blue',
  },
  divider: {
    height: 1,
    opacity: 0.2,
    backgroundColor: 'black',
    marginVertical: 8,
  },
  descriptionContainer: {
    paddingTop: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  descriptionText: {
    fontSize: 14,
    color: 'black',
    paddingTop: 8,
  },
  coupanImageContainer: {
    width: '100%',
    height: 150,
    marginTop: 20,
    position: 'relative',
  },
  coupanImage: {
    width: '100%',
    height: '100%',
  },
  logostyle: {
    width: 56,
    height: 32,
    position: 'absolute',
    right: 25,
    top: 55,
  },
  couponDetail: {
    position: 'absolute',
    width: '70%',
    left: 25,
    top: 15,
    gap: 5,
  },
  couponDetailMain: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    width: '80%',
  },
  couponDetailSub: {
    color: 'black',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
  },
  circleIcon: {
    height: 40,
    width: 40,
    backgroundColor: '#125E62',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  noCouponsText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    paddingTop: 12,
  },
});

export default DetailMerchantScreen;
