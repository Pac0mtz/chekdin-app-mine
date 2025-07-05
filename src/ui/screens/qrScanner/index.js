import React, {useEffect, useState, useRef} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {
  Text,
  StyleSheet,
  Modal,
  View,
  Button,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {checkScanData, getCouponStats} from '../../../slices/couponSlice';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {BASEURL} from '../../../constants/api';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';

const Scanner = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [reactivate, setReactivate] = useState(true); // Control scanner reactivation
  const [location, setLocation] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const dispatch = useDispatch();
  const scannerRef = useRef();

  useEffect(() => {
    getCurrentLocation();
    requestUserPermission();
  }, []);

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

  async function requestUserPermission() {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    setFcmToken(token);
  }

  const handleQRCodeScanned = async ({data}) => {
    // Prevent multiple scans while processing
    if (!reactivate) {
      return;
    }

    setIsLoading(true);
    setReactivate(false); // Disable further scanning

    try {
      const newData = JSON.parse(data);
      let id = newData.id;
      const scanCheckin = new FormData();
      scanCheckin.append('coupon', id);
      const couponList = await dispatch(checkScanData(scanCheckin));
      checkData(couponList, data);
    } catch (error) {
      console.warn('catch ', error);
      Toast.show({
        type: 'error',
        text1: 'Please Scan a valid QR Code',
      });
      setReactivate(true); // Re-enable on error
    } finally {
      setIsLoading(false);
    }
  };

  const checkData = (list, data) => {
    if (
      list.error &&
      list.error.message === 'Request failed with status code 400'
    ) {
      Toast.show({
        type: 'error',
        text1: 'Please Scan a valid QR Code',
      });
      setReactivate(true);
    } else if (list.payload && list.payload.status === 200) {
      // Success case - navigate to rolling screen
      Toast.show({
        type: 'success',
        text1: 'Coupon successfully added!',
      });
      navigation.replace('Rolling', {data});
    } else if (
      list.error &&
      list.error.message === 'Request failed with status code 422'
    ) {
      // Coupon already added - treat as success
      Toast.show({
        type: 'success',
        text1: 'Coupon already added to your list!',
      });
      // Refresh coupon stats and navigate to MyCoupons to show the user's coupons
      if (location && fcmToken) {
        dispatch(
          getCouponStats({
            lat: location.latitude,
            long: location.longitude,
            fcm_token: fcmToken,
          }),
        );
      }
      navigation.replace('MyCoupons', { user_coupons: true });
      setReactivate(true);
    } else if (
      list.error &&
      list.error.message === 'Request failed with status code 423'
    ) {
      Toast.show({
        type: 'error',
        text1: 'You have already checked in this coupon',
      });
      setReactivate(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'You have already checked in this coupon',
      });
      setReactivate(true);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      setReactivate(false);
    };
  }, []);

  return (
    <React.Fragment>
      <QRCodeScanner
        ref={scannerRef}
        onRead={handleQRCodeScanned}
        showMarker={true}
        reactivate={reactivate} // Controlled by state
      />
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </React.Fragment>
  );
};

export default Scanner;

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});
