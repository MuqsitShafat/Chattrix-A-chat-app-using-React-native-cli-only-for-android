import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getFirestore,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

const AudioCallScreen = ({navigation, route}) => {
  const {friendId, friendName, profilePic, isCaller, callId, myId} =
    route.params;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callStatus, setCallStatus] = useState(
    isCaller ? 'Calling...' : 'Ringing...',
  );
  const db = getFirestore();

  const callDocId = isCaller ? friendId : myId;

  

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'calls', callDocId), snapshot => {
      if (!snapshot.exists()) {
        navigation.goBack();
      } else {
        const data = snapshot.data();
        if (data.status === 'active') {
          setCallStatus('00:00');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleHangUp = async () => {
    try {
      await addDoc(collection(db, 'calls'), {
        userId: myId,
        friendId: friendId,
        name: friendName,
        status: callStatus === '00:00' ? 'Connected' : 'Missed',
        timestamp: serverTimestamp(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      await deleteDoc(doc(db, 'calls', callDocId));
      navigation.goBack();
    } catch (error) {
      navigation.goBack();
    }
  };

  const handleAccept = async () => {
    try {
      await updateDoc(doc(db, 'calls', callDocId), {
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to accept call', error);
    }
  };

  let photoUrl = profilePic;
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
      <StatusBar barStyle="light-content" backgroundColor="#121b22" />

      <View style={styles.topSection}>
        <Icon name="lock-closed" size={12} color="#85959f" />
        <Text style={styles.encryptText}> End-to-end encrypted</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{friendName}</Text>
        <Text style={styles.callStatus}>{callStatus}</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image source={displayImage} style={styles.profileImg} />
        </View>
      </View>

      <View style={styles.bottomControls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.iconBtn, isSpeaker && styles.activeBtn]}
            onPress={() => setIsSpeaker(!isSpeaker)}>
            <Icon
              name={isSpeaker ? 'volume-high' : 'volume-medium-outline'}
              size={28}
              color={isSpeaker ? 'black' : 'white'}
            />
          </TouchableOpacity>

          {!isCaller && callStatus === 'Ringing...' && (
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Icon name="call" size={28} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.iconBtn, isMuted && styles.activeBtn]}
            onPress={() => setIsMuted(!isMuted)}>
            <Icon
              name={isMuted ? 'mic-off' : 'mic-outline'}
              size={28}
              color={isMuted ? 'black' : 'white'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.hangUpBtn} onPress={handleHangUp}>
            <Icon
              name="call"
              size={28}
              color="white"
              style={{transform: [{rotate: '135deg'}]}}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#121b22'},
  topSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  encryptText: {color: '#85959f', fontSize: 12},
  userInfo: {alignItems: 'center', marginTop: 40},
  userName: {color: 'white', fontSize: 32, fontWeight: '500'},
  callStatus: {color: '#85959f', fontSize: 18, marginTop: 8},
  imageContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#232d36',
  },
  profileImg: {width: '100%', height: '100%'},
  bottomControls: {
    backgroundColor: '#1f2c34',
    height: 150,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  iconBtn: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#232d36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {backgroundColor: 'white'},
  acceptBtn: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangUpBtn: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#f54242',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AudioCallScreen;
