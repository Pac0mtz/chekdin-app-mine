import React, {useEffect, useState, useRef} from 'react';
import AppNavigator from './src/ui/navigators/appNavigator';
import AuthNavigator from './src/navigators/authNavigator';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearUser,
  getProfile,
  pushNoti,
  saveUser,
  setFCMResult,
  resetJustLoggedIn,
  resetJustVerifiedSignup,
  profileUpdate,
} from './src/slices/authSlice';
import {
  checkProfileCompletion,
  showMandatoryProfileModal,
  selectIsModalVisible,
  selectIsProfileComplete,
  selectIsMandatory,
  selectLoginAttempts,
  resetLoginAttempts,
} from './src/slices/mandatoryProfileSlice';
import messaging from '@react-native-firebase/messaging';
import {Settings} from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {LogBox} from 'react-native';
import GuideScreen from './src/ui/screens/Guide';
import SessionManager from './src/utils/sessionManager';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashNavigator from './src/navigators/splashNavigator';
import {ThemeProvider} from './src/ui/ThemeProvider';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/ui/navigators/navigationRef';

import MandatoryProfileModal from './src/ui/modules/MandatoryProfileModal';

LogBox.ignoreAllLogs();

navigator.geolocation = require('react-native-geolocation-service');

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(true);
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const prevUser = useRef(null);


  const user = useSelector(state => state.auth.user);
  const loginStatus = useSelector(state => state.auth.loginStatus);
  const loginError = useSelector(state => state.auth.error);
  const deleteAccountStatus = useSelector(
    state => state.auth.deleteAccountStatus,
  );
  const verifyStatus = useSelector(state => state.auth.verifyStatus);
  const profile = useSelector(state => state.auth.profile);

  const verifyError = useSelector(state => state.auth.error);
  const justLoggedIn = useSelector(state => state.auth.justLoggedIn);
  const justVerifiedSignup = useSelector(state => state.auth.justVerifiedSignup);
  
  // Mandatory profile selectors
  const isMandatoryProfileModalVisible = useSelector(selectIsModalVisible);
  const isProfileComplete = useSelector(selectIsProfileComplete);
  const isMandatory = useSelector(selectIsMandatory);
  const loginAttempts = useSelector(selectLoginAttempts);

  const dispatch = useDispatch();

  useEffect(() => {
    Settings.setAdvertiserTrackingEnabled(true);
  }, []);

  // Initialize session on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SessionManager.initializeSession();
        setIsSessionInitialized(true);

        // Remove automatic session refresh - sessions never expire
        // SessionManager.startSessionRefresh();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsSessionInitialized(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isSessionInitialized) {
      dispatch(getProfile());
    }
  }, [isSessionInitialized]);

  // Show guide after OTP verification for new signups and show it only once to all new users
  useEffect(() => {
    console.log('Guide check: justLoggedIn:', justLoggedIn, 'justVerifiedSignup:', justVerifiedSignup, 'user:', user && user.data && user.data.email);
    
    // Show guide for new signups after OTP verification
    if (justVerifiedSignup && user && user.data && user.data.email) {
      const guideKey = `hasSeenGuide_${user.data.email}`;
      AsyncStorage.getItem(guideKey).then(value => {
        if (value === null) {
          setShowGuide(true);
          console.log('Guide will show for new signup user:', user.data.email);
        } else {
          setShowGuide(false);
          console.log('Guide already seen for user:', user.data.email);
        }
        dispatch(resetJustVerifiedSignup());
      });
    }
    // Show guide for regular logins (existing users who haven't seen it)
    else if (justLoggedIn && user && user.data && user.data.email) {
      const guideKey = `hasSeenGuide_${user.data.email}`;
      AsyncStorage.getItem(guideKey).then(value => {
        if (value === null) {
          setShowGuide(true);
          console.log('Guide will show for existing user:', user.data.email);
        } else {
          setShowGuide(false);
          console.log('Guide already seen for user:', user.data.email);
        }
        dispatch(resetJustLoggedIn());
      });
    }
  }, [justLoggedIn, justVerifiedSignup, user]);

  const handleGuideDone = async () => {
    if (user && user.data && user.data.email) {
      const guideKey = `hasSeenGuide_${user.data.email}`;
      await AsyncStorage.setItem(guideKey, 'true');
      setShowGuide(false);
    }
  };

  // Function to reset guide status for testing (you can call this from console)
  const resetGuideStatus = async () => {
    try {
      if (user && user.data && user.data.email) {
        const guideKey = `hasSeenGuide_${user.data.email}`;
        await AsyncStorage.removeItem(guideKey);
        console.log('Guide status reset for user:', user.data.email);
        setShowGuide(true);
        Toast.show({
          type: 'success',
          text1: 'Guide Reset',
          text2: 'Guide will show again for this user',
        });
      } else {
        console.log('No user email available for guide reset');
        Toast.show({
          type: 'error',
          text1: 'No User',
          text2: 'Please login first to reset guide',
        });
      }
    } catch (error) {
      console.error('Error resetting guide status', error);
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: 'Could not reset guide status',
      });
    }
  };

  // Expose reset function globally for testing
  global.resetGuideStatus = resetGuideStatus;

  async function buildLink() {
    console.warn('link click');
    const link = await dynamicLinks().buildLink(
      {
        link: 'https://checkdinapp.page.link/app',
        domainUriPrefix: 'https://checkdinapp.page.link',
        android: {
          packageName: 'com.checkdinapp',
          fallbackUrl:
            'https://play.google.com/store/apps/details?id=com.checkdinapp',
        },
        ios: {
          bundleId: 'org.reactjs.native.example.checkdinapp',
        },
      },
      dynamicLinks.ShortLinkType.DEFAULT,
    );
    console.warn('link', link);
    return link;
  }

  useEffect(() => {
    buildLink();
  }, []);

  async function requestUserPermission() {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    dispatch(setFCMResult(token));
  }

  const registerForRemoteMessages = () => {
    messaging()
      .registerDeviceForRemoteMessages()
      .then(res => {
        console.log('Device registered for remote messages.', res);
        requestUserPermission();
      })
      .catch(e => console.log(e));
  };

  messaging()
    .subscribeToTopic('weather')
    .then(() => console.log('Subscribed to topic!'));

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.warn('remoteMessage on background', remoteMessage);
    // Note: navigation is not available in background context
    // Handle background message without navigation
  });

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Toast.show({
        type: 'success',
        text1: remoteMessage?.notification?.title,
        text2: remoteMessage?.notification?.body,
      });

      console.log('test noti', remoteMessage?.notification);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    registerForRemoteMessages();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const clearUserDataFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await SessionManager.clearSession();
      await auth()
        .signOut()
        .then(res => console.log('test', res))
        .catch(e => {
          console.log('error signout', e);
        });
      await dispatch(clearUser());
      Toast.show({
        type: 'success',
        text1: 'Logout Successful',
      });
    } catch (error) {
      console.error('Error clearing user data from AsyncStorage:', error);
    }
  };

  // Function to clear all stored user data (for debugging/fixing auth issues)
  const clearAllUserData = async () => {
    try {
      // Clear all possible user data storage
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userSession');
      await SessionManager.clearSession();
      await auth().signOut();
      await dispatch(clearUser());
      console.log('All user data cleared successfully');
    } catch (error) {
      console.error('Error clearing all user data:', error);
    }
  };

  // Expose clear function globally for debugging
  global.clearAllUserData = clearAllUserData;

  useEffect(() => {
    if (loginStatus === 'succeeded') {
      if (verifyStatus === 'succeeded') {
        Toast.show({
          type: 'success',
          text1: 'Login successful!',
        });
      }
      return;
    } else if (loginStatus === 'failed') {
      Toast.show({
        type: 'error',
        text1: loginError,
      });
    }
  }, [loginStatus, loginError]);

  useEffect(() => {
    if (verifyStatus === 'failed') {
      Toast.show({
        type: 'error',
        text1: verifyError,
      });
    }
  }, [verifyStatus, verifyError]);

  // Check profile completion and show mandatory modal if needed
  useEffect(() => {
    if (user && user.data && user.data.email && profile) {
      dispatch(checkProfileCompletion(profile.data));
    }
  }, [profile, user, dispatch]);

  const handleMandatoryProfileComplete = () => {
    // Profile has been completed successfully
    dispatch(showMandatoryProfileModal());
  };

  const handleMandatoryProfileClose = () => {
    // Don't allow closing - force them to complete
    // The modal will handle this internally
  };

  // Debug function to show mandatory profile modal
  const showMandatoryProfileModalDebug = () => {
    dispatch(showMandatoryProfileModal());
  };

  // Debug function to reset profile completion flag
  const resetProfileCompletionFlag = async () => {
    if (user && user.data && user.data.email) {
      const flagKey = `profileCompleted_${user.data.email}`;
      await AsyncStorage.removeItem(flagKey);
      console.log('Profile completion flag reset for:', user.data.email);
      Toast.show({
        type: 'success',
        text1: 'Profile flag reset',
        text2: 'Modal will show again on next app load',
      });
    }
  };

  // Debug function to reset login attempts
  const resetLoginAttemptsDebug = async () => {
    try {
      await dispatch(resetLoginAttempts());
      Toast.show({
        type: 'success',
        text1: 'Login attempts reset',
        text2: 'Modal will show as first reminder',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: error.message,
      });
    }
  };

  // Expose debug functions globally
  global.showMandatoryProfileModalDebug = showMandatoryProfileModalDebug;
  global.resetProfileCompletionFlag = resetProfileCompletionFlag;
  global.resetLoginAttemptsDebug = resetLoginAttemptsDebug;
  
  // Debug function to test profile update directly
  global.testProfileUpdate = async () => {
    if (user && user.data && user.data.access_token) {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('phone_number', '1234567890');
      formData.append('marketing_consent', '1');
      
      console.log('Testing profile update with:', {
        name: 'Test User',
        phone_number: '1234567890',
        marketing_consent: '1'
      });
      
      console.log('User access token:', user.data.access_token ? 'Present' : 'Missing');
      console.log('User data:', user.data);
      
      try {
        const result = await dispatch(profileUpdate(formData));
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
    } else {
      console.log('No user token available for testing');
      console.log('User state:', user);
      Toast.show({
        type: 'error',
        text1: 'No User Token',
        text2: 'Please login first',
      });
    }
  };

  // Debug function to check user state
  global.checkUserState = () => {
    console.log('Current user state:', user);
    console.log('Current profile state:', profile);
    console.log('User access token:', user?.data?.access_token ? 'Present' : 'Missing');
    Toast.show({
      type: 'info',
      text1: 'User State Check',
      text2: 'Check console for details',
    });
  };

  if (showSplash || !isSessionInitialized) {
    return <SplashNavigator />;
  }

  console.log('App render - user:', !!user, 'hasSeenGuide:', hasSeenGuide, 'isGuideLoading:', isGuideLoading);

  return (
    <>
      {user ? (
        showGuide ? (
          <GuideScreen onDone={handleGuideDone} />
        ) : (
          <AppNavigator onLogout={clearUserDataFromStorage} profile={profile} />
        )
      ) : (
        <AuthNavigator />
      )}
      <Toast />
      <MandatoryProfileModal
        visible={isMandatoryProfileModalVisible}
        onClose={handleMandatoryProfileClose}
        onComplete={handleMandatoryProfileComplete}
        userData={profile?.data}
        isMandatory={isMandatory}
        loginAttempts={loginAttempts}
      />
    </>
  );
};

const AppContainer = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </NavigationContainer>
  );
};



export default AppContainer;
