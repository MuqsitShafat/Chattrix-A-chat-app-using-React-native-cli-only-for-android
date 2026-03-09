import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getFirestore} from '@react-native-firebase/firestore';
import {RTCView} from 'react-native-webrtc';
import {AuthContext} from '../Auth/AuthContext';
import InCallManager from 'react-native-incall-manager';
import {getSocket} from '../services/socketService';

const ActiveCallBar_at_top = ({callData, myId, onPressBar, onExpand}) => {
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
    callInitialized, // ✅ NEW
    triggerHangup, // ✅ NEW — central hangup handler
    isHangingUp, // ✅ Global hangup lock
  } = useContext(AuthContext);

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
    if (onExpand) onExpand(false); // ✅ just open screen, no flag needed
    setTimeout(() => {
      Alert.alert(
        'Start Video',
        'Press the video icon below to start your video.',
        [{text: 'Got it'}],
      );
    }, 400); // ✅ wait for modal animation to finish then show alert
  };

  const handleHangup = () => {
    if (isHangingUp.current) return; // ✅ Global lock check

    getSocket()?.emit('endCall', {to: otherUserId});
    triggerHangup(callData); // ✅ safeHangup sets lock before cleanup
  };

  const aliasName =
    callData?.callerId === myId ? callData?.receiverName : callData?.callerName;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPressBar}
      disabled={isHangingUp.current}
      style={[styles.floatingBar, isHangingUp.current && {opacity: 0.8}]}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{width: 1, height: 1, position: 'absolute', opacity: 0}}
        />
      )}

      <TouchableOpacity
        onPress={handleToggleMute}
        disabled={isHangingUp.current}
        style={styles.sideBtn}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic-outline'}
          size={24}
          color={isMuted ? '#ff3b30' : 'white'}
        />
      </TouchableOpacity>

     <TouchableOpacity
        onPress={handleToggleVideo}
        disabled={isHangingUp.current}
        style={styles.sideBtn}>
        <Ionicons
          name={isVideoOn ? 'videocam' : 'videocam-outline'}
          size={24}
          color={isVideoOn ? '#4175DF' : 'white'}
        />
      </TouchableOpacity>

    <Text style={styles.aliasText}>
        {isHangingUp.current
          ? 'Goodbye...'
          : `${aliasName} (${formatTime(callDuration)})`}
      </Text>

      <TouchableOpacity
        onPress={handleHangup}
        disabled={isHangingUp.current}
        style={[styles.sideBtn, styles.redBtn, isHangingUp.current && {opacity: 0.5}]}>
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
