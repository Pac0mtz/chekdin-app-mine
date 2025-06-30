import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Intro from '../ui/screens/Intro';

const Stack = createNativeStackNavigator();
const IntroNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Intro"
        component={Intro}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default IntroNavigator;
