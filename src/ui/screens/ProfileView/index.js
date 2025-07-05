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
import Loader from '../../elements/Loader';

const ProfileView = ({navigation, route}) => {
  const {isCompletingProfile} = route.params || {};
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSocialLoginUser, setIsSocialLoginUser] = useState(false);

  const profile = useSelector(state => state.auth.profile);
  const profileStatus = useSelector(state => state.auth.status);
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
      
      // Check if user is a social login user (has provider_id)
      setIsSocialLoginUser(!!profile.data.provider_id);
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
    // Validation for social login users
    if (isSocialLoginUser) {
      if (!name.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Name is required for social login users',
        });
        return;
      }
      if (!phone.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Phone number is required for social login users',
        });
        return;
      }
      if (!email.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Email is required for social login users',
        });
        return;
      }
    }

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
      {profileStatus === 'loading' && (
        <Loader message="Loading profile..." />
      )}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isCompletingProfile && (
          <View style={styles.infoMessageContainer}>
            <Text style={styles.infoMessageText}>
              Please complete your profile with your phone number and email to
              enjoy coupons and offers.
            </Text>
          </View>
        )}
        
        {/* Social Login User Notice */}
        {isSocialLoginUser && (
          <View style={styles.socialLoginNotice}>
            <Text style={styles.socialLoginNoticeText}>
              Social Login User - You can edit your name, email, and phone number
            </Text>
          </View>
        )}
        
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {selectedImage ? (
                <Image source={{uri: selectedImage}} style={styles.profileImage} />
              ) : (
                <Image source={User} style={styles.profileImage} />
              )}
              <View style={styles.profileImageOverlay} />
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleCameraPress}>
              <Image source={Camera} style={styles.cameraIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileImageText}>Tap to change photo</Text>
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
            onChangeText={setEmail}
            isEditable={isSocialLoginUser} // Make email editable for social login users
            custom={true}
            keyboardType="email-address"
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
      {profileUpdateStatus === 'loading' && (
        <Loader message="Updating profile..." />
      )}
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
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 66,
  },
  profileImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 66,
    backgroundColor: 'rgba(2, 103, 108, 0.1)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#02676C',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  profileImageText: {
    color: '#02676C',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  contentContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  infoMessageContainer: {
    backgroundColor: '#F0FFFD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#02676C',
  },
  infoMessageText: {
    color: '#02676C',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  socialLoginNotice: {
    backgroundColor: '#FFF3CD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  socialLoginNoticeText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default ProfileView;
