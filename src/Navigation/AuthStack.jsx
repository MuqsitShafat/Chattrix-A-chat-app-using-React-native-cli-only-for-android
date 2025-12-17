import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Introscreen from '../screens/Introscreen';
import Signin from '../screens/Signin';
import Signup from '../screens/Signup';
import Otp_screen from '../screens/Otp_screen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="IntroScreen" component={Introscreen} />
      <Stack.Screen name="Login" component={Signin} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Otp_screen" component={Otp_screen} /> 
    </Stack.Navigator>
  );
};

export default AuthStack;
