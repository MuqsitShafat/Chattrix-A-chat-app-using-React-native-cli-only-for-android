import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getFirestore,
  collection,
  serverTimestamp,
  addDoc,
} from '@react-native-firebase/firestore';
import {RTCView} from 'react-native-webrtc';
import {AuthContext} from '../Auth/AuthContext';
import InCallManager from 'react-native-incall-manager';
import {getSocket} from '../services/socketService';

const ActiveCallBar_at_top = ({callData, myId, onPressBar}) => {
  const db = getFirestore();
  const {
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    pc,
    isMuted,
    toggleMute,
    isVideoOn,
    toggleVideo,
    callDuration,
    setCallStatus,
    setActiveCall,
    setIsFrontCamera,
    setIsRemoteFrontCamera,
    stopCallTimer, // ✅
  } = useContext(AuthContext);

  const [localEnding, setLocalEnding] = useState(false);

  const otherUserId =
    callData?.callerId === myId ? callData?.receiverId : callData?.callerId;

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleToggleMute = () => toggleMute(!isMuted);

  const handleToggleVideo = () => {
    const newVideoState = !isVideoOn;
    toggleVideo(newVideoState);
    getSocket()?.emit('videoToggle', {
      to: otherUserId,
      isVideoOn: newVideoState,
    });
  };

  const handleHangup = async () => {
    if (localEnding) return;
    setLocalEnding(true);

    getSocket()?.emit('endCall', {to: otherUserId});

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    setRemoteStream(null);
    setCallStatus('idle');
    stopCallTimer(); // ✅ stops and resets global timer
    setIsFrontCamera(true);
    setIsRemoteFrontCamera(false);
    InCallManager.stop();

    try {
      const ts = serverTimestamp();
      await addDoc(collection(db, 'call_history'), {
        userId: callData.callerId,
        friendId: callData.receiverId,
        type: 'outbound',
        timestamp: ts,
      });
      await addDoc(collection(db, 'call_history'), {
        userId: callData.receiverId,
        friendId: callData.callerId,
        type: 'inbound',
        timestamp: ts,
      });
    } catch (e) {
      console.log('History write error:', e);
    }

    setActiveCall(null);
  };

  const aliasName =
    callData?.callerId === myId ? callData?.receiverName : callData?.callerName;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPressBar}
      disabled={localEnding}
      style={[styles.floatingBar, localEnding && {opacity: 0.8}]}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{width: 1, height: 1, position: 'absolute', opacity: 0}}
        />
      )}

      <TouchableOpacity
        onPress={handleToggleMute}
        disabled={localEnding}
        style={styles.sideBtn}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic-outline'}
          size={24}
          color={isMuted ? '#ff3b30' : 'white'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleToggleVideo}
        disabled={localEnding}
        style={styles.sideBtn}>
        <Ionicons
          name={isVideoOn ? 'videocam' : 'videocam-outline'}
          size={24}
          color={isVideoOn ? '#4175DF' : 'white'}
        />
      </TouchableOpacity>

      <Text style={styles.aliasText}>
        {localEnding
          ? 'Ending...'
          : `${aliasName} (${formatTime(callDuration)})`}
      </Text>

      <TouchableOpacity
        onPress={handleHangup}
        disabled={localEnding}
        style={[styles.sideBtn, styles.redBtn, localEnding && {opacity: 0.5}]}>
        <MaterialIcons name="call-end" size={24} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingBar: {
    position: 'absolute',
    top: 50,
    left: '5%',
    width: '90%',
    height: 60,
    backgroundColor: '#333',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 10,
    zIndex: 9999,
  },
  aliasText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  sideBtn: {padding: 10},
  redBtn: {backgroundColor: '#ff3b30', borderRadius: 20},
});

export default ActiveCallBar_at_top;
