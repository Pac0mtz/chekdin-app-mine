import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../ui/screens/Login';
import Signup from '../ui/screens/Signup';
import Intro from '../ui/screens/Intro';
import ForgotPassword from '../ui/screens/ForgotPassword';
import PhoneVerification from '../ui/screens/PhoneVerification';
import Verification from '../ui/screens/Verification';
import ChangePassword from '../ui/screens/ChangePassword';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrivacyPolicy from '../ui/screens/PrivacyPolicy';
import TermsAndCondition from '../ui/screens/TermsAndConditions';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(true);
  const isFirstTime = async () => {
    const value = await AsyncStorage.getItem('isFirstTime');
    return value === null;
  };

  // useEffect(() => {
  //   const checkFirstTime = async () => {
  //     const isFirstTimeValue = await isFirstTime();
  //     console.log('isFirstTimeUser:', isFirstTimeValue); // Add this li
  //     setIsFirstTimeUser(isFirstTimeValue);
  //   };
  //   checkFirstTime();
  // }, []);

  const checkFirstLaunch = async () => {
    const __first_launch = await AsyncStorage.getItem('FIRST_LAUNCH');
    if (!__first_launch) {//This means that no key found with name 'FIRST_LAUNCH' which indicates that the app is launched for the first time
      AsyncStorage.setItem('FIRST_LAUNCH', "Done");//Instead of false try setting value to something like "Done"
      setFirstLaunch(true);//This line is unneccesary as you are setting the default value to true
    } else {//This means that that app is not launched for the first time so we can set setFirstLaunch to false
      setFirstLaunch(false);
    }
  }

  useEffect(() => {
    checkFirstLaunch();

  }, [])

  return (
    <Stack.Navigator initialRouteName='Intro'>
      {
        firstLaunch === true &&
        <Stack.Screen
          name="Intro"
          component={Intro}
          options={{ headerShown: false }}
        />
      }


      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
      <Stack.Screen name="PhoneVerification" component={PhoneVerification} options={{ headerShown: false }} />
      <Stack.Screen name="Verification" component={Verification} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicyCheck" component={PrivacyPolicy}
        options={{
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: "Privacy Policy",
        }} />
      <Stack.Screen name="TermsAndConditionCheck" component={TermsAndCondition}
        options={{
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: "Terms And Conditions",
        }} />
    </Stack.Navigator>
  );
};



export default AuthNavigator;
