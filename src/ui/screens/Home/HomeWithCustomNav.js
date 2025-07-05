import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import NavigationBar from '../../components/NavigationBar';
import Home from './home';

const HomeWithCustomNav = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Navigation Bar */}
      <NavigationBar
        navigation={navigation}
        title="Chekdin"
        showMenu={true}
        showProfile={true}
        backgroundColor="#E8F0F9"
        textColor="black"
      />
      
      {/* Home Content */}
      <View style={styles.content}>
        <Home navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
  },
  content: {
    flex: 1,
  },
});

export default HomeWithCustomNav; 