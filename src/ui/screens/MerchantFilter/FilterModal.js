import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Slider from '@react-native-community/slider';
import {
  filterMerchentList,
} from '../../../slices/merchentSlice';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';

const FilterModal = ({visible, onClose, navigation, route}) => {
  const dispatch = useDispatch();
  const [latLong, setLatLong] = useState(route?.params?.address || '');
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(30);
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setLatLong('');
      setAddress('');
      setRadius(30);
      
      // Initialize with existing filter data if available
      if (route?.params?.filterData) {
        const { latitude, longitude, radius: filterRadius, address: filterAddress } = route.params.filterData;
        if (latitude && longitude) {
          setLatLong({ lat: latitude, lng: longitude });
          setAddress(filterAddress || '');
          setRadius(filterRadius || 30);
        }
      }
    }
  }, [visible, route?.params?.filterData]);

  const onApply = async () => {
    if (!latLong || !latLong.lat || !latLong.lng) {
      Toast.show({
        type: 'error',
        text1: 'Please select a location!',
      });
      return;
    }
    

    
    setLoading(true);
    try {
      const result = await dispatch(
        filterMerchentList({
          latitude: latLong.lat,
          longitude: latLong.lng,
          radius_in_km: radius.toFixed(0),
        })
      );
      

      if (result.error) {
        Toast.show({
          type: 'error',
          text1: 'Filter failed. Please try again.',
        });
        return;
      }
      onClose();
      // Use replace instead of navigate to prevent navigation stack issues
      navigation.replace('AroundMe', {
        filter: true, 
        filter50: false,
        filterData: {
          latitude: latLong.lat,
          longitude: latLong.lng,
          radius: radius,
          address: address
        }
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Filter failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setAddress('');
    setLatLong('');
    setRadius(30);
  };

  const onCancel = () => {
    onReset();
    onClose();
  };

  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.heading}>Filter Merchants</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Address Search */}
              <Text style={styles.sectionTitle}>Search Address</Text>
              <View style={styles.searchRow}>
                <GooglePlacesAutocomplete
                  key={visible ? 'open' : 'closed'} // Force reset when modal opens
                  placeholder="Search by city or zip code"
                  minLength={2}
                  autoFocus={false}
                  enablePoweredByContainer={false}
                  returnKeyType={'search'}
                  fetchDetails={true}
                  query={{
                    key: 'AIzaSyBdSky2nI8jY7zxpQF-cWGj2Ol2cT-_r1s',
                    language: 'en',
                    components: 'country:us',
                    types: ['(cities)', 'postal_code'],
                  }}
                  onPress={(data, details = null) => {
                    if (details && details.geometry && details.geometry.location) {
                      setLatLong(details.geometry.location);
                      setAddress(details.formatted_address);
                    } else {
                      Toast.show({
                        type: 'error',
                        text1: 'Invalid location selected. Please try again.',
                      });
                    }
                  }}
                  onFail={error => console.error(error)}
                  textInputProps={{
                    placeholderTextColor: '#707070',
                    style: styles.searchInput,
                    value: address,
                    onChangeText: setAddress,
                  }}
                  styles={{
                    textInput: styles.searchInput,
                    row: styles.gplacesRow,
                  }}
                  nearbyPlacesAPI="GooglePlacesSearch"
                />
              </View>
              
              {/* Selected Location Indicator */}
              {latLong && latLong.lat && latLong.lng && (
                <View style={styles.selectedLocationContainer}>
                  <Text style={styles.selectedLocationText}>
                    Selected: {address || `${latLong.lat.toFixed(4)}, ${latLong.lng.toFixed(4)}`}
                  </Text>
                </View>
              )}

              {/* Radius Slider */}
              <Text style={styles.sectionTitle}>Select Mile Radius</Text>
              <View style={styles.sliderRow}>
                <Slider
                  style={{flex: 1, height: 40}}
                  minimumValue={1}
                  maximumValue={30}
                  step={1}
                  value={radius}
                  onValueChange={setRadius}
                  minimumTrackTintColor="#02676C"
                  maximumTrackTintColor="#E8F0F9"
                  thumbTintColor="#02676C"
                />
                <Text style={styles.radiusValue}>{radius} mi</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={onReset}
                  disabled={loading}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={onApply}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.applyButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0F9',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#02676C',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8F0F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#02676C',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    marginTop: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  gplacesRow: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  selectedLocationContainer: {
    backgroundColor: '#E8F0F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#02676C',
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#02676C',
    fontWeight: '500',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  radiusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#02676C',
    marginLeft: 12,
    minWidth: 40,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 8,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  resetButtonText: {
    color: '#6C757D',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#02676C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default FilterModal; 