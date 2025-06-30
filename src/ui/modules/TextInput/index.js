import React, {useState} from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Eye from '../../../assets/icons/eye.png';
import EyeSlash from '../../../assets/icons/eye-slash.png';

const TextInputField = ({
  placeholder,
  onChangeText,
  type,
  error,
  value,
  custom,
  keyboardType,
  max,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false); // State to track password visibility

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textInput,
          error && styles.errorInput,
          custom && styles.custom,
        ]}
        placeholderTextColor="#000"
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={!isPasswordVisible && type === 'password'} // Toggle secureTextEntry
        maxLength={max}
        keyboardType={
          type === 'email'
            ? 'email-address'
            : keyboardType
            ? keyboardType
            : 'default'
        }
      />
      {/* Toggle password visibility */}
      {type === 'password' && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!isPasswordVisible)}>
          {/* <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={20} color="black" /> */}
          <Image source={isPasswordVisible ? EyeSlash : Eye} />
        </TouchableOpacity>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textInput: {
    marginTop: 10,
    backgroundColor: '#fff',
    height: 48,
    color: 'black',
    borderRadius: 28,
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
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  custom: {
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: '#E8F0F9',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  eyeIcon: {
    position: 'absolute',
    top: 22,
    right: 12,
  },
});

export default TextInputField;
