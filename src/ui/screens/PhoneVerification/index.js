import React, {useState} from 'react';
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

const PhoneVerification = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    navigation.navigate('Verification');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.patternContainer}>
        <Pattern navigation={navigation} />
        <View style={styles.logoContainer}>
          <Logo />
        </View>
      </View>
      <View style={styles.screenHeadingContainer}>
        <Text style={styles.screenHeading}>Phone Verification</Text>
      </View>
      <View style={styles.contentContainer}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={'#000'}
          placeholder="Phone"
          onChangeText={text => setEmail(text)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.7}>
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
    shadowColor: '#000040',
    color: 'black',
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

export default PhoneVerification;
