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
import {emailVerify, pushNoti} from '../../../slices/authSlice';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import Button from '../../modules/Button';

const Verification = ({route, navigation}) => {
  const [otp, setOtp] = useState('');
  const loading = useSelector(state => state.auth.verifyStatus === 'loading');
  const verifyStatus = useSelector(state => state.auth.verifyStatus);
  const verifyError = useSelector(state => state.auth.error);
  const email = route.params?.email;

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (email && otp) {
      const verifiy = await dispatch(emailVerify({email, otp}));
      console.log('verifiy', verifiy);
      if (verifiy?.payload?.data) {
        Toast.show({
          type: 'success',
          text1: 'OTP verified Successfully',
        });
      }
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
        <Text style={styles.screenHeading}>OTP Verification</Text>
      </View>
      <View style={styles.contentContainer}>
        <OTPTextInput
          containerStyle={styles.otpContainer}
          textInputStyle={styles.otpInput}
          handleTextChange={text => setOtp(text)}
          inputCount={4}
          keyboardType="numeric"
        />
        {loading ? (
          <Button title={<ActivityIndicator size="small" color="#ffff" />} />
        ) : (
          <Button title={'Continue'} onPress={handleSubmit} isDisabled={!otp} />
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
});

export default Verification;
