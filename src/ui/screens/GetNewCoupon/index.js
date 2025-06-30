import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, Platform} from 'react-native';
import {Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Pattern from '../../elements/pattern';
import Button from '../../modules/Button';
import Logo from '../../elements/logo';
import {getCouponStats} from '../../../slices/couponSlice';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

const GetNewCoupon = ({navigation, route}) => {
  const isViewerCoupon = route?.params?.isViewerCoupon;
  const couponList = useSelector(state => state.coupon.couponView);
  const {data} = couponList || {};

  const handleSubmit = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.patternContainer}>
        <Pattern navigation={navigation} isGoBack={false} />
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>
      <View style={styles.contentContainer}>
        {(isViewerCoupon) ? (
          <>
            <Text style={styles.greeting}>Hello There!</Text>
            <Text style={styles.greeting}>
              Thank you for supporting our business, here's a special offer
              for helping us spread the word.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.greeting}>You have already checked in</Text>
            <Text style={styles.greeting}> the Coupon!</Text>
          </>
        )}

        <View style={styles.detailsWrap}>
          <Text style={styles.details}>{data?.name || ''}</Text>
          <Text style={styles.details}>{`${data?.offer || ''} OFF *ends ${
            data?.expiry || ''
          } At ${data?.merchant}`}</Text>
        </View>
        <View style={styles.btnWrap}>
          <Button title={'Continue'} onPress={handleSubmit} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 70,
  },
  greeting: {
    color: 'gray',
    fontSize: 20,
  },
  details: {
    color: 'black',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsWrap: {
    marginTop: 20,
  },
  patternContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  btnWrap: {
    marginTop: 100,
    width: '100%',
    paddingHorizontal: 30,
  },
});

export default GetNewCoupon;
