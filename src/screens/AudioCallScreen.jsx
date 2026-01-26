import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
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
const AudioCallScreen = ({route, myId, onMinimize}) => {
  const db = getFirestore();
  const callData = route?.params;
  const initialProfilePic =
    callData.callerId === myId ? callData.receiverPic : callData.callerPic;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isEnding, setIsEnding] = useState(false); // NEW

  if (!callData) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <Text style={{color: 'white'}}>Connecting...</Text>
      </View>
    );
  }

  const isCaller = callData.callerId === myId;
  const aliasName = isCaller ? callData.receiverName : callData.callerName;

  const handleHangup = async () => {
    if (isEnding) return;
    setIsEnding(true);

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
      console.error('Error ending call:', e);
      setIsEnding(false);
    }
  };

  let photoUrl = initialProfilePic;
  if (photoUrl && typeof photoUrl === 'string') {
    if (photoUrl.includes('googleusercontent.com')) {
      photoUrl = photoUrl.replace('s96-c', 's400-c');
    } else if (photoUrl.includes('facebook.com')) {
      photoUrl = `${photoUrl}?type=large`;
    }
  }
  const displayImage =
    photoUrl && photoUrl !== ''
      ? {uri: photoUrl}
      : require('../images/User_profile_icon.jpg');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.nameText}>{aliasName || 'Chattrix User'}</Text>
        <Text style={styles.statusText}>In Progress...</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={displayImage} style={styles.profileImage} />
      </View>

      <View style={styles.controls}>
        {/* Speaker */}
        <TouchableOpacity
          style={styles.iconBtnContainer}
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}>
          <View style={[styles.iconBtn, isSpeakerOn && styles.activeBtn]}>
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-high-outline'}
              size={28}
              color={isSpeakerOn ? 'black' : 'white'}
            />
          </View>
          <Text style={styles.btnLabel}>Speaker</Text>
        </TouchableOpacity>

        {/* Video Toggle (New) */}
        <TouchableOpacity
          style={styles.iconBtnContainer}
          onPress={() => setIsVideoOn(!isVideoOn)}>
          <View style={[styles.iconBtn, isVideoOn && styles.activeBtn]}>
            <Ionicons
              name={isVideoOn ? 'videocam' : 'videocam-outline'}
              size={28}
              color={isVideoOn ? 'black' : 'white'}
            />
          </View>
          <Text style={styles.btnLabel}>Video</Text>
        </TouchableOpacity>

        {/* Mute */}
        <TouchableOpacity
          style={styles.iconBtnContainer}
          onPress={() => setIsMuted(!isMuted)}>
          <View style={[styles.iconBtn, isMuted && styles.activeBtn]}>
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic-outline'}
              size={28}
              color={isMuted ? 'black' : 'white'}
            />
          </View>
          <Text style={styles.btnLabel}>Mute</Text>
        </TouchableOpacity>

        {/* Minimize */}
        <TouchableOpacity style={styles.iconBtnContainer} onPress={onMinimize}>
          <View style={styles.iconBtn}>
            <MaterialIcons name="fullscreen-exit" size={28} color="white" />
          </View>
          <Text style={styles.btnLabel}>Minimize</Text>
        </TouchableOpacity>

        {/* Hangup Button Section */}
        <TouchableOpacity
          style={styles.hangupBtnContainer}
          onPress={handleHangup}
          disabled={isEnding}>
          <View style={[styles.hangupBtn, isEnding && {opacity: 0.5}]}>
            <MaterialIcons name="call-end" size={35} color="white" />
          </View>
          <Text style={styles.btnLabel}>{isEnding ? 'Ending...' : 'End'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSection: {marginTop: 60, alignItems: 'center'},
  nameText: {fontSize: 32, color: 'white', fontWeight: 'bold'},
  statusText: {fontSize: 18, color: '#bbb', marginTop: 10},
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  profileImage: {width: '100%', height: '100%'},
  controls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  iconBtnContainer: {alignItems: 'center', width: 70, marginBottom: 20},
  iconBtn: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {backgroundColor: 'white'},
  hangupBtn: {
    backgroundColor: '#ff3b30',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {color: 'white', marginTop: 8, fontSize: 11, textAlign: 'center'},
});

export default AudioCallScreen;
