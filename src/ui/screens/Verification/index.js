import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
import Pattern from '../../elements/pattern';
import Logo from '../../elements/logo';
import {verifyEmail} from '../../../services/authService'; // Import the verifyEmail service
import {emailVerify, resendOTPThunk, pushNoti} from '../../../slices/authSlice';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import Button from '../../modules/Button';
import Loader from '../../elements/Loader';

const Verification = ({route, navigation}) => {
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const loading = useSelector(state => state.auth.verifyStatus === 'loading');
  const resendLoading = useSelector(state => state.auth.resendOTPStatus === 'loading');
  const verifyStatus = useSelector(state => state.auth.verifyStatus);
  const resendOTPStatus = useSelector(state => state.auth.resendOTPStatus);
  const verifyError = useSelector(state => state.auth.error);
  const email = route.params?.email;

  const dispatch = useDispatch();

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCountdown]);

  const handleResendOTP = async () => {
    if (email && resendCountdown === 0) {
      try {
        await dispatch(resendOTPThunk(email));
        setResendCountdown(60); // Start 60 second countdown
      } catch (error) {
        console.error('Resend OTP error:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (email && otp) {
      console.log('Submitting verification with:', {email, otp});
      try {
        const verifiy = await dispatch(emailVerify({email, otp}));
        console.log('Verification result:', verifiy);
        if (verifiy?.payload?.data) {
          Toast.show({
            type: 'success',
            text1: 'OTP verified Successfully',
            text2: 'Your account has been verified!',
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: error.message || 'Please try again with the correct code.',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter the verification code.',
      });
    }
  };

  useEffect(() => {
    console.log('Verification status changed:', verifyStatus, 'Error:', verifyError);
    if (verifyStatus === 'succeeded') {
      Toast.show({
        type: 'success',
        text1: 'Email Verified Successfully!',
        text2: 'You can now use your account.',
      });
    } else if (verifyStatus === 'failed' && verifyError) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: verifyError,
      });
    }
  }, [verifyStatus, verifyError]);

  // Monitor resend OTP status
  useEffect(() => {
    if (resendOTPStatus === 'succeeded') {
      Toast.show({
        type: 'success',
        text1: 'OTP Resent Successfully!',
        text2: 'Please check your email for the new verification code.',
      });
    } else if (resendOTPStatus === 'failed') {
      Toast.show({
        type: 'error',
        text1: 'Failed to Resend OTP',
        text2: 'Please try again later.',
      });
    }
  }, [resendOTPStatus]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && <Loader message="Verifying OTP..." />}
      <View style={styles.patternContainer}>
        <Pattern navigation={navigation} isGoBack={true} />
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>
      <View style={styles.screenHeadingContainer}>
        <Text style={styles.screenHeading}>OTP Verification</Text>
        <Text style={styles.screenSubheading}>
          Enter the 4-digit code sent to {email}
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <OTPTextInput
          containerStyle={styles.otpContainer}
          textInputStyle={styles.otpInput}
          handleTextChange={text => setOtp(text)}
          inputCount={4}
          keyboardType="numeric"
          autoFocus={true}
        />
        <Button title={'Continue'} onPress={handleSubmit} isDisabled={!otp || otp.length !== 4} />
        
        <TouchableOpacity 
          style={[styles.resendContainer, resendCountdown > 0 && styles.resendDisabled]}
          onPress={handleResendOTP}
          disabled={resendCountdown > 0 || resendLoading}
        >
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {resendCountdown > 0 ? (
            <Text style={styles.resendCountdown}>Resend in {resendCountdown}s</Text>
          ) : resendLoading ? (
            <Text style={styles.resendLoading}>Sending...</Text>
          ) : (
            <Text style={styles.resendLink}>Resend</Text>
          )}
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
  screenSubheading: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  otpInput: {
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    fontSize: 18,
    borderColor: '#D7D7D7',
    borderWidth: 1,
    marginRight: 10,
    textAlign: 'center',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#02676C',
    fontSize: 14,
    fontWeight: '600',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendCountdown: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  resendLoading: {
    color: '#02676C',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Verification;
