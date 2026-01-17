import './src/i18n/i18n';
import React, {useEffect, useContext, useRef} from 'react';
import {AppState} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {getAuth} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from '@react-native-firebase/firestore';

import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import {Image} from 'react-native';

import Call_screen from './src/screens/Call_screen';
import Home_Chat_navigator from './src/Navigation/Home_Chat_navigator';
import SettingsNavigator from './src/Navigation/SettingsNavigation';
import Custom_Drawer from './src/Navigation/Custom_Drawer';
import AuthStack from './src/Navigation/AuthStack';

import {AuthProvider, AuthContext} from './src/Auth/AuthContext';

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
      options={({route}) => ({
        tabBarStyle: (() => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
          if (
            routeName === 'Chat' ||
            routeName === 'Add_Contact' ||
            routeName === 'AudioCallScreen'
          ) {
            return {display: 'none'};
          }
          return {
            height: 60,
            borderRadius: 30,
            marginHorizontal: 20,
            marginBottom: 18,
            position: 'absolute',
            backgroundColor: '#D9D9D9',
            elevation: 5,
          };
        })(),
      })}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsNavigator}
      options={({route}) => ({
        unmountOnBlur: true,
        tabBarStyle: (() => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Settings';
          if (
            [
              'Profile',
              'EditProfile',
              'ChangePassword',
              'PrivacySettings',
              'Language',
              'About',
            ].includes(routeName)
          ) {
            return {display: 'none'};
          }
          return {
            height: 60,
            borderRadius: 30,
            marginHorizontal: 20,
            marginBottom: 18,
            position: 'absolute',
            backgroundColor: '#D9D9D9',
            elevation: 5,
          };
        })(),
      })}
    />
  </Tab.Navigator>
);

const AppContent = () => {
  const {user, loading} = useContext(AuthContext);
  const db = getFirestore();
  const navigationRef = useRef();

  useEffect(() => {
    if (!user) return;

    const unsubscribeCall = onSnapshot(
      doc(db, 'calls', user.uid),
      snapshot => {
        if (snapshot && snapshot.exists()) {
          const callData = snapshot.data();
          if (callData && callData.status === 'dialing') {
            navigationRef.current?.navigate('AudioCallScreen', {
              friendId: callData.callerId,
              friendName: callData.callerName,
              profilePic: callData.callerPic,
              isCaller: false,
              callId: callData.callId,
              myId: user.uid,
            });
          }
        }
      },
      error => {
        console.error('Call listener error:', error);
      },
    );

    return () => unsubscribeCall();
  }, [user]);

  useEffect(() => {
    const updateStatus = async status => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser?.uid) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            status: status,
            lastSeen: serverTimestamp(),
          });
          console.log(`Status updated to: ${status}`);
        } catch (error) {
          if (error.code !== 'firestore/permission-denied') {
            console.error('Error updating status:', error);
          }
        }
      }
    };

    if (user) {
      updateStatus('online');
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (user) {
        if (nextAppState === 'active') {
          updateStatus('online');
        } else {
          updateStatus('offline');
        }
      }
    });

    return () => {
      subscription.remove();
      if (user) {
        updateStatus('offline');
      }
    };
  }, [user]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '752916193237-13c4bjjoiqhapapren23qh8fkhg45mns.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    const init = async () => {};
    init().finally(async () => {
      await BootSplash.hide({fade: true});
    });
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
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
