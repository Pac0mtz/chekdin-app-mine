import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import resturent from '../../../assets/images/Res.png';
import logo from '../../../assets/images/logo.png';
import coupan from '../../../assets/pattern/couponPatren.png';
import BackIcon from '../../../assets/icons/back.png';
import {useDispatch, useSelector} from 'react-redux';
import {getMerchantDetails} from '../../../slices/merchentSlice';
import Toast from 'react-native-toast-message';
import {
  addRedeemCoupon,
  getCouponDetails,
  getCouponStats,
  canClaimCouponAction,
} from '../../../slices/couponSlice';
import Button from '../../modules/Button';
// import Share from 'react-native-share';
import {request, PERMISSIONS} from 'react-native-permissions';
import CustomModal from '../../modules/Modal';
import SocialMediaVerificationModal from '../../modules/SocialMediaVerificationModal';
import Geolocation from 'react-native-geolocation-service';
import messaging from '@react-native-firebase/messaging';

import {pushNoti} from '../../../slices/authSlice';
let isMounted = false;
const DetailCouponScreen = ({route, navigation}) => {
  const data = route.params?.item;
  console.log('dataa on redemm screen', data);
  const checkNotification = route.params?.isNotification;
  console.log('checkNotification', checkNotification);

  const isRedeem = route.params?.isRedeem;
  const isMerchant = route.params?.isMerchant;
  // console.log("isMerchnt", isMerchant)
  const [fcmToken, setFcmToken] = useState(null);

  const [modalText, setModalText] = useState('');
  const [isModalVisible, seIstModalVisible] = useState(false);
  const [modalType, setModalType] = useState(false);
  const [BtnText, setBtnText] = useState(false);
  const errorMessage = useSelector(state => state.coupon.addRedeemCouponErr);
  const redeemFcm = useSelector(state => state.auth.fcmResult);
  // console.log('redeemFcm', redeemFcm);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  
  // Social Media Verification States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    getCurrentLocation();
    dispatch(getCouponDetails(data?.id));
  }, []);
  useEffect(() => {
    // Register for remote messages when the component mounts
    requestUserPermission();
  }, []);
  async function requestUserPermission() {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    setFcmToken(token);
    // dispatch(pushNoti({ title: "ChekdIN", body: "Welcome to ChekdIN", token: token }));
  }
  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setLocation({latitude, longitude});
          },
          error => {
            console.error(error);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    }

    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(result => {
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              setLocation({latitude, longitude});
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        })
        .catch(e => {
          console.log('e', e);
        });
    }
  };
  const couponList = useSelector(state => state.coupon.couponDetails);
  const item = couponList?.data;

    const onConfirm = async () => {
    seIstModalVisible(false);
    if (modalType === 'action') {
      setIsLoading(true);
      try {
        const Status = await dispatch(addRedeemCoupon(data?.id));
        // }

        if (Status?.payload?.data) {
          // dispatch(
          //   pushNoti({
          //     title: 'ChekdIN',
          //     body: 'Welcome to ChekdIN',
          //     token: redeemFcm,
          //   }),
          // );
          setBtnText('Go Back to home');
          setModalType('ok');
          setModalText('Your coupon has now been redeemed');
          seIstModalVisible(true);
          Toast.show({
            type: 'success',
            text1: 'Coupon has been redeemed!.',
          });
          dispatch(
            getCouponStats({
              lat: location.latitude,
              long: location.longitude,
              fcm_token: fcmToken,
            }),
          );
          navigation.navigate('Dashboard');
          setIsLoading(false);
          return;
        } else if (Status?.error) {
          setBtnText('Close');
          setModalType('ok');
          console.log('errorMessage', errorMessage);
          setModalText(Status?.error?.message);
          seIstModalVisible(true);
          setIsLoading(false);
          return;
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Coupon Redemption Error:', error);
        setIsLoading(false);
      }
    } else if (modalType === 'ok') {
      setIsLoading(true);

      if (BtnText === 'Go Back to home') {
        dispatch(
          getCouponStats({
            lat: location.latitude,
            long: location.longitude,
            fcm_token: fcmToken,
            }),
          );
        navigation.navigate('Dashboard');
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Check if user can claim coupon (has verified social media post)
  const checkClaimEligibility = async () => {
    try {
      const result = await dispatch(canClaimCouponAction(data?.id));
      return result.payload?.data?.can_claim || false;
    } catch (error) {
      console.error('Error checking claim eligibility:', error);
      return false;
    }
  };

  // Handle redeem button press with verification
  const handleRedeemPress = async () => {
    if (verificationChecked) {
      // User has already been verified, proceed with redemption
      setModalType('action');
      setModalText('Are you sure you want to redeem?');
      seIstModalVisible(true);
    } else {
      // Check if user can claim without verification
      const canClaim = await checkClaimEligibility();
      if (canClaim) {
        setVerificationChecked(true);
        setModalType('action');
        setModalText('Are you sure you want to redeem?');
        seIstModalVisible(true);
      } else {
        // Show verification modal
        setShowVerificationModal(true);
      }
    }
  };

  // Handle verification success
  const handleVerificationSuccess = () => {
    setVerificationChecked(true);
    setModalType('action');
    setModalText('Are you sure you want to redeem?');
    seIstModalVisible(true);
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.merchantImageContainer}>
        {item?.coupon_img_url ? (
          <Image
            source={{uri: item?.coupon_img_url}}
            style={styles.merchantImage}
          />
        ) : (
          <Image source={resturent} style={styles.merchantImage} />
        )}
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={styles.backButton} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.merchantDetailsContainer}>
          <View style={styles.restaurantInfoContainer}>
            <Text style={styles.restaurantName}>{item?.merchant_name}</Text>
            <View style={styles.restaurantDestinationContainer}>
              <Text style={styles.restaurantDestinationText}>
                {item?.discount_amount || 0}
                {item?.discount_type === 'Percentage' ? '%' : '$'} Off
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          {item?.address && (
            <>
              <TouchableOpacity
                style={styles.detailContainer}
                onPress={() => navigation.navigate('Map')}>
                <Text style={styles.detailText}>{item?.address}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )}
          {item?.contact_number && (
            <>
              <View style={styles.detailContainer}>
                <Text style={styles.detailText}>
                  {item?.contact_number || '-'}
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* {
            item?.url &&
            <>
              <TouchableOpacity style={styles.detailContainer} activeOpacity={0.7} onPress={() => handleWebsitePress(item?.url)}>
                <Text style={styles.urlTest}>{item?.url || "-"}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          } */}
          {item?.offer_description && (
            <>
              <View style={styles.descriptionContainer}>
                <Text style={styles.heading}>Description</Text>
                <Text style={styles.descriptionText}>
                  {item?.offer_description}
                </Text>
              </View>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.descriptionContainer}>
            <Text style={styles.heading}>Current Coupon Offer</Text>
            <View
              style={{
                ...styles.coupanImageContainer,
                // height: 80 + textHeight, // Initial height + text height
              }}>
              <Image source={coupan} style={styles.coupanImage} />
              <Image source={logo} style={styles.logostyle} />
              <View style={styles.couponDetail}>
                <Text style={styles.couponDetailMain}>{item?.offer_title}</Text>
                <Text style={styles.couponDetailSub}>{item?.coupon_code}</Text>
                <Text style={styles.couponDetailSub}>
                  Exp {item?.expiry_date}
                </Text>
              </View>
            </View>
          </View>
          {checkNotification ? (
            <Button
              title={'Redeem Now'}
              onPress={() => {
                setModalType('ok');
                seIstModalVisible(true);
                setModalText(
                  `Visit ${item?.merchant_name} and scan the QR code to redeem the discount`,
                );
                setBtnText('Go Back to home');
              }}
            />
          ) : isLoading ? (
            <Button title={<ActivityIndicator size="large" color="#000" />} />
          ) : (
            !isRedeem &&
            !isMerchant && (
              <Button
                title={verificationChecked ? 'Redeem Now' : 'Share & Redeem'}
                onPress={handleRedeemPress}
              />
            )
          )}
          <CustomModal
            isVisible={isModalVisible}
            type={modalType}
            message={modalText}
            onCancel={() => seIstModalVisible(false)}
            onConfirm={onConfirm}
            BtnText={BtnText}
          />
          
          <SocialMediaVerificationModal
            visible={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            couponData={data}
            onVerificationSuccess={handleVerificationSuccess}
            navigation={navigation}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  merchantImageContainer: {
    height: 240,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  merchantImage: {
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
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
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
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  restaurantDestinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantDestinationText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 8,
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
  couponDetail: {
    position: 'absolute',
    width: '70%',
    height: 120,
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
});

export default DetailCouponScreen;
