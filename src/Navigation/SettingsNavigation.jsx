// src/Navigation/SettingsNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Settings_screen from '../screens/Settings_screen';
import Profile_screen from '../screens/Profile';
import EditProfile from '../screens/EditProfile';
import ChangePassword_screen from '../screens/ChangePasswordScreen';
import PrivacySettings_screen from '../screens/PrivacySettings';
import Language_screen from '../screens/Language';
import About from '../screens/About';

const Stack = createNativeStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={Settings_screen} />
      <Stack.Screen name="Profile" component={Profile_screen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePassword" component={ChangePassword_screen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettings_screen} />
      <Stack.Screen name="Language" component={Language_screen} />
      <Stack.Screen name="About" component={About} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
