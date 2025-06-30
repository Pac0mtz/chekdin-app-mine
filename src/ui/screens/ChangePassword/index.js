import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Text, View} from 'react-native';
import {LoginService} from '../../../services/authService';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
import TextInputField from '../../modules/TextInput';
import {useDispatch, useSelector} from 'react-redux';
import {
  changePassword,
  clearChangePasswordStatus,
} from '../../../slices/authSlice'; // import clearChangePasswordStatus action
import Toast from 'react-native-toast-message';
import {err} from 'react-native-svg/lib/typescript/xml';

const ChangePassword = ({navigation}) => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const isLoginDisabled = !code || !email || !password || !!passwordError;
  const status = useSelector(state => state.auth.changePasswordStatus); // Changed to status from Status
  const error = useSelector(state => state.auth.error); // Changed to error from Error
  console.log('Err', error);
  const loading = useSelector(state => state.auth.status === 'loading');

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    const data = {email: email, reset_password_code: code, password: password};
    console.warn('data', data);
    dispatch(changePassword(data));
  };

  useEffect(() => {
    if (status === 'succeeded') {
      Toast.show({
        type: 'success',
        text1: 'Password Reset Successfully!',
      });
      navigation.navigate('Login');
    } else if (status === 'failed') {
      Toast.show({
        type: 'error',
        text1: error,
      });
    }
    // Clear status and error after displaying Toast
    dispatch(clearChangePasswordStatus());
  }, [status, error]);

  const validatePassword = input => {
    // Regular expression for password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(input);
  };

  const handlePasswordChange = text => {
    setPassword(text);
    if (text) {
      if (!validatePassword(text)) {
        setPasswordError(
          'Invalid password. Passwords must contain at least 1 capital letter, 1 small letter, 1 digit, 1 special character, and be at least 8 characters long.',
        );
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.patternContainer}>
        <Pattern navigation={navigation} isGoBack={true} />
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>
      <View style={styles.screenHeadingContainer}>
        <Text style={styles.screenHeading}>Change Password</Text>
      </View>
      <View style={styles.contentContainer}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={'#000'}
          placeholder="Reset Password Code"
          onChangeText={text => setCode(text)}
        />
        <TextInput
          style={styles.textInput}
          placeholderTextColor={'#000'}
          placeholder="Email"
          onChangeText={text => setEmail(text)}
        />
        <TextInputField
          placeholder="New Password"
          onChangeText={handlePasswordChange}
          type="password"
          value={password}
          secureTextEntry={true}
          error={passwordError}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.7}
          isDisabled={isLoginDisabled}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    height: 48,
    borderRadius: 28,
    color: 'black',
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

export default ChangePassword;
