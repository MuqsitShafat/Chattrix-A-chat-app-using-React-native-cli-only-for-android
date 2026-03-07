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
  collection,
  query,
  where,
  getDocs,
  addDoc
} from '@react-native-firebase/firestore';
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import InCallManager from 'react-native-incall-manager';

import Call_screen from './src/screens/Call_screen';
import Home_Chat_navigator from './src/Navigation/Home_Chat_navigator';
import SettingsNavigator from './src/Navigation/SettingsNavigation';
import Custom_Drawer from './src/Navigation/Custom_Drawer';
import AuthStack from './src/Navigation/AuthStack';
import ActiveCallBar_at_top from './src/screens/ActiveCallBar_at_top';
import AudioCallScreen from './src/screens/AudioCallScreen';
import IncomingCallScreen from './src/screens/IncomingCallScreen';
import {AuthProvider, AuthContext} from './src/Auth/AuthContext';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from './src/services/socketService';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        if (route.name === 'Call') iconName = focused ? 'call' : 'call-outline';
        else if (route.name === 'Home_Chat_navigator')
          iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Settings')
          iconName = focused ? 'settings' : 'settings-outline';
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
          )
            return {display: 'none'};
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
          )
            return {display: 'none'};
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
  const {
    user,
    loading,
    activeCall,
    setActiveCall,
    setCallStatus,
    setIsMuted,
    setIsVideoOn,
    setCallDuration,
    setIsFrontCamera,
    setIsRemoteFrontCamera,
    stopCallTimer,
    localStream,
    setLocalStream,
    remoteStream,    // ✅ NEW
    setRemoteStream,
    pc,
    callInitialized, 
    hangupCallRef,   // ✅ NEW
  } = useContext(AuthContext);

  const db = getFirestore();
  const navigationRef = useRef();
  const [isMinimized, setIsMinimized] = useState(false);
  const pendingCancelRef = useRef(false);
  const isIncoming = !!activeCall?.isIncoming;

  // ✅ KEY FIX: Use a ref to hold latest cleanup values so the socket listener
  // never captures a stale closure. Every render updates this ref.
  const cleanupRef = useRef({});
  cleanupRef.current = {
    localStream,
    setLocalStream,
    remoteStream,    // ✅ NEW: needed to check if call was connected
    setRemoteStream,
    stopCallTimer,
    setIsFrontCamera,
    setIsRemoteFrontCamera,
    setActiveCall,
    setIsMinimized,
    setCallStatus,
    pc,
    callInitialized, 
       activeCall,      // ✅ ADD THIS — keeps activeCall fresh for remoteHangup
  };

const cleanupCall = async (callData = null) => {
    const c = cleanupRef.current;

    // ✅ SINGLE SOURCE OF TRUTH for call history
    // Writes exactly ONE history entry per call, from one place only
    if (callData?.callerId && callData?.receiverId) {
      try {
        const wasConnected = !!c.remoteStream;
        const ts = serverTimestamp();
        await addDoc(collection(db, 'call_history'), {
          userId: callData.callerId,
          friendId: callData.receiverId,
          type: wasConnected ? 'outbound' : 'missed_outbound',
          timestamp: ts,
        });
        await addDoc(collection(db, 'call_history'), {
          userId: callData.receiverId,
          friendId: callData.callerId,
          type: wasConnected ? 'inbound' : 'missed_inbound',
          timestamp: ts,
        });
      } catch (e) {
        console.log('History write error:', e);
      }
    }

    if (c.localStream) {
      c.localStream.getTracks().forEach(t => t.stop());
      c.setLocalStream(null);
    }
    if (c.pc?.current) {
      c.pc.current.close();
      c.pc.current = null;
    }
    c.setRemoteStream(null);
    c.stopCallTimer();
    c.setIsFrontCamera(true);
    c.setIsRemoteFrontCamera(false);
    InCallManager.stop();
    c.setActiveCall(null);
    c.setIsMinimized(false);
    c.setCallStatus('idle');
    if (c.callInitialized) c.callInitialized.current = false;
  };
  // ✅ Wire up so any component can call cleanupCall via context
  hangupCallRef.current = cleanupCall;


  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setActiveCall(null);
      setIsMinimized(false);
      return;
    }

    const socket = connectSocket(user.uid);

    socket.off('newCall');
    socket.off('remoteHangup');

    socket.on('newCall', async data => {
      pendingCancelRef.current = false;

      setIsMuted(false);
      setIsVideoOn(false);
      setCallDuration(0);
      setIsFrontCamera(true);
      setIsRemoteFrontCamera(false);

      let displayCallerName = data.callerName;
      try {
        const friendsRef = collection(db, 'users', user.uid, 'contacts');
        const q = query(friendsRef, where('friendId', '==', data.callerId));
        const filteredSnap = await getDocs(q);
        if (!filteredSnap.empty) {
          const friendData = filteredSnap.docs[0].data();
          if (friendData.aliasName) {
            displayCallerName = friendData.aliasName;
          }
        }
      } catch (e) {
        console.log('Alias fetch error:', e);
      }

      if (pendingCancelRef.current) {
        console.log('Caller cancelled before screen showed — ignoring');
        pendingCancelRef.current = false;
        return;
      }

      setActiveCall({
        callerId: data.callerId,
        callerName: displayCallerName,
        callerPic: data.callerPic,
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        receiverPic: data.receiverPic,
        rtcMessage: data.rtcMessage,
        isIncoming: true,
      });
      setCallStatus('incoming');
      setIsMinimized(false);
    });
    
// ✅ RESTORED: remoteHangup must be at App level so it works
    // whether AudioCallScreen is mounted or not (before/after call init)
   socket.on('remoteHangup', () => {
      // pendingCancelRef blocks a newCall from showing if it arrives
      // right after a hangup — only needed when WE were the caller
      pendingCancelRef.current = false; // ✅ Don't block future incoming calls
      // ✅ Pass null — the person who hung up already wrote the history
      // We only clean up our own state here, no history written
      cleanupCall(null);
    });

    socket.on('videoToggleOff', () => {
      // no-op at app level, AudioCallScreen handles its own listener
    });

    return () => {
      const s = getSocket();
      if (s) {
        s.off('newCall');
        s.off('remoteHangup');
        s.off('videoToggleOff');
      }
    };  }, [user]);

  useEffect(() => {
    const updateStatus = async status => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            status,
            lastSeen: serverTimestamp(),
          });
        } catch (error) {
          if (error.code !== 'firestore/permission-denied')
            console.error('Error updating status:', error);
        }
      }
    };

    if (user) updateStatus('online');

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (user) updateStatus(nextAppState === 'active' ? 'online' : 'offline');
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

  const handleAcceptCall = () => {
    setActiveCall(prev => ({...prev, isIncoming: false}));
    setCallStatus('connected');
  };

  const handleRejectCall = () => {
    // Emit to caller so their IncomingCall/AudioCall screen also closes
    getSocket()?.emit('endCall', {to: activeCall?.callerId});
    cleanupCall(activeCall); // ✅ Pass activeCall for missed history
  };

  const showIncoming = !!(user && activeCall && isIncoming);
  const showFullCall = !!(user && activeCall && !isIncoming && !isMinimized);
  const showBar = !!(user && activeCall && !isIncoming && isMinimized);

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
            visible={showIncoming}
            animationType="slide"
            transparent={false}
            onRequestClose={handleRejectCall}>
            {activeCall && (
              <IncomingCallScreen
                callData={activeCall}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
              />
            )}
          </Modal>

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
               onExpand={() => setIsMinimized(false)}  // ✅ NEW: auto-open on video
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