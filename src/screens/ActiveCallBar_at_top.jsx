import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getFirestore, doc, deleteDoc} from '@react-native-firebase/firestore';

const ActiveCallBar_at_top = ({callData, myId, onPressBar}) => {
  const db = getFirestore();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const handleHangup = async () => {
    try {
      // FIX: Always delete the document named after the Receiver's UID
      // because that is what App.jsx is listening to.
      const docId = callData.id || myId;
      await deleteDoc(doc(db, 'calls', docId));
    } catch (e) {
      console.error('Error hanging up:', e);
    }
  };

  const aliasName =
    callData.callerId === myId ? callData.receiverName : callData.callerName;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPressBar}
      style={styles.floatingBar}>
      {/* Mute Toggle with Visual Feedback */}
      <TouchableOpacity
        onPress={() => setIsMuted(!isMuted)}
        style={styles.sideBtn}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic-outline'}
          size={24}
          color={isMuted ? '#ff3b30' : 'white'}
        />
      </TouchableOpacity>

      {/* Camera Toggle */}
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
        style={[styles.sideBtn, styles.redBtn]}>
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
