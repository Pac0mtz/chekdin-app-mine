import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Swiper from 'react-native-swiper';

// Define your guide slides data
const guideSlides = [
  {
    key: '1',
    title: 'Welcome to ChekdIn!',
    text: 'Discover exclusive offers and rewards from your favorite local merchants.',
    image: require('../../../assets/images/logo.png'),
  },
  {
    key: '2',
    title: 'Find Merchants Near You',
    text: 'Use our map to find participating merchants and see their latest offers.',
    image: require('../../../assets/icons/search.png'),
  },
  {
    key: '3',
    title: 'Scan & Redeem Coupons',
    text: 'Simply scan a QR code at the merchant to check in and redeem your coupons.',
    image: require('../../../assets/images/qr.png'),
  },
];

const GuideScreen = ({onDone}) => {
  return (
    <Swiper style={styles.wrapper} showsButtons={false} loop={false}>
      {guideSlides.map((slide, index) => (
        <View key={slide.key} style={styles.slide}>
          <Image source={slide.image} style={styles.image} />
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.text}>{slide.text}</Text>
          {index === guideSlides.length - 1 && (
            <TouchableOpacity style={styles.doneButton} onPress={onDone}>
              <Text style={styles.doneButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0F9',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#02676C',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  doneButton: {
    marginTop: 40,
    backgroundColor: '#02676C',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GuideScreen;
