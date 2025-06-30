import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import BackIcon from '../../../assets/icons/back.png';
import {useDispatch, useSelector} from 'react-redux';
import {filterMerchentList} from '../../../slices/merchentSlice';
import PermissionHandler from '../../../utils/permissionHandler';
import Toast from 'react-native-toast-message';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const MapWithIcon = ({navigation, route}) => {
  const [userLocation, setUserLocation] = useState({
    latitude: 44.240304,
    longitude: -91.493768,
  });
  const [merchants, setMerchants] = useState([]);
  const [nearestMerchants, setNearestMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const merchantList = useSelector(state => state.merchant.merchantList);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);
      await getCurrentLocation();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation && !error) {
      fetchNearbyMerchants();
    }
  }, [userLocation]);

  useEffect(() => {
    processMerchantData();
  }, [merchantList]);

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await PermissionHandler.requestLocationWithGeolocation();
      if (hasPermission) {
        const position = await PermissionHandler.getCurrentLocation();
        setUserLocation(position);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Location Permission Required',
          text2: 'Please enable location permission to see nearby merchants.',
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your current location.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyMerchants = async () => {
    try {
      console.log('Fetching merchants for location:', userLocation);
      await dispatch(
        filterMerchentList({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius_in_km: 50,
        }),
      );
    } catch (error) {
      console.error('Error fetching merchants:', error);
      // Use test data if API fails
      const testMerchants = [
        {
          id: 1,
          name: 'Test Restaurant',
          address: '123 Main St',
          latitude: userLocation.latitude + 0.01,
          longitude: userLocation.longitude + 0.01,
        },
        {
          id: 2,
          name: 'Test Cafe',
          address: '456 Oak Ave',
          latitude: userLocation.latitude - 0.01,
          longitude: userLocation.longitude - 0.01,
        }
      ];
      setMerchants(testMerchants);
      calculateNearestMerchants(testMerchants);
    }
  };

  const processMerchantData = () => {
    try {
      let merchantData = [];
      
      if (merchantList?.data && Array.isArray(merchantList.data)) {
        merchantData = merchantList.data;
      } else if (merchantList && Array.isArray(merchantList)) {
        merchantData = merchantList;
      }

      const validMerchants = merchantData.filter(merchant => 
        merchant && 
        merchant.latitude && 
        merchant.longitude &&
        !isNaN(parseFloat(merchant.latitude)) &&
        !isNaN(parseFloat(merchant.longitude))
      );

      console.log('Valid merchants found:', validMerchants.length);
      setMerchants(validMerchants);
      calculateNearestMerchants(validMerchants);
    } catch (error) {
      console.error('Error processing merchant data:', error);
    }
  };

  const calculateNearestMerchants = (merchantData) => {
    try {
      if (!userLocation || !merchantData || !Array.isArray(merchantData)) {
        setNearestMerchants([]);
        return;
      }

      const merchantsWithDistance = merchantData.map(merchant => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(merchant.latitude),
          parseFloat(merchant.longitude),
        );
        return {
          ...merchant,
          distance,
        };
      });

      const nearest = merchantsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      setNearestMerchants(nearest);
    } catch (error) {
      console.error('Error calculating nearest merchants:', error);
      setNearestMerchants([]);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    try {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  };

  const handleMerchantPress = (merchant) => {
    setSelectedMerchant(merchant);
  };

  const handleMerchantDetail = (merchant) => {
    try {
      navigation.navigate('MerchantDetail', {merchant});
    } catch (error) {
      console.error('Error navigating to merchant detail:', error);
      Alert.alert('Error', 'Unable to open merchant details');
    }
  };

  const renderMerchantItem = ({item, index}) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity
        style={styles.merchantItem}
        onPress={() => handleMerchantDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {item.name || 'Merchant Name'}
          </Text>
          <Text style={styles.merchantAddress} numberOfLines={1}>
            {item.address || 'Address not available'}
          </Text>
          <Text style={styles.merchantDistance}>
            {item.distance ? `${item.distance.toFixed(1)} km away` : 'Distance unknown'}
          </Text>
        </View>
        <View style={styles.merchantRank}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMerchantMarker = (merchant) => {
    if (!merchant || !merchant.latitude || !merchant.longitude) return null;
    
    const latitude = parseFloat(merchant.latitude);
    const longitude = parseFloat(merchant.longitude);
    
    if (isNaN(latitude) || isNaN(longitude)) return null;

    return (
      <Marker
        key={merchant.id || Math.random()}
        coordinate={{
          latitude,
          longitude,
        }}
        title={merchant.name || 'Merchant'}
        description={merchant.address || 'Tap for details'}
        onPress={() => handleMerchantPress(merchant)}
      >
        <View style={styles.markerContainer}>
          <View style={styles.markerPin} />
        </View>
      </Marker>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#02676C" />
        <Text style={styles.loadingText}>Loading nearby merchants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={initializeMap}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {merchants.map(renderMerchantMarker)}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Around Me</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchants..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Nearest Merchants List */}
      <View style={styles.bottomContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Nearest Merchants</Text>
          <Text style={styles.merchantCount}>
            {merchants.length} merchants found
          </Text>
        </View>
        
        {nearestMerchants.length > 0 ? (
          <FlatList
            data={nearestMerchants}
            renderItem={renderMerchantItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            style={styles.merchantList}
          />
        ) : (
          <View style={styles.noMerchantsContainer}>
            <Text style={styles.noMerchantsText}>
              No merchants found nearby
            </Text>
            <Text style={styles.noMerchantsSubtext}>
              Try expanding your search radius or check back later
            </Text>
          </View>
        )}
      </View>

      {/* Selected Merchant Info */}
      {selectedMerchant && (
        <View style={styles.selectedMerchantInfo}>
          <Text style={styles.selectedMerchantName}>
            {selectedMerchant.name}
          </Text>
          <Text style={styles.selectedMerchantAddress}>
            {selectedMerchant.address}
          </Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleMerchantDetail(selectedMerchant)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0F9',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    color: '#02676C',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#02676C',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#02676C',
    flex: 1,
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 90,
    left: 20,
    right: 20,
    height: 50,
    zIndex: 1000,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: screenHeight * 0.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#02676C',
  },
  merchantCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  merchantList: {
    flex: 1,
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#02676C',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  merchantInfo: {
    flex: 1,
    marginRight: 15,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  merchantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  merchantDistance: {
    fontSize: 12,
    color: '#02676C',
    fontWeight: '500',
  },
  merchantRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#02676C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#02676C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedMerchantInfo: {
    position: 'absolute',
    bottom: screenHeight * 0.4 + 20,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F0F9',
  },
  selectedMerchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#02676C',
    marginBottom: 8,
  },
  selectedMerchantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  viewDetailsButton: {
    backgroundColor: '#02676C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewDetailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noMerchantsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMerchantsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#02676C',
    marginBottom: 10,
  },
  noMerchantsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#02676C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MapWithIcon;
