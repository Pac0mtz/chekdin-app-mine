import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {login, pushNoti, socialLogin} from '../../../slices/authSlice';
import { clearCouponView } from '../../../slices/couponSlice';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
import SocialButton from '../../elements/socialButton';
import {useDispatch, useSelector} from 'react-redux';
import TextInputField from '../../modules/TextInput';
import Button from '../../modules/Button';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {socialLoginService} from '../../../services/authService';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

let isMounted = false;

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const loading = useSelector(state => state.auth.loginStatus === 'loading');
  const loginStatus = useSelector(state => state.auth.loginStatus);
  const loginError = useSelector(state => state.auth.error);

  const dispatch = useDispatch();
  useEffect(() => {
    requestUserPermissionNotification();
    checkApplicationPermission();
  }, []);
  async function requestUserPermissionNotification() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }
  const isLoginDisabled =
    !email || !password || !!emailError || !!passwordError;
  const validateEmail = input => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };
  // const fcmResult = useSelector((state) => state.auth.fcmResult);
  // console.log("fcmResult" , fcmResult)
  const handleEmailChange = text => {
    setEmail(text);
    if (text) {
      if (!validateEmail(text)) {
        setEmailError('Invalid email address');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };
  const handlePasswordChange = text => {
    setPassword(text);
    if (text) {
      // Check if the text is not empty
      setPasswordError('');
    } else {
      setPasswordError('Password is required!'); // Show an error if the text is empty
    }
  };
  const handleSubmit = async () => {
    if (email && password) {
      await dispatch(login({email, password}));
      dispatch(clearCouponView());
    }
    isMounted = true;
  };
  const checkApplicationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      } catch (error) {}
    }
  };

  async function onFacebookButtonPress() {
    try {
      console.log('Starting Facebook login...');
      
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        console.log('User cancelled Facebook login');
        return;
      }

      // Once signed in, get the user's AccessToken
      const data = await AccessToken.getCurrentAccessToken();
      console.log('Facebook access token data:', data);
      
      if (!data) {
        throw new Error('Failed to obtain Facebook access token');
      }

      const tokenFb = data?.accessToken;
      
      // Get user data from Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${tokenFb}`,
      );
      const userData = await response.json();
      console.log('Facebook user data:', userData);

      if (!userData.email) {
        throw new Error('Email not available from Facebook');
      }

      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(tokenFb);
      console.log('Firebase Facebook credential created');

      // Sign in with Firebase credential
      const firebaseResult = await auth().signInWithCredential(facebookCredential);
      console.log('Firebase sign-in result:', firebaseResult);

      const user = auth().currentUser;
      console.log('Firebase current user:', user);

      if (user) {
        const token = await user.getIdToken();
        console.log('Firebase ID token obtained');

        // Prepare data for social login API
        const socialLoginData = {
          token: token,
          email: userData.email,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          provider: 'facebook',
          provider_id: userData.id
        };

        console.log('Dispatching social login with data:', socialLoginData);
        
        // Dispatch the socialLogin action
        const result = await dispatch(socialLogin(socialLoginData));
        console.log('Social login dispatch result:', result);
        
        dispatch(clearCouponView());
      } else {
        throw new Error('No Firebase user found after authentication');
      }
    } catch (error) {
      console.error('Error during Facebook login:', error);
      Toast.show({
        type: 'error',
        text1: 'Facebook Login Failed',
        text2: error.message || 'Please try again',
      });
    }
  }

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '864646753923-flmvc0hkt4fuim6m9sa2strrcofafhd7.apps.googleusercontent.com', // Your Web Client ID from Google Cloud Console
    });
  });

  const googleSignIn = async () => {
    try {
      console.log('Starting Google Sign-In...');
      
      await GoogleSignin.hasPlayServices();
      const {idToken, user: googleUser} = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', {idToken, user: googleUser});
      
      if (!idToken) {
        throw new Error('Failed to obtain Google ID token');
      }

      // Create a GoogleAuthProvider credential using the Google Sign-In ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log('Firebase Google credential created');

      // Sign in to Firebase with the Google credential
      const firebaseResult = await auth().signInWithCredential(googleCredential);
      console.log('Firebase sign-in result:', firebaseResult);

      // Get the user's Firebase authentication token
      const user = auth().currentUser;
      console.log('Firebase current user:', user);

      if (user) {
        const token = await user.getIdToken();
        console.log('Firebase ID token obtained');

        // Prepare data for social login API
        const socialLoginData = {
          token: token,
          email: googleUser?.email || user.email,
          name: googleUser?.name || user.displayName,
          provider: 'google',
          provider_id: googleUser?.id || user.uid
        };

        console.log('Dispatching social login with data:', socialLoginData);
        
        // Dispatch the socialLogin action
        const result = await dispatch(socialLogin(socialLoginData));
        console.log('Social login dispatch result:', result);
        
        dispatch(clearCouponView());
      } else {
        throw new Error('No Firebase user found after authentication');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: error.message || 'Please try again',
      });
    }
  };

  async function onAppleButtonPress() {
    try {
      console.log('Starting Apple Sign-In...');
      
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
        // See: https://github.com/invertase/react-native-apple-authentication#faqs
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      console.log('Apple auth response:', appleAuthRequestResponse);

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      const {identityToken, nonce} = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      console.log('Firebase Apple credential created');

      const firebaseResult = await auth().signInWithCredential(appleCredential);
      console.log('Firebase sign-in result:', firebaseResult);
      
      const user = auth().currentUser;
      console.log('Firebase current user:', user);

      if (user) {
        // Update user profile if name is available
        if (appleAuthRequestResponse?.fullName) {
          await auth().currentUser.updateProfile({
            displayName:
              appleAuthRequestResponse?.fullName?.givenName +
              ' ' +
              appleAuthRequestResponse?.fullName?.familyName,
            email: appleAuthRequestResponse?.email,
          });
        }

        const updatedUser = auth().currentUser;
        const token = await updatedUser.getIdToken();
        console.log('Firebase ID token obtained');

        // Prepare data for social login API
        const socialLoginData = {
          token: token,
          email: appleAuthRequestResponse?.email || user.email,
          name: appleAuthRequestResponse?.fullName ? 
            `${appleAuthRequestResponse?.fullName?.givenName || ''} ${appleAuthRequestResponse?.fullName?.familyName || ''}`.trim() :
            user.displayName,
          provider: 'apple',
          provider_id: user.uid
        };

        console.log('Dispatching social login with data:', socialLoginData);
        
        // Dispatch the socialLogin action
        const result = await dispatch(socialLogin(socialLoginData));
        console.log('Social login dispatch result:', result);
        
        dispatch(clearCouponView());
      } else {
        throw new Error('No Firebase user found after authentication');
      }
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Apple Sign-In Failed',
        text2: error.message || 'Please try again',
      });
    }
  }

  useEffect(() => {
    console.log('isMounted', isMounted);
    if (loginStatus === 'succeeded' && isMounted) {
      Toast.show({
        type: 'success',
        text1: 'Login successful!',
      });
      isMounted = false;
    } else if (loginStatus === 'failed' && isMounted) {
      Toast.show({
        type: 'error',
        text1: loginError,
      });
      isMounted = false;
    }
  }, [loginStatus, loginError]);

  // Monitor social login status
  useEffect(() => {
    console.log('Social login status changed:', loginStatus, 'Error:', loginError);
    if (loginStatus === 'succeeded') {
      Toast.show({
        type: 'success',
        text1: 'Social login successful!',
        text2: 'Welcome to ChekdIn!',
      });
    } else if (loginStatus === 'failed' && loginError) {
      Toast.show({
        type: 'error',
        text1: 'Social Login Failed',
        text2: loginError,
      });
    }
  }, [loginStatus, loginError]);

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.patternContainer}>
          <Pattern navigation={navigation} isGoBack={false} />
          <View style={styles.logoContainer}>
            <Logo />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <TextInputField
              placeholder="Email"
              onChangeText={handleEmailChange}
              type="email"
              value={email}
              error={emailError}
            />
            <TextInputField
              placeholder="Password"
              onChangeText={handlePasswordChange}
              type="password"
              value={password}
              secureTextEntry={true}
              error={passwordError}
            />
            <View style={styles.forgotPasswordContainer}>
              <Text
                style={styles.forgotPasswordText}
                onPress={() => navigation.navigate('ForgotPassword')}>
                Forgot Password?
              </Text>
            </View>
            {loading ? (
              <Button title={<ActivityIndicator size="small" color="#ffff" />} />
            ) : (
              <Button
                title={'Login'}
                onPress={handleSubmit}
                isDisabled={isLoginDisabled}
              />
            )}

            <View style={styles.socialButtonContainer}>
              <SocialButton title={'google'} onPress={googleSignIn} />
              <SocialButton title={'facebook'} onPress={onFacebookButtonPress} />
              {Platform.OS !== 'android' && (
                <SocialButton title={'apple'} onPress={onAppleButtonPress} />
              )}
            </View>
            
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>
                Not Registered Yet?{' '}
                <Text
                  style={styles.createAccountLink}
                  onPress={() => navigation.navigate('Signup')}>
                  Signup
                </Text>
              </Text>
            </View>
          </View>
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
    bottom: 70,
    transform: [{scale: 0.5}],
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: -30,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    width: '100%',
    marginTop: 15,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    color: '#000',
    fontSize: 14,
  },
  socialButtonContainer: {
    flexDirection: 'row',
    // alignItems: 'stretch',
    justifyContent: 'space-around',
    gap: 20,
    marginTop: 30,
    marginBottom: 30,
    // width: '100%',
  },
  createAccountContainer: {
    marginTop: 30,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountText: {
    color: '#000',
    fontSize: 14,
  },
  createAccountLink: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default Login;
