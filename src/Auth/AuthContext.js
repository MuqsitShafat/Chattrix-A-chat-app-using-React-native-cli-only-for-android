import React, {createContext, useEffect, useState, useRef} from 'react';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import {RTCPeerConnection} from 'react-native-webrtc';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Added global call state
  const [activeCall, setActiveCall] = useState(null);
  // [ADDED] Global stream state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); // Added global remote stream

  // [ADDED] Global PeerConnection Ref to survive screen unmounting
  const pc = useRef(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
    }),
  );

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        activeCall,
        setActiveCall,
        localStream,
        setLocalStream, // [ADDED]
        remoteStream,
        setRemoteStream,
        pc, // Global peer connection
      }}>
      {children}
    </AuthContext.Provider>
  );
};