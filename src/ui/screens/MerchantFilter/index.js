import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '../../modules/Button';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import {
  filterMerchentList,
  getMerchentList,
  resetFilterStatus,
} from '../../../slices/merchentSlice';
import Toast from 'react-native-toast-message';
import {useSelector, useDispatch} from 'react-redux';
import Geocoder from 'react-native-geocoder';
import Map from '../../../assets/icons/map.png';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Slider from '@react-native-community/slider';

const isAndroid = Platform.OS === 'android';

const FilterScreen = ({navigation, route}) => {
  const updatedAddress = route.params?.address;
  const [location, setLocation] = useState(null);
  const filterStatus = useSelector(state => state.merchent.filterStatus);
  const dispatch = useDispatch();
  const [latLong, setLatLong] = useState(route.params?.address || '');
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(30); // Initial value
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');

  const predefinedFilters = [
    { label: 'Chicago', value: 'Chicago, IL' },
    { label: 'Orlando', value: 'Orlando, FL' },
    { label: 'New York', value: 'New York, NY' },
    { label: 'IL', value: 'Illinois' },
    { label: 'FL', value: 'Florida' },
    { label: '60601', value: '60601' },
    { label: '32801', value: '32801' },
  ];

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
      await dispatch(
        filterMerchentList({
          latitude: latLong.lat,
          longitude: latLong.lng,
          radius_in_km: radius.toFixed(0),
        })
      );
      navigation.navigate('AroundMe', {filter: true, filter50: false});
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setAddress('');
    setLatLong('');
    setRadius(30);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#E8F0F9'}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.heading}>Filter Merchants</Text>

          {/* Address Search */}
          <Text style={styles.sectionTitle}>Search Address</Text>
          <View style={styles.searchRow}>
            <GooglePlacesAutocomplete
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
                types: Array[('(cities)', 'postal_code')],
              }}
              onPress={(data, details = null) => {
                setLatLong(details.geometry.location);
                setAddress(details.formatted_address);
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#E8F0F9',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#02676C',
    marginBottom: 18,
    textAlign: 'center',
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
  icon: {
    width: 32,
    height: 32,
    marginLeft: 10,
    tintColor: '#02676C',
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
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#02676C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#E8F0F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#02676C',
  },
  resetButtonText: {
    color: '#02676C',
    fontWeight: '700',
    fontSize: 16,
  },
  locationButton: {
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
  },
  filterChip: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterChipSelected: {
    backgroundColor: '#02676C',
    borderColor: '#02676C',
  },
  filterChipText: {
    color: '#02676C',
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
});
export default FilterScreen;
