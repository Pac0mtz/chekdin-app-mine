import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
  TextInput,
  Image,
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
import GetLocation from 'react-native-get-location';
const isAndroid = Platform.OS === 'android';

const FilterScreen = ({navigation, route}) => {
  const updatedAddress = route.params?.address;
  console.warn(
    'updatedAddress start============?>',
    updatedAddress ? updatedAddress : '',
  );

  const [location, setLocation] = useState(null);
  const filterStatus = useSelector(state => state.merchent.filterStatus);
  const dispatch = useDispatch();
  const [latLong, setLatLong] = useState(route.params?.address || '');
  const [address, setAddress] = useState('');
  const [thumbPosition, setThumbPosition] = useState(300);
  const [value, setValue] = useState(30); // Initial value
  const [isTextInputDisabled, setIsTextInputDisabled] = useState(true);

  const handlePanResponderMove = (_, gestureState) => {
    // Calculate the new thumb position based on the gesture movement
    const newThumbPosition = thumbPosition + gestureState.dx;

    // Ensure the thumb stays within the bounds of the bar (between 0 and 300 based on the bar's width)
    const clampedThumbPosition = Math.max(0, Math.min(newThumbPosition, 300)); // Adjust this value based on your bar's width

    // Calculate the value based on the thumb's position and the new range (1 to 10)
    const newValue = (clampedThumbPosition / 300) * (30 - 1) + 1; // Adjust 300 and the range based on your bar's width and value range

    setThumbPosition(clampedThumbPosition);
    console.log(clampedThumbPosition);
    console.log(newValue);
    setValue(newValue);
  };

  useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log(location);
        const latlng = {
          lat: location.latitude,
          lng: location.longitude,
        };
        setLatLong(latlng);
        Geocoder.geocodePosition(latlng).then(res => {
          setAddress(res[0]?.formattedAddress || '');
          // res is an Array of geocoding object (see below)
        });
      })
      .catch(error => {
        const {code, message} = error;
        console.warn(code, message);
      });
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: handlePanResponderMove,
  });
  // const getCurrentLocation = async () => {
  //   if (Platform.OS === 'ios') {
  //     const auth = await Geolocation.requestAuthorization("whenInUse");
  //     if (auth === "granted") {
  //       Geolocation.getCurrentPosition(
  //         (position) => {
  //           const { latitude, longitude } = position.coords;
  //           setLocation({ latitude, longitude });
  //           let obj = {
  //             latitude: latitude,
  //             longitude: longitude
  //           }
  //           setLatLong(updatedAddress ? updatedAddress : obj);
  //           console.warn(' latLong obj', latLong)
  //           convertLatLngInAddress(obj);
  //         },
  //         (error) => {
  //           console.error(error);
  //         },
  //         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //       );
  //     }
  //   }

  //   if (Platform.OS === 'android') {
  //     request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
  //       Geolocation.getCurrentPosition(
  //         (position) => {
  //           const { latitude, longitude } = position.coords;
  //           setLocation({ latitude, longitude });
  //           let obj = {
  //             latitude: latitude,
  //             longitude: longitude
  //           }
  //           setLatLong(updatedAddress ? updatedAddress : obj);
  //           console.warn(' latLong obj', latLong)
  //           convertLatLngInAddress(obj);
  //         },
  //         (error) => {
  //           console.error(error);
  //         },
  //         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //       );
  //     }).catch((e) => {
  //       console.log("e", e)
  //     });
  //   }
  // };
  // const convertLatLngInAddress = async (obj) => {
  //   console.warn('obj convertLatLngInAddress', obj)
  //   // Position Geocoding
  //   let NY = {
  //     lat: obj.latitude,
  //     lng: obj.longitude
  //   };

  //   console.log(NY, 'our NY');
  //   Geocoder.geocodePosition(NY)
  //     .then(res => {
  //       console.log(res[0].formattedAddress)
  //       let data = {
  //         latitude: res[0].position.lat,
  //         longitude: res[0].position.lng,
  //         address: res[0].formattedAddress
  //       };
  //       console.warn('data', data)
  //       setAddress(data)
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }

  // useEffect(() => {
  //   getCurrentLocation();
  // }, [route.params?.address]);

  const onApply = () => {
    console.log('radius', latLong.lat, latLong.lng, value.toFixed(1));
    // const Locat = locationChips.filter((item) => item.isSelected === true)?.map((item) => item?.value)
    const km = value * 1.60934;

    if (latLong?.length !== 0) {
      dispatch(
        filterMerchentList({
          latitude: latLong.lat,
          longitude: latLong.lng,
          radius_in_km: value.toFixed(0),
        }),
      );

      const filter = true;
      navigation.navigate('AroundMe', {filter, filter50: false});
    } else {
      Toast.show({
        type: 'error',
        text1: 'Please Select Radius!',
      });
    }
  };

  // useEffect(() => {
  //   if (filterStatus === 'succeeded') {
  //     Toast.show({
  //       type: 'success',
  //       text1: 'Filter successful!',
  //     });
  //     dispatch(resetFilterStatus());
  //     const filter = true
  //     navigation.navigate("AroundMe", { filter,filter50:false })
  //   } else if (filterStatus === 'failed') {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Something went wrong!',
  //     });
  //     dispatch(resetFilterStatus());
  //   }
  // }, [filterStatus]);

  const renderChips = (chips, setChips) => {
    return (
      <View style={styles.chipContainer}>
        {chips.map((chip, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              {
                backgroundColor: chip.isSelected ? '#E8F0F9' : 'white',
              },
            ]}
            onPress={() => {
              const newChips = chips.map((item, i) =>
                i === index
                  ? {...item, isSelected: true}
                  : {...item, isSelected: false},
              );
              setChips(newChips);
            }}>
            <Text
              style={[
                styles.chipText,
                {
                  fontWeight: chip.isSelected ? 'bold' : 'normal',
                  color: chip.isSelected ? 'black' : 'gray',
                },
              ]}>
              {chip.value}
            </Text>
            {chip.isSelected && <Text style={styles.cross}>x</Text>}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  const handlePress = () => {
    if (isTextInputDisabled) {
      navigation.navigate('Map', {address});
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.mainView}>
        <View style={styles.leftView}>
          <Text style={styles.heading}>Search Address</Text>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search by city or zip code"
          // currentLocation={true}
          // currentLocationLabel="Current location"
          placeholderTextColor="#707070" // Set custom placeholder text color
          minLength={2} // minimum length of text to search
          autoFocus={false}
          enablePoweredByContainer={false}
          returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          fetchDetails={true}
          // renderDescription={row => row.description} // custom description render

          query={{
            key: 'AIzaSyBdSky2nI8jY7zxpQF-cWGj2Ol2cT-_r1s',
            language: 'en', // language of the results
            components: 'country:us',
            types: Array[('(cities)', 'postal_code')],
          }}
          onPress={(data, details = null) => {
            setLatLong(details.geometry.location);

            console.log('detail.description', details.formatted_address);
            setAddress(details.formatted_address);
          }}
          // textInputProps={{
          //   defaultValue:address,
          //   value:address,
          //   onChangeText:(text)=>{
          //     if(text){

          //       setAddress(text)
          //     }
          //   }
          //   // onChangeText: (text) => setAddress(text)
          // }}
          onFail={error => console.error(error)}
          // listViewDisplayed="false"
          textInputProps={{
            placeholderTextColor: '#707070',
          }}
          styles={{
            textInput: {
              alignItems: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 10,
              height: 65,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: 'lightgray',
              color: 'black',
              flex: 1, // Take 80% of the header width
              alignItems: 'center',
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
            row: {
              backgroundColor: 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 10,
            },
          }}
          // predefinedPlaces={[{description:'Current Location',geometry:{location:{lat:latLong?.lat,lng:latLong?.lng}}}]}
          // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list

          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          // filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
        />
      </View>

      <Text style={styles.heading}>Select Mile Radius</Text>
      <View style={styles.barContainer}>
        <View style={styles.bar}>
          <View
            style={[styles.thumb, {left: thumbPosition}]}
            {...panResponder.panHandlers}
          />
        </View>
        <Text style={styles.valueText}>{value.toFixed(1)}m</Text>
      </View>

      <Button title={'Apply'} onPress={() => onApply()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E8F0F9',
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    flexDirection: 'row',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0F9',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  mainView: {flexDirection: 'row', width: '100%'},
  leftView: {width: '85%'},
  rightView: {width: '15%', flexDirection: 'row'},

  chipText: {
    fontSize: 16,
    color: 'black',
    marginRight: 5,
  },
  cross: {
    color: 'gray',
    fontWeight: 'bold',
  },
  barContainer: {
    alignItems: 'center',
    marginTop: 26,
  },
  bar: {
    width: 330, // Adjust the width of the bar as needed
    height: 10,
    backgroundColor: 'lightgray',
    position: 'relative',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#02676C',
    position: 'absolute',
    bottom: -3,
  },
  valueText: {
    marginTop: 10,
    fontSize: 16,
  },
  searchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  icon: {
    width: 30,
    height: 30,
  },
});
export default FilterScreen;
