import React from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import {WebView} from 'react-native-webview';

const PrivacyPolicy = () => {
  return (
    <View style={styles.container}>
      <WebView // Use WebView instead of ScrollView
        source={{uri: 'https://chekdin.com/privacy-policy'}} // Replace with your privacy policy URL
      />
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

export default PrivacyPolicy;
