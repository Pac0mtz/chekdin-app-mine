import React from 'react';
import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';

const Loader = ({ message = 'Loading...', size = 'large' }) => {
  return (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderContent}>
        <ActivityIndicator size={size} color="#02676C" />
        {message && <Text style={styles.loaderText}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  loaderContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 16,
    color: '#02676C',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Loader;
