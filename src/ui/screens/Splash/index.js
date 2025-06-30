import React from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import SplashImage from '../../../assets/splash/2.png';
import SplashbottomImage from '../../../assets/splash/1.png';
import LottieView from 'lottie-react-native';
import splashanimation from '../../../assets/lottie-files/splashscreen.json';

const height = Dimensions.get('screen').height;
const Splash = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar  backgroundColor={'transparent'} barStyle={'light-content'} /> */}

      {/* <Image source={SplashImage}  style={{height:400,width:'100%'}}  /> */}

      <LottieView
        source={splashanimation}
        loop
        autoPlay
        style={{height: 350, width: 350}}
      />

      {/* <Image source={SplashbottomImage} resizeMode='cover'  style={{height:height /2,width:'100%'}}  /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height:'100%',
    // width:'100%',
    backgroundColor: '#FDFEFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTop: {
    width: 400,
    // position:'absolute',
    // top:-339,
    // height:400
    // width:'100%'
  },
  botomImage: {
    // width:400,
    // position:'absolute',
    // top:110
  },
});

export default Splash;
