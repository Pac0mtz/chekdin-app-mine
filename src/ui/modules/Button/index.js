import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const Button = ({onPress, isDisabled, title, isDelete}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.disabledButton,
        isDelete && styles.isDelete,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  isDelete: {
    backgroundColor: 'red',
  },
});

export default Button;
