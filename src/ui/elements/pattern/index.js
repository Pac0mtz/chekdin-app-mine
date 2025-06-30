import React from 'react';
import {Image, View} from 'react-native';
import PatternImage from '../../../assets/pattern/pattern.png';
import Header from '../../modules/Header';

const Pattern = ({navigation, isGoBack, isSetting}) => {
  return (
    <View style={{width: '100%', height: 300}}>
      {isGoBack ? (
        <Header navigation={navigation} isSetting={isSetting} />
      ) : (
        <></>
      )}
      <View style={{width: '100%'}}>
        <Image source={PatternImage} style={{width: '100%', height: 230}} />
      </View>
    </View>
  );
};

export default Pattern;
