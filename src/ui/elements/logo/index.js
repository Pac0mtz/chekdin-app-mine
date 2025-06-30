import React from 'react';
import {Image, View} from 'react-native';
import LogoImage from '../../../assets/images/logo.png';

const Logo = () => {
  return (
    <View
      style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Image source={LogoImage} />
    </View>
  );
};

export default Logo;
