import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Text, View} from 'react-native';
import {LoginService} from '../../../services/authService';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
import {useDispatch, useSelector} from 'react-redux';
import {forgotPassword} from '../../../slices/authSlice';
import Toast from 'react-native-toast-message';
import TextInputField from '../../modules/TextInput';
import messaging from '@react-native-firebase/messaging';

let isMounted = false;

const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const forgotStatus = useSelector(state => state.auth.forgotStatus);
  const Error = useSelector(state => state.auth.error);
  const loading = useSelector(state => state.auth.status === 'loading');
  const [emailError, setEmailError] = useState('');
  const [token, setToken] = useState('');

  const dispatch = useDispatch();
  useEffect(() => {
    // Register for remote messages when the component mounts
    registerForRemoteMessages();
  }, []);

  async function requestUserPermission() {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.warn('token for  forgot fcm', token);
    setToken(token);
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
  const handleSubmit = async () => {
    if (email) {
      dispatch(forgotPassword({email, token}));
    }
    isMounted = true;
    console.log('isMounted -->', isMounted);
  };

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

  useEffect(() => {
    console.log('isMounted', isMounted);
    if (forgotStatus === 'succeeded' && isMounted) {
      Toast.show({
        type: 'success',
        text1: 'Please check your email!',
      });
      isMounted = false;

      navigation.navigate('ChangePassword');
    } else if (forgotStatus === 'failed' && isMounted) {
      Toast.show({
        type: 'error',
        text1: Error,
      });
      isMounted = false;
    }
  }, [forgotStatus, Error]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.patternContainer}>
        <Pattern navigation={navigation} isGoBack={true} />
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>
      <View style={styles.screenHeadingContainer}>
        <Text style={styles.screenHeading}>Forgot Password ?</Text>
      </View>
      <View style={styles.contentContainer}>
        <TextInputField
          placeholder="Email"
          onChangeText={handleEmailChange}
          type="email"
          value={email}
          error={emailError}
        />
        {loading ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.7}>
            <Text style={styles.buttonText}>
              <ActivityIndicator size="small" color="#ffff" />
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={!email}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  textInput: {
    marginTop: 10,
    backgroundColor: '#fff',
    width: '100%',
    color: 'black',
    height: 48,
    borderRadius: 28,
    shadowColor: '#000040',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#02676C',
    color: '#fff',
    shadowColor: '#00000012',
    shadowOpacity: 0.27,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ForgotPassword;
