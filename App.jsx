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
// ✅ NEW
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from './src/services/socketService';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ✅ TabNavigator — completely unchanged
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
  const {user, loading, activeCall, setActiveCall, setCallStatus} =
    useContext(AuthContext);

  const db = getFirestore();
  const navigationRef = useRef();
  const [isMinimized, setIsMinimized] = useState(false);

  // ✅ REPLACED: Firestore call listener → Socket.IO call listener
  useEffect(() => {
    if (!user) {
      // User logged out — disconnect socket and clear call
      disconnectSocket();
      setActiveCall(null);
      setIsMinimized(false);
      return;
    }

    // Connect socket using Firebase UID as the unique caller ID
    const socket = connectSocket(user.uid);

    // Incoming call from another user
    socket.on('newCall', data => {
      setActiveCall({
        callerId: data.callerId,
        callerName: data.callerName,
        callerPic: data.callerPic,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        receiverPic: data.receiverPic,
        rtcMessage: data.rtcMessage, // offer from caller
        isIncoming: true,
      });
      setCallStatus('incoming');
      setIsMinimized(false); // Show full call screen immediately
    });

    // Other person cancelled/hung up before we even answered
    socket.on('remoteHangup', () => {
      setActiveCall(null);
      setIsMinimized(false);
      setCallStatus('idle');
    });

    return () => {
      const s = getSocket();
      if (s) {
        s.off('newCall');
        s.off('remoteHangup');
      }
    };
  }, [user]);

  // ✅ Online/offline status — completely unchanged
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

  // ✅ Google + BootSplash — completely unchanged
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

          {/* ✅ Full call screen Modal — unchanged */}
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

          {/* ✅ Minimized call bar — unchanged */}
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
