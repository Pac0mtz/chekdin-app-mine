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
import {signUp, resetAuthState} from '../../../slices/authSlice';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
import {useDispatch, useSelector} from 'react-redux';
import TextInputField from '../../modules/TextInput';
import Button from '../../modules/Button';
import Toast from 'react-native-toast-message';
import CheckBox from '@react-native-community/checkbox';

const Signup = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const dispatch = useDispatch();
  const loading = useSelector(state => state.auth.status === 'loading');
  const isSignupDisabled =
    !name || !email || !phone || !password || password !== confirmPassword || !!phoneError;
  const status = useSelector(state => state.auth.status);
  const signupStatus = useSelector(state => state.auth.signupStatus);
  const Err = useSelector(state => state.auth.error);

  const handleSubmit = async () => {
    if (name && email && phone && password && password === confirmPassword && !phoneError) {
      console.log('Starting signup process for:', email);
      console.log('Signup data:', {name, email, phone, password});
      try {
        const result = await dispatch(signUp({name, email, phone_number: phone, password}));
        console.log('Signup dispatch result:', result);
      } catch (error) {
        console.error('Signup error:', error);
      }
    } else {
      console.log('Signup validation failed:', {
        hasName: !!name,
        hasEmail: !!email,
        hasPhone: !!phone,
        hasPassword: !!password,
        passwordsMatch: password === confirmPassword,
        phoneError: !!phoneError
      });
    }
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

  const handlePhoneChange = text => {
    setPhone(text);
    // Simple phone validation (10+ digits)
    if (!/^\d{10,}$/.test(text)) {
      setPhoneError('Enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  useEffect(() => {
    console.log('Signup status changed:', signupStatus, 'Error:', Err);
    if (signupStatus === 'succeeded') {
      navigation.navigate('Verification', {email});
      Toast.show({
        type: 'success',
        text1: 'Verification email sent!',
        text2: 'Please check your email for the verification code.',
      });
    } else if (signupStatus === 'failed' && Err) {
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: Err,
      });
    }
  }, [signupStatus, Err, navigation, email]);

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
            placeholder="Phone Number"
            onChangeText={handlePhoneChange}
            type="phone"
            value={phone}
            error={phoneError}
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
  button: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#02676C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Signup;
