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
  collection,
  serverTimestamp,
  addDoc,
} from '@react-native-firebase/firestore';
import {requestCallPermissions} from '../components/permissions';
import {
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  RTCPeerConnection,
} from 'react-native-webrtc';
import {AuthContext} from '../Auth/AuthContext';
import InCallManager from 'react-native-incall-manager';
import {getSocket} from '../services/socketService';

const AudioCallScreen = ({route, myId, onMinimize}) => {
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
    setCallDuration,
    setCallStatus,
    setActiveCall,
    isFrontCamera,
    setIsFrontCamera,
    isRemoteFrontCamera,
    setIsRemoteFrontCamera,
  } = useContext(AuthContext);

  const callData = route?.params;

  const isCaller = callData?.callerId === myId;
  const otherUserId = isCaller ? callData?.receiverId : callData?.callerId;
  const aliasName = isCaller ? callData?.receiverName : callData?.callerName;
  const initialProfilePic = isCaller
    ? callData?.receiverPic
    : callData?.callerPic;

  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [localEnding, setLocalEnding] = useState(false);
  const [callConnected, setCallConnected] = useState(false);

  const iceCandidatesQueue = useRef([]);

  const handleToggleMute = () => toggleMute(!isMuted);

  // Video toggle — notifies other person via socket
  const handleToggleVideo = () => {
    const newVideoState = !isVideoOn;
    toggleVideo(newVideoState);
    getSocket()?.emit('videoToggle', {
      to: otherUserId,
      isVideoOn: newVideoState,
    });
  };

  const processIceQueue = () => {
    while (iceCandidatesQueue.current.length > 0) {
      const candidate = iceCandidatesQueue.current.shift();
      pc.current
        ?.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.log('Queued ICE error:', e));
    }
  };

  const setupPeerConnection = stream => {
    if (pc.current) pc.current.close();

    pc.current = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
      ],
    });

    stream.getTracks().forEach(track => {
      pc.current.addTrack(track, stream);
    });

    pc.current.ontrack = event => {
      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.current.onicecandidate = event => {
      if (event.candidate) {
        getSocket()?.emit('ICEcandidate', {
          calleeId: otherUserId,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      }
    };

    pc.current.onconnectionstatechange = () => {
      console.log('PC State:', pc.current?.connectionState);
    };
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !callData) return;

    const startCall = async () => {
      const allowed = await requestCallPermissions();
      if (!allowed) return;

      // Start as audio only
      InCallManager.start({media: 'audio'});
      InCallManager.setKeepScreenOn(true);

      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: {facingMode: 'user', width: 640, height: 480},
        });

        // Audio on, video track disabled until user turns it on
        stream.getAudioTracks().forEach(t => (t.enabled = true));
        stream.getVideoTracks().forEach(t => (t.enabled = false));

        setLocalStream(stream);
        setupPeerConnection(stream);

        if (isCaller) {
          const offer = await pc.current.createOffer();
          await pc.current.setLocalDescription(offer);
          socket.emit('call', {
            calleeId: otherUserId,
            callerId: myId,
            callerName: callData.callerName,
            callerPic: callData.callerPic,
            receiverId: otherUserId,
            receiverName: callData.receiverName,
            receiverPic: callData.receiverPic,
            rtcMessage: offer,
          });
        } else {
          if (callData.rtcMessage) {
            await pc.current.setRemoteDescription(
              new RTCSessionDescription(callData.rtcMessage),
            );
            processIceQueue();
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit('answerCall', {
              callerId: otherUserId,
              rtcMessage: answer,
            });
          }
        }
      } catch (e) {
        console.error('Call setup error:', e);
      }
    };

    socket.on('callAnswered', async data => {
      if (pc.current && !pc.current.remoteDescription) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(data.rtcMessage),
        );
        processIceQueue();
        setCallConnected(true);
      }
    });

    socket.on('ICEcandidate', data => {
      const msg = data.rtcMessage;
      if (msg?.candidate) {
        const candidate = {
          candidate: msg.candidate,
          sdpMLineIndex: msg.label,
          sdpMid: msg.id,
        };
        if (pc.current?.remoteDescription) {
          pc.current
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.log('ICE error:', e));
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      }
    });

    socket.on('cameraSwitch', data => {
      setIsRemoteFrontCamera(data.isFrontCamera);
    });

    // When other person toggles their video
    socket.on('remoteVideoToggle', data => {
      console.log('Remote video toggled:', data.isVideoOn);
      // remoteStream display is already handled by RTCView
      // This can be used to show/hide a UI indicator if needed
    });

    socket.on('remoteHangup', () => {
      leaveCall(false);
    });

    startCall();

    return () => {
      socket.off('callAnswered');
      socket.off('ICEcandidate');
      socket.off('cameraSwitch');
      socket.off('remoteVideoToggle');
      socket.off('remoteHangup');
    };
  }, []);

  // Sync mute/video to hardware tracks
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
      localStream.getVideoTracks().forEach(t => (t.enabled = isVideoOn));
    }
    // Switch InCallManager mode when video turns on/off
    InCallManager.start({media: isVideoOn ? 'video' : 'audio'});
  }, [isMuted, isVideoOn, localStream]);

  useEffect(() => {
    InCallManager.setSpeakerphoneOn(isSpeakerOn);
  }, [isSpeakerOn]);

  useEffect(() => {
    let interval;
    if (remoteStream) {
      setCallConnected(true);
      interval = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [remoteStream]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSwitchCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => t._switchCamera());
    const newIsFront = !isFrontCamera;
    setIsFrontCamera(newIsFront);
    getSocket()?.emit('cameraSwitch', {
      to: otherUserId,
      isFrontCamera: newIsFront,
    });
  };

  const leaveCall = async (shouldEmit = true) => {
    if (localEnding) return;
    setLocalEnding(true);

    if (shouldEmit) {
      getSocket()?.emit('endCall', {to: otherUserId});
    }

    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    setRemoteStream(null);
    setCallStatus('idle');
    setCallDuration(0);
    setIsFrontCamera(true);
    setIsRemoteFrontCamera(false);
    iceCandidatesQueue.current = [];
    InCallManager.stop();

    // Write call history to Firebase
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

  const getStatusText = () => {
    if (localEnding) return 'Ending...';
    if (remoteStream) return formatTime(callDuration);
    if (isCaller) return callConnected ? 'Ringing...' : 'Calling...';
    return 'Connecting...';
  };

  const displayImage = initialProfilePic
    ? {uri: initialProfilePic}
    : require('../images/User_profile_icon.jpg');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.nameText}>{aliasName}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.centerArea}>
        {remoteStream && isVideoOn ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
            mirror={isRemoteFrontCamera}
          />
        ) : (
          <View style={styles.imageContainer}>
            <Image source={displayImage} style={styles.profileImage} />
          </View>
        )}

        {localStream && isVideoOn && (
          <View style={styles.localVideoContainer}>
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              objectFit="cover"
              zOrder={1}
              mirror={isFrontCamera}
            />
          </View>
        )}
      </View>

      {remoteStream && !isVideoOn && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{width: 1, height: 1, position: 'absolute', opacity: 0}}
        />
      )}

      <View style={styles.controls}>
        <ControlBtn
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          active={isSpeakerOn}
          icon={isSpeakerOn ? 'volume-high' : 'volume-high-outline'}
          label="Speaker"
        />
        <ControlBtn
          onPress={handleToggleVideo}
          active={isVideoOn}
          icon={isVideoOn ? 'videocam' : 'videocam-outline'}
          label="Video"
        />
        <ControlBtn
          onPress={handleToggleMute}
          active={isMuted}
          icon={isMuted ? 'mic-off' : 'mic-outline'}
          label="Mute"
        />
        {isVideoOn && (
          <ControlBtn
            onPress={handleSwitchCamera}
            icon="camera-reverse-outline"
            label="Flip"
          />
        )}
        <ControlBtn
          onPress={onMinimize}
          icon="fullscreen-exit"
          label="Minimize"
          isMaterial
        />
        <TouchableOpacity
          style={styles.iconBtnContainer}
          onPress={() => leaveCall(true)}
          activeOpacity={0.7}>
          <View style={styles.hangupBtn}>
            <MaterialIcons name="call-end" size={30} color="white" />
          </View>
          <Text style={styles.btnLabel}>{localEnding ? 'Ending' : 'End'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ControlBtn = ({onPress, active, icon, label, isMaterial}) => (
  <TouchableOpacity style={styles.iconBtnContainer} onPress={onPress}>
    <View style={[styles.iconBtn, active && styles.activeBtn]}>
      {isMaterial ? (
        <MaterialIcons
          name={icon}
          size={26}
          color={active ? 'black' : 'white'}
        />
      ) : (
        <Ionicons name={icon} size={26} color={active ? 'black' : 'white'} />
      )}
    </View>
    <Text style={styles.btnLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSection: {marginTop: 60, alignItems: 'center', zIndex: 10},
  nameText: {fontSize: 32, color: 'white', fontWeight: 'bold'},
  statusText: {fontSize: 18, color: '#bbb', marginTop: 10},
  centerArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  profileImage: {width: '100%', height: '100%'},
  remoteVideo: {width: '100%', height: '100%', backgroundColor: '#000'},
  localVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
  },
  localVideo: {width: '100%', height: '100%'},
  controls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  iconBtnContainer: {alignItems: 'center', width: 70},
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {backgroundColor: 'white'},
  hangupBtn: {
    backgroundColor: '#ff3b30',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    color: 'white',
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
});

export default AudioCallScreen;
