import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from '../ui/screens/Splash';

const Stack = createNativeStackNavigator();
const SplashNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default SplashNavigator;
