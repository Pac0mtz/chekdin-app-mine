import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useDispatch, useSelector } from 'react-redux';
import { getCouponStats } from '../../../slices/couponSlice';
import coupan from '../../../assets/pattern/couponPatren.png';
import logo from '../../../assets/images/logo.png';
import BackIcon from '../../../assets/icons/back.png';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS } from 'react-native-permissions';

const CouponSearchScreen = ({ navigation }) => {
  console.log('CouponSearchScreen rendered');
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState(30);
  const [latLong, setLatLong] = useState({ latitude: null, longitude: null });
  const dispatch = useDispatch();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (latLong.latitude && latLong.longitude) {
      fetchCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latLong, radius]);

  const couponStats = useSelector(state => state.coupon.couponStats?.data || []);
  const loading = useSelector(state => state.coupon.status) === 'loading';

  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            setLatLong({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          error => {
            console.error(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      }
    } else {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(result => {
          Geolocation.getCurrentPosition(
            position => {
              setLatLong({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            error => {
              console.error(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
          );
        })
        .catch(e => {
          console.log('e', e);
        });
    }
  };

  const fetchCoupons = () => {
    dispatch(
      getCouponStats({
        lat: latLong.latitude,
        long: latLong.longitude,
        radius,
      })
    );
  };

  const handleSearch = () => {
    fetchCoupons();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Image source={BackIcon} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons Nearby</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search coupons..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Radius: {radius} miles</Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={radius}
          onValueChange={setRadius}
        />
      </View>
      <ScrollView contentContainerStyle={styles.couponList}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : couponStats && couponStats.length > 0 ? (
          couponStats.map((item, index) => (
            <TouchableOpacity
              style={styles.coupanImageContainer}
              key={index}
              onPress={() => navigation.navigate('CouponDetails', { item })}
            >
              <Image source={coupan} style={styles.coupanImage} />
              <Image source={logo} style={styles.logostyle} />
              <View style={styles.couponDetail}>
                <Text style={styles.couponDetailMain}>{item?.offer_title}</Text>
                <Text style={styles.couponDetailSub}>{item?.coupon_code}</Text>
                <Text style={styles.couponDetailSub}>Exp {item?.expiry_date}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noCouponsText}>No coupons found in this area.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonContainer: {
    marginRight: 12,
  },
  backButton: {
    width: 25,
    height: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  couponList: {
    padding: 16,
  },
  coupanImageContainer: {
    width: '100%',
    height: 150,
    marginBottom: 20,
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
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: 'gray',
  },
  noCouponsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: 'gray',
  },
});

export default CouponSearchScreen; 