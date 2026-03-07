import React, {createContext, useEffect, useState, useRef} from 'react';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('idle');

  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isRemoteFrontCamera, setIsRemoteFrontCamera] = useState(false);

  const pc = useRef(null);
  const callInitialized = useRef(false); // ✅ NEW: prevents re-init on remount

  // ✅ Timer lives in context — persists across screen mounts/unmounts
  const timerRef = useRef(null);

  const startCallTimer = () => {
    // ✅ If timer already running, don't reset it
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0);
  };

  const toggleMute = muted => {
    setIsMuted(muted);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  };

  const toggleVideo = on => {
    setIsVideoOn(on);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = on;
      });
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ✅ Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  // ✅ This ref is set by App.js so any component can trigger the central hangup
  const hangupCallRef = useRef(null);

  const triggerHangup = callData => {
    if (hangupCallRef.current) {
      hangupCallRef.current(callData);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        activeCall,
        setActiveCall,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        pc,
        isMuted,
        setIsMuted,
        toggleMute,
        isVideoOn,
        setIsVideoOn,
        toggleVideo,
        callDuration,
        setCallDuration,
        callStatus,
        setCallStatus,
        isFrontCamera,
        setIsFrontCamera,
        isRemoteFrontCamera,
        setIsRemoteFrontCamera,
        startCallTimer,
        stopCallTimer,
        callInitialized,
        hangupCallRef, // ✅ App.js sets this to point to cleanupCall
        triggerHangup, // ✅ Components call this to trigger central hangup
      }}>
      {children}
    </AuthContext.Provider>
  );
};
