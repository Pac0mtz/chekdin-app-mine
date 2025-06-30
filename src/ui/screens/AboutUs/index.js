import React from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';

const AboutUs = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.text}>
          CHEKDIN an innovative app poised to revolutionize the way consumers
          and merchants connect in the digital age. With Chekdin, we aim to
          bridge the gap between customers and businesses by harnessing the
          power of digital word-of-mouth.
        </Text>
        <Text style={styles.text}>
          Our app empowers customers to effortlessly share their experiences at
          various establishments through social media check-ins. In return for
          their valuable recommendations, we reward users with exciting
          discounts, coupons, and exclusive offers. By leveraging the influence
          of social media, we strive to create a vibrant community where both
          consumers and merchants thrive.
        </Text>
        <Text style={styles.text}>
          Through Chekdin, we aim to empower consumers to discover new
          businesses, support local merchants, and enjoy fantastic deals.
          Simultaneously, we assist merchants in reaching a wider audience and
          fostering customer loyalty through positive online engagement. It's a
          win-win situation for everyone involved!
        </Text>
        <Text style={styles.text}>
          We are incredibly excited about the future of Chekdin and the endless
          possibilities it holds. Together, let's redefine the way businesses
          and customers connect, and unlock a world of convenience, rewards, and
          memorable experiences. Join us on this exciting journey!"
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
  },
  scrollViewContainer: {
    padding: 20,
  },
  text: {
    fontSize: 12,
    color: 'black',
    fontWeight: '300',
    lineHeight: 30,
    marginBottom: 20,
  },
});

export default AboutUs;
