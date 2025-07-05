import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getMerchentList } from '../../../slices/merchentSlice';
import resturent from '../../../assets/images/resturent.png';
import CouponsIcon from '../../../assets/icons/coupons.png';
import SearchIcon from '../../../assets/icons/search.png';
import FilterModal from '../MerchantFilter/FilterModal';

const SearchResultsModal = ({ visible, onClose, initialSearchText = '', navigation }) => {
  const [searchText, setSearchText] = useState(initialSearchText);
  const [showCross, setShowCross] = useState(initialSearchText.length > 0);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return text => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (text.trim()) {
            setIsSearching(true);
            dispatch(getMerchentList(text.trim())).finally(() => {
              setIsSearching(false);
            });
          } else {
            dispatch(getMerchentList());
          }
        }, 200); // 200ms delay for faster response
      };
    })(),
    [dispatch],
  );

  const dispatch = useDispatch();
  const merchantList = useSelector(state => state.merchent.merchantList);
  const merchantStatus = useSelector(state => state.merchent.status);
  const stats = useSelector(state => state.coupon.couponStats);
  const statsData = stats?.data;
  
  // Get all coupons to match with merchants
  const allCoupons = [
    ...(statsData?.checkdin_coupons_list || []),
    ...(statsData?.redeemed_coupons_list || []),
    ...(statsData?.user_coupons_list || [])
  ];

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

  const handleSearch = () => {
    if (searchText.trim()) {
      setIsSearching(true);
      dispatch(getMerchentList(searchText.trim())).finally(() => {
        setIsSearching(false);
      });
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
    debouncedSearch(text); // Trigger debounced search as user types
  };

  // Auto-search when modal opens with initial text
  useEffect(() => {
    if (visible && initialSearchText.trim()) {
      setSearchText(initialSearchText);
      setShowCross(true);
      // Search immediately for any text, even single characters
      debouncedSearch(initialSearchText);
    }
  }, [visible, initialSearchText, debouncedSearch]);

  const handleMerchantPress = (merchant) => {
    onClose();
    navigation.navigate('MerchantDetails', { item: merchant });
  };

  const renderMerchantItem = ({ item, index }) => {
    // Coupon detection logic
    let hasCoupons = false;
    
    // Check direct coupon data
    if (item?.coupon && Array.isArray(item.coupon) && item.coupon.length > 0) {
      hasCoupons = true;
    }
    
    // Check coupon matching
    if (!hasCoupons && allCoupons.length > 0) {
      const merchantCoupons = allCoupons.filter(coupon => 
        safeCompareMerchantNames(coupon.merchant_name, item.name)
      );
      hasCoupons = merchantCoupons.length > 0;
    }

    return (
      <TouchableOpacity
        style={styles.merchantCard}
        onPress={() => handleMerchantPress(item)}>

        
        {item?.profile_img_url ? (
          <Image source={{ uri: item.profile_img_url }} style={styles.merchantImage} />
        ) : (
          <Image source={resturent} style={styles.merchantImage} />
        )}
        
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>{item.name}</Text>
          <Text style={styles.merchantAddress}>{item.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isMerchantListLoaded = merchantList && merchantList.data;
  const merchantResults = isMerchantListLoaded ? merchantList.data : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Merchants</Text>
          <View style={styles.placeholder} />
        </View>

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
              autoFocus={true}
            />
            {showCross && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.searchButton, !searchText.trim() && styles.searchButtonDisabled]} 
            onPress={searchText.trim() ? handleSearch : handleClearSearch}>
            <Text style={[styles.searchButtonText, !searchText.trim() && styles.searchButtonTextDisabled]}>
              {searchText.trim() ? 'Search' : 'Clear'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#02676C" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : merchantStatus === 'loading' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#02676C" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : merchantResults.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>
                {merchantResults.length} merchant{merchantResults.length !== 1 ? 's' : ''} found
              </Text>
              <FlatList
                data={merchantResults}
                renderItem={renderMerchantItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            </>
          ) : searchText.trim() ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No merchants found</Text>
              <Text style={styles.noResultsSubtext}>Try a different search term</Text>
            </View>
          ) : (
            <View style={styles.initialStateContainer}>
              <Text style={styles.initialStateText}>Search for merchants to get started</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
      
      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        navigation={navigation}
        route={{}}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#02676C',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: '#707070',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  searchButton: {
    backgroundColor: '#02676C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonTextDisabled: {
    color: '#999',
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
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginVertical: 15,
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    paddingBottom: 20,
  },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantCardWithCoupons: {
    borderWidth: 2,
    borderColor: '#02676C',
    backgroundColor: '#F0FFFD',
  },
  merchantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  merchantAddress: {
    fontSize: 14,
    color: '#666',
  },
  couponIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#02676C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default SearchResultsModal; 