import React, {useEffect, useState} from 'react';
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
} from './src/slices/authSlice';
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

LogBox.ignoreAllLogs();

navigator.geolocation = require('react-native-geolocation-service');

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(true);
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);

  const user = useSelector(state => state.auth.user);
  const loginStatus = useSelector(state => state.auth.loginStatus);
  const loginError = useSelector(state => state.auth.error);
  const deleteAccountStatus = useSelector(
    state => state.auth.deleteAccountStatus,
  );
  const verifyStatus = useSelector(state => state.auth.verifyStatus);
  const profile = useSelector(state => state.auth.profile);

  const verifyError = useSelector(state => state.auth.error);

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

        // Start session refresh
        SessionManager.startSessionRefresh();
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

  useEffect(() => {
    const checkGuideStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenGuide');
        console.log('Guide status from AsyncStorage:', value);
        if (value !== null) {
          setHasSeenGuide(true);
        } else {
          console.log('No guide status found, will show guide for new user');
        }
      } catch (error) {
        console.error('Error reading from AsyncStorage', error);
      } finally {
        setIsGuideLoading(false);
      }
    };
    checkGuideStatus();
  }, []);

  const handleGuideDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenGuide', 'true');
      console.log('Guide marked as seen');
      setHasSeenGuide(true);
    } catch (error) {
      console.error('Error saving to AsyncStorage', error);
    }
  };

  // Function to reset guide status for testing (you can call this from console)
  const resetGuideStatus = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenGuide');
      console.log('Guide status reset - will show guide again');
      setHasSeenGuide(false);
    } catch (error) {
      console.error('Error resetting guide status', error);
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

  const saveUserDataToStorage = async userData => {
    try {
      const jsonUserData = JSON.stringify(userData);
      await AsyncStorage.setItem('userData', jsonUserData);
      // Also save to session manager
      await SessionManager.saveSession(userData);
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
    }
  };

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

  useEffect(() => {
    if (user) {
      saveUserDataToStorage(user);
    }
  }, [user]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonUserData = await AsyncStorage.getItem('userData');
        if (jsonUserData) {
          const userData = JSON.parse(jsonUserData);
          dispatch(saveUser(userData));
        }
      } catch (error) {
        console.error('Error loading user data from AsyncStorage:', error);
      }
    };
    fetchData();
  }, []);

  if (showSplash || !isSessionInitialized) {
    return <SplashNavigator />;
  }

  console.log('App render - user:', !!user, 'hasSeenGuide:', hasSeenGuide, 'isGuideLoading:', isGuideLoading);

  return (
    <>
      {user ? (
        hasSeenGuide ? (
          <AppNavigator onLogout={clearUserDataFromStorage} profile={profile} />
        ) : (
          <GuideScreen onDone={handleGuideDone} />
        )
      ) : (
        <AuthNavigator />
      )}
      <Toast />
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
