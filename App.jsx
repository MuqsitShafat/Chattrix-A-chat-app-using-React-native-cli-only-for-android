import './src/i18n/i18n';
import React, {useEffect, useContext, useRef, useState} from 'react';
import {AppState, View, Modal, Image} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {getAuth} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
} from '@react-native-firebase/firestore';

import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';

import Call_screen from './src/screens/Call_screen';
import Home_Chat_navigator from './src/Navigation/Home_Chat_navigator';
import SettingsNavigator from './src/Navigation/SettingsNavigation';
import Custom_Drawer from './src/Navigation/Custom_Drawer';
import AuthStack from './src/Navigation/AuthStack';
import ActiveCallBar_at_top from './src/screens/ActiveCallBar_at_top';
import AudioCallScreen from './src/screens/AudioCallScreen';
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
  // Use global context instead of local state
  const {user, loading, activeCall, setActiveCall} = useContext(AuthContext);
  const db = getFirestore();
  const navigationRef = useRef();
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!user) {
      setActiveCall(null);
      setIsMinimized(false);
      return;
    }

    let unsubscribeOutbound = null;

    const unsubscribeInbound = onSnapshot(
      doc(db, 'calls', user.uid),
      snapshot => {
        if (!user) return;

        if (snapshot && snapshot.exists()) {
          const callData = snapshot.data();
          setActiveCall({...callData, id: user.uid});
        } else {
          const q = query(
            collection(db, 'calls'),
            where('callerId', '==', user.uid),
          );

          if (unsubscribeOutbound) unsubscribeOutbound();

          unsubscribeOutbound = onSnapshot(
            q,
            querySnap => {
              if (user && querySnap && !querySnap.empty) {
                const outboundData = querySnap.docs[0].data();
                setActiveCall({...outboundData, id: querySnap.docs[0].id});
              } else {
                setActiveCall(null);
                setIsMinimized(false);
              }
            },
            error => console.log('Outbound Error:', error),
          );
        }
      },
      error => console.log('Inbound Error:', error),
    );

    return () => {
      unsubscribeInbound();
      if (unsubscribeOutbound) unsubscribeOutbound();
    };
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
        } catch (error) {
          if (error.code !== 'firestore/permission-denied') {
            console.error('Error updating status:', error);
          }
        }
      }
    };

    if (user) updateStatus('online');

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (user) {
        updateStatus(nextAppState === 'active' ? 'online' : 'offline');
      }
    });

    return () => {
      subscription.remove();
      const auth = getAuth();
      if (auth.currentUser) updateStatus('offline');
    };
  }, [user]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '752916193237-13c4bjjoiqhapapren23qh8fkhg45mns.apps.googleusercontent.com',
      offlineAccess: true,
    });
    BootSplash.hide({fade: true});
  }, []);

  if (loading) return null;

  const showFullCall = !!(user && activeCall && !isMinimized);
  const showBar = !!(user && activeCall && isMinimized);

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? (
        <View style={{flex: 1}}>
          <Drawer.Navigator
            screenOptions={{
              headerShown: false,
              drawerStyle: {width: '78%', backgroundColor: '#D9D9D9'},
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

          <Modal
            visible={showFullCall}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setIsMinimized(true)}>
            {activeCall ? (
              <AudioCallScreen
                route={{params: activeCall}}
                navigation={navigationRef.current}
                onMinimize={() => setIsMinimized(true)}
                myId={user.uid}
              />
            ) : (
              <View />
            )}
          </Modal>

          {showBar && activeCall && (
            <ActiveCallBar_at_top
              callData={activeCall}
              myId={user.uid}
              onPressBar={() => setIsMinimized(false)}
            />
          )}
        </View>
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
