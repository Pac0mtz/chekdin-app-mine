import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const SCREEN_WIDTH = Dimensions.get('window').width;

const guideSlides = [
  {
    key: '1',
    emoji: '📲',
    stepTitle: 'Download app',
    description: 'Download the Chekdin app from the App Store or Android store',
    checklist: [
      '✅ Create account',
      '✅ Add your profile',
      '✅ Accept notifications',
    ],
    icon: <FontAwesome5 name="download" size={80} color="#02676C" />,
  },
  {
    key: '2',
    emoji: '📍',
    stepTitle: 'Check in',
    description: 'Open the app and locate the Chekdin merchant QR code to get started',
    checklist: [
      '✅ Scan QR code using app',
      '✅ Take selfie or upload pic',
      '✅ Make a comment',
    ],
    icon: <FontAwesome5 name="qrcode" size={80} color="#02676C" />,
  },
  {
    key: '3',
    emoji: '📢',
    stepTitle: 'Post on social media',
    description: 'Message is copied—don\'t forget to paste it when posting to your social media of choice',
    checklist: [
      '✅ Choose social media',
      '✅ Paste comment',
      '✅ Post and confirm',
    ],
    icon: <FontAwesome5 name="share-alt" size={80} color="#02676C" />,
  },
  {
    key: '4',
    emoji: '🎁',
    stepTitle: 'Earn instant rewards',
    description: 'Once your post is confirmed, you\'ll receive your coupon in your Chekdin wallet',
    checklist: [
      '✅ Claim coupon',
      '✅ Coupon will post to your Chekdin wallet',
    ],
    icon: <FontAwesome5 name="gift" size={80} color="#02676C" />,
  },
];

const GuideScreen = ({ onDone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scaleAnim.setValue(0.7);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < guideSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const slide = guideSlides[currentIndex];
  const progressPercent = ((currentIndex + 1) / guideSlides.length) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.footer}>🙌 Earn instant rewards when you help support local businesses!</Text>
      <View style={styles.progressBarSpacer} />
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{`Step ${currentIndex + 1} of ${guideSlides.length}`}</Text>
      <View style={styles.card}>
        <Animated.View style={[styles.emoji, { transform: [{ scale: scaleAnim }] }] }>
          <Text style={styles.emojiText}>{slide.emoji}</Text>
        </Animated.View>
        <Text style={styles.stepTitle}>{slide.stepTitle}</Text>
        <Text style={styles.description}>{slide.description}</Text>
        <View style={styles.checklist}>
          {slide.checklist.map((item, idx) => (
            <View key={idx} style={styles.checkItem}>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.buttonRow}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrev}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {currentIndex < guideSlides.length - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.doneButton} onPress={onDone}>
            <Text style={styles.doneButtonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0F9',
    padding: 20,
  },
  footer: {
    fontSize: 20,
    color: '#02676C',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressBarSpacer: {
    height: 20,
  },
  progressBarContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: 10,
    backgroundColor: '#B0BEC5',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#02676C',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 15,
    color: '#02676C',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 18,
  },
  emoji: {
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 56,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#02676C',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  checklist: {
    width: '100%',
    marginBottom: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkText: {
    fontSize: 16,
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  navButton: {
    backgroundColor: '#B0BEC5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  navButtonText: {
    color: '#02676C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#02676C',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GuideScreen;
