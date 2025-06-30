import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  SafeAreaView,
} from 'react-native';
import resturent from '../../../assets/images/resturent.png';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {getMerchentList} from '../../../slices/merchentSlice';
import CustomTabBar from '../../modules/CustomBottomTab';
import SearchIcon from '../../../assets/icons/search1.png';
import filterImage from '../../../assets/icons/filter.png';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import RadialChart from '../Home/RadialChart';

const MerchentList = ({route, navigation}) => {
  const searchData = route.params ? route.params.searchData : '';
  const filter50 = route?.params?.filter50 || false;
  const filter = route?.params?.filter || false;

  console.warn('filter 50 ===', filter50);
  console.warn('simple filter ===', filter);
  const [searchText, setSearchText] = useState(
    searchData != null ? searchData : '',
  );
  const [showCross, setShowCross] = useState(false);
  const [latLong, setLatLong] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();
  const {data} = route?.params || {};

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return text => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (text.trim()) {
            setIsSearching(true);
            dispatch(getMerchentList(text)).finally(() => {
              setIsSearching(false);
            });
          } else {
            dispatch(getMerchentList());
          }
        }, 300); // 300ms delay
      };
    })(),
    [dispatch],
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (filter50){
        dispatch(getMerchentList()); 
        console.log('filter data if con');
      }
    });
    return unsubscribe;
  }, [navigation, filter50]);

  useEffect(() => {
    if (filter) {
      setSearchText(route.params.searchData);
      setShowCross(true);
    }
  }, [filter]);

  // Auto-load merchants when location is available
  useEffect(() => {
    if (latLong && latLong.latitude && latLong.longitude) {
      dispatch(getMerchentList());
    }
  }, [latLong, dispatch]);

  const handleSearch = () => {
    if (searchText.trim()) {
      setIsSearching(true);
      dispatch(getMerchentList(searchText)).finally(() => {
        setIsSearching(false);
      });
      setShowCross(true);
      navigation.navigate('AroundMe',{filter50:false});
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setShowCross(false);
    dispatch(getMerchentList());
  };

  const handleTextChange = text => {
    setSearchText(text);
    setShowCross(text.length > 0);
    debouncedSearch(text);
  };

  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            let obj = {
              latitude: latitude,
              longitude: longitude,
            }
            setLatLong(obj);
            console.warn(' latLong obj', latLong);
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
              let obj = {
                latitude: latitude,
                longitude: longitude,
              };
              setLatLong(obj);
              console.warn(' latLong obj', latLong);
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

  const merchantList = useSelector(state => state.merchent.merchantList);
  const stats = useSelector(state => state.coupon.couponStats);
  const statsData = stats?.data;
  const totalCoupons =
    (statsData?.checkdin_coupons || 0) +
    (statsData?.redeemed_coupons || 0) +
    (statsData?.user_coupons || 0);

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

  console.log('latLong:', latLong);
  if (merchantList && merchantList.data) {
    console.log('First 5 merchants:', merchantList.data.slice(0, 5));
  }

  const safeNumber = val => {
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  const safeCalculateDistance = (lat1, lon1, lat2, lon2) => {
    const a = safeNumber(lat1);
    const b = safeNumber(lon1);
    const c = safeNumber(lat2);
    const d = safeNumber(lon2);
    if (a === null || b === null || c === null || d === null) {return 999999;}
    return calculateDistance(a, b, c, d);
  };

  const renderItem = ({item, index}) => {
    // Calculate the distance using the calculateDistance function
    const distance = calculateDistance(
      latLong.latitude,
      latLong.longitude,
      item.latitude,
      item.longitude,
    );

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => navigation.navigate('MerchantDetails', {item})}>
        {item?.profile_img_url ? (
          <Image
            source={{uri: item?.profile_img_url}}
            style={styles.cardImage}
          />
        ) : (
          <Image source={resturent} style={styles.cardImage} />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.addressContainer}>
              <Text style={styles.address}>{item.address}</Text>
            </View>
            <View style={styles.distanceContainer}>
              <Text style={styles.distance}>{distance.toFixed(0)} mi</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const isMerchantListLoaded = merchantList && merchantList.data;

  const sortedMerchantList = isMerchantListLoaded
    ? (searchText || '').trim()
      ? [...merchantList.data]
          .map(merchant => ({
            ...merchant,
            distance: safeCalculateDistance(
              latLong.latitude,
              latLong.longitude,
              merchant.latitude,
              merchant.longitude,
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
      : [...merchantList.data]
          .map(merchant => ({
            ...merchant,
            distance: safeCalculateDistance(
              latLong.latitude,
              latLong.longitude,
              merchant.latitude,
              merchant.longitude,
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20) // Show 20 closest merchants
    : [];

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Image source={SearchIcon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search By Merchant..."
              placeholderTextColor="#707070"
              value={searchText}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSearch}
            />
            {showCross && (
              <TouchableOpacity
                style={styles.clearIconContainer}
                onPress={handleClearSearch}>
                <Text style={{color: 'black'}}>clear</Text>
              </TouchableOpacity>
            )}
            {isSearching && (
              <Text style={styles.searchingText}>Searching...</Text>
            )}
          </View>

          {/* Filter Bar */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterBar}
              onPress={() => navigation.navigate('Filter')}>
              <Image style={{height: 50, width: 50}} source={filterImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyCoupons', {
                checkdin_coupons: statsData?.checkdin_coupons_list,
              })
            }
            style={styles.outcircle}>
            <RadialChart
              series={[statsData?.checkdin_coupons || 0]}
              labels={['Chekdin']}
              maxValue={10}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyCoupons', {
                redeemed_coupons: statsData?.redeemed_coupons_list,
              })
            }
            style={styles.outcircle}>
            <RadialChart
              series={[statsData?.redeemed_coupons || 0]}
              labels={['Redeemed']}
              maxValue={10}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outcircle}
            onPress={() =>
              navigation.navigate('MyCoupons', {
                user_coupons: statsData?.user_coupons_list,
              })
            }>
            <RadialChart
              series={[statsData?.user_coupons || 0]}
              labels={['Viewer']}
              maxValue={10}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        {isMerchantListLoaded && sortedMerchantList.length ? (
          <View>
            <Text style={styles.resultsCount}>
              {(searchText || '').trim()
                ? `${sortedMerchantList.length} merchants found`
                : `Showing 20 closest merchants`}
            </Text>
            <FlatList
              data={sortedMerchantList}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View>
            <Text style={styles?.line}>No Merchant Found! </Text>
            {!data?.filter && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}>
                <Text style={{color: 'black'}}>Clear Filter/Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      <CustomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F0F9',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    height: 50,
    paddingHorizontal: 10,
    // marginBottom: 15,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
    width: 20,
    height: 20,
  },
  searchText: {
    fontSize: 16,
    color: 'gray',
  },
  filterContainer: {
    flex: 0.2, // Take 20% of the header width
    alignItems: 'center',
    marginLeft: 20,
  },
  filterBar: {
    backgroundColor: 'transparent',
    // borderWidth: 1,
    // borderColor: 'lightgray',
    borderRadius: 20,
    padding: 8,
  },
  filterIcon: {
    fontSize: 20,
  },
  clearButton: {
    alignSelf: 'center',
    paddingTop: 10,
  },
  outcircle: {
    alignItems: 'center',

  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'lightgray',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 10,
    margin: 5,
    elevation: 5,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  distanceContainer: {
    width: '20%',
  },
  address: {
    fontSize: 12,
    color: 'gray',
  },
  distance: {
    fontSize: 12,
    color: 'black',
  },
  line: {
    color: 'black',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  searchingText: {
    fontSize: 12,
    color: '#02676C',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
});

export default MerchentList;
