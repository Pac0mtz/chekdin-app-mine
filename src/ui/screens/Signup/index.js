import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {signUp} from '../../../slices/authSlice';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
import {useDispatch, useSelector} from 'react-redux';
import TextInputField from '../../modules/TextInput';
import Button from '../../modules/Button';
import Toast from 'react-native-toast-message';
import CheckBox from '@react-native-community/checkbox';
let ismounted = false;
const Signup = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.status === 'loading');
  const isSignupDisabled =
    !name || !email || !password || password !== confirmPassword;
  const status = useSelector(state => state.auth.status);
  const signupStatus = useSelector(state => state.auth.signupStatus);
  const Err = useSelector(state => state.auth.error);

  const handleSubmit = async () => {
    if (name && email && password && password === confirmPassword) {
      await dispatch(signUp({name, email, password}));
    }
    ismounted = true;
  };

  const validateEmail = input => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const validatePassword = input => {
    // Regular expression for password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(input);
  };

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

  useEffect(() => {
    console.log('isMo', ismounted);
    if (signupStatus === 'succeeded' && ismounted) {
      navigation.navigate('Verification', {email});
      Toast.show({
        type: 'success',
        text1: 'Verification email sent!',
      });
      ismounted = false;
    } else if (signupStatus === 'failed' && ismounted && Err) {
      Toast.show({
        type: 'error',
        text1: Err,
      });
      ismounted = false;
    }
  }, [signupStatus, Err, ismounted]);

  const handleConfirmPasswordChange = text => {
    setConfirmPassword(text);
    if (password !== text) {
      setConfirmPasswordError('Password do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.patternContainer}>
          <Pattern navigation={navigation} isGoBack={true} />
          <View style={styles.logoContainer}>
            <Logo />
          </View>
        </View>
        <View style={styles.screenHeadingContainer}>
          <Text style={styles.screenHeading}>SignUp</Text>
        </View>
        <View style={styles.contentContainer}>
          <TextInputField
            placeholder="Name"
            onChangeText={text => setName(text)}
            type="default"
            value={name}
          />
          <TextInputField
            placeholder="Email"
            onChangeText={handleEmailChange}
            type="email"
            error={emailError}
            value={email}
          />
          <TextInputField
            placeholder="Password"
            onChangeText={handlePasswordChange}
            type="password"
            secureTextEntry={true}
            error={passwordError}
            value={password}
          />
          <TextInputField
            placeholder="Confirm Password"
            onChangeText={handleConfirmPasswordChange}
            type="password"
            secureTextEntry={true}
            error={confirmPasswordError}
            value={confirmPassword}
          />
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={toggleCheckBox}
              onValueChange={newValue => setToggleCheckBox(newValue)}
              tintColors={{true: '#02676C', false: 'gray'}}
            />
            <View style={styles.TextContainer}>
              <Text style={styles.checkboxLabel}>I agree to the and</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('TermsAndConditionCheck')}>
                <Text style={{color: '#02676C'}}> Terms and Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}> and </Text>
              <TouchableOpacity>
                <Text
                  style={{color: '#02676C'}}
                  onPress={() => navigation.navigate('PrivacyPolicyCheck')}>
                  {' '}
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {loading ? (
            <Button title={<ActivityIndicator size="small" color="#ffff" />} />
          ) : (
            <Button
              title={'Signup'}
              onPress={handleSubmit}
              isDisabled={isSignupDisabled || !toggleCheckBox}
            />
          )}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
    gap: 8,
    marginLeft: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'gray',
  },
  TextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});

export default Signup;
