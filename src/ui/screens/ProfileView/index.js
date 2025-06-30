import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getProfile, profileUpdate} from '../../../slices/authSlice';
import User from '../../../assets/images/user.png';
import Camera from '../../../assets/icons/camera.png';
import TextInputField from '../../modules/TextInput';
import Button from '../../modules/Button';
import {launchImageLibrary} from 'react-native-image-picker';
import mime from 'mime';
import Toast from 'react-native-toast-message';

const ProfileView = ({navigation, route}) => {
  const {isCompletingProfile} = route.params || {};
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const profile = useSelector(state => state.auth.profile);
  const profileUpdateStatus = useSelector(
    state => state.auth.profileUpdateStatus,
  );

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.data) {
      setName(profile.data.name || '');
      setAddress(profile.data.address || '');
      setPhone(profile.data.phone_number || '');
      setEmail(profile.data.email || '');
      setSelectedImage(profile.data.profile_img_url);
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

  const handleSubmit = () => {
    if (phone.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Phone number must be between 10 and 15 digits',
      });
      return;
    }
    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'Please upload a profile image!',
      });
      return;
    }

    const data = new FormData();
    data.append('name', name);
    data.append('address', address);
    data.append('email', email);
    data.append('phone_number', phone);
    if (selectedImage !== profile?.data?.profile_img_url) {
      data.append('profile_img', {
        uri: selectedImage,
        name: selectedImage.split('/').pop(),
        type: mime.getType(selectedImage),
      });
    }

    dispatch(profileUpdate(data));
  };

  useEffect(() => {
    if (profileUpdateStatus === 'succeeded') {
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
      });
      navigation.navigate('Dashboard');
    } else if (profileUpdateStatus === 'failed') {
      Toast.show({
        type: 'error',
        text1: 'Profile update failed!',
      });
    }
  }, [profileUpdateStatus, navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isCompletingProfile && (
          <View style={styles.infoMessageContainer}>
            <Text style={styles.infoMessageText}>
              Please complete your profile with your phone number and email to
              enjoy coupons and offers.
            </Text>
          </View>
        )}
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
        <KeyboardAvoidingView style={styles.contentContainer}>
          <TextInputField
            placeholder="Name"
            onChangeText={setName}
            value={name !== 'null' ? name : ''}
            custom={true}
          />
          <TextInputField
            placeholder="Email"
            value={email}
            isEditable={false}
            custom={true}
          />
          <TextInputField
            placeholder="Phone Number"
            onChangeText={setPhone}
            value={phone !== 'null' ? phone : ''}
            keyboardType={'phone-pad'}
            maxLength={15}
            custom={true}
          />
          <TextInputField
            placeholder="Address"
            onChangeText={setAddress}
            value={address !== 'null' ? address : ''}
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
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  userImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'lightgray',
    borderWidth: 4,
    borderColor: 'white',
    overflow: 'hidden',
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
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  infoMessageContainer: {
    backgroundColor: '#E0F2F1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  infoMessageText: {
    color: '#00796B',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ProfileView;
