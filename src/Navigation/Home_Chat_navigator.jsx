import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main_screen from '../screens/Main_screen';
import Chat_display_screen from '../screens/Chat_display_screen';
const Stack = createNativeStackNavigator();
const Home_Chat_navigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
      }}  
    >
      <Stack.Screen name="Home" component={Main_screen} />
      <Stack.Screen name="Chat" component={Chat_display_screen} />
    </Stack.Navigator>
  )
}

export default Home_Chat_navigator