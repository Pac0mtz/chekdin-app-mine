import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform} from 'react-native';
import {Text, View, Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getProfile, profileUpdate, pushNoti} from '../../../slices/authSlice';
import Pattern from '../../elements/pattern';
import User from '../../../assets/images/user.png';
import Camera from '../../../assets/icons/camera.png';
import TextInputField from '../../modules/TextInput';
import Button from '../../modules/Button';
import {launchImageLibrary} from 'react-native-image-picker';
import mime from 'mime';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../elements/Loader';

const Profile = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isFromHome, setisFromHome] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const profile = useSelector(state => state.auth.profile);
  const profileUpdateStatus = useSelector(
    state => state.auth.profileUpdateStatus,
  );
  const redeemFcm = useSelector(state => state.auth.fcmResult);
  console.log('redeemFcm', redeemFcm);
  const restrictBackNavigation = true;
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (restrictBackNavigation) {
        e.preventDefault();
        // You can show a message to the user or perform any action here
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (profile && profile?.data) {
      setEmail(profile?.data?.email);
      setName(profile?.data?.name);
      setAddress(profile?.data?.address);
      setPhone(profile?.data?.phone_number);
      setSelectedImage(profile?.data?.profile_img_url);
    }
    setLoading(false);
  }, [profile]);

  const handleSubmit = async () => {
    // if (phone.length < 10) {
    //     Toast.show({
    //         type: 'error',
    //         text1: 'Phone number must be between 10 and 15 digits',
    //     });
    //     return; // Stop the submission
    // }
    // if (selectedImage === null) {
    //     Toast.show({
    //         type: 'error',
    //         text1: 'Please upload profile image!',
    //     });
    //     return; // Stop the submission
    // }
    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('address', address);
    data.append('phone_number', phone);

    if (selectedImage !== profile?.data?.profile_img_url) {
      data.append('profile_img', {
        uri: selectedImage,
        name: selectedImage?.split('/').pop(),
        type: mime.getType(selectedImage),
      });
    }
    // data.append('profile_img_url', selectedImage);

    const profileUpdateStatus = await dispatch(profileUpdate(data));

    if (profileUpdateStatus?.payload?.data) {
      //Profile created Successfully
      Toast.show({
        type: 'success',
        text1: 'Profile created Successfully',
      });
      dispatch(
        pushNoti({
          title: 'ChekdIN',
          body: 'Welcome to ChekdIN',
          token: redeemFcm,
        }),
      );
      navigation.navigate('Home');
    }
    setLoading(false);
  };

  const handleCameraPress = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 250,
        maxWidth: 300,
      },
      response => {
        console.log('res', response);
        if (
          !response.didCancel &&
          response.assets &&
          response.assets.length > 0
        ) {
          setSelectedImage(response.assets[0].uri);
        }
      },
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.patternContainer}>
          <Pattern navigation={navigation} isGoBack={false} />
          <View style={styles.logoContainer}>
            <View style={styles.imageContainer}>
              <View style={styles.userImageContainer}>
                {selectedImage ? (
                  <Image source={{uri: selectedImage}} style={styles.userImage} />
                ) : (
                  <Image source={User} style={styles.userImage} />
                )}
              </View>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleCameraPress}>
                <Image source={Camera} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.screenHeadingContainer}>
          <Text style={styles.screenHeading}>Create Profile</Text>
        </View>
        <View style={styles.contentContainer}>
          {isFromHome ? (
            <TextInputField
              placeholder="Name (Optional)"
              onChangeText={text => setName(text)}
              value={name}
            />
          ) : null}
          <TextInputField
            placeholder="Phone Number (Optional)"
            onChangeText={text => setPhone(text)}
            value={phone}
            keyboardType={'phone-pad'}
            max={16}
            // keyboardType="numeric"
          />
          <TextInputField
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
          />
          <TextInputField
            placeholder="Address (Optional)"
            onChangeText={text => setAddress(text)}
            value={address}
          />
          <Button title={'Continue'} onPress={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  patternContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  screenHeadingContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  screenHeading: {
    color: '#02676C',
    fontSize: 20,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 30,
  },
  userImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'lightgray',
    borderWidth: 4,
    borderColor: 'white',
    padding: 2,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
  },
});
export default Profile;
