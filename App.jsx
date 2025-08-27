import React, {useEffect} from 'react';
import BootSplash from 'react-native-bootsplash';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import Introscreen from './src/screens/Introscreen';
import Call_screen from './src/screens/Call_screen';
import Settings_screen from './src/screens/Settings_screen';
import Chat_display_screen from './src/screens/Chat_display_screen';
import Custom_Drawer from './src/Navigation/Custom_Drawer';
import {Image} from 'react-native';
import Home_Chat_navigator from './src/Navigation/Home_Chat_navigator';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 1. Create Tab Navigator
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

        // Hide bottom tab bar if on 'Chat' screen
        if (routeName === 'Chat') {
          return {
            tabBarStyle: {display: 'none'},
          };
        }

        return {};
      }}
    />
    <Tab.Screen name="Settings" component={Settings_screen} />
  </Tab.Navigator>
);

// 2. Use Drawer as the main navigator
const App = () => {
  useEffect(() => {
    const init = async () => {
      // do initial setup
    };
    init().finally(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash hidden');
    });
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        // initialRouteName="Tabs"
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
          name="Homie"
          component={TabNavigator}
          options={{
            drawerIcon: ({focused}) => (
              <Image source={require('./src/images/Homeicon.png')} style={{}} />
            ),
          }}
        />
        <Drawer.Screen
          name="Call log"
          component={Call_screen}
          options={{
            drawerIcon: ({focused}) => (
              <Image source={require('./src/images/Callicon.png')} />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;
