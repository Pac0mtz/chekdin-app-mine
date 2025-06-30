import React, {useEffect, useState, useRef} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {
  Text,
  StyleSheet,
  Modal,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {checkScanData} from '../../../slices/couponSlice';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {BASEURL} from '../../../constants/api';

const Scanner = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [reactivate, setReactivate] = useState(true); // Control scanner reactivation
  const dispatch = useDispatch();
  const scannerRef = useRef();

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
      const couponList = dispatch(checkScanData(scanCheckin));
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
      // Navigate using replace to unmount component
      navigation.replace('Rolling', {data});
    } else if (
      list.error &&
      list.error.message === 'Request failed with status code 422'
    ) {
      Toast.show({
        type: 'error',
        text1: 'The Coupon is already added to viewer coupon',
      });
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
