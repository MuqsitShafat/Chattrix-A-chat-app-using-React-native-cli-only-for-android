import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

const ActiveCallBar_at_top = ({callData, myId, onPressBar}) => {
  const db = getFirestore();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isEnding, setIsEnding] = useState(false); // NEW: Prevent double clicks

  const handleHangup = async () => {
    if (isEnding) return; // Exit if already processing
    setIsEnding(true); // Disable immediately

    try {
      const docId = callData.id || myId;
      const historyTimestamp = serverTimestamp();

      await addDoc(collection(db, 'call_history'), {
        userId: callData.callerId,
        friendId: callData.receiverId,
        type: 'outbound',
        timestamp: historyTimestamp,
      });
      await addDoc(collection(db, 'call_history'), {
        userId: callData.receiverId,
        friendId: callData.callerId,
        type: 'inbound',
        timestamp: historyTimestamp,
      });

      await deleteDoc(doc(db, 'calls', docId));
    } catch (e) {
      console.error('Error hanging up:', e);
      setIsEnding(false); // Re-enable if there was a genuine error
    }
  };
  const aliasName =
    callData.callerId === myId ? callData.receiverName : callData.callerName;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPressBar}
      style={styles.floatingBar}>
      <TouchableOpacity
        onPress={() => setIsMuted(!isMuted)}
        style={styles.sideBtn}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic-outline'}
          size={24}
          color={isMuted ? '#ff3b30' : 'white'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsCameraOn(!isCameraOn)}
        style={styles.sideBtn}>
        <Ionicons
          name={isCameraOn ? 'videocam' : 'videocam-outline'}
          size={24}
          color={isCameraOn ? '#4175DF' : 'white'}
        />
      </TouchableOpacity>

      <Text style={styles.aliasText}>{aliasName}</Text>

      <TouchableOpacity
        onPress={handleHangup}
        disabled={isEnding} // Disable UI
        style={[styles.sideBtn, styles.redBtn, isEnding && {opacity: 0.5}]}>
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
