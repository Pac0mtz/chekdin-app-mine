import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import SocialFacebook from '../../../assets/images/social-facebook.png';
import SocialApple from '../../../assets/images/social-apple.png';
import SocialGoogle from '../../../assets/images/social-google.png';

const SocialButton = ({title, onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={
          title == 'facebook'
            ? SocialFacebook
            : title == 'google'
            ? SocialGoogle
            : SocialApple
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    flexShrink: 0,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#00010c40',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SocialButton;
