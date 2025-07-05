import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Svg, {
  Path,
  Text as SvgText,
  TextPath,
  Defs,
} from 'react-native-svg';

const QRCodeComponent = ({ onPress }) => {
  return (
    <View style={styles.qrContainer}>
      <View style={styles.qrCircleContainer}>
        {/* Circular text around the QR circle */}
        <Svg
          width={432}
          height={432}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: [{ translateX: -216 }, { translateY: -216 }],
            zIndex: 2,
            pointerEvents: 'none',
          }}>
          <Defs>
            <Path
              id="qrCircleTextPath"
              d="M216,216 m-131,0 a131,131 0 1,1 262,0 a131,131 0 1,1 -262,0"
            />
          </Defs>
          <SvgText
            fill="#02676C"
            fontSize={14}
            fontFamily="Poppins-Regular"
            textAnchor="middle">
            <TextPath
              href="#qrCircleTextPath"
              startOffset="0%"
              textAnchor="middle">
              TAP ON QR CODE TO CHECK IN • TAP ON QR CODE TO CHECK IN •
            </TextPath>
          </SvgText>
        </Svg>

                <TouchableOpacity onPress={onPress} style={styles.qrCircle}>
          {Platform.OS === 'android' ? (
            <Image
              style={{ width: 180, height: 180 }}
              source={require('../../assets/images/homeqr1.gif')}
            />
          ) : (
            <LottieView
              source={require('../../assets/lottie-files/qrhome.json')}
              style={{ width: 180, height: 180 }}
              autoPlay
              loop
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: -30,
  },
  qrCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 432,
    height: 432,
    alignSelf: 'center',
  },
  qrCircle: {
    height: 312,
    width: 312,
    borderRadius: 156,
    backgroundColor: 'rgba(96, 192, 177, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});

export default QRCodeComponent; 