import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import {Text, View, Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getProfile, profileUpdate} from '../../../slices/authSlice';
import Pattern from '../../elements/pattern';
import User from '../../../assets/images/user.png';
import Camera from '../../../assets/icons/camera.png';
import TextInputField from '../../modules/TextInput';
import Button from '../../modules/Button';
import {launchImageLibrary} from 'react-native-image-picker';
import mime from 'mime';
import Toast from 'react-native-toast-message';
let isMounted;
const EditProfile = ({navigation}) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(getProfile());
  }, []);

  const profile = useSelector(state => state.auth.profile);
  const profileUpdateStatus = useSelector(
    state => state.auth.profileUpdateStatus,
  );

  useEffect(() => {
    console.warn('name', name, address);
    if (profile && profile?.data) {
      setName(profile?.data?.name || '');
      setAddress(profile?.data?.address || '');
      setPhone(profile?.data?.phone_number || '');
      setEmail(profile?.data?.email || '');
      setSelectedImage(profile?.data?.profile_img_url);
    }
  }, [profile]);

  const handleCameraPress = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
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

  const handleSubmit = async () => {
    isMounted = false;
    if (phone.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Phone number must be between 10 and 15 digits',
      });
      return; // Stop the submission
    }
    if (selectedImage === null) {
      Toast.show({
        type: 'error',
        text1: 'Please upload profile image!',
      });
      return; // Stop the submission
    }
    const data = new FormData();
    data.append('name', name);
    data.append('address', address);
    data.append('email', email);
    data.append('phone_number', phone);
    if (selectedImage !== profile?.data?.profile_img_url) {
      data.append('profile_img', {
        uri: selectedImage,
        name: selectedImage?.split('/').pop(),
        type: mime.getType(selectedImage),
      });
    }

    dispatch(profileUpdate(data));
    isMounted = true;
  };

  useEffect(() => {
    if (profileUpdateStatus === 'succeeded' && isMounted) {
      //Profile created Successfully
      Toast.show({
        type: 'success',
        text1: 'Profile updated Successfully!',
      });
      isMounted = false;
      navigation.navigate('Profile');
    }
  }, [profileUpdateStatus]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          <View style={styles.userInfoWrap}>
            {profile?.data?.name !== 'null' ? (
              <Text style={styles.userName}>{profile?.data?.name || ''}</Text>
            ) : null}
            <Text style={styles.userEmail}>{profile?.data?.email || ''}</Text>
          </View>
        </View>
        <KeyboardAvoidingView style={styles.contentContainer}>
          <TextInputField
            placeholder="Name"
            onChangeText={text => setName(text)}
            value={name !== 'null' ? name : null} // Display an empty string if name is null or empty
            custom={true}
          />
          <TextInputField
            placeholder="Phone Number"
            onChangeText={text => setPhone(text)}
            value={phone !== 'null' ? phone : null} // Display an empty string if name is null or empty
            keyboardType={'phone-pad'}
            max={16}
            custom={true}
          />
          <TextInputField
            placeholder="Location"
            onChangeText={text => setAddress(text)}
            value={address !== 'null' ? address : null} // Display an empty string if name is null or empty
            custom={true}
          />
        </KeyboardAvoidingView>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title={'Save'} onPress={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
    width: '100%',
  },
  patternContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 30,
    marginBottom: 25,
    width: '100%',
  },
  screenHeadingContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  userInfoWrap: {
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  userName: {
    fontSize: 20,
    color: 'black',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: 'black',
    fontWeight: '400',
  },
  screenHeading: {
    color: '#02676C',
    fontSize: 20,
    fontWeight: '700',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  userImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: 'lightgray',
    borderWidth: 4,
    borderColor: 'white',
    padding: 2,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  buttonContainer: {
    position: 'relative',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
});
export default EditProfile;
