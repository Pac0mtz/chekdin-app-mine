import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
} from 'react-native';
import Svg, {
  Path,
  Text as SvgText,
  TextPath,
  Defs,
  Circle,
} from 'react-native-svg';
import MerchantIcon from '../../assets/icons/merchant-icon.png';
import CouponsIcon from '../../assets/icons/coupons.png';
import SearchIcon from '../../assets/icons/search.png';

const ActionBar = ({ 
  onBecomeMerchant, 
  onSearch, 
  onCoupons,
  showPulseEffect = true 
}) => {
  return (
    <>
      {/* Arched SVG background behind the action bar */}
      <View style={styles.archedBgContainer} pointerEvents="none">
        <Svg
          width="100%"
          viewBox="0 0 100 110"
          height={110}
          style={{ position: 'absolute', bottom: 0, zIndex: -1 }}
          preserveAspectRatio="none"
        >
          <Path
            d="M0 0H100V110H0z"
            fill="#02676C"
            fillOpacity={0.7}
            stroke="none"
          />
          <Path
            d="M0 0H100V110H0z"
            fill="#02676C"
            fillOpacity={0.6}
            stroke="none"
          />
        </Svg>
      </View>

      {/* Bottom action bar */}
      <View style={styles.bottomActionBar}>
        {/* Merchant Button with circular text (left) */}
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <View
            style={{ alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}
          >
            <Svg width={100} height={100}>
              <Defs>
                <Path
                  id="merchantCircle"
                  d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"
                />
              </Defs>
              <Circle cx={50} cy={50} r={38} fill="none" stroke="#E8F0F9" strokeWidth="20" />
              <Circle cx={50} cy={50} r={28} fill="#60C0B1" />
              <SvgText
                fill="#222"
                fontSize="10"
                fontFamily="Poppins-Regular"
                textAnchor="middle">
                <TextPath
                  href="#merchantCircle"
                  startOffset="25%"
                  textAnchor="middle">
                  BECOME A MERCHANT
                </TextPath>
              </SvgText>
            </Svg>
            <Image
              source={MerchantIcon}
              style={[
                styles.fabIcon,
                { position: 'absolute', left: 36, top: 36 },
              ]}
            />
          </View>
          {onBecomeMerchant && (
            <TouchableOpacity
              style={styles.buttonOverlay}
              onPress={onBecomeMerchant}
              activeOpacity={0.7}
            />
          )}
        </View>

        {/* Search Button with circular text (center, largest, dark green, white icon) */}
        <View
          style={{
            alignItems: 'center',
            marginTop: 60,
            width: 144,
            height: 144,
            justifyContent: 'center',
          }}>
          {/* Pulse Effect */}
          {showPulseEffect && <PulseCircle />}
          <Svg
            width={144}
            height={144}
            style={{ position: 'absolute', left: 0, top: 0 }}>
            <Defs>
              <Path
                id="searchCircle"
                d="M72,72 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0"
              />
            </Defs>
            <Circle cx={72} cy={72} r={53} fill="none" stroke="#E8F0F9" strokeWidth="20" />
            <Circle cx={72} cy={72} r={43} fill="#02676C" />
                          <SvgText
                fill="#222"
                fontSize="10"
                fontFamily="Poppins-Regular"
                textAnchor="middle">
                <TextPath
                  href="#searchCircle"
                  startOffset="25%"
                  textAnchor="middle">
                  AROUND ME
                </TextPath>
              </SvgText>
          </Svg>
          <Image
            source={SearchIcon}
            style={[
              styles.fabIcon,
              styles.searchIconBig,
              {
                position: 'absolute',
                left: 50,
                top: 50,
                tintColor: '#fff',
                width: 44,
                height: 44,
              },
            ]}
          />
          {onSearch && (
            <TouchableOpacity
              style={styles.searchButtonOverlay}
              onPress={onSearch}
              activeOpacity={0.7}
              pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
            />
          )}
        </View>

        {/* Coupon Button with circular text (right) */}
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <View
            style={{ alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}
          >
            <Svg width={100} height={100}>
              <Defs>
                <Path
                  id="couponCircle"
                  d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"
                />
              </Defs>
              <Circle cx={50} cy={50} r={38} fill="none" stroke="#E8F0F9" strokeWidth="20" />
              <Circle cx={50} cy={50} r={28} fill="#60C0B1" />
              <SvgText
                fill="#222"
                fontSize="10"
                fontFamily="Poppins-Regular"
                textAnchor="middle">
                <TextPath
                  href="#couponCircle"
                  startOffset="25%"
                  textAnchor="middle">
                  MY COUPONS
                </TextPath>
              </SvgText>
            </Svg>
            <Image
              source={CouponsIcon}
              style={[
                styles.fabIcon,
                { position: 'absolute', left: 36, top: 36 },
              ]}
            />
          </View>
          {onCoupons && (
            <TouchableOpacity
              style={styles.buttonOverlay}
              onPress={onCoupons}
              activeOpacity={0.7}
            />
          )}
        </View>
      </View>
    </>
  );
};

const PulseCircle = () => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse1 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale1, {
              toValue: 1.8,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scale1, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity1, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity1, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    const pulse2 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale2, {
              toValue: 2.2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scale2, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity2, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity2, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    pulse1();
    pulse2();
  }, [scale1, opacity1, scale2, opacity2]);

  return (
    <>
      <Animated.View
        style={{
          position: 'absolute',
          left: 22,
          top: 22,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#02676C',
          opacity: opacity1,
          transform: [{ scale: scale1 }],
          zIndex: 0,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          left: 22,
          top: 22,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#60C0B1',
          opacity: opacity2,
          transform: [{ scale: scale2 }],
          zIndex: 0,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  archedBgContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 'auto',
    height: 110,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActionBar: {
    position: 'absolute',
    left: 20, // Match NavigationBar and mainContainer padding
    right: 20, // Match NavigationBar and mainContainer padding
    bottom: 30, // Reduced from 40 to 30 to add 10px padding
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
    paddingBottom: 10, // Added 10px padding to the bottom
  },
  fabIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  searchIconBig: {
    width: 44,
    height: 44,
  },
  buttonOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  searchButtonOverlay: {
    position: 'absolute',
    left: 22,
    top: 22,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default ActionBar; 