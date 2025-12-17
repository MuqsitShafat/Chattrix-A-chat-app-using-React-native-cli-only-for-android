import './src/i18n/i18n';
import React, {useEffect, useContext} from 'react';
import BootSplash from 'react-native-bootsplash';

// ✅ Explicitly run Google Config so it can't be tree-shaken
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import {Image} from 'react-native';

// Screens & Navigators
import Call_screen from './src/screens/Call_screen';
import Home_Chat_navigator from './src/Navigation/Home_Chat_navigator';
import SettingsNavigator from './src/Navigation/SettingsNavigation';
import Custom_Drawer from './src/Navigation/Custom_Drawer';
import AuthStack from './src/Navigation/AuthStack';

// Auth Context
import {AuthProvider, AuthContext} from './src/Auth/AuthContext';
import Otp_screen from './src/screens/Otp_screen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        if (route.name === 'Call') {
          iconName = focused ? 'call' : 'call-outline';
        } else if (route.name === 'Home_Chat_navigator') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4175DF',
      tabBarInactiveTintColor: 'black',
      tabBarStyle: {
        height: 60,
        borderRadius: 30,
        marginHorizontal: 20,
        marginBottom: 18,
        position: 'absolute',
        backgroundColor: '#D9D9D9',
        elevation: 5,
      },
      tabBarItemStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
      },
      headerShown: false,
      tabBarShowLabel: false,
    })}
    initialRouteName="Home_Chat_navigator">
    <Tab.Screen name="Call" component={Call_screen} />
    <Tab.Screen
      name="Home_Chat_navigator"
      component={Home_Chat_navigator}
      options={({route}) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
        if (routeName === 'Chat') {
          return {tabBarStyle: {display: 'none'}};
        }
        else if (routeName === 'Add_Contact') {
          return {tabBarStyle: {display: 'none'}};
        }
        return {};
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsNavigator}
      options={({route}) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Settings';
        if (
          routeName === 'Profile' ||
          routeName === 'EditProfile' ||
          routeName === 'ChangePassword' ||
          routeName === 'PrivacySettings' ||
          routeName === 'Language'
        ) {
          return {tabBarStyle: {display: 'none'}};
        }
        return {};
      }}
    />
  </Tab.Navigator>
);

const AppContent = () => {
  const {user, loading} = useContext(AuthContext);

  // Configure Google Sign-In when app starts
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '752916193237-13c4bjjoiqhapapren23qh8fkhg45mns.apps.googleusercontent.com',
      offlineAccess: true, 
    });
    console.log('✅ Google Sign-In initialized');
  }, []);

  // Hide BootSplash
  useEffect(() => {
    const init = async () => {
      // You can do any async pre-loading here if needed
    };
    init().finally(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash hidden');
    });
  }, []);

  if (loading) {
    return null; // or a custom Splash Screen
  }

  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              width: '78%',
              backgroundColor: '#D9D9D9',
            },
            drawerLabelStyle: {
              fontSize: 32,
              color: 'white',
              fontFamily: 'IrishGrover-Regular',
              height: 50,
              marginHorizontal: 10,
            },
            drawerActiveBackgroundColor: '#510DC0',
          }}
          drawerContent={props => <Custom_Drawer {...props} />}>
          <Drawer.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              drawerIcon: () => (
                <Image source={require('./src/images/Homeicon.png')} />
              ),
              drawerLabel: 'Home',
            }}
          />
        </Drawer.Navigator>
      ) : (
        <AuthStack /> 
      )}
    </NavigationContainer>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
