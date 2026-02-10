import React, {useState, useEffect, useContext, useRef} from 'react';
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
  runTransaction,
  collection,
  serverTimestamp,
  onSnapshot,
  setDoc,
  addDoc,
  getDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import {requestCallPermissions} from '../components/permissions';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
} from 'react-native-webrtc';
import {AuthContext} from '../Auth/AuthContext';
import InCallManager from 'react-native-incall-manager';

const AudioCallScreen = ({route, myId, onMinimize}) => {
  const db = getFirestore();
  const {localStream, setLocalStream, remoteStream, setRemoteStream, pc} =
    useContext(AuthContext); // Use global stream and pc
  const callData = route?.params;
  const initialProfilePic =
    callData.callerId === myId ? callData.receiverPic : callData.callerPic;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [localEnding, setLocalEnding] = useState(false);

  // Handle Audio Routing (Speaker vs Earpiece)
  useEffect(() => {
    if (isSpeakerOn) {
      InCallManager.setForceSpeakerphoneOn(true);
    } else {
      InCallManager.setForceSpeakerphoneOn(false);
    }
  }, [isSpeakerOn]);

  useEffect(() => {
    const setupCall = async () => {
      // Don't re-initiate if stream already exists (prevents reset on re-opening screen)
      if (localStream) return;

      const allowed = await requestCallPermissions();
      if (!allowed) return;

      // Start InCallManager lifecycle
      InCallManager.start({media: isVideoOn ? 'video' : 'audio'});
      InCallManager.setKeepScreenOn(true);

      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);
        stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

        pc.current.ontrack = event => {
          setRemoteStream(event.streams[0]);
        };

        const docId = callData.id || myId;
        const callDocRef = doc(db, 'calls', docId);

        pc.current.onicecandidate = event => {
          if (event.candidate) {
            const candidatesCol = collection(
              callDocRef,
              myId === callData.callerId
                ? 'callerCandidates'
                : 'receiverCandidates',
            );
            addDoc(candidatesCol, event.candidate.toJSON());
          }
        };

        if (myId === callData.callerId) {
          const offerDescription = await pc.current.createOffer();
          await pc.current.setLocalDescription(offerDescription);
          await updateDoc(callDocRef, {
            offer: {sdp: offerDescription.sdp, type: offerDescription.type},
          });

          onSnapshot(callDocRef, snapshot => {
            const data = snapshot.data();
            if (!pc.current.currentRemoteDescription && data?.answer) {
              pc.current.setRemoteDescription(
                new RTCSessionDescription(data.answer),
              );
            }
          });

          onSnapshot(collection(callDocRef, 'receiverCandidates'), snapshot => {
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                pc.current.addIceCandidate(
                  new RTCIceCandidate(change.doc.data()),
                );
              }
            });
          });
        } else {
          onSnapshot(callDocRef, async snapshot => {
            const data = snapshot.data();
            if (!pc.current.currentRemoteDescription && data?.offer) {
              await pc.current.setRemoteDescription(
                new RTCSessionDescription(data.offer),
              );
              const answerDescription = await pc.current.createAnswer();
              await pc.current.setLocalDescription(answerDescription);
              await updateDoc(callDocRef, {
                answer: {
                  sdp: answerDescription.sdp,
                  type: answerDescription.type,
                },
              });
            }
          });

          onSnapshot(collection(callDocRef, 'callerCandidates'), snapshot => {
            snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                pc.current.addIceCandidate(
                  new RTCIceCandidate(change.doc.data()),
                );
              }
            });
          });
        }
      } catch (e) {
        console.error('Call Setup Error:', e);
      }
    };

    setupCall();

    return () => {
      // NOTE: We DO NOT close pc.current here so the call persists when minimized
      InCallManager.stop();
    };
  }, []);

  // [ADDED FOR WEBRTC] - Handle Mute/Video toggle in stream
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
    }
  }, [isMuted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => (t.enabled = isVideoOn));
    }
  }, [isVideoOn, localStream]);

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

      pc.current.close();
      setRemoteStream(null);
      InCallManager.stop();

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
      console.error('Transaction failed: ', e);
      setLocalEnding(false);
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
        <Text style={styles.statusText}>
          {localEnding ? 'Ending...' : 'In Progress...'}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={displayImage} style={styles.profileImage} />
      </View>
      {/* This hidden view handles the remote audio/video connection */}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{width: 1, height: 1, opacity: 0}} // Keep it small/hidden for audio-only calls
          objectFit="cover"
        />
      )}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.iconBtnContainer}
          disabled={localEnding}
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

        <TouchableOpacity
          style={styles.iconBtnContainer}
          disabled={localEnding}
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

        <TouchableOpacity
          style={styles.iconBtnContainer}
          disabled={localEnding}
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

        <TouchableOpacity
          style={styles.iconBtnContainer}
          onPress={onMinimize}
          disabled={localEnding}>
          <View style={styles.iconBtn}>
            <MaterialIcons name="fullscreen-exit" size={28} color="white" />
          </View>
          <Text style={styles.btnLabel}>Minimize</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hangupBtnContainer}
          onPress={handleHangup}
          disabled={localEnding}>
          <View style={[styles.hangupBtn, localEnding && {opacity: 0.5}]}>
            <MaterialIcons name="call-end" size={35} color="white" />
          </View>
          <Text style={styles.btnLabel}>
            {localEnding ? 'Ending...' : 'End'}
          </Text>
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
