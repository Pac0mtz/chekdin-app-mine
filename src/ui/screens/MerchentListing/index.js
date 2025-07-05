import React, {useEffect, useState, useCallback, useRef} from 'react';
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
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import resturent from '../../../assets/images/resturent.png';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {getMerchentList, getMerchantDetails, resetFilterStatus, filterMerchentList} from '../../../slices/merchentSlice';
import {getCouponStats} from '../../../slices/couponSlice';
import CustomTabBar from '../../modules/CustomBottomTab';
import SearchIcon from '../../../assets/icons/search1.png';
import filterImage from '../../../assets/icons/filter.png';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import RadialChart from '../Home/RadialChart';
import Svg, {
  Path,
  Text as SvgText,
  TextPath,
  Defs,
  Circle,
} from 'react-native-svg';
import MerchantIcon from '../../../assets/icons/merchant-icon.png';
import CouponsIcon from '../../../assets/icons/coupons.png';
import SearchIconHome from '../../../assets/icons/search.png';
import Loader from '../../elements/Loader';
import FilterModal from '../MerchantFilter/FilterModal';


const screenHeight = Dimensions.get('window').height;
const smallScreenThreshold = 720;
const mediumScreenThreshold = 760;
const LargeScreenThreshold = 820;
const ExtraLargeScreenThreshold = 1200;

const containerStyle = screenHeight <= smallScreenThreshold;
const containerStyle2 = screenHeight <= mediumScreenThreshold;
const containerStyle3 = screenHeight <= LargeScreenThreshold;
const containerStyle4 = screenHeight >= ExtraLargeScreenThreshold;

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

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [merchantDetails, setMerchantDetails] = useState({});

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
            // If on Around Me screen and no search text, use 30-mile radius
            if (filter50 && latLong && latLong.latitude && latLong.longitude) {
              dispatch(filterMerchentList({
                latitude: latLong.latitude,
                longitude: latLong.longitude,
                radius_in_km: 48.28, // 30 miles in kilometers
              }));
            } else {
              dispatch(getMerchentList());
            }
          }
        }, 300); // 300ms delay
      };
    })(),
    [dispatch, filter50, latLong],
  );

  useEffect(() => {
    console.log('Component mounted, filter50:', filter50);
    getCurrentLocation();
  }, []);

  // Fetch coupon stats if not loaded
  useEffect(() => {
    if (!statsData) {
      dispatch(getCouponStats());
    }
  }, [dispatch, statsData]);

  // Reset filter status when component mounts
  useEffect(() => {
    dispatch(resetFilterStatus());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused, filter50:', filter50, 'latLong:', latLong);
      if (filter50 && latLong && latLong.latitude && latLong.longitude){
        console.log('Refreshing 30-mile radius filter on focus');
        dispatch(filterMerchentList({
          latitude: latLong.latitude,
          longitude: latLong.longitude,
          radius_in_km: 48.28, // 30 miles in kilometers
        })); 
      }
    });
    return unsubscribe;
  }, [navigation, filter50, latLong, dispatch]);

  useEffect(() => {
    if (filter) {
      setSearchText(route.params.searchData);
      setShowCross(true);
      
      // Handle filter data if provided
      if (route.params.filterData) {
        const { latitude, longitude, radius, address } = route.params.filterData;
        
        // Update the latLong state with the filtered location
        if (latitude && longitude) {
          setLatLong({ latitude, longitude });
        }
      }
    } else {
      // Reset filter-related state when not filtering
      setSearchText('');
      setShowCross(false);
    }
  }, [filter, route.params]);

  // Auto-load merchants when location is available
  useEffect(() => {
    if (latLong && latLong.latitude && latLong.longitude) {
      console.log('Location available, filter50:', filter50);
      // If filter50 is true (Around Me screen), use 30-mile radius by default
      if (filter50) {
        console.log('Dispatching 30-mile radius filter');
        dispatch(filterMerchentList({
          latitude: latLong.latitude,
          longitude: latLong.longitude,
          radius_in_km: 48.28, // 30 miles in kilometers
        }));
      } else {
        console.log('Dispatching regular merchant list');
        dispatch(getMerchentList());
      }
    }
  }, [latLong, dispatch, filter50]);

  const handleSearch = () => {
    if (searchText.trim()) {
      setIsSearching(true);
      dispatch(getMerchentList(searchText)).finally(() => {
        setIsSearching(false);
      });
      setShowCross(true);
      // Keep the current filter50 state when searching
      navigation.navigate('AroundMe',{filter50: filter50});
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setShowCross(false);
    // If on Around Me screen, use 30-mile radius, otherwise use regular search
    if (filter50 && latLong && latLong.latitude && latLong.longitude) {
      dispatch(filterMerchentList({
        latitude: latLong.latitude,
        longitude: latLong.longitude,
        radius_in_km: 48.28, // 30 miles in kilometers
      }));
    } else {
      dispatch(getMerchentList());
    }
  };

  const handleTextChange = text => {
    setSearchText(text);
    setShowCross(text.length > 0);
    debouncedSearch(text);
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

  const fetchMerchantDetails = async (merchantId) => {
    try {
      const result = await dispatch(getMerchantDetails(merchantId));
      if (result.payload?.data) {
        setMerchantDetails(prev => ({
          ...prev,
          [merchantId]: result.payload.data
        }));
      }
    } catch (error) {
      console.log('Error fetching merchant details:', error);
    }
  };

  const getCurrentLocation = async () => {
    console.log('Getting current location...');
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      console.log('iOS location auth:', auth);
      if (auth === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            let obj = {
              latitude: latitude,
              longitude: longitude,
            }
            console.log('iOS location set:', obj);
            setLatLong(obj);
          },
          error => {
            console.error('iOS location error:', error);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    }
    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(result => {
          console.log('Android location permission:', result);
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              let obj = {
                latitude: latitude,
                longitude: longitude,
              };
              console.log('Android location set:', obj);
              setLatLong(obj);
            },
            error => {
              console.error('Android location error:', error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        })
        .catch(e => {
          console.log('Android permission error:', e);
        });
    }
  };

  const merchantList = useSelector(state => state.merchent.merchantList);
  const merchantStatus = useSelector(state => state.merchent.status);
  
  // Debug merchant list state
  console.log('=== MERCHANT LIST DEBUG ===');
  console.log('Merchant status:', merchantStatus);
  console.log('Merchant list available:', !!merchantList);
  console.log('Merchant list data available:', !!merchantList?.data);
  console.log('Merchant list data length:', merchantList?.data?.length || 0);
  if (merchantList?.data?.length > 0) {
    console.log('First few merchants:', merchantList.data.slice(0, 3).map(m => ({ name: m.name, lat: m.latitude, lng: m.longitude })));
  }
  console.log('=== END MERCHANT LIST DEBUG ===');
  const stats = useSelector(state => state.coupon.couponStats);
  const statsData = stats?.data;
  const totalCoupons =
    (statsData?.checkdin_coupons || 0) +
    (statsData?.redeemed_coupons || 0) +
    (statsData?.user_coupons || 0);
    
  // Get all coupons to match with merchants
  const allCoupons = [
    ...(statsData?.checkdin_coupons_list || []),
    ...(statsData?.redeemed_coupons_list || []),
    ...(statsData?.user_coupons_list || [])
  ];
  
  // Debug: Check coupon data
  console.log('=== COUPON DATA DEBUG ===');
  console.log('Stats data available:', !!statsData);
  console.log('Checkdin coupons list length:', statsData?.checkdin_coupons_list?.length || 0);
  console.log('Redeemed coupons list length:', statsData?.redeemed_coupons_list?.length || 0);
  console.log('User coupons list length:', statsData?.user_coupons_list?.length || 0);
  console.log('All coupons total length:', allCoupons.length);
  
  if (allCoupons.length > 0) {
    console.log('First few coupon names:', allCoupons.slice(0, 3).map(c => c.name));
    console.log('First few coupon merchant names:', allCoupons.slice(0, 3).map(c => c.merchant_name));
  }
  console.log('=== END COUPON DATA DEBUG ===');
  
  // Debug: Show which merchants should have coupons
  console.log('=== MERCHANTS WITH COUPONS DEBUG ===');
  console.log('Merchants that should have coupons:');
  allCoupons.forEach(coupon => {
    console.log(`  - "${coupon.merchant_name}" has coupon: "${coupon.name}"`);
  });
  
  // Check if any of these merchants are in the current list
  if (isMerchantListLoaded && merchantList.data.length > 0) {
    console.log('Checking if coupon merchants are in current list:');
    allCoupons.forEach(coupon => {
      const foundMerchant = merchantList.data.find(merchant => 
        safeCompareMerchantNames(coupon.merchant_name, merchant.name)
      );
      if (foundMerchant) {
        console.log(`  ✅ "${coupon.merchant_name}" found as "${foundMerchant.name}"`);
      } else {
        console.log(`  ❌ "${coupon.merchant_name}" NOT found in current list`);
      }
    });
  }
  console.log('=== END MERCHANTS WITH COUPONS DEBUG ===');
  


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

  // Utility function to safely compare merchant names
  function safeCompareMerchantNames(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
      const nameA = a.trim().toLowerCase().replace(/[^\w\s]/g, '');
      const nameB = b.trim().toLowerCase().replace(/[^\w\s]/g, '');
      
      // Exact match
      if (nameA === nameB) return true;
      
      // Handle special cases like "Giordano's Pizza" vs "Giordanos"
      const cleanA = nameA.replace(/['"]/g, '').replace(/\s+/g, '');
      const cleanB = nameB.replace(/['"]/g, '').replace(/\s+/g, '');
      if (cleanA === cleanB) return true;
      
      // Handle cases where one is a shortened version (but be more strict)
      if (cleanA.length > 5 && cleanB.length > 5) {
        if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
          // Additional check: the shorter name should be at least 60% of the longer name
          const longer = cleanA.length > cleanB.length ? cleanA : cleanB;
          const shorter = cleanA.length > cleanB.length ? cleanB : cleanA;
          if (shorter.length >= longer.length * 0.6) {
            return true;
          }
        }
      }
      
      // Handle common business name variations (be more specific)
      const variationsA = nameA.split(/\s+/).filter(word => word.length > 3);
      const variationsB = nameB.split(/\s+/).filter(word => word.length > 3);
      
      // Only match if there's a significant word overlap
      let matchCount = 0;
      for (const wordA of variationsA) {
        for (const wordB of variationsB) {
          if (wordA === wordB && wordA.length > 4) {
            matchCount++;
          }
        }
      }
      
      // Require at least 2 significant word matches or 1 exact match for longer names
      if (matchCount >= 2 || (matchCount >= 1 && Math.min(variationsA.length, variationsB.length) >= 2)) {
        return true;
      }
    }
    return false;
  }

  const renderItem = ({item, index}) => {
    // Calculate the distance using the calculateDistance function
    const distance = calculateDistance(
      latLong.latitude,
      latLong.longitude,
      item.latitude,
      item.longitude,
    );

    // Coupon detection logic - check for any coupons associated with this merchant
    let hasCoupons = false;
    
    // Check direct coupon data
    if (item?.coupon && Array.isArray(item.coupon) && item.coupon.length > 0) {
      hasCoupons = true;
    }
    
    // Check merchant details if available
    if (!hasCoupons && merchantDetails[item.id]) {
      const detail = merchantDetails[item.id];
      if (detail?.coupon && Array.isArray(detail.coupon) && detail.coupon.length > 0) {
        hasCoupons = true;
      }
    }
    
          // Check coupon matching as last resort
      if (!hasCoupons && allCoupons.length > 0) {
        const merchantCoupons = allCoupons.filter(coupon => {
          const isMatch = safeCompareMerchantNames(coupon.merchant_name, item.name);
          // Debug: Log the matching process for first few merchants
          if (index < 3) {
            console.log(`    - Comparing "${coupon.merchant_name}" with "${item.name}": ${isMatch}`);
          }
          return isMatch;
        });
        
        hasCoupons = merchantCoupons.length > 0;
        
        // If we found matching coupons but no direct data, fetch merchant details
        if (hasCoupons && !merchantDetails[item.id]) {
          fetchMerchantDetails(item.id);
        }
      }
    
    // Debug: Log coupon detection for ALL merchants with coupons or first 5 merchants
    const shouldLog = hasCoupons || index < 5;
    if (shouldLog) {
      console.log(`Merchant "${item.name}" (index ${index}):`);
      console.log(`  - Has direct coupon array: ${item?.coupon && Array.isArray(item.coupon)}`);
      if (item?.coupon && Array.isArray(item.coupon)) {
        console.log(`  - Direct coupon count: ${item.coupon.length}`);
        console.log(`  - Coupon names:`, item.coupon.map(c => c.name));
      }
      
      // Check matched coupons for this merchant
      const merchantCoupons = allCoupons.filter(coupon => 
        safeCompareMerchantNames(coupon.merchant_name, item.name)
      );
      console.log(`  - Matched coupons count: ${merchantCoupons.length}`);
      if (merchantCoupons.length > 0) {
        console.log(`  - Matched coupon names:`, merchantCoupons.map(c => c.name));
      }
      
      console.log(`  - Will show indicator: ${hasCoupons}`);
    }
    
    
  

  


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
          <View style={styles.merchantHeader}>
            <Text style={styles.restaurantName}>{item.name}</Text>
          </View>
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
  
  // Debug: Check merchant data structure
  if (isMerchantListLoaded && merchantList.data.length > 0) {
    console.log('=== MERCHANT DATA STRUCTURE DEBUG ===');
    const firstMerchant = merchantList.data[0];
    console.log('First merchant keys:', Object.keys(firstMerchant));
    console.log('First merchant coupon field:', firstMerchant.coupon);
    console.log('First merchant coupons_count:', firstMerchant.coupons_count);
    console.log('First merchant has_coupons:', firstMerchant.has_coupons);
    console.log('=== END MERCHANT DATA STRUCTURE DEBUG ===');
  }
  


  const sortedMerchantList = isMerchantListLoaded
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
        .sort((a, b) => {
          // If there's a search, prioritize merchants with coupons regardless of distance
          if ((searchText || '').trim()) {
            // Use the same simplified logic to check for any coupons
            const checkHasCoupons = (merchant) => {
              // Check direct coupon data
              if (merchant?.coupon && Array.isArray(merchant.coupon) && merchant.coupon.length > 0) {
                return true;
              }
              
              // Check merchant details
              if (merchantDetails[merchant.id]) {
                const detail = merchantDetails[merchant.id];
                if (detail?.coupon && Array.isArray(detail.coupon) && detail.coupon.length > 0) {
                  return true;
                }
              }
              
              // Check matched coupons
              if (allCoupons.length > 0) {
                const merchantCoupons = allCoupons.filter(coupon => 
                  safeCompareMerchantNames(coupon.merchant_name, merchant.name)
                );
                return merchantCoupons.length > 0;
              }
              
              return false;
            };
            
            const aHasCoupons = checkHasCoupons(a);
            const bHasCoupons = checkHasCoupons(b);
            
            // Merchants with coupons come first
            if (aHasCoupons && !bHasCoupons) return -1;
            if (!aHasCoupons && bHasCoupons) return 1;
            
            // If both have or don't have coupons, sort by distance
            return a.distance - b.distance;
          }
          
          // If no search, sort by distance only
          return a.distance - b.distance;
        })
    : [];



  // Use sorted merchant list directly
  let filteredMerchantList = sortedMerchantList;
  
  // Limit to 20 for display only when not searching
  if (!(searchText || '').trim()) {
    filteredMerchantList = filteredMerchantList.slice(0, 20);
  }
  
  // Debug: Summary of merchants with coupons
  const merchantsWithCoupons = filteredMerchantList.filter(merchant => {
    // Use the same logic as in renderItem
    if (merchant?.coupon && Array.isArray(merchant.coupon) && merchant.coupon.length > 0) {
      return true;
    }
    if (merchantDetails[merchant.id]) {
      const detail = merchantDetails[merchant.id];
      if (detail?.coupon && Array.isArray(detail.coupon) && detail.coupon.length > 0) {
        return true;
      }
    }
    if (allCoupons.length > 0) {
      const merchantCoupons = allCoupons.filter(coupon => 
        safeCompareMerchantNames(coupon.merchant_name, merchant.name)
      );
      return merchantCoupons.length > 0;
    }
    return false;
  });
  
  console.log(`=== SUMMARY: ${merchantsWithCoupons.length} out of ${filteredMerchantList.length} merchants have coupons ===`);
  if (merchantsWithCoupons.length > 0) {
    console.log('Merchants with coupons:', merchantsWithCoupons.map(m => m.name));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E8F0F9', }}>
      {merchantStatus === 'loading' && (
        <Loader message="Loading merchants..." />
      )}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.mainContainer}>
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
              {isSearching && (
                <Text style={styles.searchingText}>Searching...</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}>
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Around Me Header */}
          {filter50 && !(searchText || '').trim() && (
            <View style={styles.aroundMeHeader}>
              <Text style={styles.aroundMeTitle}>📍 Around Me</Text>
              <Text style={styles.aroundMeSubtitle}>Showing merchants within 30 miles of your location</Text>
              <Text style={styles.aroundMeDebug}>Filter50: {filter50.toString()}</Text>
              <Text style={styles.aroundMeDebug}>Location: {latLong?.latitude?.toFixed(4)}, {latLong?.longitude?.toFixed(4)}</Text>
              <Text style={styles.aroundMeDebug}>Radius: 30 miles (48.28 km)</Text>
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  if (latLong && latLong.latitude && latLong.longitude) {
                    console.log('Manual 30-mile filter trigger');
                    dispatch(filterMerchentList({
                      latitude: latLong.latitude,
                      longitude: latLong.longitude,
                      radius_in_km: 48.28,
                    }));
                  }
                }}
              >
                <Text style={styles.debugButtonText}>🔧 Test 30-mile Filter</Text>
              </TouchableOpacity>
            </View>
          )}

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

          {/* Toggle Button */}

          


          {/* Merchant List Section */}
          <View style={styles.merchantListSection}>
            {isMerchantListLoaded && filteredMerchantList.length ? (
              <View>
                <Text style={styles.resultsCount}>
                  {(searchText || '').trim()
                    ? `${filteredMerchantList.length} merchants found`
                    : filter50 
                      ? `${filteredMerchantList.length} merchants within 30 miles`
                      : `${filteredMerchantList.length} merchants found`}
                </Text>
                <FlatList
                  data={filteredMerchantList}
                  renderItem={renderItem}
                  keyExtractor={item => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            ) : (
              <Text style={styles.line}>No merchants found.</Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        navigation={navigation}
        route={route}
      />
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
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    flex: 0,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: '#707070',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 0,
    marginVertical: 20,
  },
  outcircle: {
    alignItems: 'center',
  },
  merchantListSection: {
    flex: 1,
  },


  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 50,
    padding: 10,
    position: 'relative',
  },
  cardWithCoupons: {
    borderWidth: 3,
    borderColor: '#02676C',
    backgroundColor: '#F0FFFD',
    borderRadius: 50,
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
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
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
    fontFamily: 'Poppins-Regular',
  },
  aroundMeHeader: {
    backgroundColor: '#F0FFFD',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#02676C',
  },
  aroundMeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#02676C',
    marginBottom: 5,
    fontFamily: 'Poppins-Bold',
  },
  aroundMeSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  aroundMeDebug: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
    marginTop: 5,
  },
  debugButton: {
    backgroundColor: '#02676C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
  },
  couponCircleIconWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#02676C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  couponCircleIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
});



export default MerchentList;
