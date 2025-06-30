/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import AppWrapper from './AppWrapper';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  let item = {
    id: remoteMessage.data.id,
  };
  navigation.navigate('CouponDetails', { item, isNotification: true });
});

AppRegistry.registerComponent(appName, () => AppWrapper);
