import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Button from '../../modules/Button';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {checkdinData, checkinData} from '../../../slices/couponSlice';
import mime from 'mime';
import {useDispatch, useSelector} from 'react-redux';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
let isMounted = false;

const RollingScreen = ({route, navigation}) => {
  const Status = useSelector(state => state.coupon.checkdinStatus);

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');

  const {data} = route?.params;
  console.log('data on rolling', data);
  useEffect(() => {
    const newData = JSON.parse(data);
    setId(newData?.id);
    setName(newData?.name || '');
  }, []);
  const dispatch = useDispatch();
  const handleCameraPress = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 720,
        maxWidth: 960,
      },
      async response => {
        // Ensure the response parameter is properly defined here
        if (
          !response.didCancel &&
          response.assets &&
          response.assets.length > 0
        ) {
          const item = response.assets[0].uri;
          const checkinFormData = new FormData();
          checkinFormData.append('coupon', id);
          checkinFormData.append('description', 'test');
          checkinFormData.append('checkin_img', {
            uri: item,
            name: item?.split('/').pop(),
            type: mime.getType(item),
          });
          console.warn('checkinFormData', checkinFormData);
          handleData(checkinFormData);
        }
      },
    );
  };
  const openCamera = () => {
    console.warn('camera');
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 720,
        maxWidth: 960,
      },
      async response => {
        if (
          !response.didCancel &&
          response.assets &&
          response.assets.length > 0
        ) {
          const item = response.assets[0];
          console.warn('checkinFormData   ITEM', item);
          const checkinFormData = new FormData();
          checkinFormData.append('coupon', id);
          checkinFormData.append('description', 'test');
          checkinFormData.append('checkin_img', {
            uri: item.uri,
            name: item.fileName?.split('/').pop(),
            type: item.type,
          });
          console.warn('checkinFormData', checkinFormData);
          handleData(checkinFormData);
        }
      },
    );
  };
  const handleData = checkinFormData => {
    console.log('testingggggggg');
    setLoading(true);
    dispatch(checkinData(checkinFormData));
    isMounted = true;
  };
  useEffect(() => {
    const fetchData = async () => {
      if (Status === 'succeeded' && isMounted) {
        try {
          const link = await dynamicLinks().buildShortLink({
            link: `https://checkdinapp.page.link/app?couponID=${id}`,
            domainUriPrefix: 'https://checkdinapp.page.link',

            android: {
              packageName: 'com.checkdinapp',
            },
            ios: {
              bundleId: 'org.reactjs.native.example.checkdinapp',
            },
          });

          console.log('link', link);

          navigation.navigate('ShareDetails', {link, id, name});
          isMounted = false;
        } catch (error) {
          // Handle any errors that may occur during link generation
          console.error('Error generating link:', error);
        } finally {
          setLoading(false);
        }
      } else if (Status === 'failed' && isMounted) {
        isMounted = false;
        setLoading(false);
      }
    };

    fetchData(); // Call the async function immediately
  }, [Status]);

  const couponList = useSelector(state => state.coupon.couponScan);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.patternContainer}>
        <Pattern navigation={navigation} isGoBack={false} />
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.greeting}>Hello There!</Text>
        <Text style={styles.greeting}>
          Thank you for supporting our business, here's a special offer for
          helping us spread the word.
        </Text>

        <View style={styles.detailsWrap}>
          <Text style={styles.details}>{couponList?.data.name || ''}</Text>
          <Text style={styles.details}>{`${
            couponList?.data.offer || ''
          } OFF *ends ${couponList?.data.expiry || ''} At ${
            couponList?.data.merchant
          }`}</Text>
        </View>
        <View style={styles.BtnWrap}>
          {loading ? (
            <Button title={<ActivityIndicator size="small" color="#ffff" />} />
          ) : (
            <View>
              <Button
                title="Select Photo"
                onPress={() => handleCameraPress()}
              />
              <Button title="Open Camera" onPress={() => openCamera()} />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  number: {
    fontSize: 18,
    marginBottom: 20,
    color: 'black',
  },
  BtnWrap: {
    marginTop: 100,
    width: '100%',
    paddingHorizontal: 30,
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
    bottom: 70,
  },
  greeting: {
    color: 'gray',
    fontSize: 20,
  },
});

export default RollingScreen;
