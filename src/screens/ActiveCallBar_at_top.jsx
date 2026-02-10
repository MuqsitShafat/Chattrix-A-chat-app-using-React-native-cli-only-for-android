import React, {useState, useContext, useEffect} from 'react'; // Added useContext, useEffect
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getFirestore,
  doc,
  runTransaction,
  collection,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import {RTCView} from 'react-native-webrtc'; // Added for persistent audio
import {AuthContext} from '../Auth/AuthContext'; // Import context

const ActiveCallBar_at_top = ({callData, myId, onPressBar}) => {
  const db = getFirestore();
  const {localStream, setLocalStream, remoteStream, setRemoteStream, pc} =
    useContext(AuthContext); // Access global stream
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [localEnding, setLocalEnding] = useState(false);

  // [ADDED] Hardware control for Mute
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
    }
  }, [isMuted, localStream]);

  // [ADDED] Hardware control for Camera
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => (t.enabled = isCameraOn));
    }
  }, [isCameraOn, localStream]);

  const handleHangup = async () => {
    if (localEnding) return;
    setLocalEnding(true);

    const docId = callData.id || myId;
    const callDocRef = doc(db, 'calls', docId);

    try {
      // [WEBRTC CLEANUP]
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      if (pc.current) {
        pc.current.close();
      }
      setRemoteStream(null);

      await runTransaction(db, async transaction => {
        const callSnapshot = await transaction.get(callDocRef);

        if (!callSnapshot.exists() || callSnapshot.data().status === 'ending') {
          return;
        }

        transaction.update(callDocRef, {status: 'ending'});

        const historyTimestamp = serverTimestamp();
        const historyRef1 = doc(collection(db, 'call_history'));
        const historyRef2 = doc(collection(db, 'call_history'));

        transaction.set(historyRef1, {
          userId: callData.callerId,
          friendId: callData.receiverId,
          type: 'outbound',
          timestamp: historyTimestamp,
        });
        transaction.set(historyRef2, {
          userId: callData.receiverId,
          friendId: callData.callerId,
          type: 'inbound',
          timestamp: historyTimestamp,
        });

        transaction.delete(callDocRef);
      });
    } catch (e) {
      console.error('Error hanging up:', e);
      setLocalEnding(false);
    }
  };

  const aliasName =
    callData.callerId === myId ? callData.receiverName : callData.callerName;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPressBar}
      disabled={localEnding}
      style={[styles.floatingBar, localEnding && {opacity: 0.8}]}>
      {/* Persist the remote audio track via RTCView while minimized */}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{width: 1, height: 1, position: 'absolute', opacity: 0}}
        />
      )}

      <TouchableOpacity
        onPress={() => setIsMuted(!isMuted)}
        disabled={localEnding}
        style={styles.sideBtn}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic-outline'}
          size={24}
          color={isMuted ? '#ff3b30' : 'white'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsCameraOn(!isCameraOn)}
        disabled={localEnding}
        style={styles.sideBtn}>
        <Ionicons
          name={isCameraOn ? 'videocam' : 'videocam-outline'}
          size={24}
          color={isCameraOn ? '#4175DF' : 'white'}
        />
      </TouchableOpacity>

      <Text style={styles.aliasText}>
        {localEnding ? 'Ending...' : aliasName}
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
