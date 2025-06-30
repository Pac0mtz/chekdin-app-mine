import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import resturent from '../../../assets/images/Res.png';
import {useDispatch, useSelector} from 'react-redux';
import {getMerchentList} from '../../../slices/merchentSlice';
import {getCouponList, getCouponStats} from '../../../slices/couponSlice';
import CustomTabBar from '../../modules/CustomBottomTab';
import SearchIcon from '../../../assets/icons/search1.png';
import RadialChart from '../Home/RadialChart';

const CouponsList = ({route, navigation}) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');

  const list = route.params;
  console.log('list', list);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(getCouponList()); // Fetch the coupon list when the component mounts
    });
    return unsubscribe;
  }, [dispatch, navigation]);

  const stats = useSelector(state => state.coupon.couponStats);
  let data = stats?.data;

  const totalCoupons =
    (data?.checkdin_coupons || 0) +
    (data?.redeemed_coupons || 0) +
    (data?.user_coupons || 0);

  console.log('updateData', data);

  const handleSearch = async () => {
    await dispatch(getCouponStats(searchText));
  };
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate('CouponDetails', {
          item,
          isRedeem: list?.redeemed_coupons ? true : false,
        })
      }>
      <View style={styles.cardImageContainer}>
        {item?.coupon_img_url ? (
          <Image
            source={{uri: item?.coupon_img_url}}
            style={styles.cardImage}
          />
        ) : (
          <Image source={resturent} style={styles.cardImage} />
        )}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {item?.discount_amount || 0}
            {item?.discount_type === 'Percentage'
              ? '%'
              : item?.discount_type === 'User'
              ? '$'
              : ''}{' '}
            OFF
          </Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.restaurantName}>{item?.offer_title}</Text>
        <Text style={styles.address}>{item?.offer_description}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantLabel}>Merchant</Text>
            <Text style={styles.merchantName}>
              {item?.merchant_name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.expiryInfo}>
            <Text style={styles.expiryLabel}>Expires</Text>
            <Text style={styles.expiryDate}>
              {item?.expiry_date || 'No expiry'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <View style={styles.searchContainer}>
        <Image source={SearchIcon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search By coupon and discount..."
            placeholderTextColor="#707070"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View> */}
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
              maxValue={totalCoupons}
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
              maxValue={totalCoupons}
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
              maxValue={totalCoupons}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <FlatList
          data={
            list?.checkdin_coupons
              ? data?.checkdin_coupons_list
              : list?.redeemed_coupons
              ? data?.redeemed_coupons_list
              : list?.user_coupons
              ? data?.user_coupons_list
              : data?.checkdin_coupons_list
          }
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={() => (
            <Text style={styles.line}>No Records Found!</Text>
          )}
        />
      </ScrollView>
      <CustomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E8F0F9',
    paddingBottom: 80,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
  outcircle: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'lightgray',
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#02676C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  cardInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  merchantName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  expiryInfo: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  expiryDate: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  line: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CouponsList;
