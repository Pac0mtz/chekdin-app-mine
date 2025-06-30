import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../ui/screens/Login';
import Signup from '../ui/screens/Signup';
import ForgotPassword from '../ui/screens/ForgotPassword';
import PhoneVerification from '../ui/screens/PhoneVerification';
import Verification from '../ui/screens/Verification';
import ChangePassword from '../ui/screens/ChangePassword';
import PrivacyPolicy from '../ui/screens/PrivacyPolicy';
import TermsAndCondition from '../ui/screens/TermsAndConditions';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PhoneVerification"
        component={PhoneVerification}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Verification"
        component={Verification}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PrivacyPolicyCheck"
        component={PrivacyPolicy}
        options={{
          headerStyle: {backgroundColor: '#E8F0F9'},
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: 'Privacy Policy',
        }}
      />
      <Stack.Screen
        name="TermsAndConditionCheck"
        component={TermsAndCondition}
        options={{
          headerStyle: {backgroundColor: '#E8F0F9'},
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: 'Terms And Conditions',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
