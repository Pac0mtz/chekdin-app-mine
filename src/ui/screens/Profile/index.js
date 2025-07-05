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
  const [isSocialLoginUser, setIsSocialLoginUser] = useState(false);
  
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
      
      // Check if user is a social login user (has provider_id)
      setIsSocialLoginUser(!!profile?.data?.provider_id);
    }
    setLoading(false);
  }, [profile]);

  // Debug function to test profile update
  const testProfileUpdate = async () => {
    console.log('Testing profile update from Profile screen');
    console.log('Current user state:', user);
    console.log('Current profile state:', profile);
    console.log('User access token:', user?.data?.access_token ? 'Present' : 'Missing');
    
    const testData = new FormData();
    testData.append('name', 'Test User');
    testData.append('email', 'test@example.com');
    testData.append('phone_number', '1234567890');
    testData.append('address', 'Test Address');
    
    try {
      const result = await dispatch(profileUpdate(testData));
      console.log('Test profile update result:', result);
      Toast.show({
        type: 'success',
        text1: 'Test Profile Update',
        text2: 'Check console for result',
      });
    } catch (error) {
      console.error('Test profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Test Profile Update Failed',
        text2: error.message,
      });
    }
  };

  // Expose debug function globally
  React.useEffect(() => {
    global.testProfileUpdateFromScreen = testProfileUpdate;
  }, []);

  const handleSubmit = async () => {
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

    // Basic validation
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name is required',
      });
      return;
    }

    if (!phone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Phone number is required',
      });
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      Toast.show({
        type: 'error',
        text1: 'Phone number must be between 10 and 15 digits',
      });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', name.trim());
      data.append('email', email.trim());
      data.append('address', address.trim());
      data.append('phone_number', phone.trim());

      if (selectedImage !== profile?.data?.profile_img_url) {
        data.append('profile_img', {
          uri: selectedImage,
          name: selectedImage?.split('/').pop(),
          type: mime.getType(selectedImage),
        });
      }

      console.log('Profile update data:', {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        phone_number: phone.trim(),
        hasImage: selectedImage !== profile?.data?.profile_img_url
      });

      console.log('FormData contents:');
      for (let [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
      }

      const result = await dispatch(profileUpdate(data));
      console.log('Profile update result:', result);

      // Check if the update was successful
      if (result.error) {
        throw new Error(result.error.message || 'Profile update failed');
      }

      // Check if we have a successful response
      if (result.payload && (result.payload.data || result.payload.success)) {
        // Profile updated successfully
        Toast.show({
          type: 'success',
          text1: 'Profile updated successfully!',
        });
        
        // Send welcome notification if this is a new profile
        if (!profile?.data?.name || !profile?.data?.phone_number) {
          dispatch(
            pushNoti({
              title: 'ChekdIN',
              body: 'Welcome to ChekdIN',
              token: redeemFcm,
            }),
          );
        }
        
        navigation.navigate('Home');
      } else {
        throw new Error('Profile update failed - no response data');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed',
        text2: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
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
    <View style={styles.container}>
      <Pattern />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={testProfileUpdate}
          >
            <Text style={styles.debugButtonText}>Debug: Test Profile Update</Text>
          </TouchableOpacity>
        )}
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
  debugButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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

export default Profile;
